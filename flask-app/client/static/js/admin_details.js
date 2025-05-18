document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("admin-details-form");
  const saveBtn = document.getElementById("save-admin-btn");
  const confirmModal = document.getElementById("confirmation-modal");
  const confirmBtn = document.getElementById("confirm-save-btn");
  const cancelBtn = document.getElementById("cancel-save-btn");
  const toggleBtn = document.getElementById('toggle-password');
  const passwordInput = document.getElementById('password');

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

  saveBtn.addEventListener("click", () => {
    confirmModal.style.display = "flex";
  });

  cancelBtn.addEventListener("click", () => {
    confirmModal.style.display = "none";
  });

  confirmBtn.addEventListener("click", async () => {
    confirmModal.style.display = "none";
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

  loadAdminDetails();
});
