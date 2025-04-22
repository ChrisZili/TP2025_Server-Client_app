import logging

from flask import Blueprint, request, jsonify, render_template
from flask_jwt_extended import jwt_required, get_jwt_identity
from server.services.technicians_service import TechniciansService

bp = Blueprint('technicians', __name__, url_prefix='/technicians')
technician_service = TechniciansService()

logger = logging.getLogger(__name__)


@bp.route('/add', methods=['POST'])
@jwt_required()
def add_technician():
    """Pridanie technika (len pre super_admina)."""
    logger.info("add_technician endpoint vyžiadaný")
    user_id = get_jwt_identity()

    if not (request.is_json and request.accept_mimetypes['application/json'] >= request.accept_mimetypes['text/html']):
        logger.error("add_technician: Neplatný vstup alebo Accept header")
        return jsonify({'error': 'Invalid input or only JSON responses supported'}), 406

    data = request.get_json()
    logger.debug("add_technician: Prijaté dáta, keys: %s", list(data.keys()))

    try:
        response_data, status = technician_service.add_technician(user_id, data)
        logger.info("add_technician: Technik pridaný so statusom %s", status)
    except Exception as e:
        logger.exception("add_technician: Výnimka pri pridávaní technika: %s", e)
        return jsonify({'error': 'Internal server error'}), 500

    return jsonify(response_data), status


@bp.route('/update/<int:technician_id>', methods=['PUT'])
@jwt_required()
def update_technician(technician_id):
    """Úprava technika (len pre super_admina)."""
    logger.info("update_technician endpoint vyžiadaný pre technician_id: %s", technician_id)
    user_id = get_jwt_identity()

    if not (request.is_json and request.accept_mimetypes['application/json'] >= request.accept_mimetypes['text/html']):
        logger.error("update_technician: Neplatný vstup alebo Accept header")
        return jsonify({'error': 'Invalid input or only JSON responses supported'}), 406

    data = request.get_json()
    logger.debug("update_technician: Prijaté dáta, keys: %s", list(data.keys()))

    try:
        response_data, status = technician_service.update_technician(user_id, technician_id, data)
        logger.info("update_technician: Technik s id %s aktualizovaný so statusom %s", technician_id, status)
    except Exception as e:
        logger.exception("update_technician: Výnimka pri aktualizácii technika: %s", e)
        return jsonify({'error': 'Internal server error'}), 500

    return jsonify(response_data), status


@bp.route('/list', methods=['GET'])
@jwt_required()
def list_technicians():
    """Získanie zoznamu technikov (len pre super_admina)."""
    logger.info("list_technicians endpoint vyžiadaný")
    user_id = get_jwt_identity()

    if not (request.accept_mimetypes['application/json'] >= request.accept_mimetypes['text/html']):
        logger.error("list_technicians: Frontend nevyžaduje JSON odpoveď")
        return jsonify({'error': 'Only JSON responses supported'}), 406

    try:
        response_data, status = technician_service.get_technicians(user_id)
        logger.info("list_technicians: Zoznam technikov načítaný so statusom %s", status)
    except Exception as e:
        logger.exception("list_technicians: Výnimka pri získavaní technikov: %s", e)
        return jsonify({'error': 'Internal server error'}), 500

    return jsonify(response_data), status


@bp.route('/<int:technician_id>', methods=['GET'])
@jwt_required()
def get_technician(technician_id):
    """Získanie informácií o konkrétnom technikovi."""
    logger.info("get_technician endpoint vyžiadaný pre technician_id: %s", technician_id)
    user_id = get_jwt_identity()

    try:
        response_data, status = technician_service.get_technician(user_id, technician_id)
        logger.info("get_technician: Informácie technika načítané so statusom %s", status)
    except Exception as e:
        logger.exception("get_technician: Výnimka pri získavaní technika: %s", e)
        if request.accept_mimetypes['application/json'] >= request.accept_mimetypes['text/html']:
            return jsonify({'error': 'Internal server error'}), 500
        else:
            return render_template("error_500.html", error="Internal server error"), 500

    if request.accept_mimetypes['application/json'] >= request.accept_mimetypes['text/html']:
        return jsonify(response_data), status
    else:
        return render_template("technician_details.html", technician=response_data), status


@bp.route('/', methods=['GET'])
@jwt_required()
def get_technicians_page():
    """Zobrazenie hlavnej stránky technikov (vyžaduje rolu super_admin)."""
    user_id = get_jwt_identity()
    try:
        user_id_int = int(user_id)
        message, status = technician_service.check_user_id(user_id_int)
    except (ValueError, TypeError):
        if request.accept_mimetypes['application/json'] >= request.accept_mimetypes['text/html']:
            return jsonify({'error': 'Internal server error'}), 500
        else:
            return render_template("error_500.html", error="Internal server error"), 500

    if status != 200:
        return render_template('error_404.html'), 404
    else:
        logger.info("Používateľ s id %s pristupuje na stránku technikov", user_id_int)
        return render_template("technicians.html"), status
