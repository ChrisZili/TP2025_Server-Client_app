// hospital-details.js
document.addEventListener("DOMContentLoaded", () => {
  const form         = document.getElementById("hospital-form");
  const saveBtn      = document.getElementById("save-hospital-btn");
  const confirmModal = document.getElementById("confirmation-modal");
  const confirmBtn   = document.getElementById("confirm-save-btn");
  const cancelBtn    = document.getElementById("cancel-save-btn");
  const countrySelect = document.getElementById("hospital-country");

  // --- Defensive: If form is missing, do nothing ---
  if (!form) {
    console.error("Form #hospital-form not found!");
    return;
  }

  /* ----------------------------------------------------------
     Pomocné funkcie
  ---------------------------------------------------------- */
  const countries = [
    "Afganistan","Albánsko","Alžírsko","Andorra","Angola","Argentína","Arménsko","Austrália",
    "Rakúsko","Azerbajdžan","Bahamy","Bahrajn","Bangladéš","Barbados","Belgicko","Benin",
    "Bhután","Bolívia","Bosna a Hercegovina","Brazília","Brunej","Bulharsko","Burkina Faso",
    "Burundi","Kambodža","Kamerun","Kanada","Čad","Čile","Čína","Kolumbia","Komory","Kongo",
    "Kostarika","Chorvátsko","Kuba","Cyprus","Česká republika","Dánsko","Džibutsko","Dominika",
    "Ekvádor","Egypt","Salvádor","Estónsko","Etiópia","Fidži","Fínsko","Francúzsko","Gabon",
    "Gambia","Gruzínsko","Nemecko","Ghana","Grécko","Guatemala","Guinea","Honduras","Maďarsko",
    "Island","India","Indonézia","Irán","Irak","Írsko","Izrael","Taliansko","Japonsko","Jordánsko",
    "Kazachstan","Keňa","Kórejská republika","Kuvajt","Laos","Lotyšsko","Libanon","Libéria","Líbya",
    "Lichtenštajnsko","Litva","Luxembursko","Madagaskar","Malajzia","Malta","Mexiko","Moldavsko",
    "Monako","Mongolsko","Čierna Hora","Maroko","Mozambik","Mjanmarsko","Nepál","Holandsko",
    "Nový Zéland","Nikaragua","Nigéria","Nórsko","Omán","Pakistan","Panama","Paraguaj","Peru",
    "Filipíny","Poľsko","Portugalsko","Katar","Rumunsko","Rusko","Rwanda","Saudská Arábia",
    "Srbsko","Singapur","Slovensko","Slovinsko","Somálsko","Južná Afrika","Španielsko","Srí Lanka",
    "Sudán","Švédsko","Švajčiarsko","Sýria","Tchaj-wan","Tanzánia","Thajsko","Tunisko","Turecko",
    "Ukrajina","Spojené arabské emiráty","Spojené kráľovstvo","USA","Uruguaj","Uzbekistan","Venezuela",
    "Vietnam","Jemen","Zambia","Zimbabwe"
  ];
  if (countrySelect) {
    countries.forEach(cty => {
      const option = document.createElement("option");
      option.value = cty;
      option.textContent = cty;
      countrySelect.appendChild(option);
    });
  }

  // z cookie „csrf_access_token“ vytiahne hodnotu pre hlavičku
  function getCsrfFromCookie() {
    const m = document.cookie.match(/(?:^|;\s*)csrf_access_token=([^;]+)/);
    return m ? decodeURIComponent(m[1]) : null;
  }

  // fetch s cookies + CSRF pre mutačné metódy
  function fetchWithAuth(url, options = {}) {
    const method  = (options.method || "GET").toUpperCase();
    const headers = {
      Accept: "application/json",
      ...(options.headers || {})
    };
    if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
      const csrf = getCsrfFromCookie();
      if (csrf) headers["X-CSRF-TOKEN"] = csrf;
    }
    return fetch(url, {
      ...options,
      method,
      credentials: "include",
      headers
    });
  }

  // spoľahlivejšie vytiahnutie ID z ľubovoľného /hospitals/<id>/... URL
  function getHospitalIdFromURL() {
    const m = window.location.pathname.match(/\/hospitals\/(\d+)/);
    return m ? m[1] : null;
  }

  /* ----------------------------------------------------------
     Načítanie detailu nemocnice
  ---------------------------------------------------------- */
  async function loadHospitalDetails() {
    try {
      const id = getHospitalIdFromURL();
      if (!id) throw new Error("Chýba hospital ID v URL.");

      const resp = await fetchWithAuth(`/hospitals/${id}`);
      if (!resp.ok) throw new Error("Nepodarilo sa načítať údaje nemocnice.");

      const h = await resp.json();
      form.name.value         = h.name          || "";
      form.city.value         = h.city          || "";
      form.street.value       = h.street        || "";
      form.postal_code.value  = h.postal_code   || "";
      form.hospital_code.value= h.hospital_code || "";
      if (countrySelect) countrySelect.value = h.country || "";

      /* fallback, ak backend pošle krajinu mimo zoznamu */
      if (h.country && countrySelect && countrySelect.value === "") {
        countrySelect.add(new Option(h.country, h.country, true, true));
      }
    } catch (err) {
      console.error(err);
      const c = document.getElementById("dynamic-hospital-form");
      if (c) c.innerHTML = `<p class="text-danger">Chyba: ${err.message}</p>`;
    }
  }

  // --- Error message helpers with null checks ---
  function ensureErrorDiv(inputId) {
    let input = document.getElementById(inputId);
    if (!input) {
      console.warn("Input not found for error div:", inputId);
      return null;
    }
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
  const nameError = ensureErrorDiv('name');
  const cityError = ensureErrorDiv('city');
  const streetError = ensureErrorDiv('street');
  const postalCodeError = ensureErrorDiv('postal_code');
  const hospitalCodeError = ensureErrorDiv('hospital_code');
  const countryError = ensureErrorDiv('hospital-country');

  const nameRegex = /^[a-zA-ZÀ-ž0-9\s\.\-]{2,255}$/;
  const cityRegex = /^[a-zA-ZÀ-ž\s\.\-]{2,255}$/;
  const streetRegex = /^[a-zA-ZÀ-ž0-9\s\.\-]{2,255}$/;
  const postalCodeRegex = /^\d{3}\s?\d{2}$/;
  const hospitalCodeRegex = /^[A-Z0-9\-]{2,20}$/i;

  function showError(div, msg) {
    if (!div) return;
    div.textContent = msg;
    div.classList.add("active");
  }
  function clearError(div) {
    if (!div) return;
    div.textContent = "";
    div.classList.remove("active");
  }

  function validateFields(showMessages = true) {
    let valid = true;
    const nameVal = form.name?.value.trim() || "";
    const cityVal = form.city?.value.trim() || "";
    const streetVal = form.street?.value.trim() || "";
    const postalCodeVal = form.postal_code?.value.trim() || "";
    const hospitalCodeVal = form.hospital_code?.value.trim() || "";
    const countryVal = form.country?.value.trim() || (countrySelect ? countrySelect.value.trim() : "");

    // Name
    if (!nameVal) {
      if (showMessages) showError(nameError, "Názov je povinný.");
      valid = false;
    } else if (!nameRegex.test(nameVal)) {
      if (showMessages) showError(nameError, "Názov musí mať 2-255 znakov.");
      valid = false;
    } else {
      clearError(nameError);
    }

    // City
    if (!cityVal) {
      if (showMessages) showError(cityError, "Mesto je povinné.");
      valid = false;
    } else if (!cityRegex.test(cityVal)) {
      if (showMessages) showError(cityError, "Mesto musí mať 2-255 znakov.");
      valid = false;
    } else {
      clearError(cityError);
    }

    // Street
    if (!streetVal) {
      if (showMessages) showError(streetError, "Ulica je povinná.");
      valid = false;
    } else if (!streetRegex.test(streetVal)) {
      if (showMessages) showError(streetError, "Ulica musí mať 2-255 znakov.");
      valid = false;
    } else {
      clearError(streetError);
    }

    // Postal code
    if (!postalCodeVal) {
      if (showMessages) showError(postalCodeError, "PSČ je povinné.");
      valid = false;
    } else if (!postalCodeRegex.test(postalCodeVal)) {
      if (showMessages) showError(postalCodeError, "PSČ musí byť v tvare 12345 alebo 123 45.");
      valid = false;
    } else {
      clearError(postalCodeError);
    }

    // Hospital code
    if (!hospitalCodeVal) {
      if (showMessages) showError(hospitalCodeError, "Kód nemocnice je povinný.");
      valid = false;
    } else if (!hospitalCodeRegex.test(hospitalCodeVal)) {
      if (showMessages) showError(hospitalCodeError, "Kód nemocnice musí mať 2-20 znakov (písmená, čísla, pomlčka).");
      valid = false;
    } else {
      clearError(hospitalCodeError);
    }

    // Country
    if (!countryVal) {
      if (showMessages) showError(countryError, "Krajina je povinná.");
      valid = false;
    } else {
      clearError(countryError);
    }

    return valid;
  }

  // Defensive: only add listeners if fields exist
  form.name?.addEventListener("input", () => validateFields());
  form.city?.addEventListener("input", () => validateFields());
  form.street?.addEventListener("input", () => validateFields());
  form.postal_code?.addEventListener("input", () => validateFields());
  form.hospital_code?.addEventListener("input", () => validateFields());
  (form.country || countrySelect)?.addEventListener("change", () => validateFields());

  // Always show errors on blur (when leaving a field)
  form.name?.addEventListener("blur", () => validateFields(true));
  form.city?.addEventListener("blur", () => validateFields(true));
  form.street?.addEventListener("blur", () => validateFields(true));
  form.postal_code?.addEventListener("blur", () => validateFields(true));
  form.hospital_code?.addEventListener("blur", () => validateFields(true));
  (form.country || countrySelect)?.addEventListener("blur", () => validateFields(true));

  /* ----------------------------------------------------------
     Potvrdzovacie tlačidlá
  ---------------------------------------------------------- */
  if (saveBtn) {
    saveBtn.addEventListener("click", e => {
      e.preventDefault();
      if (!validateFields(true)) return;
      confirmModal.style.display = "flex";
    });
  }
  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      confirmModal.style.display = "none";
    });
  }
  if (confirmBtn) {
    confirmBtn.addEventListener("click", async () => {
      confirmModal.style.display = "none";
      if (!validateFields(true)) return;
      const hospitalId = getHospitalIdFromURL();

      const data = {
        name:        form.name?.value.trim() || "",
        city:        form.city?.value.trim() || "",
        street:      form.street?.value.trim() || "",
        postal_code: form.postal_code?.value.trim() || "",
        hospital_code: form.hospital_code?.value.trim() || "",
        country: (form.country?.value.trim() || (countrySelect ? countrySelect.value.trim() : "")),
      };
      try {
        const resp = await fetchWithAuth(`/hospitals/update/${hospitalId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });
        const result = await resp.json();
        if (!resp.ok) throw new Error(result.error || "Chyba pri aktualizácii.");

        alert(result.message || "Nemocnica bola úspešne aktualizovaná.");
        window.location.href = `/hospitals/${hospitalId}`;

      } catch (err) {
        console.error(err);
        alert(err.message || "Nepodarilo sa uložiť zmeny.");
      }
    });
  }

  document.getElementById("back-hospital-btn")?.addEventListener("click", () => window.history.back());

  loadHospitalDetails();
});
