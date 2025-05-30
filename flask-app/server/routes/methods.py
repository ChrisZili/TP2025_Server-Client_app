import logging
from flask import Blueprint, request, jsonify, render_template
from flask_jwt_extended import jwt_required, get_jwt_identity
from server.services.methods_service import MethodsService

bp = Blueprint('methods', __name__, url_prefix='/methods')
methods_service = MethodsService()

logger = logging.getLogger(__name__)

@bp.route('/add', methods=['POST'])
@jwt_required()
def add_method():
    """Add a new method."""
    logger.info("add_method endpoint requested")
    user_id = get_jwt_identity()

    if not (request.is_json and request.accept_mimetypes['application/json'] >= request.accept_mimetypes['text/html']):
        logger.error("add_method: Invalid input or Accept header")
        return jsonify({'error': 'Invalid input or only JSON responses supported'}), 406

    data = request.get_json()
    logger.debug("add_method: Received data, keys: %s", list(data.keys()))

    try:
        response_data, status = methods_service.add_method(user_id, data)
        logger.info("add_method: Method added with status %s", status)
    except Exception as e:
        logger.exception("add_method: Exception when adding method: %s", e)
        return jsonify({'error': 'Internal server error'}), 500

    return jsonify(response_data), status

@bp.route('/update/<int:method_id>', methods=['PUT'])
@jwt_required()
def update_method(method_id):
    """Update an existing method."""
    logger.info("update_method endpoint requested for method_id: %s", method_id)
    user_id = get_jwt_identity()

    if not (request.is_json and request.accept_mimetypes['application/json'] >= request.accept_mimetypes['text/html']):
        logger.error("update_method: Invalid input or Accept header")
        return jsonify({'error': 'Invalid input or only JSON responses supported'}), 406

    data = request.get_json()
    logger.debug("update_method: Received data, keys: %s", list(data.keys()))

    try:
        response_data, status = methods_service.update_method(user_id, method_id, data)
        logger.info("update_method: Method with id %s updated with status %s", method_id, status)
    except Exception as e:
        logger.exception("update_method: Exception when updating method: %s", e)
        return jsonify({'error': 'Internal server error'}), 500

    return jsonify(response_data), status

@bp.route('/delete/<int:method_id>', methods=['DELETE'])
@jwt_required()
def delete_method(method_id):
    """Delete a method."""
    logger.info("delete_method endpoint requested for method_id: %s", method_id)
    user_id = get_jwt_identity()

    try:
        response_data, status = methods_service.delete_method(user_id, method_id)
        logger.info("delete_method: Method with id %s deleted with status %s", method_id, status)
    except Exception as e:
        logger.exception("delete_method: Exception when deleting method: %s", e)
        return jsonify({'error': 'Internal server error'}), 500

    return jsonify(response_data), status

@bp.route('/list', methods=['GET'])
@jwt_required()
def list_methods():
    """Get list of all methods."""
    logger.info("list_methods endpoint requested")
    user_id = get_jwt_identity()

    if not (request.accept_mimetypes['application/json'] >= request.accept_mimetypes['text/html']):
        logger.error("list_methods: Frontend doesn't require JSON response")
        return jsonify({'error': 'Only JSON responses supported'}), 406

    try:
        response_data, status = methods_service.get_methods(user_id)
        logger.info("list_methods: Methods list loaded with status %s", status)
    except Exception as e:
        logger.exception("list_methods: Exception when getting methods: %s", e)
        return jsonify({'error': 'Internal server error'}), 500

    return jsonify(response_data), status

@bp.route('/<int:method_id>', methods=['GET'])
@jwt_required()
def get_method(method_id):
    """Get information about a specific method."""
    logger.info("get_method endpoint requested for method_id: %s", method_id)
    user_id = get_jwt_identity()

    try:
        response_data, status = methods_service.get_method(user_id, method_id)
        logger.info("get_method: Method info loaded with status %s", status)
    except Exception as e:
        logger.exception("get_method: Exception when getting method: %s", e)
        if request.accept_mimetypes['application/json'] >= request.accept_mimetypes['text/html']:
            return jsonify({'error': 'Internal server error'}), 500
        else:
            return render_template("error_500.html", error="Internal server error"), 500

    if request.accept_mimetypes['application/json'] >= request.accept_mimetypes['text/html']:
        return jsonify(response_data), status
    else:
        return render_template("method_details.html", method=response_data), status

@bp.route('/', methods=['GET'])
@jwt_required()
def get_methods_page():
    """Show main methods page."""
    user_id = get_jwt_identity()
    try:
        user_id_int = int(user_id)
        message, status = methods_service.check_user_id(user_id_int)
    except (ValueError, TypeError):
        if request.accept_mimetypes['application/json'] >= request.accept_mimetypes['text/html']:
            return jsonify({'error': 'Internal server error'}), 500
        else:
            return render_template("error_500.html", error="Internal server error"), 500

    if status != 200:
        return render_template('error_404.html'), 404
    else:
        logger.info("User with id %s accessing methods page", user_id_int)
        return render_template("methods.html"), status
