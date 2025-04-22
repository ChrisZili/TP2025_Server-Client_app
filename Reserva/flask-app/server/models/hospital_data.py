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
    country: Mapped[str] = mapped_column(db.String(64), nullable=False)  # Štát
    city: Mapped[str] = mapped_column(db.String(64), nullable=False)  # Mesto
    street: Mapped[str] = mapped_column(db.String(128), nullable=False)  # Ulica a číslo
    postal_code: Mapped[str] = mapped_column(db.String(10), nullable=False)  # PSČ
    hospital_code: Mapped[str] = mapped_column(db.String(16), unique=True, nullable=False, default=generate_uuid16)  # 16-miestny uuid4.hex pre nemocnicu

    # Vzťah: Nemocnica môže mať viacerých doktorov
    doctors: Mapped[list["DoctorData"]] = relationship(
        "DoctorData", back_populates="hospital", lazy="select"
    )
    # Vzťah: Nemocnica môže mať viacerých technikov
    technicians: Mapped[list["TechnicianData"]] = relationship(
        "TechnicianData", back_populates="hospital", lazy="select"
    )
    # Vzťah: Nemocnica môže mať viacerých adminov
    # TODO: Zistit mnozstvo adminov ci jeden alebo viacero na nemocnicu
    admins: Mapped[list["AdminData"]] = relationship(
        "AdminData", back_populates="hospital", lazy="select"
    )

    def get_info(self) -> dict:
        return {
            "name": self.name,
            "country": self.country,
            "city": self.city,
            "street": self.street,
            "postal_code": self.postal_code,
        }
    def get_doctors(self) -> list:
        return self.doctors

    def get_technicians(self) -> list:
        return self.technicians

    def get_admins(self) -> list:
        return self.admins

    def get_hospital_code(self) -> str:
        return self.hospital_code

