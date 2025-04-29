document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("hospital-form");
  const saveBtn = document.getElementById("save-hospital-btn");

  // Pomocná funkcia pre fetch s cookies
  function fetchWithAuth(url, options = {}) {
    return fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        ...(options.headers || {}),
        'Accept': 'application/json'
      }
    });
  }

  // Funkcia na získanie hospital_id z URL (predpokladáme, že URL je vo formáte /hospitals/<id>/detail)
  function getHospitalIdFromURL() {
    const parts = window.location.pathname.split('/');
    return parts.length >= 3 ? parts[2] : null;
  }

  async function loadHospitalDetails() {
    try {
      const hospitalId = getHospitalIdFromURL();
      if (!hospitalId) throw new Error("Chýba hospital ID v URL.");
      const response = await fetchWithAuth(`/hospitals/${hospitalId}`);
      if (!response.ok) throw new Error('Nepodarilo sa načítať údaje nemocnice.');
      const hospital = await response.json();

      // Naplníme existujúci formulár
      form.name.value = hospital.name || "";
      form.city.value = hospital.city || "";
      form.street.value = hospital.street || "";
      form.postal_code.value = hospital.postal_code || "";
      form.hospital_code.value = hospital.hospital_code || "";

    } catch (err) {
      console.error(err);
      const container = document.getElementById("dynamic-hospital-form");
      if (container) {
        container.innerHTML = `<p>Chyba pri načítaní údajov nemocnice: ${err.message}</p>`;
      }
    }
  }

  if (saveBtn) {
    saveBtn.addEventListener("click", async (e) => {
      e.preventDefault(); // ak je mimo form, stále zabránime reloadu

      const hospitalId = getHospitalIdFromURL();
      const dataToSave = {
        name: form.name.value,
        city: form.city.value,
        street: form.street.value,
        postal_code: form.postal_code.value,
      };

      console.log("Chcem uložiť nemocnicu:", dataToSave);
      try {
        const response = await fetchWithAuth(`/hospitals/update/${hospitalId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dataToSave)
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Chyba pri aktualizácii nemocnice");
        alert(result.message || "Nemocnica aktualizovaná.");
      } catch (err) {
        console.error(err);
        alert(err.message || "Nepodarilo sa aktualizovať nemocnicu.");
      }
    });
  }

  loadHospitalDetails();
});
