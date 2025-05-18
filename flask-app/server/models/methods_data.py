from server.database import db
from datetime import datetime
from sqlalchemy.orm import Mapped, mapped_column, relationship

class MethodsData(db.Model):
    __tablename__ = "methods"

    id: Mapped[int] = mapped_column(db.Integer, primary_key=True)

    name: Mapped[str] = mapped_column(db.String(255), nullable=False)
    description: Mapped[str] = mapped_column(db.Text, nullable=True)
    parameters: Mapped[dict] = mapped_column(db.JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(db.DateTime, default=lambda: datetime.now())
    deletable: Mapped[bool] = mapped_column(db.Boolean, default=True, nullable=False)

    #processed_images: Mapped[list["ProcessedImageData"]] = db.relationship("ProcessedImageData", back_populates="process_type", cascade="all, delete-orphan")
