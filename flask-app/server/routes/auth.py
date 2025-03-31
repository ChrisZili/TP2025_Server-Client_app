from flask import Blueprint, request, render_template, flash, redirect, url_for, jsonify
from flask_jwt_extended import jwt_required, set_access_cookies, unset_jwt_cookies, get_jwt_identity

from server import db
from server.models import User
from server.services.auth_service import AuthService
from server.extensions import limiter

bp = Blueprint('auth', __name__, url_prefix='/')
auth_service = AuthService()


@bp.route('/login', methods=['GET'], endpoint='login_get')
def login_get():
    """Endpoint pre zobrazenie prihlasovacieho formulára."""
    # Rozhodovanie o výstupe na základe hlavičky Accept
    if request.accept_mimetypes['application/json'] >= request.accept_mimetypes['text/html']:
        return jsonify({"msg": "Login page"}), 200
    else:
        return render_template('login.html'), 200


@bp.route('/login', methods=['POST'], endpoint='login_post')
@limiter.limit("5 per 5 minutes", methods=['POST'])
def login_post():
    """
    Endpoint na prihlásenie používateľa.
    Pri odoslaní dát (POST) overí údaje a, ak sú správne,
    nastaví access token do HTTP-only cookie a presmeruje na dashboard.
    """

    # Vstupná kontrola: zistenie, v akom formáte boli dáta odoslané
    if request.is_json:
        data = request.get_json()
    else:
        data = request.form

    # Spracovanie prihlasovacích údajov cez AuthService
    result, status = auth_service.login_user(data)

    if status == 200:
        # Rozhodovanie o formáte odpovede na základe Accept hlavičky
        if request.accept_mimetypes['application/json'] >= request.accept_mimetypes['text/html']:
            response = jsonify(result)
        else:
            flash(result.get('message', 'Prihlásenie prebehlo úspešne'), 'success')
            response = redirect(url_for('auth.dashboard'))

        set_access_cookies(response, result.get('access_token'))
        return response, status
    else:
        if request.accept_mimetypes['application/json'] >= request.accept_mimetypes['text/html']:
            return jsonify(result), status
        else:
            flash(result.get('error', 'Prihlásenie zlyhalo'), 'error')
            return render_template('login.html'), status


@bp.route('/dashboard', methods=['GET'])
@jwt_required()
def dashboard():
    # Výstupná kontrola: preferovaný formát odpovede
    if request.accept_mimetypes['application/json'] >= request.accept_mimetypes['text/html']:
        return jsonify({"msg": "This endpoint returns HTML for dashboard"}), 200
    else:
        user_id = get_jwt_identity()
        try:
            user_id_int = int(user_id)
        except (ValueError, TypeError):
            flash("Neplatný používateľský identifikátor", "error")
            return render_template('error.html'), 400

        user = db.session.get(User, user_id_int)
        if not user:
            flash("Používateľ nenájdený", "error")
            return render_template('error.html'), 404

        return render_template('dashboard.html', user=user)


@bp.route('/logout', methods=['GET'])
def logout():
    """
    Endpoint na odhlásenie používateľa.
    Vymaže JWT cookie a presmeruje na prihlasovaciu stránku.
    """
    response = redirect(url_for('auth.login_get'))
    unset_jwt_cookies(response)
    return response


@bp.route('/', methods=['GET'])
def landing():
    # Rozhodovanie o výstupe na základe hlavičky Accept
    if request.accept_mimetypes['application/json'] >= request.accept_mimetypes['text/html']:
        return jsonify({"msg": "Landing page"}), 200
    else:
        return render_template('landing.html'), 200
