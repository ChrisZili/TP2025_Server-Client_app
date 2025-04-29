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

  saveBtn.addEventListener("click", () => {
    confirmModal.style.display = "flex";
  });

  cancelBtn.addEventListener("click", () => {
    confirmModal.style.display = "none";
  });

  confirmBtn.addEventListener("click", async () => {
    confirmModal.style.display = "none";
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

  loadPatientDetails();
  checkUserTypeAndAdjustForm();
});