from server.database import db
from server.models.user import User
from sqlalchemy.orm import Mapped, mapped_column

class SuperAdminData(User):
    __tablename__ = "super_admins"
    id: Mapped[int] = mapped_column(db.Integer, db.ForeignKey("users.id"), primary_key=True)
    __mapper_args__ = {
        "polymorphic_identity": "super_admin"
    }

    def get_info(self):
        info = {}
        try:
            info = super().get_info()
        except AttributeError:
            pass

        info.update({
            "first_name": "Super",
            "last_name": "Admin",
        })
        return info

    def get_full_name(self):
        return "Super Admin"