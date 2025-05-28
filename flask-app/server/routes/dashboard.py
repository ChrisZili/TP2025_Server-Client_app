from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from server.services.dashboard_service import DashboardService

bp = Blueprint('dashboard', __name__, url_prefix='/dashboard')

#route for loading messages into dashboard
@bp.route('/messages', methods=['GET'])
@jwt_required()
def get_dashboard_messages():
    user_id = int(get_jwt_identity())
    print(f"[DEBUG] Dashboard route hit, user_id: {user_id}")
    
    dashboard_service = DashboardService()
    messages = dashboard_service.get_received_messages_for_user(user_id)
    
    return jsonify([msg.to_dict() for msg in messages]), 200