from server.database import db
from server.models.user import User
from sqlalchemy.orm import Mapped, mapped_column, relationship

class TechnicianData(User):
    __tablename__ = "technicians"
    id: Mapped[int] = mapped_column(db.Integer, db.ForeignKey("users.id"), primary_key=True)
    first_name: Mapped[str] = mapped_column(db.String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(db.String(100), nullable=False)

    __mapper_args__ = {
        "polymorphic_identity": "technician"
    }

    # Vzťah na nemocnicu: každý technik patrí jednej nemocnici.
    hospital_id: Mapped[int] = mapped_column(db.Integer, db.ForeignKey("hospital.id"), nullable=True)
    hospital: Mapped["Hospital"] = relationship(
        "Hospital", back_populates="technicians", lazy="select"
    )

    def get_full_name(self):
        parts = []
        if self.first_name:
            parts.append(self.first_name.strip())
        if self.last_name:
            parts.append(self.last_name.strip())

        full_name = " ".join(parts) if parts else ""
        return full_name

    def get_info(self):
        info = {}
        try:
            info = super().get_info()
        except AttributeError:
            pass

        info.update({
            "first_name": self.first_name if self.first_name else None,
            "last_name": self.last_name if self.last_name else None,
            })
        return info