document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registration-form");
  const registerBtn = document.getElementById("register-btn");
  const errorMessagesDiv = document.getElementById("error-messages");

  // Field references
  const firstName = document.getElementById("first_name");
  const lastName = document.getElementById("last_name");
  const phoneNumber = document.getElementById("phone_number");
  const birthDate = document.getElementById("birth_date");
  const birthNumber = document.getElementById("birth_number");
  const gender = document.getElementById("gender");
  const email = document.getElementById("email");
  const password = document.getElementById("password");
  const confirmPassword = document.getElementById("confirm_password");
  const gdpr = document.getElementById("gdpr");

  // Track touched state for each field individually
  const touchedFields = {
    first_name: false,
    last_name: false,
    phone_number: false,
    birth_date: false,
    birth_number: false,
    gender: false,
    email: false,
    password: false,
    confirm_password: false,
    gdpr: false
  };

  // Add event listeners to mark fields as touched
  firstName.addEventListener("blur", () => { touchedFields.first_name = true; validateForm(); });
  lastName.addEventListener("blur", () => { touchedFields.last_name = true; validateForm(); });
  phoneNumber.addEventListener("blur", () => { touchedFields.phone_number = true; validateForm(); });
  birthDate.addEventListener("blur", () => { touchedFields.birth_date = true; validateForm(); });
  birthNumber.addEventListener("blur", () => { touchedFields.birth_number = true; validateForm(); });
  gender.addEventListener("change", () => { touchedFields.gender = true; validateForm(); });
  email.addEventListener("blur", () => { touchedFields.email = true; validateForm(); });
  password.addEventListener("blur", () => { touchedFields.password = true; validateForm(); });
  confirmPassword.addEventListener("blur", () => { touchedFields.confirm_password = true; validateForm(); });
  gdpr.addEventListener("change", () => { touchedFields.gdpr = true; validateForm(); });

  // Automatické formátovanie rodného čísla: ak je zadaných len číslic, vloží lomítko po 6 čísliciach
  birthNumber.addEventListener("input", () => {
    let value = birthNumber.value.replace(/\D/g, ""); // ponechá iba číslice
    if (value.length > 6) {
      value = value.substring(0, 6) + "/" + value.substring(6, 10);
    }
    birthNumber.value = value;
    validateForm();
  });

  function validateForm() {
    let errors = [];

    if (touchedFields.first_name && !firstName.value.trim()) {
      errors.push("First name is required.");
    }
    if (touchedFields.last_name && !lastName.value.trim()) {
      errors.push("Last name is required.");
    }
    if (touchedFields.phone_number && !phoneNumber.value.trim()) {
      errors.push("Phone number is required.");
    }
    if (touchedFields.birth_date && !birthDate.value) {
      errors.push("Birth date is required.");
    }
    // Rodné číslo: formát 6 číslic, lomítko, 4 číslice
    const birthNumberPattern = /^\d{6}\/\d{4}$/;
    if (touchedFields.birth_number) {
      if (!birthNumber.value.trim()) {
        errors.push("Birth number is required.");
      } else if (!birthNumberPattern.test(birthNumber.value.trim())) {
        errors.push("Birth number must be in the format ######/####.");
      }
    }
    if (touchedFields.gender && !gender.value) {
      errors.push("Gender is required.");
    }
    if (touchedFields.email && !email.value.trim()) {
      errors.push("Email is required.");
    }
    if (touchedFields.password && !password.value) {
      errors.push("Password is required.");
    }
    if (touchedFields.confirm_password && password.value !== confirmPassword.value) {
      errors.push("Passwords do not match.");
    }
    if (touchedFields.gdpr && !gdpr.checked) {
      errors.push("You must agree to the GDPR terms.");
    }

    // Zobraz chybové správy len pre polia, ktoré boli interagované
    errorMessagesDiv.innerHTML = "";
    if (errors.length > 0) {
      errors.forEach(err => {
        const p = document.createElement("p");
        p.textContent = err;
        errorMessagesDiv.appendChild(p);
      });
    }

    // Tlačidlo povolíme iba vtedy, keď nie sú žiadne chyby
    registerBtn.disabled = errors.length > 0;
  }

  form.addEventListener("submit", e => {
    validateForm();
    if (registerBtn.disabled) {
      e.preventDefault();
    }
  });
});
