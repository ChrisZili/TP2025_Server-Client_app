from flask import jsonify
from server.database import db
from server.models.patient_data import PatientData

class PatientService:
    @staticmethod
    def register_patient(data):
        try:
            first_name = data.get('first_name')
            last_name = data.get('last_name')
            phone_number = data.get('phone_number')
            birth_date = data.get('birth_date')
            birth_number = data.get('birth_number')
            gender = data.get('gender')

            email = data.get('email')
            password = data.get('password')

            if not all([first_name, last_name, phone_number, birth_date, birth_number,gender, email, password]):
                return jsonify({'error': 'Missing required fields'}), 400

            if PatientData.query.filter_by(birth_number=birth_number).first():
                return jsonify({'error': 'Patient with this birth number already exists'}), 400
            if PatientData.query.filter_by(phone_number=phone_number).first():
                return jsonify({'error': 'Patient with this phone number already exists'}), 400

            new_patient = PatientData(
                first_name=first_name,
                last_name=last_name,
                email=email,
                phone_number=phone_number,
                birth_date=birth_date,
                birth_number=birth_number,
                gender=gender,
            )
            new_patient.set_password(password)
            db.session.add(new_patient)
            db.session.commit()

            return jsonify({'message': 'Patient registered successfully'}), 201

        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
