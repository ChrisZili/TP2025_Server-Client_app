from server.database import db

class PatientImages(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    patient_data_id = db.Column(db.Integer, db.ForeignKey('patient_data.id'), nullable=False)

    original_image_path = db.Column(db.String(255), nullable=False)  # Cesta k originálnemu obrázku
    mask_image_path = db.Column(db.String(255), nullable=True)  # Cesta k maske obrázku
    processed_image_path = db.Column(db.String(255), nullable=True)  # Cesta k spracovanému obrázku
    result = db.Column(db.String(255), nullable=True)  # Výsledok analýzy obrázku

    # Vytvorenie vzťahu k `PatientData`
    patient_data = db.relationship('PatientData', back_populates='images')
