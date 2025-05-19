import logging
from server.database import db
from server.models.technician_data import TechnicianData
from server.models.hospital_data import Hospital

logger = logging.getLogger(__name__)

class TechnicianService:
    @staticmethod
    def register_technician(data):
        logger.info("Začiatok registrácie technika.")
        try:
            first_name = data.get('first_name')
            last_name = data.get('last_name')
            hospital_code = data.get('hospital_code')
            email = data.get('email')
            password = data.get('password')

            # Kontrola povinných údajov
            if not all([first_name, last_name, email, password, hospital_code]):
                logger.error("Chýbajú povinné údaje pri registrácii technika. Prijaté kľúče: %s", list(data.keys()))
                return {'error': 'Missing required fields'}, 400

            # Overenie, či existuje nemocnica so zadaným technician_code
            hospital = Hospital.query.filter_by(hospital_code=hospital_code).first()
            if not hospital:
                logger.error("Technician code '%s' neexistuje.", hospital_code)
                return {'error': 'Technician code does not exist'}, 400

            # Kontrola duplicity na základe emailu
            existing_technician = TechnicianData.query.filter_by(email=email).first()
            if existing_technician:
                logger.error("Technician s emailom '%s' už existuje.", email)
                return {'error': 'Technician with this email already exists'}, 400

            new_technician = TechnicianData(
                first_name=first_name,
                last_name=last_name,
                email=email,
                hospital_id=hospital.id
            )
            new_technician.set_password(password)
            db.session.add(new_technician)
            db.session.commit()

            logger.info("Technik '%s %s' bol úspešne zaregistrovaný.", first_name, last_name)
            return {'message': 'Technician registered successfully'}, 201

        except Exception as e:
            db.session.rollback()
            logger.exception("Výnimka pri registrácii technika: %s", e)
            return {'error': str(e)}, 500
