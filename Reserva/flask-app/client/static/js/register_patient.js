document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registration-form");
  const registerBtn = document.getElementById("register-btn");

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

  // Divy pre chybové správy
  const firstNameErrorDiv = document.getElementById("first_name_error");
  const lastNameErrorDiv = document.getElementById("last_name_error");
  const phoneNumberErrorDiv = document.getElementById("phone_number_error");
  const birthDateErrorDiv = document.getElementById("birth_date_error");
  const birthNumberErrorDiv = document.getElementById("birth_number_error");
  const genderErrorDiv = document.getElementById("gender_error");
  const emailErrorDiv = document.getElementById("email_error");
  const passwordErrorDiv = document.getElementById("password_error");
  const confirmPasswordErrorDiv = document.getElementById("confirm_password_error");
  const gdprErrorDiv = document.getElementById("gdpr_error");

  // Ktoré polia boli "dotknuté"
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

  // Mark field as touched
  function markTouched(field) {
    touchedFields[field] = true;
    validateForm();
  }

  firstName.addEventListener("blur", () => markTouched("first_name"));
  lastName.addEventListener("blur", () => markTouched("last_name"));
  phoneNumber.addEventListener("blur", () => markTouched("phone_number"));
  birthDate.addEventListener("blur", () => markTouched("birth_date"));
  birthNumber.addEventListener("blur", () => markTouched("birth_number"));
  gender.addEventListener("change", () => markTouched("gender"));
  email.addEventListener("blur", () => markTouched("email"));
  password.addEventListener("blur", () => markTouched("password"));
  confirmPassword.addEventListener("blur", () => markTouched("confirm_password"));
  gdpr.addEventListener("change", () => markTouched("gdpr"));

  // Automatické formátovanie rodného čísla (######/####)
  birthNumber.addEventListener("input", () => {
    let value = birthNumber.value.replace(/\D/g, "");
    if (value.length > 6) {
      value = value.substring(0, 6) + "/" + value.substring(6, 10);
    }
    birthNumber.value = value;
    validateForm();
  });

  function validateForm() {
    // Najprv vynulujeme texty a schováme .active
    let isFormValid = true;

    clearError(firstNameErrorDiv);
    clearError(lastNameErrorDiv);
    clearError(phoneNumberErrorDiv);
    clearError(birthDateErrorDiv);
    clearError(birthNumberErrorDiv);
    clearError(genderErrorDiv);
    clearError(emailErrorDiv);
    clearError(passwordErrorDiv);
    clearError(confirmPasswordErrorDiv);
    clearError(gdprErrorDiv);

    // 1. validácia

    // -- First name
    if (!firstName.value.trim()) {
      isFormValid = false;
      if (touchedFields.first_name) {
        showError(firstNameErrorDiv, "First name is required.");
      }
    }

    // -- Last name
    if (!lastName.value.trim()) {
      isFormValid = false;
      if (touchedFields.last_name) {
        showError(lastNameErrorDiv, "Last name is required.");
      }
    }

    // -- Phone number
    if (!phoneNumber.value.trim()) {
      isFormValid = false;
      if (touchedFields.phone_number) {
        showError(phoneNumberErrorDiv, "Phone number is required.");
      }
    }

    // -- Birth date (nesmie byť v budúcnosti, nesmie byť staršie ako 150 rokov)
    if (!birthDate.value) {
      isFormValid = false;
      if (touchedFields.birth_date) {
        showError(birthDateErrorDiv, "Birth date is required.");
      }
    } else {
      // Skúsime parse
      const enteredDate = new Date(birthDate.value);
      const now = new Date();
      const oldestAllowed = new Date();
      oldestAllowed.setFullYear(oldestAllowed.getFullYear() - 150);

      if (enteredDate > now) {
        // budúci dátum
        isFormValid = false;
        if (touchedFields.birth_date) {
          showError(birthDateErrorDiv, "Birth date cannot be in the future.");
        }
      } else if (enteredDate < oldestAllowed) {
        // staršie ako 150 rokov
        isFormValid = false;
        if (touchedFields.birth_date) {
          showError(birthDateErrorDiv, "Birth date is too old.");
        }
      }
    }

    // -- Birth Number (######/####)
    const birthNumberPattern = /^\d{6}\/\d{4}$/;
    if (!birthNumber.value.trim()) {
      isFormValid = false;
      if (touchedFields.birth_number) {
        showError(birthNumberErrorDiv, "Birth number is required.");
      }
    } else if (!birthNumberPattern.test(birthNumber.value.trim())) {
      isFormValid = false;
      if (touchedFields.birth_number) {
        showError(birthNumberErrorDiv, "Birth number must be in format ######/####.");
      }
    }

    // -- Gender
    if (!gender.value) {
      isFormValid = false;
      if (touchedFields.gender) {
        showError(genderErrorDiv, "Gender is required.");
      }
    }

    // -- Email
    if (!email.value.trim()) {
      isFormValid = false;
      if (touchedFields.email) {
        showError(emailErrorDiv, "Email is required.");
      }
    }

    // -- Password
    if (!password.value) {
      isFormValid = false;
      if (touchedFields.password) {
        showError(passwordErrorDiv, "Password is required.");
      }
    }

    // -- Confirm Password
    if (!confirmPassword.value || password.value !== confirmPassword.value) {
      isFormValid = false;
      if (touchedFields.confirm_password) {
        showError(confirmPasswordErrorDiv, "Passwords do not match.");
      }
    }

    // -- GDPR
    if (!gdpr.checked) {
      isFormValid = false;
      if (touchedFields.gdpr) {
        showError(gdprErrorDiv, "You must agree to the GDPR terms.");
      }
    }

    // 2. Povolíme/zakážeme submit
    registerBtn.disabled = !isFormValid;
  }

  // Helper funkcie na zobrazenie/skrytie chýb
  function showError(errorDiv, msg) {
    errorDiv.textContent = msg;
    errorDiv.classList.add("active");
  }
  function clearError(errorDiv) {
    errorDiv.textContent = "";
    errorDiv.classList.remove("active");
  }

  // Final check pri submit
  form.addEventListener("submit", (e) => {
    validateForm();
    if (registerBtn.disabled) {
      e.preventDefault();
    }
  });
});
