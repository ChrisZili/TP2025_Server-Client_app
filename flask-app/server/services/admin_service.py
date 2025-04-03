import os
import logging
from server.database import db
from server.models import Hospital
from server.models.admin_data import AdminData
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

class AdminService:
    @staticmethod
    def register_admin(data):
        """
        Registruje nového admina pomocou poskytnutých dát.
        Očakáva data ako dictionary s kľúčmi 'email' a 'password'.
        """
        try:
            first_name = data.get('first_name')
            last_name = data.get('last_name')
            phone_number = data.get('phone_number')
            gender = data.get('gender')

            doctor_code = data.get('doctor_code')

            email = data.get('email')
            password = data.get('password')

            if not all([first_name, last_name, phone_number, gender, email, password, doctor_code]):
                logger.error("Chýbajú povinné údaje pri vytvarani admina.")
                return {'error': 'Missing required fields'}, 400

            hospital = Hospital.query.filter_by(doctor_code=doctor_code).first()
            existing_admin = AdminData.query.filter_by(email=email).first()
            if existing_admin:
                logger.error("Admin s emailom %s už existuje.", email)
                return {'error': 'Admin s týmto emailom už existuje.'}, 409



            new_admin = AdminData(
                first_name=first_name,
                last_name=last_name,
                phone_number=phone_number,
                gender=gender,
                email=email,
                hospital_id=hospital.id
            )

            new_admin.set_password(password)
            db.session.add(new_admin)
            db.session.commit()

            logger.info("Nový admin zaregistrovaný s emailom: %s", email)
            return {'message': 'Admin úspešne zaregistrovaný.'}, 201
        except Exception as e:
            logger.exception("Výnimka pri registrácii admina: %s", e)
            db.session.rollback()
            return {'error': 'Interná chyba servera.'}, 500
