from server.database import db
from datetime import datetime
from sqlalchemy.orm import Mapped, mapped_column, relationship

# Trieda ProcessedImageData
class ProcessedImageData(db.Model):
    __tablename__ = "processed_image_data"

    id: Mapped[int] = mapped_column(db.Integer, primary_key=True)
    created_at: Mapped[datetime] = mapped_column(db.DateTime, default=lambda: datetime.now())
    status: Mapped[str] = mapped_column(db.String(20), default="pending")

    technical_notes: Mapped[str] = mapped_column(db.Text, nullable=True)
    diagnostic_notes: Mapped[str] = mapped_column(db.Text, nullable=True)

    # Process Type
    process_type_id: Mapped[int] = mapped_column(db.Integer, db.ForeignKey("process_type.id"), nullable=False)
    process_type: Mapped["ProcessTypeData"] = db.relationship("ProcessTypeData", back_populates="processed_images")

    # Cesty k obrázkom a maskám
    processed_image_path: Mapped[str] = mapped_column(db.String(255), nullable=True)
    segmentation_mask_path: Mapped[str] = mapped_column(db.String(255), nullable=True)
    bounding_boxes_path: Mapped[str] = mapped_column(db.String(255), nullable=True)

    answer: Mapped[dict] = mapped_column(db.JSON, nullable=True)

    # Vzťah k pôvodnému obrázku
    original_image_id: Mapped[int] = mapped_column(db.Integer, db.ForeignKey("original_image_data.id"), nullable=True)
    original_image: Mapped["OriginalImageData"] = relationship("OriginalImageData", back_populates="processed_images", lazy="select")


# Trieda ProcessTypeData
class ProcessTypeData(db.Model):
    __tablename__ = "process_type"

    id: Mapped[int] = mapped_column(db.Integer, primary_key=True)
    name: Mapped[str] = mapped_column(db.String(255), nullable=False)
    description: Mapped[str] = mapped_column(db.Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(db.DateTime, default=lambda: datetime.now())

    # Vzťah k spracovaným obrázkom
    processed_images: Mapped[list["ProcessedImageData"]] = db.relationship("ProcessedImageData", back_populates="process_type", cascade="all, delete-orphan")
