from server.database import db
from server.models.patient_data import PatientData
from server.models.user import User

from sqlalchemy.orm import Mapped, mapped_column, relationship

class DoctorData(User):
    __tablename__ = "doctors"
    id: Mapped[int] = mapped_column(db.Integer, db.ForeignKey("users.id"), primary_key=True)
    first_name: Mapped[str] = mapped_column(db.String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(db.String(100), nullable=False)
    phone_number: Mapped[str] = mapped_column(db.String(20), unique=False, nullable=True)
    gender: Mapped[str] = mapped_column(db.String(10), nullable=True)

    # Titul
    title: Mapped[str] = mapped_column(db.String(50), nullable=True, default="")
    suffix: Mapped[str] = mapped_column(db.String(50), nullable=True, default="")

    # Super doktor
    super_doctor: Mapped[bool] = mapped_column(db.Boolean, nullable=False, default=False)
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
    def get_name(self):
        parts = []
        if self.first_name:
            parts.append(self.first_name.strip())
        if self.last_name:
            parts.append(self.last_name.strip())
        if self.title and self.title.strip():
            parts.insert(0, self.title.strip())

        full_name = " ".join(parts) if parts else ""

        # Ak je prípona zadaná, pripojíme ju oddelenú čiarkou
        if self.suffix and self.suffix.strip():
            full_name += f", {self.suffix.strip()}"

        return full_name

    def get_info(self):
        info = {}
        try:
            info = super().get_info()
        except AttributeError:
            # Ak rodičovská metóda get_info neexistuje, pokračujeme prázdne
            pass

        info.update({
            "title": self.title if self.title else None,
            "suffix": self.suffix if self.suffix else None,
            "first_name": self.first_name if self.first_name else None,
            "last_name": self.last_name if self.last_name else None,
            "phone_number": self.phone_number if self.phone_number else None,
            "gender": self.gender if self.gender else None,
        })
        return info

    def get_full_name(self):
        full_name = f"{self.title + ' ' if self.title else ''}{self.first_name} {self.last_name}{' ' + self.suffix if self.suffix else ''}"
        return full_name

    def set_super_doctor(self, super_doctor):
        self.super_doctor = super_doctor