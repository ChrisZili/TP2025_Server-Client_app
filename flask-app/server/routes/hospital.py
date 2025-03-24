from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from server.services.hospital_service import HospitalService

bp = Blueprint('hospital', __name__, url_prefix='/hospital')
hospital_service = HospitalService()

@bp.route('/add', methods=['POST'])
@jwt_required()
def add_hospital():
    """Pridanie nemocnice"""
    data = request.get_json()
    return hospital_service.add_hospital(data)

@bp.route('/update/<int:hospital_id>', methods=['PUT'])
@jwt_required()
def update_hospital(hospital_id):
    """Úprava nemocnice"""
    data = request.get_json()
    return hospital_service.update_hospital(hospital_id, data)

@bp.route('/list', methods=['GET'])
@jwt_required()
def list_hospitals():
    """Získanie zoznamu nemocníc"""
    return hospital_service.get_hospitals()
