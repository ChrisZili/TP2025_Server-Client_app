import os
import logging
from server.database import db
from server.models.super_admin_data import SuperAdminData
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

def create_super_admin() -> None:
    load_dotenv()  # Načíta environment premenné zo súboru .env
    # Skontrolujeme, či už existuje admin s user_type="admin"
    super_admin = SuperAdminData.query.filter_by(user_type="super_admin").first()
    if super_admin:
        logger.info("Super_admin už existuje: %s", super_admin.email)
        return

    email = os.getenv("ADMIN_EMAIL")
    password = os.getenv("ADMIN_PASSWORD")
    if not email or not password:
        logger.error("ADMIN_EMAIL alebo ADMIN_PASSWORD nie sú nastavené v environment variables.")
        return

    new_super_admin = SuperAdminData(
        email=email,
        user_type="super_admin"
    )
    new_super_admin.set_password(password)

    try:
        db.session.add(new_super_admin)
        db.session.commit()
        logger.info("Admin úspešne vytvorený s emailom: %s", email)
    except Exception as e:
        logger.exception("Nepodarilo sa vytvoriť admina: %s", e)
        db.session.rollback()
