from flask import Blueprint, jsonify, request
from server.models.user import User
from server.services.db_service import DatabaseService

bp = Blueprint('api', __name__, url_prefix='/api')
db_service = DatabaseService()

@bp.route('/users', methods=['GET'])
def get_users():
    users = User.query.all()
    return jsonify([{'id': user.id, 'username': user.username} for user in users])

@bp.route('/users', methods=['POST'])
def create_user():
    data = request.get_json()
    return db_service.create_user(data) 