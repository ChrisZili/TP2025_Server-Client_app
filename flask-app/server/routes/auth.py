from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from server.services.auth_service import AuthService

bp = Blueprint('auth', __name__, url_prefix='/auth')
auth_service = AuthService()

@bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    return auth_service.register_user(data)

@bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    return auth_service.login_user(data)

@bp.route('/protected', methods=['GET'])
@jwt_required()
def protected():
    """Chránená route - prístupná len s JWT tokenom"""
    current_user = get_jwt_identity()
    return jsonify({'message': f'Welcome User {current_user}!'}), 200
