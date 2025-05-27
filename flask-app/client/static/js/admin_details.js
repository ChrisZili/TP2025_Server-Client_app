document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("admin-details-form");
  const saveBtn = document.getElementById("save-admin-btn");
  const confirmModal = document.getElementById("confirmation-modal");
  const confirmBtn = document.getElementById("confirm-save-btn");
  const cancelBtn = document.getElementById("cancel-save-btn");
  const toggleBtn = document.getElementById('toggle-password');
  const passwordInput = document.getElementById('password');

  // --- Add error message elements ---
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

  // Regex for name, email, and phone
  const nameRegex = /^[a-zA-ZÀ-ž\s]{2,255}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^(?:\+\d{3}|\d{3}|0)\d{9}$/;

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
      let phoneError = ensureErrorDiv('phone_number');
      if (!phoneRegex.test(phoneVal)) {
        if (showMessages) phoneError.textContent = "Zadajte platné telefónne číslo (napr. +421*********).";
        valid = false;
      } else {
        phoneError.textContent = "";
      }
    } else {
      let phoneError = ensureErrorDiv('phone_number');
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

  if (toggleBtn && passwordInput) {
    toggleBtn.addEventListener('click', () => {
      const isPassword = passwordInput.type === 'password';
      passwordInput.type = isPassword ? 'text' : 'password';
      toggleBtn.innerHTML = `<i class="fas ${isPassword ? 'fa-eye' : 'fa-eye-slash'}"></i>`;
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

  function getAdminIdFromURL() {
    const parts = window.location.pathname.split("/");
    return parts.length >= 3 ? parts[2] : null;
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
  async function loadAdminDetails() {
    try {
      const adminId = getAdminIdFromURL();
      if (!adminId) throw new Error("Chýba admin ID v URL.");
      const response = await fetchWithAuth(`/admins/${adminId}`);
      if (!response.ok) throw new Error("Nepodarilo sa načítať údaje admina.");
      const admin = await response.json();

      // Naplníme hodnoty formulára
      form.first_name.value = admin.first_name || "";
      form.last_name.value = admin.last_name || "";
      form.phone_number.value = admin.phone_number || "";
      form.gender.value = admin.gender || "";
      form.email.value = admin.email || "";
      form.password.value = "";
      form.created_at.value = formatDate(admin.created_at) || "";

      if (admin.hospital) {
        form.hospital_name.value = admin.hospital.name || "";
        form.hospital_street.value = admin.hospital.street || "";
        form.hospital_city.value = admin.hospital.city || "";
        form.hospital_postal.value = admin.hospital.postal_code || "";
        form.hospital_code.value = admin.hospital.hospital_code || "";
      }
    } catch (err) {
      console.error(err);
      alert("Chyba pri načítaní údajov admina: " + err.message);
    }
  }

  saveBtn.addEventListener("click", (e) => {
    // Validate before showing modal
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
    // Final validation before saving
    if (!validateFields(true)) {
      return;
    }
    const adminId = getAdminIdFromURL();

    const data = {
      first_name: form.first_name.value.trim(),
      last_name: form.last_name.value.trim(),
      phone_number: form.phone_number.value.trim(),
      gender: form.gender.value,
      email: form.email.value.trim(),
      password: form.password.value.trim(), // môže byť prázdne
      hospital_code: form.hospital_code.value.trim()
    };

    try {
      const resp = await fetchWithAuth(`/admins/update/${adminId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      const result = await resp.json();
      if (!resp.ok) throw new Error(result.error || "Chyba pri aktualizácii admina.");

      alert(result.message || "Zmeny boli úspešne uložené.");
      window.location.href = `/admins/${adminId}`;  // <= tu je redirect

    } catch (err) {
      console.error(err);
      alert(err.message || "Nepodarilo sa uložiť zmeny.");
    }
  });

  document.getElementById("back-admin-btn")?.addEventListener("click", () => window.history.back());

  loadAdminDetails();
});
