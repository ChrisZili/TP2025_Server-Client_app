import logging
from flask import jsonify
from server.database import db
from server.models.hospital_data import Hospital

logger = logging.getLogger(__name__)

class HospitalService:
    def add_hospital(self, data):
        """Pridanie nemocnice"""
        logger.info("Spustená metóda add_hospital")

        # Získanie vstupných dát
        name = data.get("name")
        country = data.get("country")
        city = data.get("city")
        street = data.get("street")
        postal_code = data.get("postal_code")

        # Kontrola povinných údajov: name, country a city sú povinné
        if not name or not country or not city or not street or not postal_code:
            logger.error("Chýbajú povinné údaje pre nemocnicu: name, country alebo city")
            return jsonify({"error": "Missing required fields: name, country and city are required"}), 400

        try:
            new_hospital = Hospital(
                name=name,
                country=country,
                city=city,
                street=street,
                postal_code=postal_code
            )
            db.session.add(new_hospital)
            db.session.commit()
            logger.info("Nemocnica '%s' bola úspešne pridaná", name)
            return jsonify({"message": "Hospital added successfully"}), 201
        except Exception as e:
            logger.exception("Výnimka pri pridávaní nemocnice: %s", e)
            db.session.rollback()
            return jsonify({"error": "Internal server error"}), 500

    def update_hospital(self, hospital_id, data):
        """Úprava nemocnice"""
        logger.info("Spustená metóda update_hospital pre hospital_id: %s", hospital_id)

        try:
            hospital = Hospital.query.get(hospital_id)
        except Exception as e:
            logger.exception("Výnimka pri získavaní nemocnice s id %s: %s", hospital_id, e)
            return jsonify({"error": "Internal server error"}), 500

        if not hospital:
            logger.error("Nemocnica s id %s nebola nájdená", hospital_id)
            return jsonify({"error": "Hospital not found"}), 404

        try:
            # Aktualizácia údajov, ak sú nové hodnoty poskytnuté, inak ponechanie pôvodných
            hospital.name = data.get("name", hospital.name)
            hospital.city = data.get("city", hospital.city)
            hospital.street = data.get("street", hospital.street)
            hospital.postal_code = data.get("postal_code", hospital.postal_code)

            db.session.commit()
            logger.info("Nemocnica s id %s bola úspešne aktualizovaná", hospital_id)
            return jsonify({"message": "Hospital updated successfully"}), 200
        except Exception as e:
            logger.exception("Výnimka pri aktualizácii nemocnice s id %s: %s", hospital_id, e)
            db.session.rollback()
            return jsonify({"error": "Internal server error"}), 500

    def get_hospitals(self):
        """Získanie všetkých nemocníc"""
        logger.info("Spustená metóda get_hospitals")
        try:
            hospitals = Hospital.query.all()
            hospitals_data = [
                {
                    "id": h.id,
                    "name": h.name,
                    "city": h.city,
                    "street": h.street,
                    "postal_code": h.postal_code,
                    "doctor_code": h.doctor_code,
                    "technician_code": h.technician_code
                } for h in hospitals
            ]
            logger.info("Zoznam nemocníc bol načítaný, počet: %d", len(hospitals_data))
            return jsonify(hospitals_data), 200
        except Exception as e:
            logger.exception("Výnimka pri získavaní zoznamu nemocníc: %s", e)
            return jsonify({"error": "Internal server error"}), 500
