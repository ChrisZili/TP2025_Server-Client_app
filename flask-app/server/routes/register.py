import logging
from flask import Blueprint, render_template, abort, request, jsonify, url_for, redirect, flash, make_response
from server.services.register_service import RegisterService
from server.extensions import limiter

bp = Blueprint('register', __name__, url_prefix='/register')
register_service = RegisterService()

logger = logging.getLogger(__name__)

@bp.route('/', methods=['GET'], endpoint='register_form')
def register_form():
    """Zobrazenie registračného formulára pre pacienta (user_type = 'patient')."""
    user_type = 'patient'
    logger.info("Register form requested for user_type: %s", user_type)
    # Pridaj no-cache hlavičky, ak potrebuješ
    html = render_template('register_patient.html', user_type=user_type)
    response = make_response(html)
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    return response

@bp.route('/', methods=['POST'], endpoint='register_post')
@limiter.limit("3 per minute", methods=['POST'])
def register_post():
    """Spracovanie registračného formulára pre pacienta.
       Pri chybe sa posiela form_data späť do šablóny.
       (user_type je automaticky 'patient')
    """
    user_type = 'patient'
    logger.info("Registration POST for user_type: %s", user_type)
    if request.is_json:
        data = request.get_json()
        logger.debug("Received JSON registration data for %s: keys=%s", user_type, list(data.keys()))
    else:
        data = request.form
        logger.debug("Received Form registration data for %s: keys=%s", user_type, list(data.keys()))

    result, status = register_service.register_user(data, user_type)
    logger.info("Registration result for %s: status=%s, result=%s", user_type, status, result)

    if request.accept_mimetypes['application/json'] >= request.accept_mimetypes['text/html']:
        return jsonify(result), status
    else:
        if status == 201:
            flash(result.get('message', 'Registration successful'), 'success')
            logger.debug("Registration successful, redirecting to login")
            return redirect(url_for('auth.login_get'))
        else:
            flash(result.get('error', 'Registration failed'), 'error')
            logger.error("Registration failed (HTML), re-render form with partial data")
            data_dict = dict(data)
            data_dict.pop('password', None)
            return render_template('register_patient.html', user_type=user_type, form_data=data_dict), 400
