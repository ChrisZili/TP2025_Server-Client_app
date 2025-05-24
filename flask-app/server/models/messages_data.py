from server.database import db
from server.models.user import User
from sqlalchemy.orm import Mapped, mapped_column, relationship

from sqlalchemy import ForeignKey
from datetime import datetime
from server.models.messages_images_data import MessageImage


class MessageData(db.Model):
    __tablename__ = "messages"

    id: Mapped[int] = mapped_column(db.Integer, primary_key=True)
    sender_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    recipient_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    content: Mapped[str] = mapped_column(db.String(5000), nullable=False)
    timestamp: Mapped[datetime] = mapped_column(db.DateTime, default=datetime.utcnow)
    is_read: Mapped[bool] = mapped_column(db.Boolean, default=False)

    # Relationship to images
    images: Mapped[list["MessageImage"]] = relationship(
        "MessageImage",
        back_populates="message",
        cascade="all, delete-orphan",
        lazy="select"
    )

