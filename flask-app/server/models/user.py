import re
from server.database import db
from datetime import datetime, timezone
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.orm import Mapped, mapped_column, relationship
import logging

logger = logging.getLogger(__name__)
class User(db.Model):
    __tablename__ = 'users'

    id: Mapped[int] = mapped_column(db.Integer, primary_key=True)
    # Prístupové údaje
    email: Mapped[str] = mapped_column(db.String(255), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(db.String(1024), nullable=False)

    created_at: Mapped[datetime] = mapped_column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    #id_creator: Mapped[int] = mapped_column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    # Typ používateľa
    created_images: Mapped[list["OriginalImageData"]] = relationship(
        "OriginalImageData", back_populates="creator", lazy="select"
    )
    user_type: Mapped[str] = mapped_column(db.String(20), default='user')
    __mapper_args__ = {
        'polymorphic_on': user_type,
        'polymorphic_identity': 'user'
    }

    def has_role(self, role: str) -> bool:
        return self.user_type == role

    def is_super_admin(self) -> bool:
        return self.has_role('super_admin')

    def is_admin(self) -> bool:
        return self.has_role("admin")

    def is_doctor(self) -> bool:
        return self.has_role("doctor")

    def is_technician(self) -> bool:
        return self.has_role("technician")

    def is_patient(self) -> bool:
        return self.has_role("patient")

    def set_password(self, password: str) -> None:
        """
        Nastaví heslo používateľa po overení jeho zložitosti.

        :param password: Heslo používateľa, ktoré bude hashované.
        :return: None
        """
        self.password_hash = generate_password_hash(password)

    import re

    @staticmethod
    def validate_password(password: str) -> list:
        """
        Validuje heslo na základe kritérií:
        - Minimálne 8 znakov.
        - Aspoň jedno veľké písmeno.
        - Aspoň jedno malé písmeno.
        - Aspoň jedna číslica.
        - Aspoň jeden špeciálny znak.

        :param password: Heslo, ktoré sa má validovať.
        :return: Zoznam chýbajúcich kritérií. Prázdny zoznam znamená, že heslo je platné.
        :rtype: list
        """
        errors = []
        if len(password) < 8:
            errors.append("Heslo musí mať aspoň 8 znakov.")
        if not re.search(r'[A-Z]', password):
            errors.append("Heslo musí obsahovať aspoň jedno veľké písmeno.")
        if not re.search(r'[a-z]', password):
            errors.append("Heslo musí obsahovať aspoň jedno malé písmeno.")
        if not re.search(r'\d', password):
            errors.append("Heslo musí obsahovať aspoň jednu číslicu.")
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            errors.append("Heslo musí obsahovať aspoň jeden špeciálny znak (!@#$%^&* atď.).")
        return errors

    def check_password(self, password: str) -> bool:
        """
        Porovná heslo používateľa.
        :param password: Heslo používateľa
        :return: Vráti True, ak heslo sedí, inak False
        """
        return check_password_hash(self.password_hash, password)

    @staticmethod
    def get_user(user_id: int):
        """
        Načíta používateľa podľa ID.
        Ak používateľ existuje, vráti slovník s jeho údajmi.
        Ak používateľ neexistuje, vráti {'error': 'User not found'} s HTTP statusom 404.
        V prípade chyby vráti {'error': <chyba>} s HTTP statusom 500.
        """
        user = db.session.get(User, int(user_id))
        if not user:
            return None
        return user

    def get_info(self):
        info = {
            "email": self.email,
            "user_type": self.user_type,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
        return info

    @staticmethod
    def check_user_type_required(user_id, user_type):
        """
        Overí, či je aktuálny používateľ admin.

        Vstup: Funkcia get_jwt_identity() vráti len user_id (napr. "123").

        Výstup: Vracia True, ak používateľ existuje a jeho user_type je "admin", inak False.
        """
        if not user_id:
            error_message = f"{user_type}_required: Žiadne user_id"
            logger.error(error_message)
            return {"error": error_message}, 400

        try:
            user = User.query.get(int(user_id))
        except Exception as e:
            error_message = f"{user_type}_required: Chyba pri získavaní používateľa s id {user_id}: {e}"
            logger.error(error_message)
            return {"error": error_message}, 400

        if not user:
            error_message = f"{user_type}_required: Používateľ s id {user_id} nenájdený."
            logger.error(error_message)
            return {"error": error_message}, 400

        if not user.has_role(str(user_type)):
            error_message = f"{user_type}_required: Používateľ s id {user_id} nie je {user_type} (user_type={user.user_type})"
            logger.error(error_message)
            return {"error": error_message}, 400

        message = f"{user_type}_required: Používateľ s id {user_id} je {user_type}"
        logger.debug(message)
        return {"message": message}, 200