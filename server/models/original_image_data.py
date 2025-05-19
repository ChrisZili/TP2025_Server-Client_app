from server.database import db
from datetime import datetime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from server.models.user import User

class OriginalImageData(db.Model):
    __tablename__ = "original_image_data"

    id: Mapped[int] = mapped_column(db.Integer, primary_key=True)

    original_image_path: Mapped[str] = mapped_column(db.String(255), nullable=False)
    quality: Mapped[str] = mapped_column(db.String(20), default="good")
    created_at: Mapped[datetime] = mapped_column(db.DateTime, default=lambda: datetime.now())

    eye_side: Mapped[str] = mapped_column(db.String(10), nullable=False, doc="Označenie: 'prave' pre pravé oko, 'lave' pre ľavé oko")
    diagnosis: Mapped[str] = mapped_column(db.String(255), nullable=True)

    device_id: Mapped[int] = mapped_column(db.Integer, db.ForeignKey("device_data.id"), nullable=True)
    device: Mapped["DeviceData"] = relationship("DeviceData", backref="images", lazy="select", foreign_keys=[device_id])

    creator_id: Mapped[int] = mapped_column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    creator: Mapped[User] = relationship("User", back_populates="created_images", lazy="select")

    patient_id: Mapped[int] = mapped_column(db.Integer, db.ForeignKey("patients.id"), nullable=True)
    patient: Mapped["PatientData"] = relationship("PatientData", back_populates="images", lazy="select", foreign_keys=[patient_id])

    processed_images: Mapped[list["ProcessedImageData"]] = relationship(
        "ProcessedImageData", back_populates="original_image", lazy="select"
    )