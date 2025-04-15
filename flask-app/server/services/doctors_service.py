import logging
from server.database import db
from server.models import User, OriginalImageData
from server.models.admin_data import AdminData
from server.models.hospital_data import Hospital
from server.models.doctor_data import DoctorData
from server.models.patient_data import PatientData

logger = logging.getLogger(__name__)

class DoctorsService:
    def assign_patient_to_doctor(self, doctor_id, patient_id):
        """Priradenie pacienta k lekárovi"""
        doctor = DoctorData.query.filter_by(doctor_id=doctor_id).first()
        patient = PatientData.query.filter_by(patient_id=patient_id).first()

        if not doctor:
            return {'error': 'Doctor not found'}, 404
        if not patient:
            return {'error': 'Patient not found'}, 404

        patient.doctor_id = doctor.id
        db.session.commit()

        return {'message': 'Patient assigned to doctor'}, 200

    def remove_patient_from_doctor(self, doctor_id, patient_id):
        """Odstránenie pacienta od lekára"""
        patient = PatientData.query.filter_by(patient_id=patient_id, doctor_id=doctor_id).first()

        if not patient:
            return {'error': 'Patient not found or not assigned to this doctor'}, 404

        patient.doctor_id = None  # Pacient stratí doktora
        db.session.commit()

        return {'message': 'Patient removed from doctor'}, 200

    def transfer_patient_to_other_doctor(self, doctor_id, patient_id, new_doctor_id):
        """Premiestnenie pacienta k inému lekárovi"""
        patient = PatientData.query.filter_by(patient_id=patient_id, doctor_id=doctor_id).first()
        new_doctor = DoctorData.query.filter_by(doctor_id=new_doctor_id).first()

        if not patient:
            return {'error': 'Patient not found or not assigned to this doctor'}, 404
        if not new_doctor:
            return {'error': 'New doctor not found'}, 404

        patient.doctor_id = new_doctor.id
        db.session.commit()

        return {'message': 'Patient transferred to new doctor'}, 200

    def get_doctor_patients(self, doctor_id):
        """Získanie zoznamu pacientov lekára"""
        doctor = DoctorData.query.filter_by(doctor_id=doctor_id).first()
        if not doctor:
            return {'error': 'Doctor not found'}, 404

        patients = doctor.patients
        return [
            {
                "id": patient.patient_id,
                "name": f"{patient.patient.first_name} {patient.patient.last_name}"
            } for patient in patients
        ], 200

    def update_doctor_info(self, doctor_id, data):
        """Aktualizácia údajov o lekárovi"""
        doctor = DoctorData.query.filter_by(doctor_id=doctor_id).first()
        if not doctor:
            return {'error': 'Doctor not found'}, 404

        doctor.specialization = data.get("specialization", doctor.specialization)
        doctor.notes = data.get("notes", doctor.notes)

        db.session.commit()
        return {'message': 'Doctor info updated'}, 200

    def change_hospital(self, doctor_id, hospital_code):
        """Zmena nemocnice lekára"""
        doctor = DoctorData.query.filter_by(doctor_id=doctor_id).first()
        hospital = Hospital.query.filter_by(code=hospital_code).first()

        if not doctor:
            return {'error': 'Doctor not found'}, 404
        if not hospital:
            return {'error': 'Invalid hospital code'}, 400

        doctor.hospital_id = hospital.id
        db.session.commit()

        return {'message': 'Hospital changed successfully'}, 200

    def get_patient_details(self, doctor_id, patient_id):
        """Získanie informácií o pacientovi a jeho fotiek (len ak je to pacient doktora)"""
        doctor = DoctorData.query.filter_by(doctor_id=doctor_id).first()
        patient_data = PatientData.query.filter_by(patient_id=patient_id, doctor_id=doctor.id).first()

        if not doctor:
            return {'error': 'Doctor not found'}, 404
        if not patient_data:
            return {'error': 'Patient not assigned to this doctor'}, 403

        patient = User.query.get(patient_data.patient_id)
        images = OriginalImageData.query.filter_by(patient_data_id=patient_data.id).all()

        return {
            "patient_id": patient.id,
            "first_name": patient.first_name,
            "last_name": patient.last_name,
            "email": patient.email,
            "gender": patient.gender,
            "hospital": doctor.hospital_data.name if doctor.hospital_data else "Unknown",
            "images": [
                {
                    "id": img.id,
                    "original_image": img.original_image_path,
                    "mask_image": img.mask_image_path,
                    "processed_image": img.processed_image_path,
                    "result": img.result
                } for img in images
            ]
        }, 200

    @staticmethod
    def register_doctor(data):
        try:
            first_name = data.get('first_name')
            last_name = data.get('last_name')
            phone_number = data.get('phone_number')
            gender = data.get('gender')

            hospital_code = data.get('hospital_code')

            email = data.get('email')
            password = data.get('password')

            if not all([first_name, last_name, phone_number, gender, email, password, hospital_code]):
                return {'error': 'Missing required fields'}, 400
            hospital = Hospital.query.filter_by(hospital_code=hospital_code).first()
            if not hospital:
                return {'error': 'Doctor code does not exist'}, 400
            if PatientData.query.filter_by(phone_number=phone_number).first():
                return {'error': 'Patient with this phone number already exists'}, 400

            new_doctor = DoctorData(
                first_name=first_name,
                last_name=last_name,
                phone_number=phone_number,
                gender=gender,
                email=email,
                hospital_id = hospital.id
            )
            new_doctor.set_password(password)
            db.session.add(new_doctor)
            db.session.commit()
            print()
            return {'message': 'Doctor registered successfully'}, 201

        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500

    @staticmethod
    def get_doctor_info(doctor):
        try:
            response = {
                "first_name": doctor.first_name,
                "last_name": doctor.last_name,
                "email": doctor.email,
                "gender": doctor.gender
            }
            if doctor.title:
                response["title"] = doctor.title
            if doctor.suffix:
                response["suffix"] = doctor.suffix
            if doctor.phone_number:
                response["phone_number"] = doctor.phone_number
            if doctor.birth_date:
                response["birth_date"] = doctor.birth_date.isoformat()
            return response, 200
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500

######################################################################################
    def add_doctor(self, user_id: int, data):
        logger.info("Spustená metóda add_doctor")
        user = User.query.get(int(user_id))
        if user.is_super_admin():
            hospital_code = data.get("hospital_code")
            doctor_role = data.get("role")
        elif user.is_admin():
            hospital_code = AdminData.query.filter_by(id =user_id).first().hospital.hospital_code
            logger.info(f"Hospital kode: {hospital_code}")
            doctor_role = "doctor"
        else:
            error_message = f"Add doctor: Používateľ s id {user_id} nie je admin ani super_admin (user_type={user.user_type})"
            logger.error(error_message)
            return {"error": error_message}, 400

        title = data.get("title", "")
        suffix = data.get("suffix", "")

        first_name = data.get("first_name")
        last_name = data.get("last_name")

        phone_number = data.get("phone_number")
        gender = data.get("gender")

        email = data.get("email")
        password = data.get("password")


        if User.query.filter_by(email=email).first():
            logger.error("Registrácia zlyhala: Email %s už existuje", email)
            return {'error': 'Email already exists'}, 400

        if not all([first_name, last_name, phone_number, gender, doctor_role, hospital_code, email, password]):
            logger.error("Chýbajú povinné údaje (vrátane emailu/hesla)")
            return {"error": "Chýbajú povinné údaje vrátane emailu a hesla"}, 400

        hospital = Hospital.query.filter_by(hospital_code=hospital_code).first()
        if not hospital:
            logger.error("Nemocnica s kódom '%s' neexistuje", hospital_code)
            return {"error": "Neexistujúca nemocnica s týmto kódom"}, 404

        try:
            new_doctor = DoctorData(
                email=email,
                first_name=first_name,
                last_name=last_name,
                phone_number=phone_number,
                gender=gender,
                title=title,
                suffix=suffix,
                hospital_id=hospital.id
            )
            if doctor_role == "super_doctor":
                new_doctor.set_super_doctor(True)
            elif doctor_role == "doctor":
                new_doctor.set_super_doctor(False)
            else:
                logger.warning("Neexistujúca rola s nazvom '%s'", doctor_role)
                return {"error": "Neexistujúca rola"}, 404
            new_doctor.set_password(password)
            db.session.add(new_doctor)
            db.session.commit()
            logger.info("Doktor '%s %s' bol úspešne pridaný", first_name, last_name)
            return {"message": "Doktor bol úspešne pridaný."}, 201
        except Exception as e:
            logger.exception("Výnimka pri pridávaní doktora: %s", e)
            db.session.rollback()
            return {"error": "Interná chyba servera"}, 500

    def update_doctor(self, user_id: int, doctor_id: int, data):
        logger.info("Spustená metóda update_doctor pre doctor_id: %s", doctor_id)
        try:
            user = User.query.get(int(user_id))
            doctor = None
            if user.is_super_admin():
                doctor = DoctorData.query.get(doctor_id)
            elif user.is_admin():
                doctor = DoctorData.query.get(doctor_id)
                if user.hospital.hospital_code != doctor.hospital.hospital_code:
                    error_message = f"Používateľ s id {user_id} nema pristup k doctor_id {doctor_id}"
                    logger.error(error_message)
                    return {"error": error_message}, 400
            else:
                error_message = f"Používateľ s id {user_id} nie je admin ani super_admin (user_type={user.user_type})"
                logger.error(error_message)
                return {"error": error_message}, 400

            if not doctor:
                logger.warning("Doktor s id %s neexistuje", doctor_id)
                return {"error": "Doktor neexistuje"}, 404

            doctor.first_name = data.get("first_name", doctor.first_name)
            doctor.last_name = data.get("last_name", doctor.last_name)
            doctor.phone_number = data.get("phone_number", doctor.phone_number)
            doctor.gender = data.get("gender", doctor.gender)
            doctor.title = data.get("title", doctor.title)
            doctor.suffix = data.get("suffix", doctor.suffix)

            if user.is_super_admin():
                hospital_code = data.get("hospital_code")
                if hospital_code != doctor.hospital.hospital_code:
                    if hospital_code:
                        hospital = Hospital.query.filter_by(hospital_code=hospital_code).first()
                        if not hospital:
                            logger.warning("Neexistujúca nemocnica s kódom '%s'", hospital_code)
                            return {"error": "Neexistujúca nemocnica"}, 404
                        doctor.hospital_id = hospital.id
                doctor_role = data.get("role")
                if doctor_role == "super_doctor":
                    doctor.set_super_doctor(True)
                elif doctor_role == "doctor":
                    doctor.set_super_doctor(False)
                else:
                    logger.warning("Neexistujúca rola s nazvom '%s'", doctor_role)
                    return {"error": "Neexistujúca rola"}, 404

            db.session.commit()
            logger.info("Doktor s id %s bol aktualizovaný", doctor_id)
            return {"message": "Doktor aktualizovaný"}, 200
        except Exception as e:
            logger.exception("Výnimka pri aktualizácii doktora: %s", e)
            db.session.rollback()
            return {"error": "Interná chyba servera"}, 500

    def get_doctors(self, user_id: int):
        logger.info("Spustená metóda get_doctors")
        try:
            user = User.query.get(int(user_id))
            if user.is_super_admin():
                doctors = DoctorData.query.all()
            elif user.is_admin():
                hospital_id = user.hospital_id
                doctors = DoctorData.query.filter_by(hospital_id=hospital_id).all()
            else:
                error_message = f"Používateľ s id {user_id} nie je admin ani super_admin (user_type={user.user_type})"
                logger.error(error_message)
                return {"error": error_message}, 400

            doctors_data = []
            for d in doctors:
                hospital = d.hospital
                hospital_info = {
                    "id": hospital.id,
                    "name": hospital.name,
                    "city": hospital.city,
                    "street": hospital.street,
                    "postal_code": hospital.postal_code
                } if hospital else None
                doctors_data.append({
                    "id": d.id,
                    "first_name": d.first_name,
                    "last_name": d.last_name,
                    "phone_number": d.phone_number,
                    "gender": d.gender,
                    "email": d.email,
                    "title": d.title,
                    "suffix": d.suffix,
                    "hospital": hospital_info,
                    "created_at": d.created_at.isoformat() if d.created_at else None
                })

            return doctors_data, 200
        except Exception as e:
            logger.exception("Chyba pri získavaní doktorov: %s", e)
            return {"error": "Interná chyba servera"}, 500

    def get_doctor(self, user_id: int, doctor_id: int):
        logger.info("Spustená metóda get_doctor pre doctor_id: %s", doctor_id)
        user = User.query.get(int(user_id))
        doctor = None
        if user.is_super_admin():
            doctor = DoctorData.query.get(doctor_id)
        elif user.is_admin():
            doctor = DoctorData.query.get(doctor_id)
            if user.hospital.hospital_code != doctor.hospital.hospital_code:
                error_message = f"Používateľ s id {user_id} nema pristup k doctor_id {doctor_id}"
                logger.error(error_message)
                return {"error": error_message}, 400
        else:
            error_message = f"Používateľ s id {user_id} nie je admin ani super_admin (user_type={user.user_type})"
            logger.error(error_message)
            return {"error": error_message}, 400

        try:
            if not doctor:
                return {"error": "Doktor neexistuje"}, 404
            hospital = doctor.hospital
            hospital_info = {
                "id": hospital.id,
                "name": hospital.name,
                "city": hospital.city,
                "street": hospital.street,
                "postal_code": hospital.postal_code,
            } if hospital else None
            if hospital:
                if user.is_super_admin():
                    hospital_info.update({"hospital_code": doctor.hospital.hospital_code if doctor.hospital else ""})

            doctor_data = {
                "id": doctor.id,
                "first_name": doctor.first_name,
                "last_name": doctor.last_name,
                "phone_number": doctor.phone_number,
                "gender": doctor.gender,
                "email": doctor.email,
                "title": doctor.title,
                "suffix": doctor.suffix,
                "created_at": doctor.created_at.isoformat() if doctor.created_at else None,
                "role": "super_doctor" if doctor.super_doctor else "doctor",
                "hospital": hospital_info
            }
            if user.is_super_admin():
                doctor_data.update({"super_doctor": doctor.super_doctor})
            return doctor_data, 200
        except Exception as e:
            logger.exception("Chyba pri získavaní doktora: %s", e)
            return {"error": "Interná chyba servera"}, 500

    def check_user_id(self, user_id: int):
        message, status = User.check_user_type_required(user_id, "super_admin")
        if status != 200:
            message, status = User.check_user_type_required(user_id, "admin")
        return message, status
