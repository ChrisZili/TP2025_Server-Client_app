from server.database import db
from server.models.user import User
from server.models.original_image_data import OriginalImageData
from server.models.hospital_data import Hospital
from sqlalchemy.orm import Mapped, mapped_column, relationship

class TechnicianData(User):
    __tablename__ = "technicians"
    id: Mapped[int] = mapped_column(db.Integer, db.ForeignKey("users.id"), primary_key=True)
    first_name: Mapped[str] = mapped_column(db.String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(db.String(100), nullable=False)

    # Vzťah na nemocnicu: každý technik patrí jednej nemocnici.
    hospital: Mapped["Hospital"] = relationship(
        "Hospital", back_populates="technicians", lazy="select"
    )

    # One-to-many vzťah na OriginalImageData: technik môže mať viacero obrázkov.
    images: Mapped[list["OriginalImageData"]] = relationship(
        "OriginalImageData", back_populates="technician", cascade="all, delete-orphan", lazy="select"
    )