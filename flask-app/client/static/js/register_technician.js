document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registration-form");
  const registerBtn = document.getElementById("register-btn");

  // Polia
  const firstName = document.getElementById("first_name");
  const lastName = document.getElementById("last_name");
  const technicianCode = document.getElementById("technician_code"); // Zobrazené ako Hospital Code
  const email = document.getElementById("email");
  const password = document.getElementById("password");
  const confirmPassword = document.getElementById("confirm_password");
  const gdpr = document.getElementById("gdpr");

  // Chybové divy
  const firstNameError = document.getElementById("first_name_error");
  const lastNameError = document.getElementById("last_name_error");
  const technicianCodeError = document.getElementById("technician_code_error");
  const emailError = document.getElementById("email_error");
  const passwordError = document.getElementById("password_error");
  const confirmPasswordError = document.getElementById("confirm_password_error");
  const gdprError = document.getElementById("gdpr_error");

  // Touched
  const touched = {
    first_name: false,
    last_name: false,
    technician_code: false,
    email: false,
    password: false,
    confirm_password: false,
    gdpr: false
  };

  function markTouched(field) {
    touched[field] = true;
    validateForm();
  }

  // Event listenery
  firstName.addEventListener("blur", () => markTouched("first_name"));
  lastName.addEventListener("blur", () => markTouched("last_name"));
  technicianCode.addEventListener("blur", () => markTouched("technician_code"));
  email.addEventListener("blur", () => markTouched("email"));
  password.addEventListener("blur", () => markTouched("password"));
  confirmPassword.addEventListener("blur", () => markTouched("confirm_password"));
  gdpr.addEventListener("change", () => markTouched("gdpr"));

  function validateForm() {
    let isValid = true;

    // Vymažeme staré chyby
    clearError(firstNameError);
    clearError(lastNameError);
    clearError(technicianCodeError);
    clearError(emailError);
    clearError(passwordError);
    clearError(confirmPasswordError);
    clearError(gdprError);

    // 1) First Name
    if (!firstName.value.trim()) {
      isValid = false;
      if (touched.first_name) {
        showError(firstNameError, "First name is required.");
      }
    }

    // 2) Last Name
    if (!lastName.value.trim()) {
      isValid = false;
      if (touched.last_name) {
        showError(lastNameError, "Last name is required.");
      }
    }

    // 3) Technician Code (label: Hospital Code)
    if (!technicianCode.value.trim()) {
      isValid = false;
      if (touched.technician_code) {
        showError(technicianCodeError, "Hospital code is required.");
      }
    }

    // 4) Email
    if (!email.value.trim()) {
      isValid = false;
      if (touched.email) {
        showError(emailError, "Email is required.");
      }
    }

    // 5) Password
    if (!password.value) {
      isValid = false;
      if (touched.password) {
        showError(passwordError, "Password is required.");
      }
    }

    // 6) Confirm Password
    if (!confirmPassword.value || confirmPassword.value !== password.value) {
      isValid = false;
      if (touched.confirm_password) {
        showError(confirmPasswordError, "Passwords do not match.");
      }
    }

    // 7) GDPR
    if (!gdpr.checked) {
      isValid = false;
      if (touched.gdpr) {
        showError(gdprError, "You must agree to the GDPR terms.");
      }
    }

    // Povoliť/zakázať tlačidlo
    registerBtn.disabled = !isValid;
  }

  function showError(divElem, msg) {
    divElem.textContent = msg;
    divElem.classList.add("active");
  }

  function clearError(divElem) {
    divElem.textContent = "";
    divElem.classList.remove("active");
  }

  // Kontrola pri submit
  form.addEventListener("submit", (e) => {
    validateForm();
    if (registerBtn.disabled) {
      e.preventDefault();
    }
  });
});
