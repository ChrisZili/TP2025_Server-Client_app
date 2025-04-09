from server.database import db
from sqlalchemy.orm import Mapped, mapped_column, relationship


class DeviceData(db.Model):
    __tablename__ = "device_data"

    id: Mapped[int] = mapped_column(db.Integer, primary_key=True)
    # Informácie o zariadení
    device_name: Mapped[str] = mapped_column(db.String(128), nullable=False)  # Názov zariadenia
    device_type: Mapped[str] = mapped_column(db.String(64),nullable=True)  # Typ zariadenia (napr. mobil, kamera, počítač)
    # Informácie o kamere
    camera_model: Mapped[str] = mapped_column(db.String(128), nullable=True)  # Model kamery
    camera_resolution: Mapped[str] = mapped_column(db.String(64), nullable=True)  # Rozlíšenie kamery (napr. "1920x1080")


