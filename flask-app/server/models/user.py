from server.database import db
from datetime import datetime, UTC
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(64), nullable=False)  # Krstné meno
    last_name = db.Column(db.String(64), nullable=False)   # Priezvisko
    email = db.Column(db.String(120), unique=True, nullable=False)  # Email musí byť unikátny
    password_hash = db.Column(db.String(256), nullable=False)  # Hashované heslo
    gender = db.Column(db.String(10), nullable=False, default="unknown")  # Pohlavie (male/female/unknown)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(UTC))

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
