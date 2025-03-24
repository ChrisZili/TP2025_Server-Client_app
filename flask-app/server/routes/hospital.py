from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from server.services.hospital_service import HospitalService
from server.models.user import User

bp = Blueprint('hospital', __name__, url_prefix='/hospital')
hospital_service = HospitalService()


def admin_required() -> bool:
    """
    Overí, či je aktuálny používateľ admin.

    Vstup: Funkcia get_jwt_identity() vráti len user_id (napr. "123").

    Výstup: Vracia True, ak používateľ existuje a jeho user_type je "admin", inak False.
    """
    user_id = get_jwt_identity()  # Očakáva sa, že v JWT bude uložené len ID používateľa.
    if not user_id:
        return False

    user = User.query.get(int(user_id))
    return user is not None and user.user_type == "admin"

@bp.route('/add', methods=['POST'])
@jwt_required()
def add_hospital():
    """Pridanie nemocnice (len pre admina)."""
    if not admin_required():
        return jsonify({'error': 'Unauthorized, admin only'}), 403

    data = request.get_json()
    return hospital_service.add_hospital(data)

@bp.route('/update/<int:hospital_id>', methods=['PUT'])
@jwt_required()
def update_hospital(hospital_id):
    """Úprava nemocnice (len pre admina)."""
    if not admin_required():
        return jsonify({'error': 'Unauthorized, admin only'}), 403

    data = request.get_json()
    return hospital_service.update_hospital(hospital_id, data)

@bp.route('/list', methods=['GET'])
@jwt_required()
def list_hospitals():
    """Získanie zoznamu nemocníc (len pre admina)."""
    if not admin_required():
        return jsonify({'error': 'Unauthorized, admin only'}), 403

    return hospital_service.get_hospitals()