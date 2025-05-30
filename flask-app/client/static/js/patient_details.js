document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("patient-details-form");
  const saveBtn = document.getElementById("save-patient-btn");
  const confirmModal = document.getElementById("confirmation-modal");
  const confirmBtn = document.getElementById("confirm-save-btn");
  const cancelBtn = document.getElementById("cancel-save-btn");
  const toggleBtn = document.getElementById("toggle-password");
  const passwordInput = document.getElementById("password");

  // Enable Enter key to submit form
  form.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      saveBtn.click();
    }
  });

  if (toggleBtn && passwordInput) {
    toggleBtn.addEventListener("click", () => {
      const isPassword = passwordInput.type === "password";
      passwordInput.type = isPassword ? "text" : "password";
      toggleBtn.innerHTML = `<i class="fas ${isPassword ? "fa-eye" : "fa-eye-slash"}"></i>`;
    });
  }

  function fetchWithAuth(url, options = {}) {
    return fetch(url, {
      ...options,
      credentials: "include",
      headers: {
        ...(options.headers || {}),
        Accept: "application/json"
      }
    });
  }

  function getPatientIdFromURL() {
    const parts = window.location.pathname.split("/");
    return parts.length >= 3 ? parts[2] : null;
  }

  async function checkUserTypeAndAdjustForm() {
    try {
      const response = await fetch("/settings/info", {
        method: "GET",
        headers: { Accept: "application/json" },
        credentials: "include"
      });
      const user = await response.json();

      // Hide birth number field for technician users
      const birthNumberGroup = document.querySelector('#birth_number')?.closest('.form-group');
      if (birthNumberGroup && user.user_type === "technician") {
        birthNumberGroup.style.display = "none";
      }

      setTimeout(() => {
        document.querySelectorAll(".hidden-js").forEach(el => {
          el.style.visibility = "visible";
          el.style.opacity = "1";
          el.classList.remove("hidden-js");
        });
      }, 10);
    } catch (err) {
      console.error("Nepodarilo sa načítať používateľa:", err);
    }
  }

  function formatDate(dateString) {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString('sk-SK', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  async function loadPatientDetails() {
    try {
      const patientId = getPatientIdFromURL();
      if (!patientId) throw new Error("Chýba patient ID v URL.");

      const response = await fetchWithAuth(`/patients/${patientId}`);
      if (!response.ok) throw new Error("Nepodarilo sa načítať údaje pacienta.");

      const patient = await response.json();

      form.patient_id.value = patient.id || "";
      form.first_name.value = patient.first_name || "";
      form.last_name.value = patient.last_name || "";
      form.phone_number.value = patient.phone_number || "";
      form.gender.value = patient.gender || "";
      form.email.value = patient.email || "";
      form.created_at.value = formatDate(patient.created_at) || "";
      if (patient.gender) {
          // Pokús sa nájsť zhodu v options
          const genderSelect = form.gender;
          for (let i = 0; i < genderSelect.options.length; i++) {
            if (genderSelect.options[i].value === patient.gender) {
              genderSelect.selectedIndex = i;
              break;
            }
          }
      }
      if (patient.birth_date) {
          // Konverzia na formát YYYY-MM-DD
          const birthDate = new Date(patient.birth_date);
          if (!isNaN(birthDate.getTime())) {
            const year = birthDate.getFullYear();
            const month = String(birthDate.getMonth() + 1).padStart(2, '0');
            const day = String(birthDate.getDate()).padStart(2, '0');
            form.birth_date.value = `${year}-${month}-${day}`;
          } else {
            form.birth_date.value = patient.birth_date;
          }
      }

      if (patient.birth_number) {
        form.birth_number.value = patient.birth_number;
      }

      if (patient.birth_date) {
        form.birth_date.value = patient.birth_date;
      }
      if (patient.doctor_id) {
        form.doctor_id.value = patient.doctor_id || "";
      }
      form.password.value = "";

      // Display doctor info if available
      if (patient.doctor_name) {
        form.doctor_name.value = patient.doctor_name || "";
      }

      if (patient.hospital_name) {
        form.hospital_name.value = patient.hospital_name || "";
      }
    } catch (err) {
      console.error(err);
      alert("Chyba pri načítaní údajov pacienta: " + err.message);
    }
  }

  // --- Add error message elements and validation ---
  function ensureErrorDiv(inputId) {
    let input = document.getElementById(inputId);
    if (!input) return null;
    let errorDiv = input.parentElement.querySelector('.error-message');
    if (!errorDiv) {
      errorDiv = document.createElement('div');
      errorDiv.className = 'error-message';
      errorDiv.style.color = '#c0392b';
      errorDiv.style.fontSize = '0.95em';
      errorDiv.style.marginTop = '2px';
      input.parentElement.appendChild(errorDiv);
    }
    return errorDiv;
  }
  const firstNameError = ensureErrorDiv('first_name');
  const lastNameError = ensureErrorDiv('last_name');
  const emailError = ensureErrorDiv('email');
  const phoneError = ensureErrorDiv('phone_number');
  const birthNumberError = ensureErrorDiv('birth_number');

  const nameRegex = /^[a-zA-ZÀ-ž\s]{2,255}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^(?:\+\d{3}|\d{3}|0)\d{9}$/;
  const birthNumberRegex = /^\d{6}$/;

  function validateFields(showMessages = true) {
    let valid = true;
    const firstNameVal = form.first_name.value.trim();
    const lastNameVal = form.last_name.value.trim();
    const emailVal = form.email.value.trim();
    const phoneVal = form.phone_number.value.trim();
    const birthNumberVal = form.birth_number ? form.birth_number.value.trim() : "";

    // First name validation
    if (!firstNameVal) {
      if (showMessages) firstNameError.textContent = "Meno je povinné.";
      valid = false;
    } else if (!nameRegex.test(firstNameVal)) {
      if (showMessages) firstNameError.textContent = "Meno musí obsahovať iba písmená a mať dĺžku 2 až 255 znakov.";
      valid = false;
    } else {
      firstNameError.textContent = "";
    }

    // Last name validation
    if (!lastNameVal) {
      if (showMessages) lastNameError.textContent = "Priezvisko je povinné.";
      valid = false;
    } else if (!nameRegex.test(lastNameVal)) {
      if (showMessages) lastNameError.textContent = "Priezvisko musí obsahovať iba písmená a mať dĺžku 2 až 255 znakov.";
      valid = false;
    } else {
      lastNameError.textContent = "";
    }

    // Email validation
    if (!emailVal) {
      if (showMessages) emailError.textContent = "Email je povinný.";
      valid = false;
    } else if (!emailRegex.test(emailVal)) {
      if (showMessages) emailError.textContent = "Zadajte platnú emailovú adresu.";
      valid = false;
    } else {
      emailError.textContent = "";
    }

    // Phone validation (only if something is entered)
    if (phoneVal) {
      if (!phoneRegex.test(phoneVal)) {
        if (showMessages) phoneError.textContent = "Zadajte platné telefónne číslo (napr. +421900123456, 0900123456, 421900123456).";
        valid = false;
      } else {
        phoneError.textContent = "";
      }
    } else {
      phoneError.textContent = "";
    }

    // Birth number validation (must be exactly 6 digits and valid date)
    if (form.birth_number && form.birth_number.offsetParent !== null) {
      if (!birthNumberVal) {
        if (showMessages) birthNumberError.textContent = "Rodné číslo je povinné.";
        valid = false;
      } else if (!birthNumberRegex.test(birthNumberVal)) {
        if (showMessages) birthNumberError.textContent = "Rodné číslo musí mať 6 číslic.";
        valid = false;
      } else {
        // Parse birth number and check validity (same as registration)
        const year = parseInt(birthNumberVal.slice(0, 2), 10);
        let month = parseInt(birthNumberVal.slice(2, 4), 10);
        const day = parseInt(birthNumberVal.slice(4, 6), 10);

        // Gender logic: month > 50 means female
        let gender = "Muž";
        if (month > 50) {
          gender = "Žena";
          month -= 50;
        }

        // Guess century: if year > 30, use 1900s, else 2000s
        const fullYear = year > 30 ? 1900 + year : 2000 + year;

        // Check month and day validity
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
          if (showMessages) birthNumberError.textContent = "Rodné číslo obsahuje neplatný dátum narodenia.";
          valid = false;
        } else {
          birthNumberError.textContent = "";
        }
      }
    } else if (birthNumberError) {
      birthNumberError.textContent = "";
    }

    return valid;
  }

  // Show error on input if cleared or invalid
  form.first_name.addEventListener("input", () => validateFields());
  form.last_name.addEventListener("input", () => validateFields());
  form.email.addEventListener("input", () => validateFields());
  form.phone_number.addEventListener("input", () => validateFields());
  if (form.birth_number) form.birth_number.addEventListener("input", () => {
    // Only allow up to 6 digits
    let val = form.birth_number.value.replace(/\D/g, "");
    if (val.length > 6) val = val.substring(0, 6);
    form.birth_number.value = val;
    validateFields();
  });

  // Show error when leaving (blurring) a field if not valid
  form.first_name.addEventListener("blur", () => validateFields());
  form.last_name.addEventListener("blur", () => validateFields());
  form.email.addEventListener("blur", () => validateFields());
  form.phone_number.addEventListener("blur", () => validateFields());
  if (form.birth_number) form.birth_number.addEventListener("blur", () => validateFields());

  saveBtn.addEventListener("click", (e) => {
    if (!validateFields(true)) {
      e.preventDefault();
      return;
    }
    confirmModal.style.display = "flex";
  });

  cancelBtn.addEventListener("click", () => {
    confirmModal.style.display = "none";
  });

  confirmBtn.addEventListener("click", async () => {
    confirmModal.style.display = "none";
    if (!validateFields(true)) {
      return;
    }
    const patientId = getPatientIdFromURL();

    const data = {
      first_name: form.first_name.value.trim(),
      last_name: form.last_name.value.trim(),
      phone_number: form.phone_number.value.trim(),
      gender: form.gender.value,
      email: form.email.value.trim(),
      birth_date: form.birth_date.value,
      password: form.password.value.trim()
    };

    if (form.birth_number && form.birth_number.value) {
      data.birth_number = form.birth_number.value.trim();
    }

    if (form.doctor_id && form.doctor_id.value) {
      data.doctor_id = form.doctor_id.value.trim();
    }

    try {
      const resp = await fetchWithAuth(`/patients/update/${patientId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      const result = await resp.json();
      if (!resp.ok) throw new Error(result.error || "Chyba pri aktualizácii pacienta.");

      alert(result.message || "Zmeny boli úspešne uložené.");
      window.location.href = `/patients/${patientId}`;
    } catch (err) {
      console.error(err);
      alert(err.message || "Nepodarilo sa uložiť zmeny.");
    }
  });

  // Add back button logic (same as in admin/doctor/hospital details)
  document.getElementById("back-patient-btn")?.addEventListener("click", () => window.history.back());

  loadPatientDetails();
  checkUserTypeAndAdjustForm();
});