from server.database import db
from server.models.user import User
from flask import jsonify
from flask_jwt_extended import create_access_token
from datetime import timedelta

# Nastavenia maximálnych dĺžok
MAX_USERNAME_LENGTH = 64
MAX_EMAIL_LENGTH = 120
MAX_PASSWORD_LENGTH = 64  # 🔹 Maximálna dĺžka hesla pred hashovaním

class AuthService:
    def register_user(self, data):
        """Registrácia nového používateľa s kontrolou dĺžok"""
        try:
            username = data.get('username')
            email = data.get('email')
            password = data.get('password')

            # 🔹 Overenie dĺžok vstupných údajov
            if len(username) > MAX_USERNAME_LENGTH:
                return jsonify({'error': f'Username is too long (max {MAX_USERNAME_LENGTH} characters)'}), 400
            if len(email) > MAX_EMAIL_LENGTH:
                return jsonify({'error': f'Email is too long (max {MAX_EMAIL_LENGTH} characters)'}), 400
            if len(password) > MAX_PASSWORD_LENGTH:
                return jsonify({'error': f'Password is too long (max {MAX_PASSWORD_LENGTH} characters)'}), 400

            # 🔹 Overenie, či už existuje používateľ s rovnakým emailom
            if User.query.filter_by(email=email).first():
                return jsonify({'error': 'Email already in use'}), 400

            user = User(username=username, email=email)
            user.set_password(password)  # Hashovanie hesla

            db.session.add(user)
            db.session.commit()

            return jsonify({'message': 'User registered successfully'}), 201

        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500  # Interná chyba servera

    def login_user(self, data):
        """Prihlásenie používateľa a vygenerovanie JWT tokenu"""
        user = User.query.filter_by(email=data['email']).first()

        if user and user.check_password(data['password']):
            access_token = create_access_token(identity=str(user.id), expires_delta=timedelta(hours=1))
            return jsonify({'access_token': access_token}), 200

        return jsonify({'error': 'Invalid email or password'}), 401
