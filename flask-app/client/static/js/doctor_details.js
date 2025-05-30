document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("doctor-details-form");
  const saveBtn = document.getElementById("save-doctor-btn");
  const confirmModal = document.getElementById("confirmation-modal");
  const confirmBtn = document.getElementById("confirm-save-btn");
  const cancelBtn = document.getElementById("cancel-save-btn");
  const toggleBtn = document.getElementById("toggle-password");
  const passwordInput = document.getElementById("password");

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

  function getDoctorIdFromURL() {
    const parts = window.location.pathname.split("/");
    return parts.length >= 3 ? parts[2] : null;
  }
  // Získaj informácie o používateľovi a skry pole nemocnice, ak nie je super_admin
  async function checkUserTypeAndAdjustForm() {
    try {
      const response = await fetch("/settings/info", {
        method: "GET",
        headers: { Accept: "application/json" },
        credentials: "include"
      });
      const user = await response.json();
      const hospitalCodeGroup = document.querySelector('#hospital_code')?.closest('.form-group');
      const doctorType = document.querySelector('#doctor-type')?.closest('.form-group');
      const doctorId = document.querySelector('#doctor-id')?.closest('.form-group');

      if (hospitalCodeGroup && user.user_type !== "super_admin") {

        hospitalCodeGroup.style.display = "none";
        doctorType.style.display = "none";
        doctorId.style.display = "none";
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
  async function loadDoctorDetails() {
    try {
      const doctorId = getDoctorIdFromURL();
      if (!doctorId) throw new Error("Chýba doctor ID v URL.");
      const response = await fetchWithAuth(`/doctors/${doctorId}`);
      if (!response.ok) throw new Error("Nepodarilo sa načítať údaje doktora.");
      const doctor = await response.json();
      form.doctor_id.value = doctor.id || "";
      form.title.value = doctor.title || "";
      form.suffix.value = doctor.suffix || "";
      form.first_name.value = doctor.first_name || "";
      form.last_name.value = doctor.last_name || "";
      form.phone_number.value = doctor.phone_number || "";
      form.gender.value = doctor.gender || "";
      form.email.value = doctor.email || "";

      form.password.value = "";
      form.created_at.value = formatDate(doctor.created_at) || "";

      if (doctor.role === "super_doctor") {
        form.doctor_type.value = "super_doctor";
      } else {
        form.doctor_type.value = "doctor";
      }

      if (doctor.hospital) {
        form.hospital_name.value = doctor.hospital.name || "";
        form.hospital_street.value = doctor.hospital.street || "";
        form.hospital_city.value = doctor.hospital.city || "";
        form.hospital_postal.value = doctor.hospital.postal_code || "";
        form.hospital_code.value = doctor.hospital.hospital_code || "";
      }
    } catch (err) {
      console.error(err);
      alert("Chyba pri načítaní údajov doktora: " + err.message);
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

  const nameRegex = /^[a-zA-ZÀ-ž\s]{2,255}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^(?:\+\d{3}|\d{3}|0)\d{9}$/;
  const noNumbersRegex = /^[^\d]*$/;

  function validateFields(showMessages = true) {
    let valid = true;
    const firstNameVal = form.first_name.value.trim();
    const lastNameVal = form.last_name.value.trim();
    const emailVal = form.email.value.trim();
    const phoneVal = form.phone_number.value.trim();

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

    return valid;
  }

  // Show error on input if cleared or invalid
  form.first_name.addEventListener("input", () => validateFields());
  form.last_name.addEventListener("input", () => validateFields());
  form.email.addEventListener("input", () => validateFields());
  form.phone_number.addEventListener("input", () => validateFields());

  // Show error when leaving (blurring) a field if not valid
  form.first_name.addEventListener("blur", () => validateFields());
  form.last_name.addEventListener("blur", () => validateFields());
  form.email.addEventListener("blur", () => validateFields());
  form.phone_number.addEventListener("blur", () => validateFields());

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
    const doctorId = getDoctorIdFromURL();

    const data = {
      first_name: form.first_name.value.trim(),
      last_name: form.last_name.value.trim(),
      phone_number: form.phone_number.value.trim(),
      gender: form.gender.value,
      email: form.email.value.trim(),
      password: form.password.value.trim(),
      hospital_code: form.hospital_code.value.trim(),
      title: form.title.value.trim(),
      suffix: form.suffix.value.trim(),
      role: form.doctor_type.value
    };

    try {
      const resp = await fetchWithAuth(`/doctors/update/${doctorId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      const result = await resp.json();
      if (!resp.ok) throw new Error(result.error || "Chyba pri aktualizácii doktora.");

      alert(result.message || "Zmeny boli úspešne uložené.");
      window.location.href = `/doctors/${doctorId}`;
    } catch (err) {
      console.error(err);
      alert(err.message || "Nepodarilo sa uložiť zmeny.");
    }
  });

  // Add this for the back button (same as admin_details.js)
  document.getElementById("back-doctor-btn")?.addEventListener("click", () => window.history.back());

  loadDoctorDetails();
  checkUserTypeAndAdjustForm();
});