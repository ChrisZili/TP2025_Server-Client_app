from server.database import db
from datetime import datetime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from server.models.user import User

class OriginalImageData(db.Model):
    __tablename__ = "original_image_data"

    id: Mapped[int] = mapped_column(db.Integer, primary_key=True)

    original_image_path: Mapped[str] = mapped_column(db.String(255), nullable=False)
    processed_image_path: Mapped[str] = mapped_column(db.String(255), nullable=True)
    segmentation_mask_path: Mapped[str] = mapped_column(db.String(255), nullable=True)
    bounding_boxes_path: Mapped[str] = mapped_column(db.String(255), nullable=True)

    quality: Mapped[str] = mapped_column(db.String(20), default="good")
    technical_notes: Mapped[str] = mapped_column(db.Text, nullable=True)
    diagnostic_notes: Mapped[str] = mapped_column(db.Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(db.DateTime, default=lambda: datetime.now())
    status: Mapped[str] = mapped_column(db.String(20), default="pending")

    # Optional foreign key k pacientovi – môže byť NULL, ak sa neskôr priradí
    patient_id: Mapped[int] = mapped_column(db.Integer, db.ForeignKey("patients.id"), nullable=True)
    patient: Mapped["PatientData"] = relationship("PatientData", back_populates="images", lazy="select", foreign_keys=[patient_id])
    device_id: Mapped[int] = mapped_column(db.Integer, db.ForeignKey("device_data.id"), nullable=True)
    device: Mapped["DeviceData"] = relationship("DeviceData", backref="images", lazy="select", foreign_keys=[device_id])
    creator_id: Mapped[int] = mapped_column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    creator: Mapped[User] = relationship("User", back_populates="created_images", lazy="select")
