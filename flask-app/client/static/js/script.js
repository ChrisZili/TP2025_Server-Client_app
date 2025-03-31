
document.addEventListener('DOMContentLoaded', function () {
    console.log('Script loaded and running!');
    const form = document.getElementById('registerForm');
    const roleDropdown = document.getElementById('roleDropdown');
    const hospitalCodeContainer = document.getElementById('hospitalCodeContainer');

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
    } else {
        console.error('Form with id "registerForm" not found!');
    }
});