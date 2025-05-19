import logging
from server.database import db
from server.models.user import User
from server.services.technicians_service import TechniciansService
from server.services.patients_service import PatientsService
from server.services.doctors_service import DoctorsService

logger = logging.getLogger(__name__)

class RegisterService:
    def register_user(self, data, user_type):
        """Registrácia nového používateľa s kontrolou duplicity a logovaním."""
        logger.info("Spustená registrácia používateľa. user_type: %s, data keys: %s", user_type, list(data.keys()))
        try:
            email = data.get('email')
            if not email:
                logger.error("Registrácia zlyhala: email nie je poskytnutý")
                return {'error': 'Email is required'}, 400

            # Overenie, či už existuje rovnaký email
            if User.query.filter_by(email=email).first():
                logger.error("Registrácia zlyhala: Email %s už existuje", email)
                return {'error': 'Email already exists'}, 400

            # Kontrola, či bol zadaný typ používateľa
            if not user_type:
                logger.error("Registrácia zlyhala: user_type nie je zadaný")
                return {'error': 'Missing required fields: user type'}, 400

            # Volanie príslušnej registračnej metódy podľa typu používateľa
            if user_type == 'patient':
                logger.info("Volanie registračnej metódy pre pacienta")
                return PatientsService().register_patient(data)
            elif user_type == 'technician':
                logger.info("Volanie registračnej metódy pre technika")
                return TechniciansService().add_technician(data)
            elif user_type == 'doctor':
                logger.info("Volanie registračnej metódy pre lekára")
                return DoctorsService().register_doctor(data)
            else:
                logger.error("Registrácia zlyhala: Neplatný user_type: %s", user_type)
                return {'error': 'Invalid user type'}, 400

        except Exception as e:
            db.session.rollback()
            logger.exception("Výnimka pri registrácii používateľa: %s", e)
            return {'error': str(e)}, 500
