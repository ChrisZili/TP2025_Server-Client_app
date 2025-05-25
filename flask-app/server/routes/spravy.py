import logging
from flask import Blueprint, request, jsonify, render_template
from flask_jwt_extended import jwt_required, get_jwt_identity
from server.database import db
from server.models.messages_data import MessageData
from server.services.messages_service import MessageService

bp = Blueprint('spravy', __name__, url_prefix='/spravy')

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)  # make sure DEBUG logs are shown
logger.info("#####################     Spravy blueprint module loaded    ###############")


@bp.route("/send", methods=["POST"])
@jwt_required()
def send_message():
    logger.info("send_message endpoint hit")

    user_id = get_jwt_identity()

    recipient = request.form.get("recipient")
    message = request.form.get("message")
    image = request.files.get("image")  # Not handled yet, just received

    logger.debug("Send message form data: sender=%s, recipient=%s, message length=%d", user_id, recipient, len(message or ""))

    if not recipient or not message:
        return jsonify({"error": "Missing recipient or message"}), 400

    # At this point, we don't support uploading the image yet — so we'll skip saving it.
    # If needed, you can later extend this block to save the file.

    try:
        result, status_code = MessageService.send_message({
            'sender_id': user_id,
            'recipient_name_or_id': recipient,
            'content': message,
            # 'image': image  # optional later
        })

        return jsonify(result), status_code

    except Exception as e:
        logger.exception("send_message: Error")
        return jsonify({"error": "Internal server error"}), 500



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