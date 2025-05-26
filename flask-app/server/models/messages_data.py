from server.database import db
from server.models.user import User
from sqlalchemy.orm import Mapped, mapped_column, relationship
from server.models.messages_images_data import MessageImage
from sqlalchemy import ForeignKey
from datetime import datetime
from datetime import datetime, timezone


class MessageData(db.Model):
    __tablename__ = "messages"

    id: Mapped[int] = mapped_column(db.Integer, primary_key=True)
    sender_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    recipient_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    content: Mapped[str] = mapped_column(db.String(5000), nullable=False)
    timestamp: Mapped[datetime] = mapped_column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    is_read: Mapped[bool] = mapped_column(db.Boolean, default=False)

    # Relationship to images
    images: Mapped[list["MessageImage"]] = relationship(
        "MessageImage",
        back_populates="message",
        cascade="all, delete-orphan",
        lazy="select"
    )

    def to_dict(self):
        return {
        "id": self.id,
        "sender_id": self.sender_id,
        "sender_email": User.query.get(self.sender_id).email if self.sender_id else None,
        "recipient_id": self.recipient_id,
        "recipient_email": User.query.get(self.recipient_id).email if self.recipient_id else None,
        "content": self.content,
        "timestamp": self.timestamp.isoformat(),
        "is_read": self.is_read
    }

