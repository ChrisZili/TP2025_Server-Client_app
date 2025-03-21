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