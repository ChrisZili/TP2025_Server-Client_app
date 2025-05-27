document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("technician-details-form");
  const saveBtn = document.getElementById("save-technician-btn");
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

  function getTechnicianIdFromURL() {
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
      const hospitalCodeInput = document.getElementById("hospital_code");
      const newPasswordInput = document.getElementById("password");
      const emailInput = document.getElementById("email");
      const firstNameInput = document.getElementById("first_name");
      const lastNameInput = document.getElementById("last_name");

      const hospitalCodeGroup = hospitalCodeInput?.closest('.form-group');
      const newPasswordGroup = newPasswordInput?.closest('.form-group');

      if (user.user_type !== "super_admin") {
        if (hospitalCodeInput) hospitalCodeInput.readOnly = true;
        if (hospitalCodeGroup) hospitalCodeGroup.style.display = "none";
      }
      if (user.user_type !== "admin" && user.user_type !== "super_admin") {
        if (emailInput) emailInput.readOnly = true;
        if (firstNameInput) firstNameInput.readOnly = true;
        if (lastNameInput) lastNameInput.readOnly = true;
        if (newPasswordGroup) newPasswordGroup.style.display = "none";
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
  async function loadTechnicianDetails() {
    try {
      const technicianId = getTechnicianIdFromURL();
      if (!technicianId) throw new Error("Chýba technician ID v URL.");
      const response = await fetchWithAuth(`/technicians/${technicianId}`);
      if (!response.ok) throw new Error("Nepodarilo sa načítať údaje technika.");
      const technician = await response.json();

      form.first_name.value = technician.first_name || "";
      form.last_name.value = technician.last_name || "";
      form.email.value = technician.email || "";
      form.password.value = "";
      form.created_at.value = formatDate(technician.created_at) || "";

      if (technician.hospital) {
        form.hospital_name.value = technician.hospital.name || "";
        form.hospital_street.value = technician.hospital.street || "";
        form.hospital_city.value = technician.hospital.city || "";
        form.hospital_postal.value = technician.hospital.postal_code || "";
        form.hospital_code.value = technician.hospital.hospital_code || "";
      }
    } catch (err) {
      console.error(err);
      alert("Chyba pri načítaní údajov technika: " + err.message);
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

  const nameRegex = /^[a-zA-ZÀ-ž\s]{2,255}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function validateFields(showMessages = true) {
    let valid = true;
    const firstNameVal = form.first_name.value.trim();
    const lastNameVal = form.last_name.value.trim();
    const emailVal = form.email.value.trim();

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

    return valid;
  }

  // Show error on input if cleared or invalid
  form.first_name.addEventListener("input", () => validateFields());
  form.last_name.addEventListener("input", () => validateFields());
  form.email.addEventListener("input", () => validateFields());

  // Show error when leaving (blurring) a field if not valid
  form.first_name.addEventListener("blur", () => validateFields());
  form.last_name.addEventListener("blur", () => validateFields());
  form.email.addEventListener("blur", () => validateFields());

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
    const technicianId = getTechnicianIdFromURL();

    const data = {
      first_name: form.first_name.value.trim(),
      last_name: form.last_name.value.trim(),
      email: form.email.value.trim(),
      password: form.password.value.trim(),
      hospital_code: form.hospital_code.value.trim()
    };

    try {
      const resp = await fetchWithAuth(`/technicians/update/${technicianId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      const result = await resp.json();
      if (!resp.ok) throw new Error(result.error || "Chyba pri aktualizácii technika.");

      alert(result.message || "Zmeny boli úspešne uložené.");
      window.location.href = `/technicians/${technicianId}`;
    } catch (err) {
      console.error(err);
      alert(err.message || "Nepodarilo sa uložiť zmeny.");
    }
  });

  // Add back button logic (same as in admin/doctor/hospital/patient details)
  document.getElementById("back-technician-btn")?.addEventListener("click", () => window.history.back());

  loadTechnicianDetails();
  checkUserTypeAndAdjustForm();
});
