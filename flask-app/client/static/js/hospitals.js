document.addEventListener("DOMContentLoaded", () => {
  // =========================================
  // 1) Deklarácia premenných (viditeľných pre všetky funkcie nižšie)
  // =========================================

  // Zoznam nemocníc
  let allHospitalsData = [];

  // Premenné pre triedenie tabulky "All"
  let allCurrentSortColumn = "name";
  let allCurrentSortDirection = "asc";

  // ==== Taby (All / Add) ====
  const tabAll = document.getElementById("tab-all");
  const tabAdd = document.getElementById("tab-add");

  const tabAllContent = document.getElementById("tab-all-content");
  const tabAddContent = document.getElementById("tab-add-content");

  // ==== Karty & Zoznam pre "ALL" ====
  const viewCardsBtnAll = document.getElementById("view-cards");
  const viewListBtnAll = document.getElementById("view-list");
  const allCardsContainer = document.getElementById("all-cards-container");
  const allListContainer = document.getElementById("all-list-container");
  const sortOptionsAll = document.getElementById("sort-options-all");
  const allCards = document.getElementById("all-hospitals-cards");
  const allListBody = document.getElementById("all-list-body");
  const allSortSelect = document.getElementById("sort-select-all");

  // ==== Search Elements (now part of ALL tab) ====
  const searchInput = document.getElementById("search-input");

  // ==== City Filter Element ====
  const cityFilter = document.getElementById("city-filter");

  // =========================================
  // 2) Definícia funkcií (teraz už môžu používať vyššie deklarované premené)
  // =========================================

  // --- Helper: Reset form fields and errors ---
  function resetAddHospitalForm() {
    const fields = [
      "hospital-name",
      "hospital-country",
      "hospital-city",
      "hospital-street",
      "hospital-postal"
    ];
    fields.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.value = "";
        el.classList.remove("touched");
      }
    });
    showError(nameErrorDiv, "");
    showError(countryErrorDiv, "");
    showError(cityErrorDiv, "");
    showError(streetErrorDiv, "");
    showError(postalErrorDiv, "");
    if (addMessage) {
      addMessage.textContent = "";
      addMessage.classList.remove("error", "success");
    }
  }

  // --- Prepínanie tabov (All / Add) ---
  let lastTab = "all";
  function showTab(tab) {
    [tabAll, tabAdd].forEach(el => el?.classList.remove("active"));
    [tabAllContent, tabAddContent].forEach(el => el?.classList.add("hidden"));

    // If leaving the add tab, reset the form
    if (lastTab === "add" && tab !== "add") {
      resetAddHospitalForm();
    }

    if (tab === "all") {
      tabAll?.classList.add("active");
      tabAllContent?.classList.remove("hidden");
    } else if (tab === "add") {
      tabAdd?.classList.add("active");
      tabAddContent?.classList.remove("hidden");
    }
    lastTab = tab;
  }

  // --- Prepínanie režimu zobrazenia (Karty / Zoznam) ---
  function setViewMode(mode) {
    localStorage.setItem("hospitalViewMode", mode);

    // Update UI for the selected view mode
    if (mode === "list") {
      viewCardsBtnAll?.classList.remove("active");
      viewListBtnAll?.classList.add("active");
      allCardsContainer?.classList.add("hidden");
      allListContainer?.classList.remove("hidden");
      sortOptionsAll?.classList.add("hidden");
    } else {
      // "cards"
      viewCardsBtnAll?.classList.add("active");
      viewListBtnAll?.classList.remove("active");
      allCardsContainer?.classList.remove("hidden");
      allListContainer?.classList.add("hidden");
      sortOptionsAll?.classList.remove("hidden");
    }

    // Reapply search and filters
    performSearch();
    updateSortIconsAll();
  }

  // ---  Všetky nemocnice (ALL)

  async function loadAllHospitals() {
    try {
      const resp = await fetch("/hospitals/list", {
        method: "GET",
        headers: { "Accept": "application/json" },
        credentials: "include"
      });
      if (!resp.ok) throw new Error("Chyba pri načítaní nemocníc.");
      const hospitals = await resp.json();
      allHospitalsData = hospitals;

      // Populate city filter dropdown
      populateCityFilter(hospitals);

      // Render hospitals in cards and list
      renderAllCards(hospitals, allSortSelect.value);
      renderAllListTable(hospitals);
    } catch (err) {
      console.error(err);
      if (allCards) {
        allCards.innerHTML = `<p>Chyba pri načítaní nemocníc: ${err.message}</p>`;
      }
    }
  }

  // --- Populate City Filter Dropdown ---
  function populateCityFilter(hospitals) {
    if (!cityFilter) return;

    // Get unique cities
    const uniqueCities = [...new Set(hospitals.map(h => h.city).filter(city => city))];

    // Clear existing options
    cityFilter.innerHTML = '<option value="">Všetky mestá</option>';

    // Add unique cities as options
    uniqueCities.forEach(city => {
      const option = document.createElement("option");
      option.value = city;
      option.textContent = city;
      cityFilter.appendChild(option);
    });
  }

  // --- Sort Hospitals Based on Selected Sort Option ---
  function sortHospitalsForCards(hospitals, sortValue = "alphabetical-asc") {
    let sorted = [...hospitals];
    if (sortValue === "alphabetical-asc") {
      sorted.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    } else if (sortValue === "alphabetical-desc") {
      sorted.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
    } else if (sortValue === "newest") {
      sorted.sort((a, b) => (b.id || 0) - (a.id || 0));
    } else {
      // creation => older to newer
      sorted.sort((a, b) => (a.id || 0) - (b.id || 0));
    }
    return sorted;
  }

  function renderAllCards(hospitals, sortValue) {
    if (!allCards) return;
    allCards.innerHTML = "";
    if (!hospitals || hospitals.length === 0) {
      allCards.innerHTML = "<p>Žiadne nemocnice nenájdené.</p>";
      return;
    }

    const sorted = sortHospitalsForCards(hospitals, sortValue);
    const container = document.createElement("div");
    container.classList.add("cards");

    sorted.forEach(h => {
      const card = document.createElement("div");
      card.classList.add("card");
      card.innerHTML = `
        <h3>${h.name || "-"}</h3>
        <p>Vytvorenie: ${h.created_at || "-"}</p>
        <p>Mesto: ${h.city || "-"}</p>
        <p>Ulica: ${h.street || "-"}</p>
        <p>PSČ: ${h.postal_code || "-"}</p>
      `;
      card.addEventListener("click", () => {
        window.location.href = "/hospitals/" + h.id;
      });
      container.appendChild(card);
    });

    allCards.appendChild(container);
  }

  // --- All: Tabuľka (klikateľné hlavičky) ---
  function renderAllListTable(hospitals) {
    if (!allListBody) return;
    allListBody.innerHTML = "";
    if (!hospitals || hospitals.length === 0) {
      return; // No data => empty table
    }

    // Sort the provided dataset (filtered hospitals)
    let data = [...hospitals];
    data.sort((a, b) => {
      let valA = (a[allCurrentSortColumn] || "").toString().toLowerCase();
      let valB = (b[allCurrentSortColumn] || "").toString().toLowerCase();
      if (valA < valB) return allCurrentSortDirection === "asc" ? -1 : 1;
      if (valA > valB) return allCurrentSortDirection === "asc" ? 1 : -1;
      return 0;
    });

    // Render the sorted data
    data.forEach(h => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${h.name || "-"}</td>
        <td>${h.created_at || "-"}</td>
        <td>${h.city || "-"}</td>
        <td>${h.street || "-"}</td>
        <td>${h.postal_code || "-"}</td>
      `;
      tr.addEventListener("click", () => {
        window.location.href = "/hospitals/" + h.id;
      });
      allListBody.appendChild(tr);
    });
  }

  // --- Filter Hospitals Based on Search and City ---
  function filterHospitals(query, city) {
    query = query.toLowerCase();
    return allHospitalsData.filter(h => {
      const matchesQuery =
        (!query || (h.name && h.name.toLowerCase().includes(query)) ||
          (h.city && h.city.toLowerCase().includes(query)) ||
          (h.postal_code && h.postal_code.toLowerCase().includes(query)));

      const matchesCity = !city || (h.city && h.city === city);

      return matchesQuery && matchesCity;
    });
  }

  // --- Perform Search and Apply Filters + Sorting ---
  function performSearch() {
    const mode = localStorage.getItem("hospitalViewMode") || "cards";
    const query = (searchInput?.value || "").trim();
    const city = cityFilter?.value || "";
    const sortVal = allSortSelect?.value || "alphabetical-asc";

    // Filter hospitals based on search query and city
    let filtered = filterHospitals(query, city);

    // Sort the filtered hospitals
    filtered = sortHospitalsForCards(filtered, sortVal);

    // Render the results in the selected view mode
    if (mode === "list") {
      renderAllListTable(filtered);
    } else {
      renderAllCards(filtered, sortVal);
    }
  }

  function debounce(func, delay) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), delay);
    };
  }

  // --- Restore view mode on page load ---
  function restoreHospitalViewMode() {
    const savedMode = localStorage.getItem("hospitalViewMode") || "cards";
    setViewMode(savedMode);

    // Set sort select to A-Z on load
    if (allSortSelect) {
      allSortSelect.value = "alphabetical-asc";
    }
    updateSortIconsAll();
  }

  // --- Add sort arrow icons to table headers ---
  function updateSortIconsAll() {
    const allHeaderCells = document.querySelectorAll("#all-list-container thead th");
    allHeaderCells.forEach(th => {
      const col = th.getAttribute("data-column");
      th.classList.remove("sort-asc", "sort-desc");
      // Remove old arrow if present
      const oldArrow = th.querySelector('.sort-arrow');
      if (oldArrow) th.removeChild(oldArrow);

      // Show arrow only for the sorted column
      if (col === allCurrentSortColumn) {
        th.classList.add(allCurrentSortDirection === "asc" ? "sort-asc" : "sort-desc");
        const arrow = document.createElement("span");
        arrow.className = "sort-arrow";
        arrow.textContent = allCurrentSortDirection === "asc" ? " ▲" : " ▼";
        th.appendChild(arrow);
      }
    });
  }

  // =========================================
  // 3) Pripojenie eventov po definícii funkcií
  // =========================================

  // --- Taby ---
  tabAll?.addEventListener("click", () => showTab("all"));
  tabAdd?.addEventListener("click", () => showTab("add"));

  // --- Nastavíme predvolene "all" tab ---
  showTab("all");

  // --- Režim zobrazenia (LocalStorage) ---
  restoreHospitalViewMode();

  // --- Kliknutia: All (cards / list) ---
  viewCardsBtnAll?.addEventListener("click", () => setViewMode("cards"));
  viewListBtnAll?.addEventListener("click", () => setViewMode("list"));

  // --- Klikanie na hlavičky (All) ---
  const allHeaderCells = document.querySelectorAll("#all-list-container thead th");
  allHeaderCells.forEach(th => {
    th.addEventListener("click", () => {
      const col = th.getAttribute("data-column");
      if (!col) return;

      // Toggle sort direction or set new column
      if (allCurrentSortColumn === col) {
        allCurrentSortDirection = (allCurrentSortDirection === "asc") ? "desc" : "asc";
      } else {
        allCurrentSortColumn = col;
        allCurrentSortDirection = "asc";
      }

      allHeaderCells.forEach(cell => cell.classList.remove("sort-asc", "sort-desc"));
      th.classList.add(allCurrentSortDirection === "asc" ? "sort-asc" : "sort-desc");

      updateSortIconsAll();
      performSearch();
    });
  });

  // --- Zmena selectu pre All (karty) ---
  allSortSelect?.addEventListener("change", () => {
    // Set sorting variables based on select
    if (allSortSelect.value === "alphabetical-asc") {
      allCurrentSortColumn = "name";
      allCurrentSortDirection = "asc";
    } else if (allSortSelect.value === "alphabetical-desc") {
      allCurrentSortColumn = "name";
      allCurrentSortDirection = "desc";
    } else if (allSortSelect.value === "newest") {
      allCurrentSortColumn = "created_at";
      allCurrentSortDirection = "desc";
    } else if (allSortSelect.value === "creation") {
      allCurrentSortColumn = "created_at";
      allCurrentSortDirection = "asc";
    }
    updateSortIconsAll();
    performSearch();
  });

  // --- Vyhľadávanie: input ---
  searchInput?.addEventListener("keyup", debounce(performSearch, 300));

  // --- Event Listener for City Filter ---
  cityFilter?.addEventListener("change", performSearch);

  // --- Pridanie nemocnice ---
  const addBtn = document.getElementById("add-hospital-btn");
  const addMessage = document.getElementById("add-hospital-message");
  const countrySelect = document.getElementById("hospital-country");

  // --- Inline error elements for each input ---
  const nameErrorDiv = document.getElementById("hospital-name-error");
  const countryErrorDiv = document.getElementById("hospital-country-error");
  const cityErrorDiv = document.getElementById("hospital-city-error");
  const streetErrorDiv = document.getElementById("hospital-street-error");
  const postalErrorDiv = document.getElementById("hospital-postal-error");

  // --- Inline error display functions ---
  function showError(div, msg) {
    if (div) div.textContent = msg;
  }
  function clearError(div) {
    if (div) div.textContent = "";
  }

  // --- Validation function for add hospital form ---
  function validateHospitalForm() {
    let isValid = true;
    clearError(nameErrorDiv);
    clearError(countryErrorDiv);
    clearError(cityErrorDiv);
    clearError(streetErrorDiv);
    clearError(postalErrorDiv);

    const name = (document.getElementById("hospital-name")?.value || "").trim();
    const country = (document.getElementById("hospital-country")?.value || "").trim();
    const city = (document.getElementById("hospital-city")?.value || "").trim();
    const street = (document.getElementById("hospital-street")?.value || "").trim();
    const postal = (document.getElementById("hospital-postal")?.value || "").trim();

    if (name.length < 3 || name.length > 255) {
      showError(nameErrorDiv, "Názov musí mať 3 až 255 znakov.");
      isValid = false;
    }
    if (!country) {
      showError(countryErrorDiv, "Štát je povinný.");
      isValid = false;
    }
    if (!/^[^\d]+$/.test(city) || city.length < 3 || city.length > 255) {
      showError(cityErrorDiv, "Mesto nesmie obsahovať čísla a musí mať 3 až 255 znakov.");
      isValid = false;
    }
    if (!/[a-zA-Z]{3,}/.test(street) || !/\d/.test(street) || street.length < 4 || street.length > 255) {
      showError(streetErrorDiv, "Ulica musí obsahovať aspoň 3 písmená, aspoň jedno číslo a mať 4 až 255 znakov.");
      isValid = false;
    }
    if (!/^\d{4,8}$/.test(postal)) {
      showError(postalErrorDiv, "PSČ musí obsahovať iba čísla a mať dĺžku 4 až 8 znakov.");
      isValid = false;
    }
    return isValid;
  }

  // --- Single field validation on blur ---
  function validateSingleField(id) {
    const value = (document.getElementById(id)?.value || "").trim();
    switch (id) {
      case "hospital-name":
        if (value.length < 3 || value.length > 255) {
          showError(nameErrorDiv, "Názov musí mať 3 až 255 znakov.");
        } else {
          showError(nameErrorDiv, "");
        }
        break;
      case "hospital-country":
        if (!value) {
          showError(countryErrorDiv, "Štát je povinný.");
        } else {
          showError(countryErrorDiv, "");
        }
        break;
      case "hospital-city":
        if (!/^[^\d]+$/.test(value) || value.length < 3 || value.length > 255) {
          showError(cityErrorDiv, "Mesto nesmie obsahovať čísla a musí mať 3 až 255 znakov.");
        } else {
          showError(cityErrorDiv, "");
        }
        break;
      case "hospital-street":
        if (!/[a-zA-Z]{3,}/.test(value) || !/\d/.test(value) || value.length < 4 || value.length > 255) {
          showError(streetErrorDiv, "Ulica musí obsahovať aspoň 3 písmená, aspoň jedno číslo a mať 4 až 255 znakov.");
        } else {
          showError(streetErrorDiv, "");
        }
        break;
      case "hospital-postal":
        if (!/^\d{4,8}$/.test(value)) {
          showError(postalErrorDiv, "PSČ musí obsahovať iba čísla a mať dĺžku 4 až 8 znakov.");
        } else {
          showError(postalErrorDiv, "");
        }
        break;
    }
  }

  ["hospital-name", "hospital-country", "hospital-city", "hospital-street", "hospital-postal"].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("blur", () => {
        el.classList.add("touched");
        validateSingleField(id);
      });
    }
  });

  // --- Add hospital button click ---
  if (addBtn) {
    addBtn.addEventListener("click", async () => {
      // Mark all fields as touched
      ["hospital-name", "hospital-country", "hospital-city", "hospital-street", "hospital-postal"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add("touched");
      });

      if (addMessage) {
        addMessage.textContent = "";
        addMessage.classList.remove("error", "success");
      }

      // Inline validation
      if (!validateHospitalForm()) {
        if (addMessage) {
          addMessage.textContent = "Vyplňte všetky polia správne.";
          addMessage.classList.add("error");
        }
        return;
      }

      const name = (document.getElementById("hospital-name")?.value || "").trim();
      const country = (document.getElementById("hospital-country")?.value || "").trim();
      const city = (document.getElementById("hospital-city")?.value || "").trim();
      const street = (document.getElementById("hospital-street")?.value || "").trim();
      const postal = (document.getElementById("hospital-postal")?.value || "").trim();

      try {
        const resp = await fetch("/hospitals/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, country, city, street, postal_code: postal }),
          credentials: "include"
        });
        const data = await resp.json();
        if (!resp.ok) throw new Error(data.error || "Chyba pri vytváraní nemocnice");

        if (addMessage) {
          addMessage.textContent = data.message || "Nemocnica pridaná.";
          addMessage.classList.add("success");
        }
        showTab("all");
        await loadAllHospitals();
      } catch (err) {
        console.error(err);
        if (addMessage) {
          addMessage.textContent = err.message || "Nepodarilo sa pridať nemocnicu.";
          addMessage.classList.add("error");
        }
      }
    });
  }

  // --- Načítanie štátov do <select> ---
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

  // =========================================
  // 4) Po všetkých definíciách spustíme načítanie
  // =========================================
  loadAllHospitals();
});