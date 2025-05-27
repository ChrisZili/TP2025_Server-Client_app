import logging
from flask import Blueprint, request, jsonify, render_template
from flask_jwt_extended import jwt_required, get_jwt_identity
from server.services.patients_service import PatientsService

bp = Blueprint('patients', __name__, url_prefix='/patients')
patient_service = PatientsService()

logger = logging.getLogger(__name__)


@bp.route('/add', methods=['POST'])
@jwt_required()
def add_patient():
    """Pridanie pacienta."""
    logger.info("add_patient endpoint vyžiadaný")
    user_id = get_jwt_identity()

    if not (request.is_json and request.accept_mimetypes['application/json'] >= request.accept_mimetypes['text/html']):
        logger.error("add_patient: Neplatný vstup alebo Accept header")
        return jsonify({'error': 'Invalid input or only JSON responses supported'}), 406

    data = request.get_json()
    logger.debug("add_patient: Prijaté dáta, keys: %s", list(data.keys()))

    try:
        response_data, status = patient_service.add_patient(user_id, data)
        logger.info("add_patient: Pacient pridaný so statusom %s", status)
    except Exception as e:
        logger.exception("add_patient: Výnimka pri pridávaní pacienta: %s", e)
        return jsonify({'error': 'Internal server error'}), 500

    return jsonify(response_data), status

@bp.route('/assign', methods=['POST'])
@jwt_required()
def assign_patient():
    """Úprava pacienta."""
    logger.info("assign_patient endpoint vyžiadaný")
    user_id = get_jwt_identity()

    if not (request.is_json and request.accept_mimetypes['application/json'] >= request.accept_mimetypes['text/html']):
        logger.error("assign_patient: Neplatný vstup alebo Accept header")
        return jsonify({'error': 'Invalid input or only JSON responses supported'}), 406

    data = request.get_json()
    logger.debug("assign_patient: Prijaté dáta, keys: %s", list(data.keys()))

    try:
        response_data, status = patient_service.assign_patient(user_id, data)
        logger.info(f"{response_data} so statusom: {status}")
    except Exception as e:
        logger.exception("assign_patient: Výnimka pri pridavani pacienta: %s", e)
        return jsonify({'error': 'Internal server error'}), 500

    return jsonify(response_data), status


@bp.route('/update/<int:patient_id>', methods=['PUT'])
@jwt_required()
def update_patient(patient_id):
    """Úprava pacienta."""
    logger.info("update_patient endpoint vyžiadaný pre patient_id: %s", patient_id)
    user_id = get_jwt_identity()

    if not (request.is_json and request.accept_mimetypes['application/json'] >= request.accept_mimetypes['text/html']):
        logger.error("update_patient: Neplatný vstup alebo Accept header")
        return jsonify({'error': 'Invalid input or only JSON responses supported'}), 406

    data = request.get_json()
    logger.debug("update_patient: Prijaté dáta, keys: %s", list(data.keys()))

    try:
        response_data, status = patient_service.update_patient(user_id, patient_id, data)
        logger.info("update_patient: Pacient s id %s aktualizovaný so statusom %s", patient_id, status)
    except Exception as e:
        logger.exception("update_patient: Výnimka pri aktualizácii pacienta: %s", e)
        return jsonify({'error': 'Internal server error'}), 500

    return jsonify(response_data), status


@bp.route('/list', methods=['GET'])
@jwt_required()
def list_patients():
    """Získanie zoznamu pacientov."""
    logger.info("list_patients endpoint vyžiadaný")
    user_id = get_jwt_identity()

    if not (request.accept_mimetypes['application/json'] >= request.accept_mimetypes['text/html']):
        logger.error("list_patients: Frontend nevyžaduje JSON odpoveď")
        return jsonify({'error': 'Only JSON responses supported'}), 406

    try:
        response_data, status = patient_service.get_patients(user_id)
        logger.info("list_patients: Zoznam pacientov načítaný so statusom %s", status)
    except Exception as e:
        logger.exception("list_patients: Výnimka pri získavaní pacientov: %s", e)
        return jsonify({'error': 'Internal server error'}), 500

    return jsonify(response_data), status

@bp.route('/unassigned_list', methods=['GET'])
@jwt_required()
def unassigned_list_patients():
    """Získanie zoznamu pacientov."""
    logger.info("list_patients endpoint vyžiadaný")
    user_id = get_jwt_identity()

    if not (request.accept_mimetypes['application/json'] >= request.accept_mimetypes['text/html']):
        logger.error("list_patients: Frontend nevyžaduje JSON odpoveď")
        return jsonify({'error': 'Only JSON responses supported'}), 406

    try:
        response_data, status = patient_service.get_unassigned_patients(user_id)
        logger.info("list_patients: Zoznam pacientov načítaný so statusom %s", status)
    except Exception as e:
        logger.exception("list_patients: Výnimka pri získavaní pacientov: %s", e)
        return jsonify({'error': 'Internal server error'}), 500

    return jsonify(response_data), status

@bp.route('/<int:patient_id>', methods=['GET'])
@jwt_required()
def get_patient(patient_id):
    """Z��skanie informácií o konkrétnom pacientovi."""
    logger.info("get_patient endpoint vyžiadaný pre patient_id: %s", patient_id)
    user_id = get_jwt_identity()

    try:
        response_data, status = patient_service.get_patient(user_id, patient_id)
        logger.info("get_patient: Informácie pacienta načítané so statusom %s", status)
    except Exception as e:
        logger.exception("get_patient: Výnimka pri získavaní pacienta: %s", e)
        if request.accept_mimetypes['application/json'] >= request.accept_mimetypes['text/html']:
            return jsonify({'error': 'Internal server error'}), 500
        else:
            return render_template("error_500.html", error="Internal server error"), 500

    if request.accept_mimetypes['application/json'] >= request.accept_mimetypes['text/html']:
        return jsonify(response_data), status
    else:
        return render_template("patient_details.html", patient=response_data), status


@bp.route('/', methods=['GET'])
@jwt_required()
def get_patients_page():
    """Zobrazenie hlavnej stránky pacientov."""
    user_id = get_jwt_identity()
    try:
        user_id_int = int(user_id)
        message, status = patient_service.check_user_id(user_id_int)
    except (ValueError, TypeError):
        if request.accept_mimetypes['application/json'] >= request.accept_mimetypes['text/html']:
            return jsonify({'error': 'Internal server error'}), 500
        else:
            return render_template("error_500.html", error="Internal server error"), 500

    if status != 200:
        return render_template('error_404.html'), 404
    else:
        logger.info("Používateľ s id %s pristupuje na stránku pacientov", user_id_int)
        return render_template("patients.html"), status