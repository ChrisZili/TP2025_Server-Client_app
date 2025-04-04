document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("dynamic-hospital-form");
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
    // Napríklad: ["", "hospitals", "123", "detail"]
    return parts.length >= 3 ? parts[2] : null;
  }

  async function loadHospitalDetails() {
    try {
      const hospitalId = getHospitalIdFromURL();
      if (!hospitalId) throw new Error("Chýba hospital ID v URL.");
      const response = await fetchWithAuth(`/hospitals/${hospitalId}`);
      if (!response.ok) {
        throw new Error('Nepodarilo sa načítať údaje nemocnice.');
      }
      const hospital = await response.json();
      renderHospitalForm(hospital);
    } catch (err) {
      console.error(err);
      container.innerHTML = `<p>Chyba pri načítaní údajov nemocnice: ${err.message}</p>`;
    }
  }

  function renderHospitalForm(hospital) {
    // Vygenerujeme formulár s údajmi o nemocnici
    let html = `<div class="form-group">
      <label>Názov nemocnice</label>
      <input type="text" name="name" value="${hospital.name || ''}" />
    </div>`;
    html += `<div class="form-group">
      <label>Mesto</label>
      <input type="text" name="city" value="${hospital.city || ''}" />
    </div>`;
    html += `<div class="form-group">
      <label>Ulica a číslo</label>
      <input type="text" name="street" value="${hospital.street || ''}" />
    </div>`;
    html += `<div class="form-group">
      <label>PSČ</label>
      <input type="text" name="postal_code" value="${hospital.postal_code || ''}" />
    </div>`;
    // Hospital code nie je editovateľný
    html += `<div class="form-group">
      <label>Kód nemocnice</label>
      <input type="text" name="hospital_code" value="${hospital.hospital_code || ''}" readonly />
    </div>`;
    container.innerHTML = html;
  }

  if (saveBtn) {
    saveBtn.addEventListener("click", async () => {
      // Získame hospital_id z URL
      const hospitalId = getHospitalIdFromURL();
      // Získame hodnoty zo všetkých inputov vo formulári
      const inputs = container.querySelectorAll("input");
      let dataToSave = {};
      inputs.forEach(inp => {
        dataToSave[inp.name] = inp.value;
      });
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
