from server.database import db
from server.models.user import User
from sqlalchemy.orm import Mapped, mapped_column, relationship

class AdminData(User):
    __tablename__ = "admins"
    id: Mapped[int] = mapped_column(db.Integer, db.ForeignKey("users.id"), primary_key=True)

    first_name: Mapped[str] = mapped_column(db.String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(db.String(100), nullable=False)
    phone_number: Mapped[str] = mapped_column(db.String(20), unique=True, nullable=False)
    gender: Mapped[str] = mapped_column(db.String(10), nullable=False)

    __mapper_args__ = {
        "polymorphic_identity": "admin"
    }

    # Vzťah na nemocnicu: každý technik patrí jednej nemocnici.
    hospital_id: Mapped[int] = mapped_column(db.Integer, db.ForeignKey("hospital.id"), nullable=True)
    hospital: Mapped["Hospital"] = relationship(
        "Hospital", back_populates="admins", lazy="select"
    )

    def get_info_pat(self):
        info = {}
        try:
            info = super().get_info()
        except AttributeError:
            pass
        info.update({"street":self.hospital.street})
        return info

    def get_full_name(self):
        full_name = f"{self.first_name} {self.last_name}"
        return full_name