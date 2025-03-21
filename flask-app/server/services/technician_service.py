from flask import jsonify
from server.database import db
from server.models.technician_data import TechnicianData
from server.models.hospital_data import Hospital

class TechnicianService:
    @staticmethod
    def register_technician(data):
        try:
            first_name = data.get('first_name')
            last_name = data.get('last_name')

            technician_code = data.get('technician_code')

            email = data.get('email')
            password = data.get('password')

            if not all([first_name, last_name, email, password, technician_code]):
                return jsonify({'error': 'Missing required fields'}), 400

            hospital = Hospital.query.filter_by(technician_code=technician_code).first()
            if not hospital:
                return jsonify({'error': 'Technician code does not exist'}), 400

            new_technician = TechnicianData(
                first_name=first_name,
                last_name=last_name,
                email=email,
                hospital_id=hospital.id
            )
            new_technician.set_password(password)
            db.session.add(new_technician)
            db.session.commit()

            return jsonify({'message': 'Technician registered successfully'}), 201

        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
