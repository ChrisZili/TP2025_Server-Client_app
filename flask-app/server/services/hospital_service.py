from flask import jsonify
from server.database import db
from server.models.hospital import Hospital

class HospitalService:
    def add_hospital(self, data):
        """Pridanie nemocnice"""
        name = data.get("name")
        code = data.get("code")
        country = data.get("country")
        city = data.get("city")
        street = data.get("street")
        postal_code = data.get("postal_code")

        if Hospital.query.filter_by(code=code).first():
            return jsonify({"error": "Hospital code already exists"}), 400

        new_hospital = Hospital(name=name, code=code, country=country, city=city, street=street, postal_code=postal_code)

        db.session.add(new_hospital)
        db.session.commit()
        return jsonify({"message": "Hospital added successfully"}), 201

    def update_hospital(self, hospital_id, data):
        """Úprava nemocnice"""
        hospital = Hospital.query.get(hospital_id)
        if not hospital:
            return jsonify({"error": "Hospital not found"}), 404

        hospital.name = data.get("name", hospital.name)
        hospital.city = data.get("city", hospital.city)
        hospital.street = data.get("street", hospital.street)
        hospital.postal_code = data.get("postal_code", hospital.postal_code)

        db.session.commit()
        return jsonify({"message": "Hospital updated successfully"}), 200

    def get_hospitals(self):
        """Získanie všetkých nemocníc"""
        hospitals = Hospital.query.all()
        return jsonify([
            {"id": h.id, "name": h.name, "code": h.code, "city": h.city} for h in hospitals
        ]), 200
