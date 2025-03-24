from server import db
from server.models.user import User
from flask import jsonify

class DatabaseService:
    def create_user(self, data):
        try:
            user = User(
                username=data['username'],
                email=data['email']
            )
            db.session.add(user)
            db.session.commit()
            return jsonify({'message': 'User created successfully'}), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 400
