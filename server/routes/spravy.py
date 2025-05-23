import logging
from flask import Blueprint, request, jsonify, render_template
from flask_jwt_extended import jwt_required, get_jwt_identity

bp = Blueprint('spravy', __name__, url_prefix='/spravy')

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)  # make sure DEBUG logs are shown
logger.info("#####################     Spravy blueprint module loaded    ###############")

@bp.route('/', methods=['GET'])
@jwt_required()
def get_spravy_page():
    logger.debug("Entered get_spravy_page()")

    user_id = get_jwt_identity()
    logger.debug(f"User id from JWT: {user_id}")

    try:
        user_id_int = int(user_id)
        logger.debug(f"user_id_int successfully converted: {user_id_int}")
        # Example check if needed
        # message, status = some_check(user_id_int)
        status = 200  # temporarily hardcoded for debugging
    except (ValueError, TypeError) as e:
        logger.error(f"Error converting user_id: {e}")
        if request.accept_mimetypes['application/json'] >= request.accept_mimetypes['text/html']:
            return jsonify({'error': 'Internal server error'}), 500
        else:
            return render_template("error_500.html", error="Internal server error"), 500

    if status != 200:
        logger.debug("Status not 200, returning 404 error page")
        return render_template('error_404.html'), 404
    else:
        logger.info(f"User with id {user_id_int} accessed spravy page")
        return render_template("spravy.html"), 200