import logging
from flask import Blueprint, request, jsonify, render_template
from flask_jwt_extended import jwt_required, get_jwt_identity
from server.services.hospital_service import HospitalService

bp = Blueprint('hospitals', __name__, url_prefix='/hospitals')
hospital_service = HospitalService()

logger = logging.getLogger(__name__)

@bp.route('/add', methods=['POST'])
@jwt_required()
def add_hospital():
    """Pridanie nemocnice (len pre super_admina)."""
    logger.info("add_hospital endpoint vyžiadaný")
    user_id = get_jwt_identity()

    # Tento endpoint vyžaduje JSON vstup aj JSON odpoveď.
    if not (request.is_json and request.accept_mimetypes['application/json'] >= request.accept_mimetypes['text/html']):
        logger.error("add_hospital: Neplatný vstup alebo Accept header")
        return jsonify({'error': 'Invalid input or only JSON responses supported'}), 406

    data = request.get_json()
    logger.debug("add_hospital: Prijaté dáta, keys: %s", list(data.keys()))

    try:
        response_data, status = hospital_service.add_hospital(user_id, data)
        logger.info("add_hospital: Nemocnica pridaná so statusom %s", status)
    except Exception as e:
        logger.exception("add_hospital: Výnimka pri pridávaní nemocnice: %s", e)
        return jsonify({'error': 'Internal server error'}), 500

    return jsonify(response_data), status


@bp.route('/update/<int:hospital_id>', methods=['PUT'])
@jwt_required()
def update_hospital(hospital_id):
    """Úprava nemocnice (len pre super_admina)."""
    logger.info("update_hospital endpoint vyžiadaný pre hospital_id: %s", hospital_id)
    user_id = get_jwt_identity()
    if not (request.is_json and request.accept_mimetypes['application/json'] >= request.accept_mimetypes['text/html']):
        logger.error("update_hospital: Neplatný vstup alebo Accept header")
        return jsonify({'error': 'Invalid input or only JSON responses supported'}), 406

    data = request.get_json()
    logger.debug("update_hospital: Prijaté dáta, keys: %s", list(data.keys()))

    try:
        response_data, status = hospital_service.update_hospital(user_id, hospital_id, data)
        logger.info("update_hospital: Nemocnica s id %s aktualizovaná so statusom %s", hospital_id, status)
    except Exception as e:
        logger.exception("update_hospital: Výnimka pri aktualizácii nemocnice s id %s: %s", hospital_id, e)
        return jsonify({'error': 'Internal server error'}), 500

    return jsonify(response_data), status


@bp.route('/list', methods=['GET'])
@jwt_required()
def list_hospitals():
    """Získanie zoznamu nemocníc (len pre super_admina)."""
    logger.info("list_hospitals endpoint vyžiadaný")
    user_id = get_jwt_identity()

    if not (request.accept_mimetypes['application/json'] >= request.accept_mimetypes['text/html']):
        logger.error("list_hospitals: Frontend nevyžaduje JSON odpoveď")
        return jsonify({'error': 'Only JSON responses supported'}), 406

    try:
        response_data, status = hospital_service.get_hospitals(user_id)
        logger.info("list_hospitals: Zoznam nemocníc načítaný so statusom %s", status)
    except Exception as e:
        logger.exception("list_hospitals: Výnimka pri získavaní nemocníc: %s", e)
        return jsonify({'error': 'Internal server error'}), 500

    return jsonify(response_data), status

@bp.route('/<int:hospital_id>', methods=['GET'])
@jwt_required()
def get_hospital(hospital_id):
    """Získanie informácií o konkrétnej nemocnici (len pre super_admina).
       Vráti JSON, ak to klient preferuje, inak vykreslí HTML stránku.
    """
    logger.info("get_hospital endpoint vyžiadaný pre hospital_id: %s", hospital_id)
    user_id = get_jwt_identity()

    try:
        response_data, status = hospital_service.get_hospital(user_id, hospital_id)
        logger.info("get_hospital: Informácie nemocnice načítané so statusom %s", status)
    except Exception as e:
        logger.exception("get_hospital: Výnimka pri získavaní nemocnice s id %s: %s", hospital_id, e)
        if request.accept_mimetypes['application/json'] >= request.accept_mimetypes['text/html']:
            return jsonify({'error': 'Internal server error'}), 500
        else:
            return render_template("error_500.html", error="Internal server error"), 500

    if request.accept_mimetypes['application/json'] >= request.accept_mimetypes['text/html']:
        return jsonify(response_data), status
    else:
        return render_template("hospital_details.html", hospital=response_data), status


@bp.route('/', methods=['GET'])
@jwt_required()
def get_hospitals():
    """
    Endpoint pre zobrazenie stránky nemocníc.
    Vyžaduje, aby bol používateľ prihlásený a mal rolu super_admin.
    Ak nie je, prístup je odmietnutý.
    """
    user_id = get_jwt_identity()
    try:
        user_id_int = int(user_id)
        message, status = hospital_service.check_user_id(user_id_int)
    except (ValueError, TypeError):
        if request.accept_mimetypes['application/json'] >= request.accept_mimetypes['text/html']:
            return jsonify({'error': 'Internal server error'}), 500
        else:
            return render_template("error_500.html", error="Internal server error"), 500
    if status != 200:
        return render_template('error_404.html'), 404
    else:
        logger.info("Používateľ s id %s pristupuje na stránku nemocníc", user_id_int)
        return render_template("hospitals.html"), status
