import os
import logging
from server.database import db
from server.models.admin_data import AdminData
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

def create_admin() -> None:
    load_dotenv()  # Načíta environment premenné zo súboru .env
    # Skontrolujeme, či už existuje admin s user_type="admin"
    admin = AdminData.query.filter_by(user_type="admin").first()
    if admin:
        logger.info("Admin už existuje: %s", admin.email)
        return

    email = os.getenv("ADMIN_EMAIL")
    password = os.getenv("ADMIN_PASSWORD")
    if not email or not password:
        logger.error("ADMIN_EMAIL alebo ADMIN_PASSWORD nie sú nastavené v environment variables.")
        return

    new_admin = AdminData(
        email=email,
        user_type="admin"
    )
    new_admin.set_password(password)

    try:
        db.session.add(new_admin)
        db.session.commit()
        logger.info("Admin úspešne vytvorený s emailom: %s", email)
    except Exception as e:
        logger.exception("Nepodarilo sa vytvoriť admina: %s", e)
        db.session.rollback()

class AdminService:
    @staticmethod
    def register_admin(data):
        """
        Registruje nového admina pomocou poskytnutých dát.
        Očakáva data ako dictionary s kľúčmi 'email' a 'password'.
        """
        try:
            email = data.get('email')
            password = data.get('password')
            if not email or not password:
                logger.error("Chýbajú povinné údaje: email alebo password.")
                return {'error': 'Chýbajú povinné údaje: email a password.'}, 400

            # Overenie, či admin s daným emailom už existuje
            existing_admin = AdminData.query.filter_by(email=email).first()
            if existing_admin:
                logger.error("Admin s emailom %s už existuje.", email)
                return {'error': 'Admin s týmto emailom už existuje.'}, 409

            new_admin = AdminData(email=email, user_type="admin")
            new_admin.set_password(password)
            db.session.add(new_admin)
            db.session.commit()
            logger.info("Nový admin zaregistrovaný s emailom: %s", email)
            return {'message': 'Admin úspešne zaregistrovaný.'}, 201
        except Exception as e:
            logger.exception("Výnimka pri registrácii admina: %s", e)
            db.session.rollback()
            return {'error': 'Interná chyba servera.'}, 500
