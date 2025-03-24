import os
from server.database import db
from server.models.admin_data import AdminData
from dotenv import load_dotenv

def create_admin() -> None:
    load_dotenv()  # Načíta environment premenné zo súboru .env
    # Skontrolujeme, či už existuje admin s user_type="admin"
    admin = AdminData.query.filter_by(user_type="admin").first()
    if not admin:
        email = os.getenv("ADMIN_EMAIL")
        password = os.getenv("ADMIN_PASSWORD")

        new_admin = AdminData(
            email=email,
            user_type="admin"
        )
        new_admin.set_password(password)

        db.session.add(new_admin)
        db.session.commit()

class AdminService:
    @staticmethod
    def register_admin(data):
        pass