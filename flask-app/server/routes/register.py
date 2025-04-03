import logging
from flask import Blueprint, render_template, abort, request, jsonify, url_for, redirect, flash
from server.services.register_service import RegisterService
from server.extensions import limiter

bp = Blueprint('register', __name__, url_prefix='/register')
register_service = RegisterService()

logger = logging.getLogger(__name__)

#TODO: Opravit volanie(nech neni /register/patient...)

"""
@bp.route('/', methods=['GET'], endpoint='register_select')
def register_select():
    Endpoint pre výber typu registrácie.
    logger.info("Register select page requested")
    if request.accept_mimetypes['application/json'] >= request.accept_mimetypes['text/html']:
        return jsonify({"msg": "Select registration type"}), 200
    else:
        return render_template('register.html')
"""

@bp.route('/<string:user_type>', methods=['GET'], endpoint='register_form')
def register_form(user_type):
    """Zobrazenie registračného formulára pre daný user_type."""
    logger.info("Register form requested for user_type: %s", user_type)
    if user_type not in ['patient']: #, 'doctor', 'technician'
        logger.error("Invalid user_type: %s", user_type)
        abort(404)
    # Zobrazíme prázdny formulár:
    return render_template(f'register_{user_type}.html', user_type=user_type)

@bp.route('/<string:user_type>', methods=['POST'], endpoint='register_post')
@limiter.limit("3 per minute", methods=['POST'])
def register_post(user_type):
    """Spracovanie registračného formulára. Pri chybe posielame `form_data` späť do šablóny."""
    logger.info("Registration POST for user_type: %s", user_type)
    if user_type not in ['patient']: #, 'doctor', 'technician'
        abort(404)

    # Vstupná kontrola: zisťujeme, či sú dáta zaslané ako JSON alebo formulárom
    if request.is_json:
        data = request.get_json()
        logger.debug("Received JSON registration data for %s: keys=%s", user_type, list(data.keys()))
    else:
        data = request.form
        logger.debug("Received Form registration data for %s: keys=%s", user_type, list(data.keys()))

    result, status = register_service.register_user(data, user_type)
    logger.info("Registration result for %s: status=%s, result=%s", user_type, status, result)

    # Ak preferuje JSON (napr. API volanie), vrátime JSON
    if request.accept_mimetypes['application/json'] >= request.accept_mimetypes['text/html']:
        return jsonify(result), status
    else:
        # HTML režim
        if status == 201:
            # Úspech -> flash + redirect (POST-Redirect-GET)
            flash(result.get('message', 'Registration successful'), 'success')
            logger.debug("Registration successful, redirecting to login")
            return redirect(url_for('auth.login_get'))
        else:
            # Neúspech -> zobraz šablónu s tým, čo prišlo (form_data),
            # aby používateľ nemusel všetko vypisovať odznova.
            flash(result.get('error', 'Registration failed'), 'error')
            logger.error("Registration failed (HTML), redirecting back to register form")

            # PRE BEZPEČNOSŤ: odstránime heslo, aby sa nezobrazilo vo formulári
            # (vo výnimočných prípadoch by ste ho tam mohli nechať, ale neodporúča sa)
            data_dict = dict(data)
            data_dict.pop('password', None)

            logger.error("Registration failed -> re-render form with partial data")

            return (
                render_template(
                    f'register_{user_type}.html',
                    user_type=user_type,
                    form_data=data_dict
                ),
                400
            )
