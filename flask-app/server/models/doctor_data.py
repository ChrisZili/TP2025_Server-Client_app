from server.database import db

class DoctorData(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    doctor_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False, unique=True)  # Každý lekár má jeden záznam
    hospital_id = db.Column(db.Integer, db.ForeignKey('hospital.id'), nullable=True)  # Odkaz na nemocnicu
    notes = db.Column(db.Text, nullable=True)  # Poznámky o pacientoch

    # Vzťah: Lekár môže mať viacerých pacientov
    patients = db.relationship('PatientData', backref='doctor_data', lazy=True)

    doctor = db.relationship('User', foreign_keys=[doctor_id])
    hospital = db.relationship('Hospital', backref='doctors')