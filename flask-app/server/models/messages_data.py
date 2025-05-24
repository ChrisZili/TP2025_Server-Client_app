# server/models/message_data.py

from server.database import db
from server.models.user import User
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import ForeignKey
from datetime import datetime

class MessageData(db.Model):
    __tablename__ = "messages"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)

    # Sender and Receiver as foreign keys to User
    sender_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    recipient_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)

    # Relationships to access sender/recipient details
    sender: Mapped["User"] = relationship("User", foreign_keys=[sender_id], lazy="select")
    recipient: Mapped["User"] = relationship("User", foreign_keys=[recipient_id], lazy="select")

    # Message content
    timestamp: Mapped[datetime] = mapped_column(default=datetime.utcnow, nullable=False)
    content: Mapped[str] = mapped_column(db.String(5000), nullable=False)

    # Optional image path (can be null or point to media folder)
    image_paths: Mapped[str] = mapped_column(db.String(1000), nullable=True, default="")

    # Max 3 images, separated by semicolons. Optional.
image_paths: Mapped[str] = mapped_column(
    db.String(500), 
    nullable=True, 
    default="", 
    doc="Up to 3 image file paths separated by semicolons."
)

def get_images(self):
    paths = self.image_paths.split(";") if self.image_paths else []
    return paths[:3]  # Enforce max 3

    # Whether message was read
    is_read: Mapped[bool] = mapped_column(default=False, nullable=False)

    def get_info(self):
        return {
            "id": self.id,
            "sender_name": self.sender.get_full_name() if self.sender else "Unknown",
            "sender_role": getattr(self.sender, 'role', 'unknown'),
            "recipient_name": self.recipient.get_full_name() if self.recipient else "Unknown",
            "recipient_role": getattr(self.recipient, 'role', 'unknown'),
            "timestamp": self.timestamp.isoformat(),
            "content": self.content,
            "images": self.image_paths.split(";") if self.image_paths else [],
            "is_read": self.is_read
        }
