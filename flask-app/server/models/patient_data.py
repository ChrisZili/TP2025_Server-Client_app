from server.database import db
from server.models.user import User


from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import date

class PatientData(User):
    __tablename__ = "patients"
    id: Mapped[int] = mapped_column(db.Integer, db.ForeignKey("users.id"), primary_key=True)

    # Osobné údaje pacienta
    first_name: Mapped[str] = mapped_column(db.String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(db.String(100), nullable=False)
    phone_number: Mapped[str] = mapped_column(db.String(20), unique=True, nullable=False)
    birth_date: Mapped[date] = mapped_column(db.Date, nullable=False)
    birth_number: Mapped[str] = mapped_column(db.String(20), unique=True, nullable=False)
    gender: Mapped[str] = mapped_column(db.String(10), nullable=False)
    doctor_id: Mapped[int] = mapped_column(db.Integer, db.ForeignKey("doctors.id"), nullable=True)

    __mapper_args__ = {
        "polymorphic_identity": "patient"
    }

    # Vzťah na entitu Doctor – jeden pacient patrí jednému doktorovi.
    doctor: Mapped["DoctorData"] = relationship("DoctorData", back_populates="patients", lazy="select", foreign_keys=[doctor_id])    # One-to-many vzťah na OrgImage – pacient môže mať viacero obrázkov.
    images: Mapped[list["OriginalImageData"]] = relationship(
        "OriginalImageData", back_populates="patient", cascade="all, delete-orphan", lazy="select"
    )
