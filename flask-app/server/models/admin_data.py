from server.database import db
from server.models.user import User
from sqlalchemy.orm import Mapped, mapped_column

class AdminData(User):
    __tablename__ = "admins"
    id: Mapped[int] = mapped_column(db.Integer, db.ForeignKey("users.id"), primary_key=True)
    __mapper_args__ = {
        "polymorphic_identity": "admin"
    }
    def get_info_pat(self):
        info = {}
        try:
            info = super().get_info()
        except AttributeError:
            pass
        return info