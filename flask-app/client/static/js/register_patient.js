document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registration-form");
  const registerBtn = document.getElementById("register-btn");

  // Field references
  const firstName = document.getElementById("first_name");
  const lastName = document.getElementById("last_name");
  const phoneNumber = document.getElementById("phone_number");
  const birthNumber = document.getElementById("birth_number");
  const email = document.getElementById("email");
  const password = document.getElementById("password");
  const confirmPassword = document.getElementById("confirm_password");
  const gdpr = document.getElementById("gdpr");

  // Error divs
  const firstNameErrorDiv = document.getElementById("first_name_error");
  const lastNameErrorDiv = document.getElementById("last_name_error");
  const phoneNumberErrorDiv = document.getElementById("phone_number_error");
  const birthNumberErrorDiv = document.getElementById("birth_number_error");
  const emailErrorDiv = document.getElementById("email_error");
  const passwordErrorDiv = document.getElementById("password_error");
  const confirmPasswordErrorDiv = document.getElementById("confirm_password_error");
  const gdprErrorDiv = document.getElementById("gdpr_error");

  // Track touched fields
  const touchedFields = {
    first_name: false,
    last_name: false,
    phone_number: false,
    birth_number: false,
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
  birthNumber.addEventListener("blur", () => markTouched("birth_number"));
  email.addEventListener("blur", () => markTouched("email"));
  password.addEventListener("blur", () => markTouched("password"));
  confirmPassword.addEventListener("blur", () => markTouched("confirm_password"));
  gdpr.addEventListener("change", () => markTouched("gdpr"));

  // Auto-format birth number: only 6 digits, no slash
  birthNumber.addEventListener("input", () => {
    let value = birthNumber.value.replace(/\D/g, "");
    if (value.length > 6) {
      value = value.substring(0, 6);
    }
    birthNumber.value = value;
    validateForm();
  });

  function validateForm() {
    let isFormValid = true;

    clearError(firstNameErrorDiv);
    clearError(lastNameErrorDiv);
    clearError(phoneNumberErrorDiv);
    clearError(birthNumberErrorDiv);
    clearError(emailErrorDiv);
    clearError(passwordErrorDiv);
    clearError(confirmPasswordErrorDiv);
    clearError(gdprErrorDiv);

    // Name regex: allows letters, accents, spaces, 2-255 chars
    const nameRegex = /^[a-zA-ZÀ-ž\s]{2,255}$/;
    const phoneRegex = /^(?:\+\d{3}|\d{3}|0)\d{9}$/;

    // First name
    if (!firstName.value.trim()) {
      isFormValid = false;
      if (touchedFields.first_name) {
        showError(firstNameErrorDiv, "First name is required.");
      }
    } else if (!nameRegex.test(firstName.value.trim())) {
      isFormValid = false;
      if (touchedFields.first_name) {
        showError(firstNameErrorDiv, "First name must contain only letters and be 2-255 characters.");
      }
    }

    // Last name
    if (!lastName.value.trim()) {
      isFormValid = false;
      if (touchedFields.last_name) {
        showError(lastNameErrorDiv, "Last name is required.");
      }
    } else if (!nameRegex.test(lastName.value.trim())) {
      isFormValid = false;
      if (touchedFields.last_name) {
        showError(lastNameErrorDiv, "Last name must contain only letters and be 2-255 characters.");
      }
    }

    // Phone (optional, but validate if filled)
    if (phoneNumber.value.trim()) {
      if (!phoneRegex.test(phoneNumber.value.trim())) {
        isFormValid = false;
        if (touchedFields.phone_number) {
          showError(phoneNumberErrorDiv, "Invalid phone number (e.g. +421000000000).");
        }
      }
    }

    // Birth number (######)
    if (!birthNumber.value.trim()) {
      isFormValid = false;
      if (touchedFields.birth_number) {
        showError(birthNumberErrorDiv, "Birth number is required.");
      }
    } else if (!/^\d{6}$/.test(birthNumber.value.trim())) {
      isFormValid = false;
      if (touchedFields.birth_number) {
        showError(birthNumberErrorDiv, "Birth number must be 6 digits.");
      }
    } else {
      // Validate date from birth number
      const year = parseInt(birthNumber.value.slice(0, 2), 10);
      let month = parseInt(birthNumber.value.slice(2, 4), 10);
      const day = parseInt(birthNumber.value.slice(4, 6), 10);

      if (month > 50) month -= 50;
      const fullYear = year > 30 ? 1900 + year : 2000 + year;
      const isMonthValid = month >= 1 && month <= 12;
      const isDayValid = day >= 1 && day <= 31;
      let isDateValid = false;
      if (isMonthValid && isDayValid) {
        const testDate = new Date(fullYear, month - 1, day);
        isDateValid =
          testDate.getFullYear() === fullYear &&
          testDate.getMonth() === month - 1 &&
          testDate.getDate() === day;
      }
      if (!isMonthValid || !isDayValid || !isDateValid) {
        isFormValid = false;
        if (touchedFields.birth_number) {
          showError(birthNumberErrorDiv, "Birth number contains invalid date.");
        }
      }
    }

    // Email
    if (!email.value.trim()) {
      isFormValid = false;
      if (touchedFields.email) {
        showError(emailErrorDiv, "Email is required.");
      }
    }

    // Password
    if (!password.value) {
      isFormValid = false;
      if (touchedFields.password) {
        showError(passwordErrorDiv, "Password is required.");
      }
    }

    // Confirm password
    if (!confirmPassword.value || password.value !== confirmPassword.value) {
      isFormValid = false;
      if (touchedFields.confirm_password) {
        showError(confirmPasswordErrorDiv, "Passwords do not match.");
      }
    }

    // GDPR
    if (!gdpr.checked) {
      isFormValid = false;
      if (touchedFields.gdpr) {
        showError(gdprErrorDiv, "You must agree to the GDPR terms.");
      }
    }

    registerBtn.disabled = !isFormValid;
  }

  // Helper functions
  function showError(errorDiv, msg) {
    errorDiv.textContent = msg;
    errorDiv.classList.add("active");
  }
  function clearError(errorDiv) {
    errorDiv.textContent = "";
    errorDiv.classList.remove("active");
  }

  // Final check on submit
  form.addEventListener("submit", (e) => {
    validateForm();
    if (registerBtn.disabled) {
      e.preventDefault();
    }
  });

  // Password toggle logic (optional, for UX parity)
  function setupPasswordToggle(inputId, toggleId) {
    const input = document.getElementById(inputId);
    const toggle = document.getElementById(toggleId);
    if (input && toggle) {
      toggle.addEventListener("click", () => {
        const isHidden = input.type === "password";
        input.type = isHidden ? "text" : "password";
        toggle.innerHTML = `<i class="fas ${isHidden ? "fa-eye" : "fa-eye-slash"}"></i>`;
      });
    }
  }
  setupPasswordToggle("password", "toggle-password");
  setupPasswordToggle("confirm_password", "toggle-password-confirm");

  function parse_birth_date(birth_number) {
    // birth_number: str, e.g. "020412"
    if (!birth_number || birth_number.length !== 6 || isNaN(birth_number)) {
      return null;
    }
    const year = parseInt(birth_number.slice(0, 2), 10);
    let month = parseInt(birth_number.slice(2, 4), 10);
    const day = parseInt(birth_number.slice(4, 6), 10);
    // Gender logic: month > 50 means female
    if (month > 50) {
      month -= 50;
    }
    // Guess century: if year > 30, use 1900s, else 2000s
    const fullYear = year > 30 ? 1900 + year : 2000 + year;
    try {
      return `${fullYear}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    } catch (e) {
      return null;
    }
  }

  // Add hidden birth_date input if not present
  let birthDateInput = document.getElementById("birth_date");
  if (!birthDateInput) {
    birthDateInput = document.createElement("input");
    birthDateInput.type = "hidden";
    birthDateInput.name = "birth_date";
    birthDateInput.id = "birth_date";
    form.appendChild(birthDateInput);
  }

  // Update hidden birth_date input whenever birth number changes
  function updateBirthDateInput() {
    const parsed = parse_birth_date(birthNumber.value);
    birthDateInput.value = parsed ? parsed : "";
  }

  birthNumber.addEventListener("input", updateBirthDateInput);
  birthNumber.addEventListener("blur", updateBirthDateInput);

  // Also update before submit to be sure
  form.addEventListener("submit", (e) => {
    updateBirthDateInput();
    validateForm();
    if (registerBtn.disabled) {
      e.preventDefault();
    }
  });

  function parse_gender(birth_number) {
    if (!birth_number || birth_number.length !== 6 || isNaN(birth_number)) {
      return null;
    }
    let month = parseInt(birth_number.slice(2, 4), 10);
    return month > 50 ? "Žena" : "Muž";
  }

  // Add hidden gender input if not present
  let genderInput = document.getElementById("gender");
  if (!genderInput) {
    genderInput = document.createElement("input");
    genderInput.type = "hidden";
    genderInput.name = "gender";
    genderInput.id = "gender";
    form.appendChild(genderInput);
  }

  // Update hidden gender input whenever birth number changes
  function updateGenderInput() {
    const parsed = parse_gender(birthNumber.value);
    genderInput.value = parsed ? parsed : "";
  }

  birthNumber.addEventListener("input", updateGenderInput);
  birthNumber.addEventListener("blur", updateGenderInput);

  // Also update before submit to be sure
  form.addEventListener("submit", (e) => {
    updateGenderInput();
    updateBirthDateInput();
    validateForm();
    if (registerBtn.disabled) {
      e.preventDefault();
    }
  });
});
