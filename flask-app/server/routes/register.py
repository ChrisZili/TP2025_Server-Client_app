import logging
from flask import Blueprint, render_template, abort, request, jsonify, url_for, redirect, flash
from server.services.register_service import RegisterService
from server.extensions import limiter

bp = Blueprint('register', __name__, url_prefix='/register')
register_service = RegisterService()

logger = logging.getLogger(__name__)


@bp.route('/', methods=['GET'], endpoint='register_select')
def register_select():
    """Endpoint pre výber typu registrácie.
       Zobrazí stránku s tlačidlami pre výber: pacient, lekár, technik.
    """
    logger.info("Register select page requested")
    # Pre túto stránku sa predpokladá HTML, ale ak by bol JSON požiadavka:
    if request.accept_mimetypes['application/json'] >= request.accept_mimetypes['text/html']:
        logger.debug("Returning JSON response for register select")
        return jsonify({"msg": "Select registration type"}), 200
    else:
        return render_template('register.html')


@bp.route('/<string:user_type>', methods=['GET'], endpoint='register_form')
def register_form(user_type):
    """Endpoint pre zobrazenie registračného formulára pre daný typ používateľa."""
    logger.info("Register form requested for user_type: %s", user_type)
    if user_type not in ['patient', 'doctor', 'technician']:
        logger.error("Invalid user_type: %s", user_type)
        abort(404)
    # Renderujeme príslušnú šablónu pre daný typ
    return render_template(f'register_{user_type}.html', user_type=user_type)


@bp.route('/<string:user_type>', methods=['POST'], endpoint='register_post')
@limiter.limit("3 per minute", methods=['POST'])
def register_post(user_type):
    """Endpoint na registráciu používateľa spracovaním odoslaných dát."""
    logger.info("Registration POST requested for user_type: %s", user_type)
    if user_type not in ['patient', 'doctor', 'technician']:
        logger.error("Invalid user_type in POST: %s", user_type)
        abort(404)

    # Vstupná kontrola: zisťujeme, či sú dáta zaslané ako JSON alebo formulárom
    if request.is_json:
        data = request.get_json()
        logger.debug("Received JSON registration data for %s: keys=%s", user_type, list(data.keys()))
    else:
        data = request.form
        logger.debug("Received Form registration data for %s: keys=%s", user_type, list(data.keys()))

    # Spracovanie registrácie cez service vrstvu
    result, status = register_service.register_user(data, user_type)
    logger.info("Registration result for %s: status=%s, result=%s", user_type, status, result)

    # Rozhodovanie o formáte výstupu na základe Accept hlavičky
    if request.accept_mimetypes['application/json'] >= request.accept_mimetypes['text/html']:
        # Ak klient preferuje JSON odpoveď
        response = jsonify(result)
        return response, status
    else:
        # Ak klient preferuje HTML
        if status == 201:
            flash(result.get('message', 'Registrácia prebehla úspešne.'), 'success')
            logger.debug("Registration successful, redirecting to login")
            response = redirect(url_for('auth.login_get'))
        else:
            flash(result.get('error', 'Registrácia zlyhala.'), 'error')
            logger.error("Registration failed (HTML), redirecting back to register form")
            response = redirect(url_for('register.register_form', user_type=user_type))
        return response
