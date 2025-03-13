from server.database import db
from server.models.user import User
from flask import jsonify
from flask_jwt_extended import create_access_token, create_refresh_token
from datetime import timedelta

class AuthService:
    def register_user(self, data):
        """Registrácia nového používateľa s kontrolou duplicity"""
        try:
            first_name = data.get('first_name')
            last_name = data.get('last_name')
            email = data.get('email')
            password = data.get('password')
            gender = data.get('gender', 'unknown')  # Ak gender nie je poslaný, nastaví sa na 'unknown'

            # ✅ Overenie povinných polí
            if not first_name or not last_name or not email or not password:
                return jsonify({'error': 'Missing required fields'}), 400

            # ✅ Overenie, či už existuje rovnaký email
            if User.query.filter_by(email=email).first():
                return jsonify({'error': 'Email already exists'}), 400

            # ✅ Vytvorenie používateľa
            user = User(first_name=first_name, last_name=last_name, email=email, gender=gender)
            user.set_password(password)  # Hashovanie hesla

            db.session.add(user)
            db.session.commit()

            return jsonify({'message': 'User registered successfully'}), 201

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
                refresh_token = create_refresh_token(identity=str(user.id))

                return jsonify({
                    "access_token": access_token,
                    "refresh_token": refresh_token,
                    "message": "Login successful"
                }), 200

            return jsonify({'error': 'Invalid email or password'}), 401
        except Exception as e:
            return jsonify({'error': str(e)}), 500
