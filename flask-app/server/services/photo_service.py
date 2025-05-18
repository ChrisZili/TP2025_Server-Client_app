import base64
import os
import uuid
from datetime import datetime
import requests
from werkzeug.utils import secure_filename
from server.database import db
from server.models.admin_data import AdminData
from server.models.doctor_data import DoctorData
from server.models.original_image_data import OriginalImageData
from server.models.user import User
from server.models.patient_data import PatientData
from server.models.device_data import DeviceData
from server.models.processed_image_data import ProcessedImageData
import logging
from server.config import Config
from pathlib import Path

from server.services.methods_service import MethodsService

logger = logging.getLogger(__name__)
methods_service = MethodsService()

class PhotoService:
    def __init__(self, base_upload_path=Config.UPLOAD_FOLDER):
        self.base_upload_path = base_upload_path
        
    def _create_user_directory(self, user_id):
        """Create a directory for the user if it doesn't exist."""
        user_dir = os.path.join(self.base_upload_path, str(user_id))
        os.makedirs(user_dir, exist_ok=True)
        return user_dir

    def _generate_unique_filename(self, original_filename):
        """Generate a unique filename using UUID while preserving the original extension."""
        ext = os.path.splitext(original_filename)[1]
        return f"{uuid.uuid4().hex}{ext}"
    

    def save_file_for_user(self, user_id, file_storage):
        """
        Save a file (original or processed) in a user-specific folder.

        Args:
            user_id: The ID of the user (or patient) to associate the file with.
            file_storage: The FileStorage object (from Flask's request.files).

        Returns:
            The full path to the saved file.
        """
        # Ensure the user directory exists
        user_dir = os.path.join(self.base_upload_path, str(user_id))
        os.makedirs(user_dir, exist_ok=True)

        # Generate a unique filename
        original_filename = secure_filename(file_storage.filename)
        ext = os.path.splitext(original_filename)[1]
        unique_filename = f"{uuid.uuid4().hex}{ext}"

        # Full file path
        file_path = os.path.join(user_dir, original_filename)

        # Save the file
        file_storage.save(file_path)

        return file_path

    def save_photo(self, photo_file, user_id, patient_id, eye_side, diagnosis=None, device_name=None, device_type=None, camera_type=None,quality=None):
        """
        Save a photo file and create database entry.
        
        Args:
            photo_file: FileStorage object from request.files
            user_id: ID of the user uploading the photo
            patient_id: ID of the patient the photo is for
            eye_side: 'right' or 'left'
            diagnosis: Optional diagnosis text
            device_id: Optional ID of the device used to take the photo
            quality: Quality of the image (default: 'good')
            
        Returns:
            tuple: (OriginalImageData object, status code, message)
        """
        try:
            # Validate inputs
            if not photo_file:
                return None, 400, "No photo file provided"
            
            if not photo_file.filename:
                return None, 400, "Invalid filename"
                
            # Create user directory
            user_dir = self._create_user_directory(patient_id)
            
            # Generate unique filename
            filename = self._generate_unique_filename(secure_filename(photo_file.filename))
            file_path = self.save_file_for_user(patient_id, photo_file)
            
            # Create relative path for database storage
            new_device = DeviceData(
                device_name=device_name,
                device_type=device_type,
                camera_model=camera_type,
                camera_resolution="1080p"
            )
            db.session.add(new_device)
            db.session.commit()
            device_id = new_device.id
            # Create database entry
            photo_data = OriginalImageData(
                original_image_path=file_path,
                quality=quality,
                eye_side=eye_side,
                diagnosis=diagnosis,
                device_id=device_id,
                creator_id=user_id,
                patient_id=patient_id
            )
            
            db.session.add(photo_data)
            db.session.commit()
            logger.info(f"Photo saved successfully: {photo_data.id}")
            
            return photo_data, 200, "Photo saved successfully"
            
        except Exception as e:
            logger.error(f"Error saving photo: {str(e)}")
            db.session.rollback()
            return None, 500, f"Error saving photo: {str(e)}"

    def get_user_photos(self, user_id):
        """Get all photos created by a specific user."""
        user = User.query.get(int(user_id))
        try:
            if user.is_super_admin():
                photos = OriginalImageData.query.all()
            elif user.is_admin():
                admin = AdminData.query.get(user_id)

                if not admin or not admin.hospital:
                    return {'error': 'Admin hospital not found'}, 404
                # Now access the hospital's doctors through the admin instance
                # In the get_patients method
                photos = (
                    OriginalImageData.query
                    .join(OriginalImageData.patient)  # spojenie na PatientData
                    .join(PatientData.doctor)  # spojenie na DoctorData
                    .filter(DoctorData.hospital_id == admin.hospital.id)
                    .all()
                )
            elif user.is_doctor():
                doctor = DoctorData.query.get(user_id)
                if doctor.super_doctor:
                    photos = OriginalImageData.query.all()
                else:
                    photos = (
                        OriginalImageData.query
                        .join(OriginalImageData.patient)  # spojenie na PatientData
                        .join(PatientData.doctor)  # spojenie na DoctorData
                        .filter(DoctorData.id == doctor.id)  # len pre tohto doktora
                        .all()
                    )

            elif user.is_technician():
                photos = OriginalImageData.query.filter_by(creator_id=user_id).all()
            elif user.is_patient():
                photos = OriginalImageData.query.filter_by(patient_id=user_id).all()

            else:
                return {'error': 'Unauthorized'}, 403
            return photos, 200, "Photos retrieved successfully"
        except Exception as e:
            logger.error(f"Error retrieving photos: {str(e)}")
            return None, 500, f"Error retrieving photos: {str(e)}"

    def get_patient_photos(self, patient_id):
        """Get all photos for a specific patient."""
        try:
            photos = OriginalImageData.query.filter_by(patient_id=patient_id).all()
            return photos, 200, "Photos retrieved successfully"
        except Exception as e:
            logger.error(f"Error retrieving patient photos: {str(e)}")
            return None, 500, f"Error retrieving patient photos: {str(e)}"

    def delete_photo(self, photo_id, user_id):
        """Delete a photo and its file."""
        try:
            photo = OriginalImageData.query.get(photo_id)
            
            if not photo:
                return False, 404, "Photo not found"
                
            # Check if user has permission (creator or admin)
            if photo.creator_id != user_id:
                user = User.query.get(user_id)
                if not user or not (user.is_admin() or user.is_super_admin()):
                    return False, 403, "Permission denied"
            
            # Delete file
            file_path = os.path.join(self.base_upload_path, photo.original_image_path)
            if os.path.exists(file_path):
                os.remove(file_path)
            
            # Delete database entry
            db.session.delete(photo)
            db.session.commit()
            
            return True, 200, "Photo deleted successfully"
            
        except Exception as e:
            logger.error(f"Error deleting photo: {str(e)}")
            db.session.rollback()
            return False, 500, f"Error deleting photo: {str(e)}"

    def get_photo_by_id(self, photo_id):
        """Get a specific photo by ID."""
        try:
            photo = OriginalImageData.query.get(photo_id)
            if not photo:
                return None, 404, "Photo not found"
            return photo, 200, "Photo retrieved successfully"
        except Exception as e:
            logger.error(f"Error retrieving photo: {str(e)}")
            return None, 500, f"Error retrieving photo: {str(e)}"

    def sent_image_to_processing(self, 
                                 photo_id, 
                                 method_name, 
                                 method_parameters,
                                 user_id, patient_id, 
                                 eye_side, diagnosis, 
                                 device_name, device_type, 
                                 camera_type):
        """Send a photo to processing."""
        try:
            photo = OriginalImageData.query.get(photo_id)
            if not photo:
                return False, 404, "Photo not found"
            file_extension = os.path.splitext(photo.original_image_path)[1].lstrip('.')
            method = methods_service.get_method_by_name(method_name)
            if not method:
                return False, 404, "Method not found"
            method_parameters = method.parameters
            # if not method_parameters:
            #     return False, 404, "Method parameters not found"
            
                        # Create a new ProcessedImageData instance
            processed_photo = ProcessedImageData(
                created_at=datetime.now(),
                status="Čaká na spracovanie",
                process_type=method_name,
                original_image_id=photo_id,
            )

            # Add and commit to the database
            db.session.add(processed_photo)
            db.session.commit()
            
            payload = {
                "file":{
                    "id": int(processed_photo.id),
                    "data": base64.b64encode(open(photo.original_image_path, 'rb').read()).decode('utf-8'),
                    "extension": file_extension
                },
                "method":{
                    "name": method_name,
                    "parameters": method_parameters
                },
                "metadata":{
                    "original_photo_id": int(photo_id),
                    "user_id": int(user_id),
                    "patient_id": int(patient_id),
                    "eye_side": str(eye_side),
                    "diagnosis": str(diagnosis),
                    "device_name": str(device_name),
                    "device_type": str(device_type),
                    "camera_type": str(camera_type)
                },
                "recieving_endpoint": Config.RECIEVING_ENDPOINT
            }

            # print(f"Payload: {payload}")


            print(f"Sending image to processing: {photo.original_image_path}")

            # Send the image to the processing service
            response = requests.post(
                f"{Config.PROCESSING_SERVICE_URL}/process-image",
                json=payload
            )
            if response.status_code != 200:
                print(f"Failed to send image to processing: {response.status_code}")
                return False, 500, "Failed to send image to processing"
            else:
                print(f"Image sent to processing successfully: {response.status_code}")
                return True, 200, "Image sent to processing successfully"
        except Exception as e:
            logger.error(f"Error sending image to processing: {str(e)}")
            return False, 500, f"Error sending image to processing: {str(e)}"
        
    def process_received_data(self, status, answer, file_id, file_data, file_extension):
        """Process the received data from the processing service."""
        try:
            # Find the processed image by ID
            processed_image = ProcessedImageData.query.get(file_id)
            if not processed_image:
                return False, "Processed image not found"
            
            # Save the file to the user's directory (from base64 string)
            orig_path = processed_image.original_image.original_image_path

            # zmena prípony na .tif
            file_path = Path(orig_path).with_suffix(".tif")            # Update the processed image with the received data
            processed_image.status = "Spracované"
            processed_image.answer = answer
            processed_image.processed_image_path = file_path
            processed_image.processed_image_extension = file_extension
            db.session.commit()
            return True, "Processed image updated successfully"
        except Exception as e:
            logger.error(f"Error processing received data: {str(e)}")
            return False, f"Error processing received data: {str(e)}"
        
    def save_base64_file_for_user(self, user_id, base64_data, extension):
        """
        Save a base64-encoded file in a user-specific folder.
        Returns the full file path.
        """
        import base64
        import uuid
        # Ensure the user directory exists
        user_dir = os.path.join(self.base_upload_path, str(user_id))
        os.makedirs(user_dir, exist_ok=True)
        # Generate a unique filename
        unique_filename = f"{uuid.uuid4().hex}.{extension}"
        file_path = os.path.join(user_dir, unique_filename)
        # Decode and save the file
        with open(file_path, "wb") as f:
            f.write(base64.b64decode(base64_data))
        return file_path
        
    def update_photo_diagnosis(self, photo_id, new_diagnosis):
        """Update the diagnosis for a specific photo.
        
        Args:
            photo_id: ID of the photo to update
            new_diagnosis: New diagnosis text
            
        Returns:
            tuple: (success (bool), status code (int), message (str))
        """
        try:
            photo = OriginalImageData.query.get(photo_id)
            
            if not photo:
                return False, 404, "Photo not found"
            
            photo.diagnosis = new_diagnosis
            db.session.commit()
            
            logger.info(f"Updated diagnosis for photo {photo_id}")
            return True, 200, "Diagnosis updated successfully"
            
        except Exception as e:
            logger.error(f"Error updating diagnosis: {str(e)}")
            db.session.rollback()
            return False, 500, f"Error updating diagnosis: {str(e)}"
        
    