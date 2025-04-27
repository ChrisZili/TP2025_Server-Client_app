import logging
from flask import Flask, render_template, flash, request, jsonify, url_for, redirect
from flask_jwt_extended import jwt_required, get_jwt_identity
from database_simulation import (
    HOSPITALS,
    ADMINS,
    DOCTORS,
    PATIENTS,
    TECHNICIANS,
    PROCESSED_IMAGES,
    IMAGES,
    MEDICAL_METHODS,
    TECHNICIAN_USER_DATA,
    DOCTOR_USER_DATA,
    ADMIN_USER_DATA,
    SUPER_ADMIN_USER_DATA,
    PATIENT_USER_DATA,
)

USER_DATA = ADMIN_USER_DATA # Change this to the desired user type

# Configure logging to file only
log_file = "app.log"  # Log file name

# Set up the logging format
log_format = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"

# Configure the root logger
logging.basicConfig(
    level=logging.DEBUG,  # Set the logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
    format=log_format,
    handlers=[
        logging.FileHandler(log_file)  # Log only to a file
    ]
)

logger = logging.getLogger(__name__)  # Reuse the logger instance

# Set the current user type (can be changed dynamically)

# Initialize Flask app
app = Flask(__name__, template_folder="client/templates", static_folder="client/static")
app.secret_key = "your_secret_key_here"

@app.route("/landing", methods=["GET"])
def landing_page():
    logger.info("Landing page accessed.")
    return render_template("landing.html")


# Route: Account Page
@app.route("/account", methods=["GET"])
def account_page():
    logger.info("Account page accessed.")
    return render_template("account.html", user=USER_DATA)


# Route: Hospitals Page
@app.route('/hospitals', methods=['GET'])
def get_hospitals():
    """Render the hospitals page."""
    logger.info("get_hospitals endpoint accessed")
    return render_template("hospitals_list.html")


# Route: Hospital Details
@app.route('/hospitals/<int:hospital_id>', methods=['GET'])
def get_hospital(hospital_id):
    """Retrieve details of a specific hospital."""
    logger.info("get_hospital endpoint accessed for hospital_id: %s", hospital_id)

    # Check if the user is a Super Admin
    user_type = USER_DATA["user_type"]  # Replace with actual user type logic
    if user_type != "super_admin":
        logger.warning("Unauthorized access attempt by user type: %s", user_type)
        return render_template("error_403.html"), 403  # Return a 403 Forbidden error page

    # Find the hospital by ID
    hospital = next((h for h in HOSPITALS if h["id"] == hospital_id), None)
    if not hospital:
        logger.error("get_hospital: Hospital not found with id: %s", hospital_id)
        if request.accept_mimetypes['application/json'] >= request.accept_mimetypes['text/html']:
            return jsonify({'error': 'Hospital not found'}), 404
        else:
            return render_template("error_404.html"), 404

    # Return JSON or HTML based on the Accept header
    if request.accept_mimetypes['application/json'] >= request.accept_mimetypes['text/html']:
        return jsonify(hospital), 200
    else:
        return render_template("hospitals_details.html", hospital=hospital, user_type=user_type), 200


# Route: Add Hospital
@app.route('/hospitals/add', methods=['POST'])
def add_hospital_post():
    """Add a new hospital."""
    logger.info("add_hospital endpoint accessed")

    if not (request.is_json and request.accept_mimetypes['application/json'] >= request.accept_mimetypes['text/html']):
        logger.error("add_hospital: Invalid input or Accept header")
        return jsonify({'error': 'Invalid input or only JSON responses supported'}), 406

    data = request.get_json()
    logger.debug("add_hospital: Received data, keys: %s", list(data.keys()))

    try:
        new_hospital = {
            "id": max(h["id"] for h in HOSPITALS) + 1 if HOSPITALS else 1,
            "name": data["name"],
            "city": data["city"],
            "type": data.get("type", "Unknown"),
            "capacity": data.get("capacity", "Unknown"),
            "street": data["street"],
            "postal_code": data["postal_code"]
        }
        HOSPITALS.append(new_hospital)
        logger.info("add_hospital: New hospital added: %s", new_hospital)
    except Exception as e:
        logger.exception("add_hospital: Exception while adding hospital: %s", e)
        return jsonify({'error': 'Internal server error'}), 500

    return jsonify(new_hospital), 201


@app.route('/hospitals/add', methods=['GET'])
def add_hospital():
    return render_template('add_hospital.html')


# Route: Update Hospital
@app.route('/hospitals/update/<int:hospital_id>', methods=['PUT'])
def update_hospital(hospital_id):
    """Update an existing hospital."""
    logger.info("update_hospital endpoint accessed for hospital_id: %s", hospital_id)

    if not (request.is_json and request.accept_mimetypes['application/json'] >= request.accept_mimetypes['text/html']):
        logger.error("update_hospital: Invalid input or Accept header")
        return jsonify({'error': 'Invalid input or only JSON responses supported'}), 406

    data = request.get_json()
    logger.debug("update_hospital: Received data, keys: %s", list(data.keys()))

    hospital = next((h for h in HOSPITALS if h["id"] == hospital_id), None)
    if not hospital:
        logger.error("update_hospital: Hospital not found with id: %s", hospital_id)
        return jsonify({'error': 'Hospital not found'}), 404

    try:
        hospital.update({
            "name": data.get("name", hospital["name"]),
            "city": data.get("city", hospital["city"]),
            "type": data.get("type", hospital.get("type", "Unknown")),
            "capacity": data.get("capacity", hospital.get("capacity", "Unknown")),
            "street": data.get("street", hospital["street"]),
            "postal_code": data.get("postal_code", hospital["postal_code"])
        })
        logger.info("update_hospital: Hospital updated: %s", hospital)
    except Exception as e:
        logger.exception("update_hospital: Exception while updating hospital: %s", e)
        return jsonify({'error': 'Internal server error'}), 500

    return jsonify(hospital), 200


# Route: List Hospitals
@app.route('/hospitals/list', methods=['GET'])
def list_hospitals():
    """Retrieve a list of hospitals."""
    logger.info("list_hospitals endpoint accessed")

    if not (request.accept_mimetypes['application/json'] >= request.accept_mimetypes['text/html']):
        logger.error("list_hospitals: Frontend does not require JSON response")
        return jsonify({'error': 'Only JSON responses supported'}), 406

    try:
        hospitals_data = [
            {
                "id": hospital["id"],
                "name": hospital["name"],
                "created_at": hospital.get("created_at", "Neznámy dátum"),
                "city": hospital["city"],
                "street": hospital["street"],
                "postal_code": hospital["postal_code"],
                "capacity": hospital.get("capacity", "Unknown"),
            }
            for hospital in HOSPITALS
        ]
        logger.info("list_hospitals: List of hospitals retrieved, count: %d", len(hospitals_data))
    except Exception as e:
        logger.exception("list_hospitals: Exception while retrieving hospitals: %s", e)
        return jsonify({'error': 'Internal server error'}), 500

    return jsonify(hospitals_data), 200


# Route: Delete Hospital
@app.route('/hospitals/delete/<int:hospital_id>', methods=['DELETE'])
def delete_hospital(hospital_id):
    """Delete a hospital."""
    logger.info("delete_hospital endpoint accessed for hospital_id: %s", hospital_id)

    hospital = next((h for h in HOSPITALS if h["id"] == hospital_id), None)
    if not hospital:
        logger.error("Hospital not found with id: %s", hospital_id)
        return jsonify({'error': 'Hospital not found'}), 404

    try:
        HOSPITALS.remove(hospital)
        logger.info("Hospital deleted: %s", hospital)
    except Exception as e:
        logger.exception("Error while deleting hospital: %s", e)
        return jsonify({'error': 'Internal server error'}), 500

    return jsonify({'message': 'Hospital deleted successfully'}), 200


# Route: Medical Methods Page
@app.route("/methods", methods=["GET"])
def get_medical_methods_page():
    """Render the medical methods page."""
    logger.info("get_medical_methods_page endpoint accessed")
    return render_template("methods.html", methods=MEDICAL_METHODS)


# Route: Admins Page
@app.route('/admins', methods=['GET'])
def get_admins_page():
    """Render the admins page."""
    logger.info("get_admins_page endpoint accessed")
    return render_template("admins.html", admins=ADMINS)


# Route: Add Doctor (GET)
@app.route('/doctors/add', methods=['GET'])
def add_doctor_page():
    """Render the Add Doctor page."""
    logger.info("add_doctor_page endpoint accessed")
    return render_template("add_doctor.html", user=USER_DATA)


# Route: Add Doctor (POST)
@app.route('/doctors/add', methods=['POST'])
def add_doctor_post():
    """Add a new doctor."""
    logger.info("add_doctor_post endpoint accessed")

    if not (request.is_json and request.accept_mimetypes['application/json'] >= request.accept_mimetypes['text/html']):
        logger.error("add_doctor_post: Invalid input or Accept header")
        return jsonify({'error': 'Invalid input or only JSON responses supported'}), 406

    data = request.get_json()
    logger.debug("add_doctor_post: Received data, keys: %s", list(data.keys()))

    try:
        new_doctor = {
            "id": max(d["id"] for d in DOCTORS) + 1 if DOCTORS else 1,
            "first_name": data["first_name"],
            "last_name": data["last_name"],
            "title": data.get("title", ""),
            "email": data["email"],
            "phone_number": data["phone"],
            "hospital_id": next((h["id"] for h in HOSPITALS if h["name"] == data["hospital"]), None),
            "created_at": data["created_at"]
        }

        if not new_doctor["hospital_id"]:
            logger.error("add_doctor_post: Invalid hospital name")
            return jsonify({'error': 'Invalid hospital name'}), 400

        DOCTORS.append(new_doctor)
        logger.info("add_doctor_post: New doctor added: %s", new_doctor)
    except Exception as e:
        logger.exception("add_doctor_post: Exception while adding doctor: %s", e)
        return jsonify({'error': 'Internal server error'}), 500

    return jsonify(new_doctor), 201


# Route: Update Doctor
@app.route('/doctors/update/<int:doctor_id>', methods=['PUT'])
def update_doctor(doctor_id):
    """Update an existing doctor."""
    logger.info("update_doctor endpoint accessed for doctor_id: %s", doctor_id)

    if not (request.is_json and request.accept_mimetypes['application/json'] >= request.accept_mimetypes['text/html']):
        logger.error("update_doctor: Invalid input or Accept header")
        return jsonify({'error': 'Invalid input or only JSON responses supported'}), 406

    data = request.get_json()
    logger.debug("update_doctor: Received data, keys: %s", list(data.keys()))

    doctor = next((d for d in DOCTORS if d["id"] == doctor_id), None)
    if not doctor:
        logger.error("update_doctor: Doctor not found with id: %s", doctor_id)
        return jsonify({'error': 'Doctor not found'}), 404

    try:
        # Update the doctor's details
        doctor.update({
            "first_name": data.get("first_name", doctor["first_name"]),
            "last_name": data.get("last_name", doctor["last_name"]),
            "title": data.get("title", doctor.get("title", "")),
            "email": data.get("email", doctor["email"]),
            "phone_number": data.get("phone_number", doctor["phone_number"]),
            "hospital_id": next((h["id"] for h in HOSPITALS if h["name"] == data.get("hospital")), doctor["hospital_id"]),
            "super_doctor": data.get("is_superdoctor", doctor.get("is_superdoctor", False)),
        })

        # Check if the hospital_id is valid
        if not doctor["hospital_id"]:
            logger.error("update_doctor: Invalid hospital name")
            return jsonify({'error': 'Invalid hospital name'}), 400

        logger.info("update_doctor: Doctor updated: %s", doctor)
    except Exception as e:
        logger.exception("update_doctor: Exception while updating doctor: %s", e)
        return jsonify({'error': 'Internal server error'}), 500

    return jsonify(doctor), 200


# Route: List Doctors
@app.route('/doctors/list', methods=['GET'])
def list_doctors():
    """Retrieve a list of doctors."""
    logger.info("list_doctors endpoint accessed")

    try:
        doctors_data = [
            {
                "id": doctor["id"],
                "name": f"{doctor.get('title', '')} {doctor.get('first_name', '')} {doctor.get('last_name', '')}".strip(),
                "hospital": next((h["name"] for h in HOSPITALS if h["id"] == doctor.get("hospital_id")), "Unknown"),
                "created_at": doctor.get("created_at", "Unknown"),
                "phone_number": doctor.get("phone_number", "Unknown"),
                "email": doctor.get("email", "Unknown"),
            }
            for doctor in DOCTORS
        ]
        logger.info("list_doctors: List of doctors retrieved, count: %d", len(doctors_data))
    except Exception as e:
        logger.exception("list_doctors: Exception while retrieving doctors: %s", e)
        return jsonify({'error': 'Internal server error'}), 500

    return jsonify(doctors_data), 200


# Route: Doctor Details
@app.route('/doctors/<int:doctor_id>', methods=['GET'])
def get_doctor_details(doctor_id):
    """Retrieve details of a specific doctor."""
    logger.info("get_doctor_details endpoint accessed for doctor_id: %s", doctor_id)

    # Find the doctor by ID
    doctor = next((d for d in DOCTORS if d["id"] == doctor_id), None)
    if not doctor:
        logger.error("get_doctor_details: Doctor not found with id: %s", doctor_id)
        return jsonify({'error': 'Doctor not found'}), 404
    logger.info("Doctor: %s", doctor)
    # Add hospital name to the doctor details
    doctor["hospital"] = next((h["name"] for h in HOSPITALS if h["id"] == doctor.get("hospital_id")), "Unknown")

    # Return JSON if requested via JavaScript
    if request.accept_mimetypes['application/json'] >= request.accept_mimetypes['text/html']:
        return jsonify(doctor), 200

    # Render the doctor details page
    return render_template("doctor_details.html", doctor=doctor, user=USER_DATA)


# Route: Doctors Page
@app.route('/doctors', methods=['GET'])
def get_doctors_page():
    """Render the doctors page."""
    logger.info("get_doctors_page endpoint accessed")
    return render_template("doctors_list.html")


# Route: Fotky Page
@app.route('/photos/add', methods=['GET', 'POST'])
def photos_add():
    """Render the Add Photo page."""
    return render_template('photos_add.html', patients=PATIENTS, medical_methods=MEDICAL_METHODS)


# Route: Dashboard Info API
@app.route("/dashboard/info", methods=["GET"])
def dashboard_info():
    """Provide dashboard data based on user type."""
    logger.info("dashboard_info endpoint accessed")

    user_data = {
        "user_type": USER_DATA["user_type"],
        "processed_image_count": len(USER_DATA.get("created_images", [])),
        "doctor_count": len(DOCTORS),
        "technician_count": len(TECHNICIANS),
        "patient_count": len(PATIENTS),
        "original_image_count": len(IMAGES),
        "processed_image_count": len(PROCESSED_IMAGES),
        "hospital_count": len(HOSPITALS),
        "admin_count": len(ADMINS),
    }
    return jsonify(user_data)


# Route: Get Patient Details
@app.route("/patients/<int:patient_id>", methods=["GET"])
def get_patient(patient_id):
    """Get details of a specific patient."""
    logger.info("get_patient endpoint accessed for patient_id: %s", patient_id)

    patient = next((p for p in PATIENTS if p["id"] == patient_id), None)
    if not patient:
        logger.error("Patient not found with id: %s", patient_id)
        return render_template("error_404.html"), 404

    # Add related images
    patient["images"] = [i for i in IMAGES if i["id"] in patient["images"]]

    return render_template("patient_details.html", patient=patient)


# Route: Patients Page
@app.route('/patients', methods=['GET'])
def get_patients_page():
    """Render the patients page."""
    logger.info("get_patients_page endpoint accessed")
    return render_template("patients.html", patients=PATIENTS)


# Route: Get Technician Details
@app.route("/technicians/<int:technician_id>", methods=["GET"])
def get_technician(technician_id):
    """Get details of a specific technician."""
    logger.info("get_technician endpoint accessed for technician_id: %s", technician_id)

    technician = next((t for t in TECHNICIANS if t["id"] == technician_id), None)
    if not technician:
        logger.error("Technician not found with id: %s", technician_id)
        return render_template("error_404.html"), 404

    return render_template("technician_details.html", technician=technician)


# Route: Technicians Page
@app.route('/technicians', methods=['GET'])
def get_technicians_page():
    """Render the technicians page."""
    logger.info("get_technicians_page endpoint accessed")
    return render_template("technicians.html", technicians=TECHNICIANS)


# Route: Dashboard Page
@app.route('/dashboard', methods=['GET'])
def dashboard_page():
    """Render the dashboard page."""
    logger.info("Dashboard page accessed.")
    return render_template("dashboard.html")


# Route: Settings Info API
@app.route('/settings/info', methods=['GET'])
def settings_info():
    """Provide user data for the sidebar."""
    # Use USER_DATA from dummy_data.py
    user_data = {
        "user_type": USER_DATA["user_type"],
        "user_id": USER_DATA["id"],
        "first_name": USER_DATA.get("first_name", "Unknown"),  # Use top-level keys
        "last_name": USER_DATA.get("last_name", "Unknown"),
    }
    return jsonify(user_data)


# Route: Photos List
@app.route('/photos', methods=['GET'])
def photos_list():
    """Render the photo list page with photo and patient data."""
    # Combine photo data with patient data
    photos_with_patient_data = []
    for photo in IMAGES:
        patient = next((p for p in PATIENTS if p["id"] == photo["patient_id"]), None)
        if patient:
            photo_with_patient_data = {
                "id": photo["id"],
                "name": photo["name"],
                "url": url_for('photo_detail', photo_name=photo["name"]),
                "preview_url": photo["original_image_path"],
                "date": photo["created_at"],
                "eye": photo["eye_side"],
                "diagnosis": photo["diagnosis"],
                "patient": f"{patient['first_name']} {patient['last_name']}",
                "doctor": next((d["first_name"] + " " + d["last_name"] for d in DOCTORS if d["id"] == patient["doctor_id"]), "Unknown"),
                "hospital": next((h["name"] for h in HOSPITALS if h["id"] == patient["hospital_id"]), "Unknown"),
                "patient_data": {
                    "age": 2025 - int(patient["birth_date"].split("-")[0]),
                    "gender": patient["gender"],
                    "phone_number": patient["phone_number"],
                    "birth_number": patient["birth_number"]
                }
            }
            photos_with_patient_data.append(photo_with_patient_data)

    # Pass the user type dynamically
    return render_template('photos.html', photos=photos_with_patient_data, user_type=USER_DATA["user_type"])


# Route: Photo Detail
@app.route('/photos/detail/<photo_name>', methods=['GET'])
def photo_detail(photo_name):
    """Render the Photo Detail page."""
    logger.info(f"Accessing the Photo Detail page for photo name: {photo_name}")

    # Find the photo in IMAGES by name
    photo = next((image for image in IMAGES if image["name"] == photo_name), None)
    if not photo:
        logger.error(f"Photo with name {photo_name} not found.")
        return render_template("error_404.html"), 404

    logger.info(f"Photo found: {photo}")

    # Add additional details to the photo object
    patient = next((p for p in PATIENTS if p["id"] == photo["patient_id"]), None)
    doctor = next((d for d in DOCTORS if d["id"] == patient["doctor_id"]), None) if patient else None
    hospital = next((h for h in HOSPITALS if h["id"] == patient["hospital_id"]), None) if patient else None

    photo["patient"] = f"{patient['first_name']} {patient['last_name']}" if patient else "Unknown"
    photo["doctor"] = f"{doctor['title']} {doctor['first_name']} {doctor['last_name']}" if doctor else "Unknown"
    photo["hospital"] = hospital["name"] if hospital else "Unknown"
    photo["quality"] = photo.get("quality", "Unknown")
    photo["diagnosis"] = photo.get("diagnosis", "Unknown")
    photo["created_at"] = photo.get("created_at", "Unknown")
    photo["eye_side"] = photo.get("eye_side", "Unknown")
    photo["device_type"] = photo.get("device_type", "Unknown")
    photo["camera_type"] = photo.get("camera_type", "Unknown")
    photo["methods"] = photo.get("methods", [])
    photo["preview_url"] = url_for('static', filename=photo.get("original_image_path", "").lstrip('/')) if photo.get("original_image_path") else None

    # Find processed images related to this photo by IDs in the processed_images field
    processed_images = [
        {
            "id": img["id"],
            "processing_date": img.get("created_at", "Unknown"),
            "method_used": img["process_type"]["name"] if img.get("process_type") else "Unknown",
            "processing_state": img.get("status", "Unknown"),
        }
        for img in PROCESSED_IMAGES if img["id"] in photo.get("processed_images", [])
    ]

    logger.info(f"Processed images being sent to template: {processed_images}")

    # Fetch all medical methods
    medical_methods = [
        {"name": method["name"]}
        for method in MEDICAL_METHODS
    ]
    logger.info(f"Medical methods: {medical_methods}")

    # Pass all photo details to the template
    return render_template(
        "photos_detail.html",
        photo=photo,
        processed_images=processed_images,
        medical_methods=medical_methods,
        user=USER_DATA  # Pass user details to the template
    )


# Route: Update Photo Details
@app.route('/photos/update_details/<int:photo_id>', methods=['POST'])
def update_details(photo_id):
    """Update the details for a photo."""
    data = request.get_json()

    # Debug log to check the received payload and photo_id
    logger.info(f"Received payload for photo ID {photo_id}: {data}")
    logger.info(f"IMAGES list: {IMAGES}")

    if not data:
        return jsonify({"error": "Invalid request payload"}), 400

    # Find the photo by ID (ensure IDs are compared as integers)
    photo = next((image for image in IMAGES if int(image["id"]) == photo_id), None)
    if not photo:
        logger.error(f"Photo with ID {photo_id} not found.")
        return jsonify({"error": "Photo not found"}), 404

    # Allow the ID field if it matches the photo_id
    if "id" in data and int(data["id"]) != photo_id:
        logger.error(f"Attempt to change ID from {photo_id} to {data['id']} is not allowed.")
        return jsonify({"error": "Changing the ID is not allowed."}), 400

    # Remove the ID field from the payload if it matches the photo_id
    if "id" in data and int(data["id"]) == photo_id:
        logger.info(f"ID field matches the photo_id ({photo_id}). Ignoring the ID field in the payload.")
        del data["id"]

    # Update other fields
    for key, value in data.items():
        if key in photo:  # Allow updating all fields, excluding ID
            photo[key] = value

    logger.info(f"Updated details for photo ID {photo_id}: {data}")
    return jsonify({"message": "Details updated successfully"}), 200


# Route: Edit Processed Image
@app.route('/edit_processed_image/<int:image_id>', methods=['GET', 'POST'])
def edit_processed_image(image_id):
    """Edit the details of a processed image."""
    # Find the processed image by ID
    processed_image = next((img for img in PROCESSED_IMAGES if img["id"] == image_id), None)
    if not processed_image:
        logger.error(f"Processed image with ID {image_id} not found.")
        return render_template("error_404.html"), 404

    if request.method == 'POST':
        # Update the processed image fields with form data
        processed_image["technical_notes"] = request.form.get("technical_notes", processed_image["technical_notes"])
        processed_image["diagnostic_notes"] = request.form.get("diagnostic_notes", processed_image["diagnostic_notes"])
        processed_image["status"] = request.form.get("status", processed_image["status"])
        flash("Processed image details updated successfully!", "success")
        return redirect(url_for('results_detail', image_name=image_id))

    # Render the edit form
    return render_template("edit_processed_image.html", processed_image=processed_image)


# Route: Update Processed Image Details
@app.route('/results/update_details/<int:image_id>', methods=['POST'])
def update_processed_image_details(image_id):
    """Update the details of a processed image."""
    processed_image = next((img for img in PROCESSED_IMAGES if img["id"] == image_id), None)
    if not processed_image:
        return {"error": "Processed image not found"}, 404

    data = request.get_json()
    if not data:
        return {"error": "Invalid request payload"}, 400

    # Update the fields
    processed_image["status"] = data.get("status", processed_image["status"])
    processed_image["technical_notes"] = data.get("technical_notes", processed_image["technical_notes"])
    processed_image["diagnostic_notes"] = data.get("diagnostic_notes", processed_image["diagnostic_notes"])

    return {"message": "Processed image details updated successfully"}, 200


def validate_processed_images():
    """Ensure all original_image_id references in PROCESSED_IMAGES are valid."""
    valid_ids = {int(image["id"]) for image in IMAGES}
    for processed_image in PROCESSED_IMAGES:
        if int(processed_image["original_image_id"]) not in valid_ids:
            logger.error(f"Invalid original_image_id {processed_image['original_image_id']} in processed image {processed_image['id']}")
            return False
    return True


def validate_ids():
    """Ensure all IDs in IMAGES and PROCESSED_IMAGES are consistent."""
    valid_image_ids = {int(image["id"]) for image in IMAGES}
    for processed_image in PROCESSED_IMAGES:
        if int(processed_image["original_image_id"]) not in valid_image_ids:
            logger.error(f"Invalid original_image_id {processed_image['original_image_id']} in processed image {processed_image['id']}")
            return False
    logger.info("All IDs are valid.")
    return True


# Error Handlers
@app.errorhandler(404)
def not_found_error(error):
    logger.error("404 error occurred.")
    return render_template("error_404.html"), 404


@app.errorhandler(400)
def bad_request_error(error):
    logger.error("400 error occurred.")
    return render_template("error_400.html"), 400


@app.errorhandler(500)
def internal_server_error(error):
    logger.error("500 error occurred.")
    return render_template("error_500.html"), 500

@app.route('/results/detail/<image_name>', methods=['GET'])
def results_detail(image_name):
    """Render the Processed Image Detail page."""
    logger.info(f"Accessing the Processed Image Detail page for image name: {image_name}")

    # Find the processed image by ID
    processed_image = next((img for img in PROCESSED_IMAGES if str(img["id"]) == image_name), None)
    if not processed_image:
        logger.error(f"Processed image with name {image_name} not found.")
        return render_template("error_404.html"), 404

    # Find the original image by ID
    original_image = next((img for img in IMAGES if img["id"] == processed_image["original_image_id"]), None)
    if not original_image:
        logger.error(f"Original image for processed image {image_name} not found.")
        return render_template("error_404.html"), 404

    # Add additional details to the original image object
    original_image["device_type"] = original_image.get("device_type", "Unknown")
    original_image["camera_type"] = original_image.get("camera_type", "Unknown")
    original_image["methods"] = original_image.get("methods", [])

    # Prepare URLs for the processed image
    urls = {
        "preview_url": url_for('static', filename=processed_image.get("processed_image_path", "").lstrip('/')),
        "mask_url": url_for('static', filename=processed_image.get("segmentation_mask_path", "").lstrip('/')) if processed_image.get("segmentation_mask_path") else None,
        "bounding_boxes_url": url_for('static', filename=processed_image.get("bounding_boxes_path", "").lstrip('/')) if processed_image.get("bounding_boxes_path") else None
    }

    # Pass all required variables to the template
    return render_template(
        "results_detail.html",
        processed_image=processed_image,
        original_image=original_image,
        urls=urls,
        user=USER_DATA
    )


# Route: Get User Data
@app.route('/user/data', methods=['GET'])
def get_user_data():
    """Provide all user data to the frontend."""
    logger.info("get_user_data endpoint accessed")

    # Send all user data to the frontend
    return jsonify(USER_DATA), 200


# Run the app
if __name__ == "__main__":
    app.run(debug=True, port=5002)