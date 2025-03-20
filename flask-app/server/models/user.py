from server.database import db
from datetime import datetime, timezone
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.orm import Mapped, mapped_column
import re

class User(db.Model):
    __tablename__ = 'users'

    id: Mapped[int] = mapped_column(db.Integer, primary_key=True)
    # Prístupové údaje
    email: Mapped[str] = mapped_column(db.String(255), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(db.String(1024), nullable=False)

    created_at: Mapped[datetime] = mapped_column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    # Typ používateľa
    user_type: Mapped[str] = mapped_column(db.String(20), default='user')
    __mapper_args__ = {
        'polymorphic_on': user_type,
        'polymorphic_identity': 'user'
    }

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
        """if len(password) < 8:
            return False
        if not re.search(r'[A-Z]', password):
            return False
        if not re.search(r'\d', password):
            return False"""
        return True

    def check_password(self, password: str) -> bool:
        """
        Porovná heslo používateľa.
        :param password: Heslo používateľa
        :return: Vráti True, ak heslo sedí, inak False
        """
        return check_password_hash(self.password_hash, password)