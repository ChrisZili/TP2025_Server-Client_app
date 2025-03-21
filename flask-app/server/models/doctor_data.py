from server.database import db
from server.models import PatientData
from server.models.user import User

from sqlalchemy.orm import Mapped, mapped_column, relationship

class DoctorData(User):
    __tablename__ = "doctors"
    id: Mapped[int] = mapped_column(db.Integer, db.ForeignKey("users.id"), primary_key=True)
    first_name: Mapped[str] = mapped_column(db.String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(db.String(100), nullable=False)
    phone_number: Mapped[str] = mapped_column(db.String(20), unique=True, nullable=False)
    gender: Mapped[str] = mapped_column(db.String(10), nullable=False)
    __mapper_args__ = {
        "polymorphic_identity": "doctor"
    }

    # Vzťah na nemocnicu: každý technik patrí jednej nemocnici.
    hospital_id: Mapped[int] = mapped_column(db.Integer, db.ForeignKey("hospital.id"), nullable=True)
    hospital: Mapped["Hospital"] = relationship(
        "Hospital", back_populates="doctors", lazy="select"
    )

    # One-to-many vzťah na OriginalImageData: technik môže mať viacero obrázkov.
    patients: Mapped[list["PatientData"]] = relationship(
        "PatientData", back_populates="doctor", cascade="all, delete-orphan", lazy="select", foreign_keys=[PatientData.doctor_id]
    )