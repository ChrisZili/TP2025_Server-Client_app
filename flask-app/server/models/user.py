from server.database import db
from datetime import datetime, timezone
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.orm import Mapped, mapped_column, relationship
import re

class User(db.Model):
    __tablename__ = 'users'

    id: Mapped[int] = mapped_column(db.Integer, primary_key=True)
    # Prístupové údaje
    email: Mapped[str] = mapped_column(db.String(255), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(db.String(1024), nullable=False)

    created_at: Mapped[datetime] = mapped_column(db.DateTime, default=lambda: datetime.now(timezone.utc))
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
        if not self.validate_password(password):
            raise ValueError("Heslo nespĺňa požadované kritériá (min. 8 znakov, aspoň jedno veľké písmeno a číslica).")
        self.password_hash = generate_password_hash(password)

    @staticmethod
    def validate_password(password: str) -> bool:
        """
        Validuje heslo na základe minimálnych kritérií:
        - Minimálne 8 znakov.
        - Aspoň jedno veľké písmeno.
        - Aspoň jedna číslica.

        :param password: Heslo, ktoré sa má validovať.
        :return: True, ak heslo spĺňa kritériá, inak False.
        :rtype: bool
        """
        """
            if len(password) < 8:
                return False
            if not re.search(r'[A-Z]', password):
                return False
            if not re.search(r'\d', password):
                return False
        """
        return True

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
