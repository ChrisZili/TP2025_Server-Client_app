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

    # Diagnostické údaje pre pravé a ľavé oko (môžu byť prázdne)
    diagnosis_right_eye: Mapped[str] = mapped_column(db.String(255), nullable=True)
    diagnosis_left_eye: Mapped[str] = mapped_column(db.String(255), nullable=True)

    __mapper_args__ = {
        "polymorphic_identity": "patient"
    }

    # Vzťah na entitu Doctor – jeden pacient patrí jednému doktorovi.
    doctor: Mapped["DoctorData"] = relationship("DoctorData", back_populates="patients", lazy="select", foreign_keys=[doctor_id])    # One-to-many vzťah na OrgImage – pacient môže mať viacero obrázkov.

    # One-to-many vzťah – pacient môže mať viacero originálnych obrázkov.
    images: Mapped[list["OriginalImageData"]] = relationship(
        "OriginalImageData", back_populates="patient", cascade="all, delete-orphan", lazy="select"
    )

    def get_full_name(self):
        parts = []
        if self.first_name:
            parts.append(self.first_name.strip())
        if self.last_name:
            parts.append(self.last_name.strip())
        return " ".join(parts) if parts else ""

    def get_info(self):
        info = {}
        try:
            info = super().get_info()
        except AttributeError:
            # Ak rodičovská metóda get_info neexistuje, pokračujeme prázdne
            pass

        info.update({
            "first_name": self.first_name,
            "last_name": self.last_name,
            "phone_number": self.phone_number,
            "birth_date": self.birth_date.isoformat() if self.birth_date else None,
            "birth_number": self.birth_number,
            "gender": self.gender,
            "doctor_id": self.doctor_id,
            "diagnosis_right_eye": self.diagnosis_right_eye,
            "diagnosis_left_eye": self.diagnosis_left_eye
        })
        return info

