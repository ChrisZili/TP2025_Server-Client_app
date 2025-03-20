from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from server.services.auth_service import AuthService
from server.models.user import User
from server.extensions import limiter

bp = Blueprint('auth', __name__, url_prefix='/auth')
auth_service = AuthService()

@bp.route('/register', methods=['POST', 'GET'])
@limiter.limit("3 per minute")
def register():
    """Endpoint na registráciu používateľa"""
    data = request.get_json()
    return auth_service.register_user(data)

@bp.route('/login', methods=['POST', 'GET'])
@limiter.limit("3 per 10 minutes")
def login():
    """Endpoint na prihlásenie používateľa"""
    data = request.get_json()
    return auth_service.login_user(data)

@bp.route('/me', methods=['POST', 'GET'])
@jwt_required()
def get_current_user():
    """Vráti údaje o aktuálnom prihlásenom používateľovi"""
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))

    if not user:
        return jsonify({'error': 'User not found'}), 404

    return jsonify({
        "id": user.id,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "gender": user.gender
    }), 200
