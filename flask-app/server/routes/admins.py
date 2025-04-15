import logging
from os import abort

from flask import Blueprint, request, jsonify, render_template
from flask_jwt_extended import jwt_required, get_jwt_identity
from server.services.admins_service import AdminsService

bp = Blueprint('admins', __name__, url_prefix='/admins')
admin_service = AdminsService()

logger = logging.getLogger(__name__)


@bp.route('/add', methods=['POST'])
@jwt_required()
def add_admin():
    """Pridanie admina (len pre super_admina)."""
    logger.info("add_admin endpoint vyžiadaný")
    user_id = get_jwt_identity()

    if not (request.is_json and request.accept_mimetypes['application/json'] >= request.accept_mimetypes['text/html']):
        logger.error("add_admin: Neplatný vstup alebo Accept header")
        return jsonify({'error': 'Invalid input or only JSON responses supported'}), 406

    data = request.get_json()
    logger.debug("add_admin: Prijaté dáta, keys: %s", list(data.keys()))

    try:
        response_data, status = admin_service.add_admin(user_id, data)
        logger.info("add_admin: Admin pridaný so statusom %s", status)
    except Exception as e:
        logger.exception("add_admin: Výnimka pri pridávaní admina: %s", e)
        return jsonify({'error': 'Internal server error'}), 500

    return jsonify(response_data), status


@bp.route('/update/<int:admin_id>', methods=['PUT'])
@jwt_required()
def update_admin(admin_id):
    """Úprava admina (len pre super_admina)."""
    logger.info("update_admin endpoint vyžiadaný pre admin_id: %s", admin_id)
    user_id = get_jwt_identity()

    if not (request.is_json and request.accept_mimetypes['application/json'] >= request.accept_mimetypes['text/html']):
        logger.error("update_admin: Neplatný vstup alebo Accept header")
        return jsonify({'error': 'Invalid input or only JSON responses supported'}), 406

    data = request.get_json()
    logger.debug("update_admin: Prijaté dáta, keys: %s", list(data.keys()))

    try:
        response_data, status = admin_service.update_admin(user_id, admin_id, data)
        logger.info("update_admin: Admin s id %s aktualizovaný so statusom %s", admin_id, status)
    except Exception as e:
        logger.exception("update_admin: Výnimka pri aktualizácii admina: %s", e)
        return jsonify({'error': 'Internal server error'}), 500

    return jsonify(response_data), status


@bp.route('/list', methods=['GET'])
@jwt_required()
def list_admins():
    """Získanie zoznamu adminov (len pre super_admina)."""
    logger.info("list_admins endpoint vyžiadaný")
    user_id = get_jwt_identity()

    if not (request.accept_mimetypes['application/json'] >= request.accept_mimetypes['text/html']):
        logger.error("list_admins: Frontend nevyžaduje JSON odpoveď")
        return jsonify({'error': 'Only JSON responses supported'}), 406

    try:
        response_data, status = admin_service.get_admins(user_id)
        logger.info("list_admins: Zoznam adminov načítaný so statusom %s", status)
    except Exception as e:
        logger.exception("list_admins: Výnimka pri získavaní adminov: %s", e)
        return jsonify({'error': 'Internal server error'}), 500

    return jsonify(response_data), status


@bp.route('/<int:admin_id>', methods=['GET'])
@jwt_required()
def get_admin(admin_id):
    """Získanie informácií o konkrétnom adminovi."""
    logger.info("get_admin endpoint vyžiadaný pre admin_id: %s", admin_id)
    user_id = get_jwt_identity()

    try:
        response_data, status = admin_service.get_admin(user_id, admin_id)
        logger.info("get_admin: Informácie admina načítané so statusom %s", status)
    except Exception as e:
        logger.exception("get_admin: Výnimka pri získavaní admina: %s", e)
        if request.accept_mimetypes['application/json'] >= request.accept_mimetypes['text/html']:
            return jsonify({'error': 'Internal server error'}), 500
        else:
            return render_template("error_500.html", error="Internal server error"), 500

    if request.accept_mimetypes['application/json'] >= request.accept_mimetypes['text/html']:
        return jsonify(response_data), status
    else:
        return render_template("admin_details.html", admin=response_data), status


@bp.route('/', methods=['GET'])
@jwt_required()
def get_admins_page():
    """Zobrazenie hlavnej stránky adminov (vyžaduje rolu super_admin)."""
    user_id = get_jwt_identity()
    try:
        user_id_int = int(user_id)
        message, status = admin_service.check_user_id(user_id_int)
    except (ValueError, TypeError):
        if request.accept_mimetypes['application/json'] >= request.accept_mimetypes['text/html']:
            return jsonify({'error': 'Internal server error'}), 500
        else:
            return render_template("error_500.html", error="Internal server error"), 500

    if status != 200:
        return render_template('error_404.html'), 404
    else:
        logger.info("Používateľ s id %s pristupuje na stránku adminov", user_id_int)
        return render_template("admins.html"), status
