from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from server.services.doctor_service import DoctorService

bp = Blueprint('doctor', __name__, url_prefix='/doctor')
doctor_service = DoctorService()

@bp.route('/patients', methods=['GET'])
@jwt_required()
def get_patients():
    """Získanie pacientov prihláseného lekára"""
    user_id = get_jwt_identity()
    return doctor_service.get_doctor_patients(user_id)

@bp.route('/update', methods=['PUT'])
@jwt_required()
def update_info():
    """Aktualizácia informácií o lekárovi"""
    user_id = get_jwt_identity()
    data = request.get_json()
    return doctor_service.update_doctor_info(user_id, data)

@bp.route('/assign', methods=['POST'])
@jwt_required()
def assign_patient():
    user_id = get_jwt_identity()
    data = request.get_json()
    return doctor_service.assign_patient_to_doctor(user_id, data['patient_id'])

@bp.route('/remove', methods=['POST'])
@jwt_required()
def remove_patient():
    user_id = get_jwt_identity()
    data = request.get_json()
    return doctor_service.remove_patient_from_doctor(user_id, data['patient_id'])

@bp.route('/transfer', methods=['POST'])
@jwt_required()
def transfer_patient():
    user_id = get_jwt_identity()
    data = request.get_json()
    return doctor_service.transfer_patient_to_other_doctor(user_id, data['patient_id'], data['new_doctor_id'])

@bp.route('/change_hospital', methods=['POST'])
@jwt_required()
def change_hospital():
    user_id = get_jwt_identity()
    data = request.get_json()
    return doctor_service.change_hospital(user_id, data['hospital_code'])

@bp.route('/patient', methods=['GET'])
@jwt_required()
def get_patient_info():
    """Doktor získa informácie o pacientovi (len ak je jeho pacient)"""
    # /<int:patient_id> alebo pridat za patient namiesto json
    # zaroven pridat do funkcie ako vstup patient_id
    user_id = get_jwt_identity()
    data = request.get_json()
    patient_id = data['patient_id']
    return doctor_service.get_patient_details(user_id, patient_id)
