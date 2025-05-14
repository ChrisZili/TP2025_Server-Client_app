import logging
from server.database import db
from server.models import User
from server.models.admin_data import AdminData
from server.models.hospital_data import Hospital

logger = logging.getLogger(__name__)

class AdminsService:
    def add_admin(self, user_id: int, data):
        logger.info("Spustená metóda add_admin")
        message, status = User.check_user_type_required(user_id, "super_admin")
        if status != 200:
            return message, status

        first_name = data.get("first_name")
        last_name = data.get("last_name")
        phone_number = data.get("phone_number")
        gender = data.get("gender")
        hospital_code = data.get("hospital_code")

        email = data.get("email")
        if User.query.filter_by(email=email).first():
            logger.error("Registrácia zlyhala: Email %s už existuje", email)
            return {'error': 'Email already exists'}, 400

        password = data.get("password")

        if not all([first_name, last_name, phone_number, gender, hospital_code, email, password]):
            logger.error("Chýbajú povinné údaje (vrátane emailu/hesla)")
            return {"error": "Chýbajú povinné údaje vrátane emailu a hesla"}, 400

        hospital = Hospital.query.filter_by(hospital_code=hospital_code).first()
        if not hospital:
            logger.error("Nemocnica s kódom '%s' neexistuje", hospital_code)
            return {"error": "Neexistujúca nemocnica s týmto kódom"}, 404

        try:
            new_admin = AdminData(
                email=email,
                first_name=first_name,
                last_name=last_name,
                phone_number=phone_number,
                gender=gender,
                hospital_id=hospital.id
            )
            new_admin.set_password(password)
            db.session.add(new_admin)
            db.session.commit()
            logger.info("Admin '%s %s' bol úspešne pridaný", first_name, last_name)
            return {"message": "Admin bol úspešne pridaný."}, 201
        except Exception as e:
            logger.exception("Výnimka pri pridávaní admina: %s", e)
            db.session.rollback()
            return {"error": "Interná chyba servera"}, 500

    def update_admin(self, user_id: int, admin_id: int, data):
        logger.info("Spustená metóda update_admin pre admin_id: %s", admin_id)
        message, status = User.check_user_type_required(user_id, "super_admin")
        if status != 200:
            return message, status

        try:
            admin = AdminData.query.get(admin_id)
            if not admin:
                logger.warning("Admin s id %s neexistuje", admin_id)
                return {"error": "Admin neexistuje"}, 404

            admin.first_name = data.get("first_name", admin.first_name)
            admin.last_name = data.get("last_name", admin.last_name)
            admin.phone_number = data.get("phone_number", admin.phone_number)
            admin.gender = data.get("gender", admin.gender)
            User.query.get(admin_id).email = data.get("email", User.query.get(admin_id).email)

            password = data.get("password", "")
            if password != "":
                User.query.get(admin_id).set_password(password)

            hospital_code = data.get("hospital_code")
            if hospital_code:
                hospital = Hospital.query.filter_by(hospital_code=hospital_code).first()
                if not hospital:
                    logger.warning("Neexistujúca nemocnica s kódom '%s'", hospital_code)
                    return {"error": "Neexistujúca nemocnica"}, 404
                admin.hospital_id = hospital.id
            db.session.commit()
            logger.info("Admin s id %s bol aktualizovaný", admin_id)
            return {"message": "Admin aktualizovaný"}, 200
        except Exception as e:
            logger.exception("Výnimka pri aktualizácii admina: %s", e)
            db.session.rollback()
            return {"error": "Interná chyba servera"}, 500

    def get_admins(self, user_id: int):
        """Získanie všetkých adminov (iba pre super_admina) s detailmi nemocnice."""
        logger.info("Spustená metóda get_admins")
        message, status = User.check_user_type_required(user_id, "super_admin")
        if status != 200:
            return message, status

        try:
            admins = AdminData.query.all()
            admins_data = []
            for a in admins:
                hospital = a.hospital
                hospital_info = {
                    "id": hospital.id,
                    "name": hospital.name,
                    "city": hospital.city,
                    "street": hospital.street,
                    "postal_code": hospital.postal_code
                } if hospital else None

                admins_data.append({
                    "id": a.id,
                    "first_name": a.first_name,
                    "last_name": a.last_name,
                    "email": a.email,
                    "phone_number": a.phone_number,
                    "gender": a.gender,
                    "created_at": a.created_at.isoformat() if a.created_at else None,
                    "hospital": hospital_info
                })
            logger.info("Načítaný zoznam adminov: %d", len(admins_data))
            return admins_data, 200
        except Exception as e:
            logger.exception("Chyba pri načítavaní adminov: %s", e)
            return {"error": "Interná chyba servera"}, 500

    def get_admin(self, user_id: int, admin_id: int):
        """Získanie konkrétneho admina s detailmi nemocnice."""
        logger.info("Spustená metóda get_admin pre admin_id: %s", admin_id)
        message, status = User.check_user_type_required(user_id, "super_admin")
        if status != 200:
            return message, status

        try:
            admin = AdminData.query.get(admin_id)
            if not admin:
                return {"error": "Admin neexistuje"}, 404

            hospital = admin.hospital
            hospital_info = {
                "id": hospital.id,
                "name": hospital.name,
                "city": hospital.city,
                "street": hospital.street,
                "postal_code": hospital.postal_code,
                "hospital_code": hospital.hospital_code
            } if hospital else None

            admin_data = {
                "id": admin.id,
                "first_name": admin.first_name,
                "last_name": admin.last_name,
                "phone_number": admin.phone_number,
                "gender": admin.gender,
                "email": admin.email,
                "created_at": admin.created_at.isoformat() if admin.created_at else None,
                "hospital": hospital_info
            }
            logger.info("Admin načítaný: %s %s", admin.first_name, admin.last_name)
            return admin_data, 200
        except Exception as e:
            logger.exception("Chyba pri získavaní admina: %s", e)
            return {"error": "Interná chyba servera"}, 500

    def check_user_id(self, user_id: int):
        """Overenie, či používateľ má oprávnenie super_admin."""
        return User.check_user_type_required(user_id, "super_admin")
