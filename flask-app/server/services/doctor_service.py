from flask import jsonify
from server.database import db
from server.models.doctor_data import DoctorData
from server.models.original_image_data import OriginalImageData
from server.models.patient_data import PatientData
from server.models.hospital_data import Hospital
from server.models.user import User

class DoctorService:
    def assign_patient_to_doctor(self, doctor_id, patient_id):
        """Priradenie pacienta k lekárovi"""
        doctor = DoctorData.query.filter_by(doctor_id=doctor_id).first()
        patient = PatientData.query.filter_by(patient_id=patient_id).first()

        if not doctor:
            return jsonify({'error': 'Doctor not found'}), 404
        if not patient:
            return jsonify({'error': 'Patient not found'}), 404

        patient.doctor_id = doctor.id
        db.session.commit()

        return jsonify({'message': 'Patient assigned to doctor'}), 200

    def remove_patient_from_doctor(self, doctor_id, patient_id):
        """Odstránenie pacienta od lekára"""
        patient = PatientData.query.filter_by(patient_id=patient_id, doctor_id=doctor_id).first()

        if not patient:
            return jsonify({'error': 'Patient not found or not assigned to this doctor'}), 404

        patient.doctor_id = None  # Pacient stratí doktora
        db.session.commit()

        return jsonify({'message': 'Patient removed from doctor'}), 200

    def transfer_patient_to_other_doctor(self, doctor_id, patient_id, new_doctor_id):
        """Premiestnenie pacienta k inému lekárovi"""
        patient = PatientData.query.filter_by(patient_id=patient_id, doctor_id=doctor_id).first()
        new_doctor = DoctorData.query.filter_by(doctor_id=new_doctor_id).first()

        if not patient:
            return jsonify({'error': 'Patient not found or not assigned to this doctor'}), 404
        if not new_doctor:
            return jsonify({'error': 'New doctor not found'}), 404

        patient.doctor_id = new_doctor.id
        db.session.commit()

        return jsonify({'message': 'Patient transferred to new doctor'}), 200

    def get_doctor_patients(self, doctor_id):
        """Získanie zoznamu pacientov lekára"""
        doctor = DoctorData.query.filter_by(doctor_id=doctor_id).first()
        if not doctor:
            return jsonify({'error': 'Doctor not found'}), 404

        patients = doctor.patients
        return jsonify([
            {
                "id": patient.patient_id,
                "name": f"{patient.patient.first_name} {patient.patient.last_name}"
            } for patient in patients
        ]), 200

    def update_doctor_info(self, doctor_id, data):
        """Aktualizácia údajov o lekárovi"""
        doctor = DoctorData.query.filter_by(doctor_id=doctor_id).first()
        if not doctor:
            return jsonify({'error': 'Doctor not found'}), 404

        doctor.specialization = data.get("specialization", doctor.specialization)
        doctor.notes = data.get("notes", doctor.notes)

        db.session.commit()
        return jsonify({'message': 'Doctor info updated'}), 200

    def change_hospital(self, doctor_id, hospital_code):
        """Zmena nemocnice lekára"""
        doctor = DoctorData.query.filter_by(doctor_id=doctor_id).first()
        hospital = Hospital.query.filter_by(code=hospital_code).first()

        if not doctor:
            return jsonify({'error': 'Doctor not found'}), 404
        if not hospital:
            return jsonify({'error': 'Invalid hospital code'}), 400

        doctor.hospital_id = hospital.id
        db.session.commit()

        return jsonify({'message': 'Hospital changed successfully'}), 200

    def get_patient_details(self, doctor_id, patient_id):
        """Získanie informácií o pacientovi a jeho fotiek (len ak je to pacient doktora)"""
        doctor = DoctorData.query.filter_by(doctor_id=doctor_id).first()
        patient_data = PatientData.query.filter_by(patient_id=patient_id, doctor_id=doctor.id).first()

        if not doctor:
            return jsonify({'error': 'Doctor not found'}), 404
        if not patient_data:
            return jsonify({'error': 'Patient not assigned to this doctor'}), 403

        patient = User.query.get(patient_data.patient_id)
        images = PatientImages.query.filter_by(patient_data_id=patient_data.id).all()

        return jsonify({
            "patient_id": patient.id,
            "first_name": patient.first_name,
            "last_name": patient.last_name,
            "email": patient.email,
            "gender": patient.gender,
            "hospital": doctor.hospital_data.name if doctor.hospital_data else "Unknown",
            "images": [
                {
                    "id": img.id,
                    "original_image": img.original_image_path,
                    "mask_image": img.mask_image_path,
                    "processed_image": img.processed_image_path,
                    "result": img.result
                } for img in images
            ]
        }), 200

    @staticmethod
    def register_doctor(data):
        try:
            first_name = data.get('first_name')
            last_name = data.get('last_name')
            phone_number = data.get('phone_number')
            gender = data.get('gender')

            doctor_code = data.get('doctor_code')

            email = data.get('email')
            password = data.get('password')

            if not all([first_name, last_name, phone_number, gender, email, password, doctor_code]):
                return jsonify({'error': 'Missing required fields'}), 400
            hospital = Hospital.query.filter_by(doctor_code=doctor_code).first()
            if not hospital:
                return jsonify({'error': 'Doctor code does not exist'}), 400
            if PatientData.query.filter_by(phone_number=phone_number).first():
                return jsonify({'error': 'Patient with this phone number already exists'}), 400

            new_doctor = DoctorData(
                first_name=first_name,
                last_name=last_name,
                phone_number=phone_number,
                gender=gender,
                email=email,
                hospital_id = hospital.id
            )
            new_doctor.set_password(password)
            db.session.add(new_doctor)
            db.session.commit()
            print()
            return jsonify({'message': 'Doctor registered successfully'}), 201

        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500