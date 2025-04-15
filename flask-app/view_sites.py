from flask import Flask, render_template, url_for, jsonify, flash, make_response, redirect, request, send_file
import os
from io import BytesIO
import base64

app = Flask(__name__, template_folder='client/templates', static_folder='client\\static')
app.secret_key = 'your_secret_key_here'

UPLOAD_FOLDER = os.path.join(app.static_folder, 'images')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)  # Ensure the upload folder exists

uploaded_photo = None
uploaded_data = {}

# Centralized structure for medical methods
MEDICAL_METHODS = [
    {
        "name": "Segmentacia",
        "description": "Segmentation of medical images.",
        "mask": "Binary mask for segmentation.",
        "diagnosis": "Used for identifying regions of interest.",
        "data": {"complexity": "High", "tools": ["Tool A", "Tool B"]}
    },
    {
        "name": "Klasifikacia",
        "description": "Classification of medical conditions.",
        "mask": "Not applicable.",
        "diagnosis": "Used for categorizing medical conditions.",
        "data": {"accuracy": "95%", "tools": ["Tool C"]}
    },
    {
        "name": "Detekcia",
        "description": "Detection of anomalies in images.",
        "mask": "Bounding boxes for detected anomalies.",
        "diagnosis": "Used for identifying anomalies.",
        "data": {"speed": "Fast", "tools": ["Tool D", "Tool E"]}
    },
    {
        "name": "Aloha",
        "description": "Experimental method Aloha.",
        "mask": "Not applicable.",
        "diagnosis": "Experimental diagnostic method.",
        "data": {"notes": "Still in testing phase."}
    },
    {
        "name": "Qloha",
        "description": "Experimental method Qloha.",
        "mask": "Not applicable.",
        "diagnosis": "Experimental diagnostic method.",
        "data": {"tools": ["Tool F"], "limitations": "Requires high computational power."}
    }
]

# Centralized structure for users
USERS = {
    "user@example.com": {
        "email": "user@example.com",
        "user_type": "admin",
        "first_name": "John",
        "last_name": "Doe",
        "gender": "Male",
        "phone_number": "123456789",
        "birth_date": "1990-01-01",
        "birth_number": "9001011234",
        "doctor_id": 22222,
        "diagnosis_right_eye": "Healthy",
        "diagnosis_left_eye": "Healthy",
    }
}

# Centralized structure for photos
PHOTOS = [
    {
        "name": "Photo 1",
        "eye": "rigth",
        "patient": "Patient1",
        "hospital": "Hospital1",
        "doctor": "Doctor1",
        "date": "1.1.2023",
        "url": "/static/images/Untitled1.jpg",
        "methods": ["Segmentacia", "Klasifikacia"]
    },
    {
        "name": "Photo 2",
        "eye": "left",
        "patient": "Patient1",
        "hospital": "Hospital2",
        "doctor": "Doctor2",
        "date": "2.1.2023",
        "url": "/static/images/Untitled2.jpg",
        "methods": ["Detekcia"]
    },
    {
        "name": "Photo 3",
        "eye": "rigth",
        "patient": "Patient2",
        "hospital": "Hospital2",
        "doctor": "Doctor2",
        "date": "2.3.2023",
        "url": "/static/images/Untitled3.jpg",
        "methods": ["Segmentacia", "Detekcia"]
    },
    # 20 new random photos linked to existing ones
    {
        "name": "Photo 4",
        "eye": "left",
        "patient": "Patient3",
        "hospital": "Hospital1",
        "doctor": "Doctor1",
        "date": "3.1.2023",
        "url": "/static/images/Untitled1.jpg",
        "methods": ["Segmentacia", "Klasifikacia"]
    },
    {
        "name": "Photo 5",
        "eye": "rigth",
        "patient": "Patient4",
        "hospital": "Hospital2",
        "doctor": "Doctor2",
        "date": "4.1.2023",
        "url": "/static/images/Untitled2.jpg",
        "methods": ["Detekcia"]
    },
    {
        "name": "Photo 6",
        "eye": "left",
        "patient": "Patient5",
        "hospital": "Hospital3",
        "doctor": "Doctor3",
        "date": "5.1.2023",
        "url": "/static/images/Untitled3.jpg",
        "methods": ["Segmentacia", "Detekcia"]
    },
    {
        "name": "Photo 7",
        "eye": "rigth",
        "patient": "Patient6",
        "hospital": "Hospital1",
        "doctor": "Doctor1",
        "date": "6.1.2023",
        "url": "/static/images/Untitled1.jpg",
        "methods": ["Segmentacia", "Klasifikacia"]
    },
    {
        "name": "Photo 8",
        "eye": "left",
        "patient": "Patient7",
        "hospital": "Hospital2",
        "doctor": "Doctor2",
        "date": "7.1.2023",
        "url": "/static/images/Untitled2.jpg",
        "methods": ["Detekcia"]
    },
    {
        "name": "Photo 9",
        "eye": "rigth",
        "patient": "Patient8",
        "hospital": "Hospital3",
        "doctor": "Doctor3",
        "date": "8.1.2023",
        "url": "/static/images/Untitled3.jpg",
        "methods": ["Segmentacia", "Detekcia"]
    },
    {
        "name": "Photo 10",
        "eye": "left",
        "patient": "Patient9",
        "hospital": "Hospital1",
        "doctor": "Doctor1",
        "date": "9.1.2023",
        "url": "/static/images/Untitled1.jpg",
        "methods": ["Segmentacia", "Klasifikacia"]
    },
    {
        "name": "Photo 11",
        "eye": "rigth",
        "patient": "Patient10",
        "hospital": "Hospital2",
        "doctor": "Doctor2",
        "date": "10.1.2023",
        "url": "/static/images/Untitled2.jpg",
        "methods": ["Detekcia"]
    },
    {
        "name": "Photo 12",
        "eye": "left",
        "patient": "Patient11",
        "hospital": "Hospital3",
        "doctor": "Doctor3",
        "date": "11.1.2023",
        "url": "/static/images/Untitled3.jpg",
        "methods": ["Segmentacia", "Detekcia"]
    },
    {
        "name": "Photo 13",
        "eye": "rigth",
        "patient": "Patient12",
        "hospital": "Hospital1",
        "doctor": "Doctor1",
        "date": "12.1.2023",
        "url": "/static/images/Untitled1.jpg",
        "methods": ["Segmentacia", "Klasifikacia"]
    },
    {
        "name": "Photo 14",
        "eye": "left",
        "patient": "Patient13",
        "hospital": "Hospital2",
        "doctor": "Doctor2",
        "date": "13.1.2023",
        "url": "/static/images/Untitled2.jpg",
        "methods": ["Detekcia"]
    },
    {
        "name": "Photo 15",
        "eye": "rigth",
        "patient": "Patient14",
        "hospital": "Hospital3",
        "doctor": "Doctor3",
        "date": "14.1.2023",
        "url": "/static/images/Untitled3.jpg",
        "methods": ["Segmentacia", "Detekcia"]
    },
    {
        "name": "Photo 16",
        "eye": "left",
        "patient": "Patient15",
        "hospital": "Hospital1",
        "doctor": "Doctor1",
        "date": "15.1.2023",
        "url": "/static/images/Untitled1.jpg",
        "methods": ["Segmentacia", "Klasifikacia", "Detekcia", "Aloha", "Qloha"]
    },
    {
        "name": "Photo 17",
        "eye": "rigth",
        "patient": "Patient16",
        "hospital": "Hospital2",
        "doctor": "Doctor2",
        "date": "16.1.2023",
        "url": "/static/images/Untitled2.jpg",
        "methods": ["Detekcia"]
    },
    {
        "name": "Photo 18",
        "eye": "left",
        "patient": "Patient17",
        "hospital": "Hospital3",
        "doctor": "Doctor3",
        "date": "17.1.2023",
        "url": "/static/images/Untitled3.jpg",
        "methods": ["Segmentacia", "Detekcia"]
    },
    {
        "name": "Photo 19",
        "eye": "rigth",
        "patient": "Patient18",
        "hospital": "Hospital1",
        "doctor": "Doctor1",
        "date": "18.1.2023",
        "url": "/static/images/Untitled1.jpg",
        "methods": ["Segmentacia", "Klasifikacia"]
    },
    {
        "name": "Photo 20",
        "eye": "left",
        "patient": "Patient19",
        "hospital": "Hospital2",
        "doctor": "Doctor2",
        "date": "19.1.2023",
        "url": "/static/images/Untitled2.jpg",
        "methods": ["Detekcia"]
    },
]

# Account page
@app.route('/account')
def account():
    return render_template('account.html')

# Account info page
@app.route('/account/info')
def account_info():
    # Example response
    user_data = USERS["user@example.com"]
    
    # Extract method names from the MEDICAL_METHODS structure
    method_names = [method["name"] for method in MEDICAL_METHODS if "name" in method]
    user_data["Methods"] = ", ".join(method_names)
    
    return jsonify(user_data)

# Landing page
@app.route('/landing')
def landing():
    return render_template('landing.html')

# Login page
@app.route('/login')
def login():
    return render_template('login.html')

# Register page
@app.route('/register')
def register():
    return render_template('register.html')

# Register form for specific user types
@app.route('/register_form/<user_type>', endpoint='register.register_form')
def register_form(user_type):
    # Handle different user types dynamically
    valid_user_types = ['patient', 'doctor', 'technician']
    if user_type not in valid_user_types:
        return render_template('error.html', message="Invalid user type"), 400
    return render_template('register.html', user_type=user_type)

# Register select page
@app.route('/register_select', endpoint='register.register_select')
def register_select():
    return render_template('register.html')

# Error page
@app.route('/error')
def error():
    return render_template('error.html')

# Login endpoint referenced in the template
@app.route('/auth/login_get', endpoint='auth.login_get')
def login_get():
    return render_template('login.html')

@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

@app.route('/logout')
def logout():
    response = make_response(redirect('/login'))
    response.delete_cookie('auth_token')
    flash("You have been logged out successfully.", "info")
    return response

@app.route('/fotky', methods=['GET', 'POST'])
def fotky():
    global uploaded_photo, uploaded_data

    # Get the current user (example: hardcoded email for now)
    user_email = "user@example.com"
    user_data = USERS.get(user_email)

    # Extract patients from the PHOTOS structure
    patients = sorted(set(photo.get("patient", "-") for photo in PHOTOS))

    if request.method == 'POST':
        if 'photo' not in request.files:
            flash('No file part', 'error')
            return redirect(url_for('fotky'))

        file = request.files['photo']
        if file.filename == '':
            flash('No selected file', 'error')
            return redirect(url_for('fotky'))

        if file:
            # Store the photo in memory
            uploaded_photo = BytesIO(file.read())

            # Store additional form data
            uploaded_data = {
                'eye': request.form.get('eye'),
                'diagnostic': request.form.get('diagnostic'),
                'device': request.form.get('device'),
                'variant': request.form.get('variant'),
                'patient': request.form.get('patient')  # Capture selected patient
            }

            flash('Photo and data uploaded successfully!', 'success')
            return redirect(url_for('fotky'))

    # Pass the medical methods to the template
    return render_template(
        'fotky.html',
        photo_uploaded=uploaded_photo is not None,
        uploaded_data=uploaded_data,
        medical_methods=MEDICAL_METHODS,  # Pass the updated structure
        patients=patients
    )

@app.route('/display_photo')
def display_photo():
    global uploaded_photo
    if uploaded_photo:
        uploaded_photo.seek(0)
        return send_file(uploaded_photo, mimetype='image/jpeg')
    else:
        flash('No photo uploaded yet.', 'error')
        return redirect(url_for('fotky'))

@app.route('/upload_photo', methods=['POST'])
def upload_photo():
    if 'photo' not in request.files:
        flash('No file part', 'error')
        return redirect(url_for('fotky'))

    file = request.files['photo']
    if file.filename == '':
        flash('No selected file', 'error')
        return redirect(url_for('fotky'))

    if file:
        # Save the file to the upload folder
        file_path = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(file_path)
        flash('Photo uploaded successfully!', 'success')
        return redirect(url_for('fotky'))

@app.route('/fotky/list', methods=['GET'])
def fotky_list():
    # Get the current user (example: hardcoded email for now)
    user_email = "user@example.com"
    user_data = USERS.get(user_email)

    # Extract unique values for doctors, patients, and hospitals
    doctors = sorted(set(photo.get("doctor", "-") for photo in PHOTOS))
    patients = sorted(set(photo.get("patient", "-") for photo in PHOTOS))
    hospitals = sorted(set(photo.get("hospital", "-") for photo in PHOTOS))

    return render_template(
        'fotky_list.html',
        photos=PHOTOS,
        doctors=doctors,
        patients=patients,
        hospitals=hospitals,
        user_type=user_data.get("user_type", "guest"),
        user_data=user_data
    )

@app.route('/fotky/detail/<photo_name>/update_methods', methods=['POST'])
def update_photo_methods(photo_name):
    # Find the photo by name
    photo = next((p for p in PHOTOS if p["name"] == photo_name), None)

    if not photo:
        flash("Photo not found.", "error")
        return redirect(url_for('fotky_list'))

    # Get the selected methods from the form
    selected_methods = request.form.getlist('methods')

    # Update the photo's methods
    photo['methods'] = selected_methods

    # Simulate saving to the database (in a real app, you'd save this to your database)
    flash(f"Metódy pre fotku {photo_name} boli aktualizované.", "success")
    return redirect(url_for('photo_detail', photo_name=photo_name))

@app.route('/fotky/detail/<photo_name>', methods=['GET', 'POST'])
def photo_detail(photo_name):
    # Get the current user (example: hardcoded email for now)
    user_email = "user@example.com"
    user_data = USERS.get(user_email)

    # Extract method names from the MEDICAL_METHODS structure
    method_names = [method["name"] for method in MEDICAL_METHODS if "name" in method]
    user_data["Methods"] = ", ".join(method_names)

    # Find the photo by name
    photo = next((p for p in PHOTOS if p["name"] == photo_name), None)

    if not photo:
        flash("Photo not found.", "error")
        return redirect(url_for('fotky_list'))

    if request.method == 'POST':
        # Handle form submission to update methods
        selected_methods = request.form.getlist('methods')
        photo['methods'] = selected_methods

        # Simulate saving to the database (in a real app, you'd save this to your database)
        flash(f"Metódy pre fotku {photo_name} boli aktualizované.", "success")

    # Render the photo detail page
    return render_template(
        'photo_detail.html',
        photo=photo,
        user_data=user_data,
        medical_methods=MEDICAL_METHODS
    )

if __name__ == '__main__':
        app.run(debug=True, port=5002)