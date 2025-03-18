from server.database import db
from datetime import datetime, UTC

class PatientImages(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    patient_data_id = db.Column(db.Integer, db.ForeignKey('patient_data.id'), nullable=False)
    device_id = db.Column(db.Integer, db.ForeignKey('device.id'), nullable=False)

    original_image_path = db.Column(db.String(255), nullable=False)
    processed_image_path = db.Column(db.String(255), nullable=True)
    segmentation_mask_path = db.Column(db.String(255), nullable=True)
    bounding_boxes_path = db.Column(db.String(255), nullable=True)

    quality = db.Column(db.String(20), default="good")  # good / bad
    technical_notes = db.Column(db.Text, nullable=True)
    diagnostic_notes = db.Column(db.Text, nullable=True)

    created_at = db.Column(db.DateTime, default=lambda: datetime.now(UTC))  # Dátum nahrania
    status = db.Column(db.String(20), default="pending")  # pending / processing / completed

    patient = db.relationship('PatientData', backref='images')
    device = db.relationship('DeviceData', backref='images')