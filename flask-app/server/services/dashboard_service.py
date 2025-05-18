from server.models.admin_data import AdminData
from server.models.doctor_data import DoctorData
from server.models.hospital_data import Hospital
from server.models.original_image_data import OriginalImageData
from server.models import ProcessedImageData
from server.models.patient_data import PatientData
from server.models.super_admin_data import SuperAdminData
from server.models.technician_data import TechnicianData
from server.models.user import User

class DashboardService:
    def get_info(self,user_id: int):
        user = User.query.get(int(user_id))
        if user.is_super_admin():
            return self.get_info_super_admin(user_id)
        elif user.is_admin():
            return self.get_info_admin(user_id)
        elif user.is_doctor():
            return self.get_info_doctor(user_id)
        elif user.is_technician():
            return self.get_info_technician(user_id)
        elif user.is_patient():
            return self.get_info_patient(user_id)
        else:
            return {"error": "Unauthorized or invalid user."}, 403



    def get_info_super_admin(self, user_id: int):
        """Získanie základných informácií o nemocnici a počte používateľov."""
        super_admin = SuperAdminData.query.get(int(user_id))
        if not super_admin:
            return {"error": "Unauthorized or invalid super_admin user."}, 403

        try:
            hospital_count = len(Hospital.query.all())
            patient_count = len(PatientData.query.all())
            doctor_count = len(DoctorData.query.all())
            technician_count = len(TechnicianData.query.all())
            admin_count = len(AdminData.query.all())
            original_image_count = len(OriginalImageData.query.all())
            processed_image_count = len(ProcessedImageData.query.all())

            return {
                "user_type": super_admin.user_type,
                "hospital_count": hospital_count,
                "patient_count": patient_count,
                "doctor_count": doctor_count,
                "technician_count": technician_count,
                "admin_count": admin_count,
                "original_image_count": original_image_count,
                "processed_image_count": processed_image_count,
                "message_count": 2,
            }, 200
        except Exception as e:
            return {"error": str(e)}, 500

    def get_info_admin(self, user_id: int):
        """Získanie základných informácií o nemocnici a počte používateľov."""
        admin = AdminData.query.get(int(user_id))
        if not admin:
            return {"error": "Unauthorized or invalid admin user."}, 403

        try:
            hospital = admin.hospital
            doctor_count = len(hospital.doctors)
            technician_count = len(hospital.technicians)
            patient_count = sum(len(doctor.patients) for doctor in hospital.doctors)
            original_image_count = sum(len(patient.images) for doctor in hospital.doctors for patient in doctor.patients)
            processed_image_count = sum(
                len(image.processed_images)
                for doctor in hospital.doctors
                for patient in doctor.patients
                for image in patient.images
            )
            return {
                "user_type": admin.user_type,
                "patient_count": patient_count,
                "doctor_count": doctor_count,
                "technician_count": technician_count,
                "original_image_count": original_image_count,
                "processed_image_count": processed_image_count,
                "message_count": 2,
            }, 200
        except Exception as e:
            return {"error": str(e)}, 500

    def get_info_doctor(self, user_id: int):
        """Získanie základných informácií o nemocnici a počte používateľov."""
        doctor = DoctorData.query.get(int(user_id))
        if not doctor:
            return {"error": "Unauthorized or invalid doctor user."}, 403

        try:
            hospital = doctor.hospital
            technician_count = len(hospital.technicians)
            if doctor.super_doctor:
                patient_count = len(PatientData.query.all())
                original_image_count = len(OriginalImageData.query.all())
                processed_image_count = len(ProcessedImageData.query.all())

            else:
                patient_count = len(doctor.patients)
                original_image_count = sum(len(patient.images) for patient in doctor.patients)
                processed_image_count = sum(
                    len(image.processed_images)
                    for patient in doctor.patients
                    for image in patient.images
                )

            return {
                "user_type": doctor.user_type,
                "patient_count": patient_count,
                "technician_count": technician_count,
                "original_image_count": original_image_count,
                "processed_image_count": processed_image_count,
                "message_count": 2,
            }, 200
        except Exception as e:
            return {"error": str(e)}, 500

    def get_info_technician(self, user_id: int):
        """Získanie základných informácií o nemocnici a počte používateľov."""
        technician = TechnicianData.query.get(int(user_id))
        if not technician:
            return {"error": "Unauthorized or invalid technician user."}, 403

        try:
            original_image_count = 5
            return {
                "user_type": technician.user_type,
                "original_image_count": original_image_count,
                "message_count": 2,
            }, 200
        except Exception as e:
            return {"error": str(e)}, 500

    def get_info_patient(self, user_id: int):
        """Získanie základných informácií o nemocnici a počte používateľov."""
        patient = PatientData.query.get(int(user_id))
        if not patient:
            return {"error": "Unauthorized or invalid patient user."}, 403

        try:
            original_image_count = len(patient.images)
            processed_image_count = sum(
                len(image.processed_images)
                for image in patient.images
            )
            return {
                "user_type": patient.user_type,
                "original_image_count": original_image_count,
                "processed_image_count": processed_image_count,
                "message_count": 2,
            }, 200
        except Exception as e:
            return {"error": str(e)}, 500