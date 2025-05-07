// hospital-details.js
document.addEventListener("DOMContentLoaded", () => {
  const form         = document.getElementById("hospital-form");
  const saveBtn      = document.getElementById("save-hospital-btn");
  const confirmModal = document.getElementById("confirmation-modal");
  const confirmBtn   = document.getElementById("confirm-save-btn");
  const cancelBtn    = document.getElementById("cancel-save-btn");
  const countrySelect = document.getElementById("hospital-country");

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
  countries.forEach(cty => {
    const option = document.createElement("option");
    option.value = cty;
    option.textContent = cty;
    countrySelect.appendChild(option);
  });

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
      countrySelect.value     = h.country       || "";

      /* fallback, ak backend pošle krajinu mimo zoznamu */
      if (h.country && countrySelect.value === "") {
        countrySelect.add(new Option(h.country, h.country, true, true));
      }

    } catch (err) {
      console.error(err);
      const c = document.getElementById("dynamic-hospital-form");
      if (c) c.innerHTML = `<p class="text-danger">Chyba: ${err.message}</p>`;
    }
  }

  /* ----------------------------------------------------------
     Potvrdzovacie tlačidlá
  ---------------------------------------------------------- */
  if (saveBtn) {
    saveBtn.addEventListener("click", e => {
      e.preventDefault();            // blokni submit/reload
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
      const hospitalId = getHospitalIdFromURL();

      const data = {
        name:        form.name.value.trim(),
        city:        form.city.value.trim(),
        street:      form.street.value.trim(),
        postal_code: form.postal_code.value.trim(),
        country: form.country.value.trim(),
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

  loadHospitalDetails();
});
