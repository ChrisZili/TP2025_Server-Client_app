from server.database import db
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import ForeignKey

from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from server.models.messages_data import MessageData

class MessageImage(db.Model):
    __tablename__ = "message_images"

    id: Mapped[int] = mapped_column(db.Integer, primary_key=True)
    message_id: Mapped[int] = mapped_column(ForeignKey("messages.id"), nullable=False)
    image_path: Mapped[str] = mapped_column(db.String(255), nullable=False)

    message: Mapped["MessageData"] = relationship("MessageData", back_populates="images")
