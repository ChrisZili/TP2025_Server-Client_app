import logging
from flask import Blueprint, request, jsonify, render_template
from flask_jwt_extended import jwt_required, get_jwt_identity
from server.services.doctors_service import DoctorsService

bp = Blueprint('doctors', __name__, url_prefix='/doctors')
doctor_service = DoctorsService()

logger = logging.getLogger(__name__)


@bp.route('/add', methods=['POST'])
@jwt_required()
def add_doctor():
    """Pridanie doktora (len pre super_admina)."""
    logger.info("add_doctor endpoint vyžiadaný")
    user_id = get_jwt_identity()

    if not (request.is_json and request.accept_mimetypes['application/json'] >= request.accept_mimetypes['text/html']):
        logger.error("add_doctor: Neplatný vstup alebo Accept header")
        return jsonify({'error': 'Invalid input or only JSON responses supported'}), 406

    data = request.get_json()
    logger.debug("add_doctor: Prijaté dáta, keys: %s", list(data.keys()))

    try:
        response_data, status = doctor_service.add_doctor(user_id, data)
        logger.info("add_doctor: Doktor pridaný so statusom %s", status)
    except Exception as e:
        logger.exception("add_doctor: Výnimka pri pridávaní doktora: %s", e)
        return jsonify({'error': 'Internal server error'}), 500

    return jsonify(response_data), status


@bp.route('/update/<int:doctor_id>', methods=['PUT'])
@jwt_required()
def update_doctor(doctor_id):
    """Úprava doktora (len pre super_admina)."""
    logger.info("update_doctor endpoint vyžiadaný pre doctor_id: %s", doctor_id)
    user_id = get_jwt_identity()

    if not (request.is_json and request.accept_mimetypes['application/json'] >= request.accept_mimetypes['text/html']):
        logger.error("update_doctor: Neplatný vstup alebo Accept header")
        return jsonify({'error': 'Invalid input or only JSON responses supported'}), 406

    data = request.get_json()
    logger.debug("update_doctor: Prijaté dáta, keys: %s", list(data.keys()))

    try:
        response_data, status = doctor_service.update_doctor(user_id, doctor_id, data)
        logger.info("update_doctor: Doktor s id %s aktualizovaný so statusom %s", doctor_id, status)
    except Exception as e:
        logger.exception("update_doctor: Výnimka pri aktualizácii doktora: %s", e)
        return jsonify({'error': 'Internal server error'}), 500

    return jsonify(response_data), status


@bp.route('/list', methods=['GET'])
@jwt_required()
def list_doctors():
    """Získanie zoznamu doktorov (len pre super_admina)."""
    logger.info("list_doctors endpoint vyžiadaný")
    user_id = get_jwt_identity()

    if not (request.accept_mimetypes['application/json'] >= request.accept_mimetypes['text/html']):
        logger.error("list_doctors: Frontend nevyžaduje JSON odpoveď")
        return jsonify({'error': 'Only JSON responses supported'}), 406

    try:
        response_data, status = doctor_service.get_doctors(user_id)
        logger.info("list_doctors: Zoznam doktorov načítaný so statusom %s", status)
    except Exception as e:
        logger.exception("list_doctors: Výnimka pri získavaní doktorov: %s", e)
        return jsonify({'error': 'Internal server error'}), 500

    return jsonify(response_data), status


@bp.route('/<int:doctor_id>', methods=['GET'])
@jwt_required()
def get_doctor(doctor_id):
    """Získanie informácií o konkrétnom doktorovi."""
    logger.info("get_doctor endpoint vyžiadaný pre doctor_id: %s", doctor_id)
    user_id = get_jwt_identity()

    try:
        response_data, status = doctor_service.get_doctor(user_id, doctor_id)
        logger.info("get_doctor: Informácie o doktorovi načítané so statusom %s", status)
    except Exception as e:
        logger.exception("get_doctor: Výnimka pri získavaní doktora: %s", e)
        if request.accept_mimetypes['application/json'] >= request.accept_mimetypes['text/html']:
            return jsonify({'error': 'Internal server error'}), 500
        else:
            return render_template("error_500.html", error="Internal server error"), 500

    if request.accept_mimetypes['application/json'] >= request.accept_mimetypes['text/html']:
        return jsonify(response_data), status
    else:
        return render_template("doctor_details.html", doctor=response_data), status


@bp.route('/', methods=['GET'])
@jwt_required()
def get_doctors_page():
    """Zobrazenie hlavnej stránky doktorov (len pre super_admina)."""
    user_id = get_jwt_identity()
    try:
        user_id_int = int(user_id)
        message, status = doctor_service.check_user_id(user_id_int)
    except (ValueError, TypeError):
        if request.accept_mimetypes['application/json'] >= request.accept_mimetypes['text/html']:
            return jsonify({'error': 'Internal server error'}), 500
        else:
            return render_template("error_500.html", error="Internal server error"), 500

    if status != 200:
        return render_template('error_404.html'), 404
    else:
        logger.info("Používateľ s id %s pristupuje na stránku adminov", user_id_int)
        return render_template("doctors.html"), status
