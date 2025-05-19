import logging
from server.database import db
from server.models.user import User
from server.models.hospital_data import Hospital

logger = logging.getLogger(__name__)

class HospitalService:
    def add_hospital(self, user_id: int, data):
        """Pridanie nemocnice so kontrolou duplicity adresy."""
        logger.info("Spustená metóda add_hospital")
        message, status = User.check_user_type_required(user_id, "super_admin")
        if status != 200:
            return message, status

        # Získanie vstupných dát
        name = data.get("name")
        country = data.get("country")
        city = data.get("city")
        street = data.get("street")
        postal_code = data.get("postal_code")

        # Kontrola povinných údajov: všetky musia byť zadané
        if not name or not country or not city or not street or not postal_code:
            error_message = "Chýbajú povinné údaje pre nemocnicu: name, country, city, street alebo postal_code"
            logger.error(error_message)
            return {"error": error_message}, 400

        # Kontrola, či už nemocnica s rovnakou adresou existuje
        existing_hospital = Hospital.query.filter_by(city=city, street=street, postal_code=postal_code).first()
        if existing_hospital:
            error_message = "Nemocnica s touto adresou uz existuje."
            logger.error(error_message)
            return {"error": error_message}, 400

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
            message = f"Nemocnica '{name}' bola úspešne pridaná"
            logger.info(message)
            return {"message": message}, 201
        except Exception as e:
            db.session.rollback()
            error_message = f"Výnimka pri pridávaní nemocnice: {e}"
            logger.exception(error_message)
            return {"error": error_message}, 500

    def update_hospital(self, user_id: int, hospital_id: int, data):
        """Úprava nemocnice"""
        logger.info("Spustená metóda update_hospital pre hospital_id: %s", hospital_id)
        message, status = User.check_user_type_required(user_id, "super_admin")
        if status != 200:
            return message, status

        try:
            hospital = Hospital.query.get(hospital_id)
        except Exception as e:
            logger.exception("Výnimka pri získavaní nemocnice s id %s: %s", hospital_id, e)
            return {"error": "Internal server error"}, 500

        if not hospital:
            logger.error("Nemocnica s id %s nebola nájdená", hospital_id)
            return {"error": "Hospital not found"}, 404

        try:
            # Aktualizácia údajov, ak sú nové hodnoty poskytnuté, inak ponechanie pôvodných
            hospital.name = data.get("name", hospital.name)
            hospital.city = data.get("city", hospital.city)
            hospital.street = data.get("street", hospital.street)
            hospital.postal_code = data.get("postal_code", hospital.postal_code)
            hospital.country = data.get("country", hospital.country)

            db.session.commit()
            logger.info("Nemocnica s id %s bola úspešne aktualizovaná", hospital_id)
            return {"message": "Hospital updated successfully"}, 200
        except Exception as e:
            logger.exception("Výnimka pri aktualizácii nemocnice s id %s: %s", hospital_id, e)
            db.session.rollback()
            return {"error": "Internal server error"}, 500

    def get_hospitals(self, user_id: int):
        """Získanie všetkých nemocníc"""
        logger.info("Spustená metóda get_hospitals")
        message, status = User.check_user_type_required(user_id, "super_admin")
        if status != 200:
            return message, status

        try:
            hospitals = Hospital.query.all()
            hospitals_data = [
                {
                    "id": h.id,
                    "name": h.name,
                    "city": h.city,
                    "street": h.street,
                    "postal_code": h.postal_code,
                    "country": h.country,
                } for h in hospitals
            ]
            logger.info("Zoznam nemocníc bol načítaný, počet: %d", len(hospitals_data))
            return hospitals_data, 200
        except Exception as e:
            logger.exception("Výnimka pri získavaní zoznamu nemocníc: %s", e)
            return {"error": "Internal server error"}, 500

    def get_hospital(self, user_id: int, hospital_id: int):
        """Získanie všetkých nemocníc"""
        logger.info("Spustená metóda get_hospital")
        message, status = User.check_user_type_required(user_id, "super_admin")
        if status != 200:
            return message, status
        try:
            hospital = Hospital.query.get(hospital_id)
            hospital_data = {
                    "id": hospital.id,
                    "name": hospital.name,
                    "city": hospital.city,
                    "street": hospital.street,
                    "postal_code": hospital.postal_code,
                    "hospital_code": hospital.hospital_code,
                    "country": hospital.country,
                }
            logger.info("Informacie nemocnice bol načítaný, počet: %d", len(hospital_data))
            return hospital_data, 200
        except Exception as e:
            logger.exception("Výnimka pri získavaní zoznamu nemocníc: %s", e)
            return {"error": "Internal server error"}, 500


    def check_user_id(self, user_id: int):
        """Overenie, či používateľ má oprávnenie super_admin."""
        return User.check_user_type_required(user_id, "super_admin")
