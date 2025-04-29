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

  saveBtn.addEventListener("click", () => {
    confirmModal.style.display = "flex";
  });

  cancelBtn.addEventListener("click", () => {
    confirmModal.style.display = "none";
  });

  confirmBtn.addEventListener("click", async () => {
    confirmModal.style.display = "none";
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

  loadTechnicianDetails();
  checkUserTypeAndAdjustForm();
});
