import uuid
from server.database import db
from sqlalchemy.orm import Mapped, mapped_column, relationship


def generate_uuid16() -> str:
    """Generuje 16-miestny hex reťazec z uuid4."""
    return uuid.uuid4().hex[:16]

class Hospital(db.Model):
    __tablename__ = "hospital"
    id: Mapped[int] = mapped_column(db.Integer, primary_key=True)
    name: Mapped[str] = mapped_column(db.String(128), nullable=False)  # Názov nemocnice
    doctor_code: Mapped[str] = mapped_column(db.String(16), unique=True, nullable=False, default=generate_uuid16)  # 16-miestny uuid4.hex pre doktora
    technician_code: Mapped[str] = mapped_column(db.String(16), unique=True, nullable=False, default=generate_uuid16)  # 16-miestny uuid4.hex pre technika
    country: Mapped[str] = mapped_column(db.String(64), nullable=False)  # Štát
    city: Mapped[str] = mapped_column(db.String(64), nullable=False)  # Mesto
    street: Mapped[str] = mapped_column(db.String(128), nullable=False)  # Ulica a číslo
    postal_code: Mapped[str] = mapped_column(db.String(10), nullable=False)  # PSČ

    # Vzťah: Nemocnica môže mať viacerých doktorov
    doctors: Mapped[list["DoctorData"]] = relationship(
        "DoctorData", back_populates="hospital", lazy="select"
    )
    # Vzťah: Nemocnica môže mať viacerých technikov
    technicians: Mapped[list["TechnicianData"]] = relationship(
        "TechnicianData", back_populates="hospital", lazy="select"
    )