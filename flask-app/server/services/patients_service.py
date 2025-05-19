import logging
from server.database import db
from server.models.admin_data import AdminData
from server.models.user import User
from server.models.doctor_data import DoctorData
from server.models.patient_data import PatientData
logger = logging.getLogger(__name__)

class PatientsService:
    @staticmethod
    def register_patient(data):
        logger.info("Začiatok registrácie pacienta")
        try:
            first_name = data.get('first_name')
            last_name = data.get('last_name')
            phone_number = data.get('phone_number')
            birth_date = data.get('birth_date')
            birth_number = data.get('birth_number')
            gender = data.get('gender')
            email = data.get('email')
            password = data.get('password')

            if not all([first_name, last_name, phone_number, birth_date, birth_number, gender, email, password]):
                logger.error("Chýbajú povinné údeje pri registrácii pacienta")
                return {'error': 'Missing required fields'}, 400

            if PatientData.query.filter_by(birth_number=birth_number).first():
                logger.error("Pacient s rodným číslom %s už existuje", birth_number)
                return {'error': 'Patient with this birth number already exists'}, 400
            if PatientData.query.filter_by(phone_number=phone_number).first():
                logger.error("Pacient s telefónnym číslom %s už existuje", phone_number)
                return {'error': 'Patient with this phone number already exists'}, 400

            new_patient = PatientData(
                first_name=first_name,
                last_name=last_name,
                email=email,
                phone_number=phone_number,
                birth_date=birth_date,
                birth_number=birth_number,
                gender=gender,
            )
            new_patient.set_password(password)
            db.session.add(new_patient)
            db.session.commit()

            logger.info("Pacient %s %s bol úspešne zaregistrovaný", first_name, last_name)
            return {'message': 'User registered successfully'}, 201

        except Exception as e:
            db.session.rollback()
            logger.exception("Výnimka pri registrácii pacienta: %s", e)
            return {'error': str(e)}, 500

    def get_patients(self, user_id: int):
        user = User.query.get(user_id)
        if not user or not user.user_type in ['super_admin', 'admin', 'doctor']:
            return {'error': 'Unauthorized'}, 403

        if user.user_type == 'super_admin':
            patients = PatientData.query.all()
        elif user.user_type  == 'admin':
            admin = AdminData.query.get(user_id)
            if not admin or not admin.hospital:
                return {'error': 'Admin hospital not found'}, 404
            patients = []
            for doctor in admin.hospital.doctors:
                try:
                    doctor_patients = doctor.patients or []
                    patients.extend(doctor_patients)
                except Exception as e:
                    logger.exception(f"Error accessing patients for doctor {doctor.id}: {e}")
                    continue
        elif user.user_type == 'doctor':
            doctor = DoctorData.query.get(user_id)
            if doctor.super_doctor:
                patients = PatientData.query.all()
            else:
                patients = doctor.patients
        else:
            return {'error': 'Unauthorized'}, 403

        result = []
        for patient in patients:
            item = {
                "id": patient.id,
                "first_name": patient.first_name,
                "last_name": patient.last_name,
                "email": patient.email,
                "gender": patient.gender,
                "phone_number": patient.phone_number,
                "created_at": patient.created_at.isoformat() if patient.created_at else None,
                "doctor_id": patient.doctor_id,  # <-- add doctor_id
                "hospital_id": None,             # <-- add hospital_id (default None)
            }
            if user.user_type != 'technician':
                item["birth_number"] = patient.birth_number

            if patient.doctor_id:
                doctor = DoctorData.query.get(patient.doctor_id)
                if doctor:
                    item["doctor_name"] = f"{doctor.title + ' ' if doctor.title else ''}{doctor.first_name} {doctor.last_name}{' ' + doctor.suffix if doctor.suffix else ''}"
                    item["hospital_name"] = doctor.hospital.name if doctor.hospital else None
                    item["hospital_id"] = doctor.hospital.id if doctor.hospital else None  # <-- set hospital_id

            result.append(item)

        return result, 200

    def add_patient(self, user_id: int, data):
        user = User.query.get(user_id)
        if not user or user.user_type not in ['super_admin', 'admin', 'doctor', 'technician']:
            return {'error': 'Unauthorized'}, 403

        try:
            first_name = data.get('first_name')
            last_name = data.get('last_name')
            email = data.get('email')
            phone_number = data.get('phone_number')
            birth_date = data.get('birth_date')
            birth_number = data.get('birth_number')
            gender = data.get('gender')
            doctor_id = data.get('doctor_id')
            password = data.get('password')

            if not all([first_name, last_name, phone_number, birth_date, birth_number, gender, password]):
                return {'error': 'Missing required fields'}, 400

            if PatientData.query.filter_by(birth_number=birth_number).first():
                return {'error': 'Patient with this birth number already exists'}, 400

            new_patient = PatientData(
                first_name=first_name,
                last_name=last_name,
                email=email,
                phone_number=phone_number,
                birth_date=birth_date,
                birth_number=birth_number,
                gender=gender,
                doctor_id=doctor_id
            )
            new_patient.set_password(password)
            db.session.add(new_patient)
            db.session.commit()

            return {'message': 'Patient added successfully'}, 201

        except Exception as e:
            db.session.rollback()
            logger.exception("Error adding patient: %s", e)
            return {'error': 'Internal server error'}, 500

    def get_patient(self, user_id: int, patient_id: int):
        user = User.query.get(user_id)
        if not user or user.user_type not in ['super_admin', 'admin', 'doctor']:
            return {'error': 'Unauthorized'}, 403

        # First get the patient data
        patient = PatientData.query.get(patient_id)
        if not patient:
            return {'error': 'Patient not found'}, 404

        # Check authorization based on user type
        if user.user_type == 'super_admin':
            # Super admin can access all patients
            pass
        elif user.user_type == 'admin':
            admin = AdminData.query.get(user_id)
            if not admin or not admin.hospital:
                return {'error': 'Admin hospital not found'}, 404

            if not patient.doctor_id or not any(
                    doctor.id == patient.doctor_id for doctor in admin.hospital.doctors
            ):
                return {'error': 'Unauthorized to access this patient'}, 403
        elif user.user_type == 'doctor':
            doctor = DoctorData.query.get(user_id)
            # Check if patient belongs to this doctor
            if not doctor or patient.doctor_id != doctor.id:
                # Also check if doctor is a super_doctor (can see all patients)
                if not doctor or not doctor.super_doctor:
                    return {'error': 'Unauthorized to access this patient'}, 403

        # Build response
        response = {
            "id": patient.id,
            "first_name": patient.first_name,
            "last_name": patient.last_name,
            "email": patient.email,
            "gender": patient.gender,
            "phone_number": patient.phone_number,
            "created_at": patient.created_at.isoformat() if patient.created_at else None,
            "birth_date": patient.birth_date.isoformat() if patient.birth_date else None,
        }

        if user.user_type != 'technician':
            response["birth_number"] = patient.birth_number

        if patient.doctor_id:
            doctor = DoctorData.query.get(patient.doctor_id)
            if doctor:
                response["doctor_id"] = doctor.id
                response["doctor_name"] = f"{doctor.first_name} {doctor.last_name}"
                response["hospital_name"] = doctor.hospital.name if doctor.hospital else None

        return response, 200

    def update_patient(self, user_id: int, patient_id: int, data):
        user = User.query.get(user_id)
        if not user or user.user_type not in ['super_admin', 'admin', 'doctor']:
            return {'error': 'Unauthorized'}, 403

        patient = PatientData.query.get(patient_id)
        if not patient:
            return {'error': 'Patient not found'}, 404

        try:
            patient.first_name = data.get("first_name", patient.first_name)
            patient.last_name = data.get("last_name", patient.last_name)
            patient.email = data.get("email", patient.email)
            patient.phone_number = data.get("phone_number", patient.phone_number)
            patient.gender = data.get("gender", patient.gender)
            patient.birth_date = data.get("birth_date", patient.birth_date)
            if user.user_type != 'technician':
                patient.birth_number = data.get("birth_number", patient.birth_number)

            # Add validation for doctor_id
            if "doctor_id" in data and data["doctor_id"] and user.user_type == 'super_admin':
                doctor = DoctorData.query.get(data["doctor_id"])
                if not doctor:
                    return {'error': f'Doctor with ID {data["doctor_id"]} not found'}, 400
                patient.doctor_id = data["doctor_id"]
            elif "doctor_id" in data and not data["doctor_id"]:
                patient.doctor_id = None  # Clear the doctor association

            db.session.commit()
            return {'message': 'Patient updated successfully'}, 200

        except Exception as e:
            db.session.rollback()
            logger.exception("Error updating patient: %s", e)
            return {'error': 'Internal server error'}, 500

    def assign_patient(self, user_id: int, data):
        try:
            user = User.query.get(user_id)
            logger.info(f"user_type = {user.user_type} ({type(user.user_type)})")

            if user.user_type not in ['super_admin', 'admin', 'doctor']:
                return {'error': 'Neautorizovaný prístup.'}, 403

            birth_number = data.get('birth_number')
            if not birth_number:
                return {'error': 'Chýba rodné číslo pacienta.'}, 400

            patient = PatientData.query.filter_by(birth_number=birth_number).first()
            if not patient:
                return {'error': 'Pacient nebol nájdený.'}, 404

            if patient.doctor_id is not None:
                return {'error': 'Pacient už má priradeného doktora.'}, 400

            if user.user_type == 'super_admin':
                doctor = DoctorData.query.get(data.get('doctor_id'))
                if not doctor:
                    return {'error': 'Doktor nebol nájdený.'}, 404
                patient.doctor_id = doctor.id

            elif user.user_type == 'admin':
                admin = AdminData.query.get(user_id)
                if not admin or not admin.hospital:
                    return {'error': 'Nemocnica správcu nebola nájdená.'}, 404

                doctor = DoctorData.query.get(data.get('doctor_id'))
                if not doctor:
                    return {'error': 'Doktor nebol nájdený.'}, 404

                if not doctor.hospital or doctor.hospital.id != admin.hospital.id:
                    return {'error': 'Doktor nepatrí do vašej nemocnice.'}, 403

                patient.doctor_id = doctor.id

            elif user.user_type == 'doctor':
                doctor = DoctorData.query.get(user_id)
                if not doctor:
                    return {'error': 'Doktor nebol nájdený.'}, 404
                patient.doctor_id = doctor.id

            db.session.commit()
            return {'message': 'Pacient bol úspešne priradený k doktorovi.'}, 200

        except Exception as e:
            db.session.rollback()
            logger.exception("Chyba pri priraďovaní pacienta: %s", e)
            return {'error': 'Interná chyba servera.'}, 500

    def check_user_id(self, user_id: int):
        """Overenie, či používateľ má oprávnenie super_admin."""
        message, status = User.check_user_type_required(user_id, "super_admin")
        if status != 200:
            message, status = User.check_user_type_required(user_id, "admin")
        if status != 200:
            message, status = User.check_user_type_required(user_id, "doctor")
        return message, status
