from server.database import db
from datetime import datetime
from sqlalchemy.orm import Mapped, mapped_column, relationship

class ProcessedImageData(db.Model):
    __tablename__ = "processed_image_data"

    id: Mapped[int] = mapped_column(db.Integer, primary_key=True)
    created_at: Mapped[datetime] = mapped_column(db.DateTime, default=lambda: datetime.now())
    status: Mapped[str] = mapped_column(db.String(20), default="pending")

    technical_notes: Mapped[str] = mapped_column(db.Text, nullable=True)
    diagnostic_notes: Mapped[str] = mapped_column(db.Text, nullable=True)

    process_type: Mapped[str] = mapped_column(db.String(20), default='process_image')

    #Spytat sa ze ci kazdy typ spracovania ma dane veci a ak nie mozme robit co to bud dedia alebo to ukladat do json
    processed_image_path: Mapped[str] = mapped_column(db.String(255), nullable=True)
    segmentation_mask_path: Mapped[str] = mapped_column(db.String(255), nullable=True)
    bounding_boxes_path: Mapped[str] = mapped_column(db.String(255), nullable=True)

    answer: Mapped[dict] = mapped_column(db.JSON, nullable=True)

    original_image_id: Mapped[int] = mapped_column(db.Integer, db.ForeignKey("original_image_data.id"), nullable=True)
    original_image: Mapped["OriginalImageData"] = relationship("OriginalImageData", back_populates="processed_images", lazy="select")