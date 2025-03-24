from server.database import db
from server.models.user import User
from flask import jsonify
from flask_jwt_extended import create_access_token, create_refresh_token
from datetime import timedelta
from server.services.technician_service import TechnicianService
from server.services.patient_service import PatientService
from server.services.doctor_service import DoctorService

class AuthService:
    def register_user(self, data, user_type):
        """Registrácia nového používateľa s kontrolou duplicity"""
        try:
            email = data.get('email')

            # Overenie, či už existuje rovnaký email
            if User.query.filter_by(email=email).first():
                return jsonify({'error': 'Email already exists'}), 400

            # Overenie, či je zadaný typ používateľa a volanie príslušnej metódy
            if not user_type:
                return jsonify({'error': 'Missing required fields usertype'}), 400

            if user_type == 'patient':
                return PatientService().register_patient(data)
            elif user_type == 'technician':
                return TechnicianService().register_technician(data)
            elif user_type == 'doctor':
                return DoctorService().register_doctor(data)
            else:
                return jsonify({'error': 'Invalid user type'}), 400

        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500  # Interná chyba servera

    def login_user(self, data):
        """Prihlásenie používateľa a vygenerovanie JWT tokenu"""
        try:
            email = data.get('email')
            password = data.get('password')

            if not email or not password:
                return jsonify({'error': 'Email and password are required'}), 400

            user = User.query.filter_by(email=email).first()

            if user and user.check_password(password):
                access_token = create_access_token(identity=str(user.id), expires_delta=timedelta(hours=1))
                #refresh_token = create_refresh_token(identity=str(user.id))

                return jsonify({
                    "access_token": access_token,
                    "message": "Login successful"
                }), 200

            return jsonify({'error': 'Invalid email or password'}), 401
        except Exception as e:
            return jsonify({'error': str(e)}), 500
