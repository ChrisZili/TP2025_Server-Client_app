from flask import Flask, render_template, url_for, jsonify, flash, make_response, redirect, request, send_file
import os
from io import BytesIO

app = Flask(__name__, template_folder='client/templates', static_folder='client/static')
app.secret_key = 'your_secret_key_here'

UPLOAD_FOLDER = os.path.join(app.static_folder, 'images')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)  # Ensure the upload folder exists

uploaded_photo = None
uploaded_data = {}

# Account page
@app.route('/account')
def account():
    return render_template('account.html')

# Account info page
@app.route('/account/info')
def account_info():
    # Example response
    user_data = {
        "email": "user@example.com",
        "user_type": "doctor",
        "first_name": "John",
        "last_name": "Doe",
        "gender": "Male",
        "phone_number": "123456789",
        "birth_date": "1990-01-01",
        "birth_number": "9001011234",
        "doctor_id": 22222,
        "diagnosis_right_eye": "Healthy",
        "diagnosis_left_eye": "Healthy",
        "Methods": "Segmentacia, Klasifikacia, Detekcia, Aloha",
       }
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

    # Example patient data with "Methods" and "Patients"
    user_data = {
        "email": "user@example.com",
        "user_type": "patient",
        "first_name": "John",
        "last_name": "Doe",
        "gender": "Male",
        "phone_number": "123456789",
        "birth_date": "1990-01-01",
        "birth_number": "9001011234",
        "doctor_id": 22222,
        "diagnosis_right_eye": "Healthy",
        "diagnosis_left_eye": "Healthy",
        "Methods": "Segmentacia, Klasifikacia",  # Example methods
        "Patients": "Patient1, Patient2, Patient3",  # Example patients
    }

    # Split the methods and patients into lists
    method_names = [method.strip() for method in user_data['Methods'].split(',')]
    patients = [patient.strip() for patient in user_data['Patients'].split(',')]

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

    return render_template(
        'fotky.html',
        photo_uploaded=uploaded_photo is not None,
        uploaded_data=uploaded_data,
        method_names=method_names,
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

if __name__ == '__main__':
        app.run(debug=True, port=5002)