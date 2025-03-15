from server.database import db

class PatientData(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    doctor_id = db.Column(db.Integer, db.ForeignKey('doctor_data.id'), nullable=True)  # Odkaz na doktora

    patient = db.relationship('User', foreign_keys=[patient_id])
    doctor = db.relationship('DoctorData', foreign_keys=[doctor_id], backref='patients')

    # Pridanie vzťahu na obrázky pacienta
    images = db.relationship('PatientImages', backref='patient_data', lazy=True)
