document.addEventListener('DOMContentLoaded', function () {
    fetchUsers();

    // Account Page Logic
    const accountForm = document.getElementById('accountForm');
    const editButton = document.getElementById('editButton');
    const cancelButton = document.getElementById('cancelButton');
    const accountDetails = document.getElementById('accountDetails');

    if (editButton && cancelButton && accountForm && accountDetails) {
        editButton.addEventListener('click', function () {
            accountDetails.style.display = 'none';
            accountForm.style.display = 'block';
        });

        cancelButton.addEventListener('click', function () {
            accountForm.style.display = 'none';
            accountDetails.style.display = 'block';
        });

        accountForm.addEventListener('submit', function (event) {
            event.preventDefault();
            if (!validateAccountForm()) {
                return;
            }

            const firstName = document.getElementById('firstName').value.trim();
            const lastName = document.getElementById('lastName').value.trim();
            const email = document.getElementById('email').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const yearOfBirth = document.getElementById('yearOfBirth').value.trim();

            document.getElementById('firstNameDisplay').textContent = firstName;
            document.getElementById('lastNameDisplay').textContent = lastName;
            document.getElementById('emailDisplay').textContent = email;
            document.getElementById('phoneDisplay').textContent = phone;
            document.getElementById('yearOfBirthDisplay').textContent = yearOfBirth;

            accountForm.style.display = 'none';
            accountDetails.style.display = 'block';
            alert('Account information updated successfully!');
        });
    }

    function validateAccountForm() {
        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const yearOfBirth = document.getElementById('yearOfBirth').value.trim();

        if (!validateName(firstName)) {
            alert('First Name must be at least 2 characters long and contain no numbers.');
            return false;
        }

        if (!validateName(lastName)) {
            alert('Last Name must be at least 2 characters long and contain no numbers.');
            return false;
        }

        if (!validateEmail(email)) {
            alert('Please enter a valid email address.');
            return false;
        }

        if (!validatePhone(phone)) {
            alert('Please enter a valid phone number.');
            return false;
        }

        const currentYear = new Date().getFullYear();
        if (yearOfBirth < 1900 || yearOfBirth > currentYear) {
            alert('Please enter a valid year of birth.');
            return false;
        }

        return true;
    }

    function validateName(name) {
        const nameRegex = /^[A-Za-z\s]+$/;
        return name.length >= 2 && nameRegex.test(name);
    }

    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function validatePhone(phone) {
        const phoneRegex = /^\+?[0-9]{7,15}$/;
        return phoneRegex.test(phone);
    }

    // Add Patient Page Logic
    const addPatientForm = document.getElementById('addPatientForm');
    const patientIDField = document.getElementById('patientID');
    const patientIDFeedback = document.getElementById('patientIDFeedback');

    if (addPatientForm && patientIDField && patientIDFeedback) {
        addPatientForm.addEventListener('submit', function (event) {
            event.preventDefault();
            const patientID = patientIDField.value;
            if (patientID.length !== 10 || isNaN(patientID)) {
                patientIDField.classList.add('invalid');
                patientIDFeedback.style.display = 'block';
                return;
            } else {
                patientIDField.classList.remove('invalid');
                patientIDFeedback.style.display = 'none';
            }
            console.log(`Adding patient: ID = ${patientID}`);
            alert(`Patient added: ID = ${patientID}`);
        });
    }

    // Add Photo Page Logic
    const addPhotoForm = document.getElementById('addPhotoForm');
    const imageUpload = document.getElementById('imageUpload');
    const imagePreviewContainer = document.getElementById('imagePreviewContainer');
    const imagePreview = document.getElementById('imagePreview');
    const cancelImageButton = document.getElementById('cancelImageButton');

    if (addPhotoForm && imageUpload && imagePreviewContainer && imagePreview && cancelImageButton) {
        imageUpload.addEventListener('change', function () {
            const file = imageUpload.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    imagePreview.src = e.target.result;
                    imagePreviewContainer.style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        });

        cancelImageButton.addEventListener('click', function () {
            imageUpload.value = '';
            imagePreview.src = '';
            imagePreviewContainer.style.display = 'none';
        });

        function validateAddPhotoForm() {
            const eye = document.getElementById('eye').value;
            const diagnosis = document.getElementById('diagnosis').value.trim();
            const photoType = document.getElementById('photoType').value.trim();
            const deviceType = document.getElementById('deviceType').value;
            const deviceName = document.getElementById('deviceName').value.trim();
            const imageFile = imageUpload.files[0];

            if (!eye) {
                alert('Please select which eye the photo is of.');
                return false;
            }

            if (diagnosis.length < 3) {
                alert('Diagnosis must be at least 3 characters long.');
                return false;
            }

            if (photoType.length < 3) {
                alert('Photo type must be at least 3 characters long.');
                return false;
            }

            if (!deviceType) {
                alert('Please select a device type.');
                return false;
            }

            if (deviceName.length < 3) {
                alert('Device name/model must be at least 3 characters long.');
                return false;
            }

            if (!imageFile) {
                alert('Please upload an image before submitting.');
                return false;
            }

            return true;
        }

        addPhotoForm.addEventListener('submit', function (event) {
            event.preventDefault();

            if (!validateAddPhotoForm()) {
                return;
            }

            const eye = document.getElementById('eye').value;
            const diagnosis = document.getElementById('diagnosis').value.trim();
            const photoType = document.getElementById('photoType').value.trim();
            const deviceType = document.getElementById('deviceType').value;
            const deviceName = document.getElementById('deviceName').value.trim();
            const imageFile = imageUpload.files[0];

            console.log('Eye:', eye);
            console.log('Diagnosis:', diagnosis);
            console.log('Photo Type:', photoType);
            console.log('Device Type:', deviceType);
            console.log('Device Name/Model:', deviceName);
            console.log('Uploaded Image:', imageFile);

            alert('Photo information submitted successfully!');
        });
    }


    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', function (event) {
            let isValid = true;

            loginForm.querySelectorAll('input').forEach(field => {
                const feedback = document.getElementById(field.name + 'Feedback');
                if (!field.checkValidity()) {
                    field.classList.add('invalid');
                    if (feedback) feedback.style.display = 'block';
                    isValid = false;
                } else {
                    field.classList.remove('invalid');
                    if (feedback) feedback.style.display = 'none';
                }
            });

            if (!isValid) {
                console.log('Login form is invalid. Preventing submission.');
                event.preventDefault();
            }
        });
    }

    const registerForm = document.getElementById('registerForm');

    if (registerForm) {
        registerForm.addEventListener('submit', function (event) {
            let isValid = true;

            registerForm.querySelectorAll('input').forEach(field => {
                const feedback = document.getElementById(field.name + 'Feedback');
                if (!field.value.trim()) {
                    field.classList.add('invalid');
                    if (feedback) feedback.style.display = 'block';
                    isValid = false;
                } else {
                    field.classList.remove('invalid');
                    if (feedback) feedback.style.display = 'none';
                }
            });

            const password = registerForm.querySelector('input[name="password"]').value.trim();
            const confirmPassword = registerForm.querySelector('input[name="confirmPassword"]').value.trim();
            if (password !== confirmPassword) {
                const confirmPasswordFeedback = document.getElementById('confirmPasswordFeedback');
                confirmPasswordFeedback.style.display = 'block';
                isValid = false;
            } else {
                const confirmPasswordFeedback = document.getElementById('confirmPasswordFeedback');
                confirmPasswordFeedback.style.display = 'none';
            }

            if (!isValid) {
                event.preventDefault();
                console.log('Register form validation failed.');
            }
        });
    }

    const roleDropdown = document.getElementById('roleDropdown');
    const hospitalCodeContainer = document.getElementById('hospitalCodeContainer');
    const form = document.getElementById('registerForm');

    // Handle role-specific hospital code input
    if (roleDropdown) {
        roleDropdown.addEventListener('change', function () {
            if (roleDropdown.value === 'Doctor') {
                if (!document.getElementById('hospital_code')) {
                    const hospitalCodeInput = document.createElement('input');
                    hospitalCodeInput.type = 'text';
                    hospitalCodeInput.id = 'hospital_code';
                    hospitalCodeInput.name = 'hospital_code';
                    hospitalCodeInput.placeholder = 'Hospital Code';
                    hospitalCodeContainer.appendChild(hospitalCodeInput);
                }
            } else {
                const existingHospitalCodeInput = document.getElementById('hospital_code');
                if (existingHospitalCodeInput) {
                    hospitalCodeContainer.removeChild(existingHospitalCodeInput);
                }
            }
        });
    }


    if (form) {
        form.addEventListener('submit', function (event) {
            let isValid = true;

            form.querySelectorAll('input, select').forEach(field => {
                const feedback = document.getElementById(field.name + 'Feedback');
                if (!field.checkValidity()) {
                    field.classList.add('invalid');
                    if (feedback) feedback.style.display = 'block';
                    isValid = false;
                } else {
                    field.classList.remove('invalid');
                    if (feedback) feedback.style.display = 'none';
                }
            });

            if (!isValid) {
                console.log('Form is invalid. Preventing submission.');
                event.preventDefault();
            }
        });
    }
});

async function fetchUsers() {
    try {
        const response = await fetch('/api/users');
        const users = await response.json();
        displayUsers(users);
    } catch (error) {
        console.error('Error fetching users:', error);
    }
}

function displayUsers(users) {
    const userList = document.getElementById('user-list');
    userList.innerHTML = users.map(user => 
        `<div class="user-item">
            <p>Username: ${user.username}</p>
        </div>`
    ).join('');
}

function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
}