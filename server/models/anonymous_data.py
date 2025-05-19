from server.database import db
from server.models.user import User
from sqlalchemy.orm import Mapped, mapped_column

class AnonymousData(User):
    __tablename__ = "anonymous"
    id: Mapped[int] = mapped_column(db.Integer, db.ForeignKey("users.id"), primary_key=True)

    __mapper_args__ = {
        "polymorphic_identity": "anonymous"
    }