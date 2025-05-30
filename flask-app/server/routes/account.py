import logging
from flask import Blueprint, request, jsonify, abort, render_template, session, flash, redirect, url_for
from flask_jwt_extended import jwt_required, get_jwt_identity
from server.models import User
from server.services.account_service import AccountService
from server.database import db
from server.extensions import limiter

bp = Blueprint('settings', __name__, url_prefix='/settings')
account_service = AccountService()

logger = logging.getLogger(__name__)


@bp.route('/', methods=['GET'], endpoint='account_page')
@jwt_required()
def account_page():
    # Jednoduché zobrazenie stránky účtu
    return render_template("account.html")


@bp.route('/info', methods=['GET'], endpoint='account_info')
@jwt_required()
def account_info():
    # Vstupná kontrola: validácia user_id z tokenu
    user_id = get_jwt_identity()
    try:
        user_id_int = int(user_id)
    except (ValueError, TypeError):
        logger.error("Neplatný user_id získaný z tokenu: %s", user_id)
        if request.accept_mimetypes['application/json'] >= request.accept_mimetypes['text/html']:
            return jsonify({'error': 'Neplatné údaje tokenu'}), 400
        else:
            flash("Neplatné údaje tokenu", "error")
            return render_template("error_400.html"), 400

    # Získanie údajov o účte pomocou service vrstvy
    response, status = AccountService.get_account_info(user_id_int)
    logger.info("Údaje účtu boli úspešne získané pre používateľa %s", user_id_int)

    # Výstupná kontrola: podľa hlavičky Accept vrátime JSON alebo HTML
    if request.accept_mimetypes['application/json'] >= request.accept_mimetypes['text/html']:
        return jsonify(response), status
    else:
        return render_template("account.html", user=response), status


@bp.route('/edit', methods=['POST'], endpoint='edit_current_account_post')
@jwt_required()
def edit_current_account_post():
    logger.info("Spustená požiadavka na úpravu účtu")

    # Vstupná kontrola: zistieme, či ide o JSON alebo formulárové dáta
    if request.is_json:
        data = request.get_json()
        # Príklad validácie: overíme, či JSON obsahuje potrebné pole "some_required_field"
        if not data or 'some_required_field' not in data:
            logger.error("Chýba povinné pole v JSON vstupoch")
            if request.accept_mimetypes['application/json'] >= request.accept_mimetypes['text/html']:
                return jsonify({'error': 'Chýba povinné pole'}), 400
            else:
                flash("Chýba povinné pole", "error")
                return render_template("error_400.html"), 400
    else:
        data = request.form
        # Príklad validácie pre formuláre
        if not data or 'some_required_field' not in data:
            logger.error("Chýba povinné pole vo formulárových dátach")
            flash("Chýba povinné pole", "error")
            return render_template("error_400.html"), 400

    # Tu by nasledovala logika pre aktualizáciu účtu (napr. account_service.update_account(data))
    # Pre ukážku zavoláme len account_info(), aby sme vrátili aktuálne údaje
    logger.info("Údaje na úpravu účtu: %s", data)
    return account_info()


def _get_current_user():
    """Spoločná logika pre získanie údajov o prihlásenom používateľovi."""
    user_id = get_jwt_identity()
    try:
        user_id_int = int(user_id)
    except (ValueError, TypeError):
        logger.error("Neplatný user_id pre získanie aktuálneho používateľa: %s", user_id)
        flash('Neplatný používateľ', 'error')
        return render_template('error_400.html'), 400

    user = db.session.get(User, user_id_int)
    if not user:
        logger.error("Používateľ s id %s nebol nájdený", user_id_int)
        flash('User not found', 'error')
        return render_template('error_404.html'), 404

    logger.info("Používateľ %s úspešne načítaný", user_id_int)
    return render_template("account.html", user=user)
