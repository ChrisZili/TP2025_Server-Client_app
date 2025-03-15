from server.database import db

class Hospital(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), nullable=False)  # Názov nemocnice
    code = db.Column(db.String(10), unique=True, nullable=False)  # Unikátny kód nemocnice
    country = db.Column(db.String(64), nullable=False)  # Štát
    city = db.Column(db.String(64), nullable=False)  # Mesto
    street = db.Column(db.String(128), nullable=False)  # Ulica a číslo
    postal_code = db.Column(db.String(10), nullable=False)  # PSČ

    # Vzťah: Nemocnica môže mať viacerých doktorov
    doctors = db.relationship('DoctorData', backref='hospital_data', lazy=True)
