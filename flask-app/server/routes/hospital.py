import logging
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from server.services.hospital_service import HospitalService
from server.models.user import User

bp = Blueprint('hospital', __name__, url_prefix='/hospital')
hospital_service = HospitalService()

logger = logging.getLogger(__name__)


def admin_required() -> bool:
    """
    Overí, či je aktuálny používateľ admin.

    Vstup: Funkcia get_jwt_identity() vráti len user_id (napr. "123").

    Výstup: Vracia True, ak používateľ existuje a jeho user_type je "admin", inak False.
    """
    user_id = get_jwt_identity()
    if not user_id:
        logger.warning("admin_required: Žiadne user_id v JWT")
        return False

    try:
        user = User.query.get(int(user_id))
    except Exception as e:
        logger.error("admin_required: Chyba pri získavaní používateľa s id %s: %s", user_id, e)
        return False

    if not user:
        logger.warning("admin_required: Používateľ s id %s nenájdený", user_id)
        return False

    if user.user_type != "admin":
        logger.warning("admin_required: Používateľ s id %s nie je admin (user_type=%s)", user_id, user.user_type)
        return False

    logger.debug("admin_required: Používateľ s id %s je admin", user_id)
    return True


@bp.route('/add', methods=['POST'])
@jwt_required()
def add_hospital():
    """Pridanie nemocnice (len pre admina)."""
    logger.info("add_hospital endpoint vyžiadaný")

    # Overenie, či klient očakáva JSON odpoveď
    if not request.accept_mimetypes['application/json'] >= request.accept_mimetypes['text/html']:
        logger.error("add_hospital: Frontend nevyžaduje JSON odpoveď")
        return jsonify({'error': 'Only JSON responses supported'}), 406

    if not admin_required():
        logger.error("add_hospital: Neoprávnený prístup")
        return jsonify({'error': 'Unauthorized, admin only'}), 403

    if not request.is_json:
        logger.error("add_hospital: Očakávaný JSON vstup")
        return jsonify({'error': 'Invalid input, JSON required'}), 400

    data = request.get_json()
    logger.debug("add_hospital: Prijaté dáta, keys: %s", list(data.keys()))

    try:
        response_data, status = hospital_service.add_hospital(data)
        logger.info("add_hospital: Nemocnica pridaná so statusom %s", status)
    except Exception as e:
        logger.exception("add_hospital: Výnimka pri pridávaní nemocnice: %s", e)
        return jsonify({'error': 'Internal server error'}), 500

    return jsonify(response_data), status


@bp.route('/update/<int:hospital_id>', methods=['PUT'])
@jwt_required()
def update_hospital(hospital_id):
    """Úprava nemocnice (len pre admina)."""
    logger.info("update_hospital endpoint vyžiadaný pre hospital_id: %s", hospital_id)

    if not request.accept_mimetypes['application/json'] >= request.accept_mimetypes['text/html']:
        logger.error("update_hospital: Frontend nevyžaduje JSON odpoveď")
        return jsonify({'error': 'Only JSON responses supported'}), 406

    if not admin_required():
        logger.error("update_hospital: Neoprávnený prístup")
        return jsonify({'error': 'Unauthorized, admin only'}), 403

    if not request.is_json:
        logger.error("update_hospital: Očakávaný JSON vstup")
        return jsonify({'error': 'Invalid input, JSON required'}), 400

    data = request.get_json()
    logger.debug("update_hospital: Prijaté dáta, keys: %s", list(data.keys()))

    try:
        response_data, status = hospital_service.update_hospital(hospital_id, data)
        logger.info("update_hospital: Nemocnica s id %s aktualizovaná so statusom %s", hospital_id, status)
    except Exception as e:
        logger.exception("update_hospital: Výnimka pri aktualizácii nemocnice s id %s: %s", hospital_id, e)
        return jsonify({'error': 'Internal server error'}), 500

    return jsonify(response_data), status


@bp.route('/list', methods=['GET'])
@jwt_required()
def list_hospitals():
    """Získanie zoznamu nemocníc (len pre admina)."""
    logger.info("list_hospitals endpoint vyžiadaný")

    if not request.accept_mimetypes['application/json'] >= request.accept_mimetypes['text/html']:
        logger.error("list_hospitals: Frontend nevyžaduje JSON odpoveď")
        return jsonify({'error': 'Only JSON responses supported'}), 406

    if not admin_required():
        logger.error("list_hospitals: Neoprávnený prístup")
        return jsonify({'error': 'Unauthorized, admin only'}), 403

    try:
        response_data, status = hospital_service.get_hospitals()
        logger.info("list_hospitals: Zoznam nemocníc načítaný so statusom %s", status)
    except Exception as e:
        logger.exception("list_hospitals: Výnimka pri získavaní nemocníc: %s", e)
        return jsonify({'error': 'Internal server error'}), 500

    return jsonify(response_data), status
