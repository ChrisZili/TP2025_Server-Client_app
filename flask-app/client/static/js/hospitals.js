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

  // --- Prepínanie tabov (All / Add) ---
  function showTab(tab) {
    [tabAll, tabAdd].forEach(el => el?.classList.remove("active"));
    [tabAllContent, tabAddContent].forEach(el => el?.classList.add("hidden"));

    if (tab === "all") {
      tabAll?.classList.add("active");
      tabAllContent?.classList.remove("hidden");
    } else if (tab === "add") {
      tabAdd?.classList.add("active");
      tabAddContent?.classList.remove("hidden");
    }
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

  // =========================================
  // 3) Pripojenie eventov po definícii funkcií
  // =========================================

  // --- Taby ---
  tabAll?.addEventListener("click", () => showTab("all"));
  tabAdd?.addEventListener("click", () => showTab("add"));

  // --- Nastavíme predvolene "all" tab ---
  showTab("all");

  // --- Režim zobrazenia (LocalStorage) ---
  const savedMode = localStorage.getItem("hospitalViewMode") || "cards";
  setViewMode(savedMode);

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

      // Update header styles
      allHeaderCells.forEach(cell => cell.classList.remove("sort-asc", "sort-desc"));
      th.classList.add(allCurrentSortDirection === "asc" ? "sort-asc" : "sort-desc");

      // Reapply search and filters, then sort
      performSearch();
    });
  });

  // --- Zmena selectu pre All (karty) ---
  allSortSelect?.addEventListener("change", performSearch);

  // --- Vyhľadávanie: input ---
  searchInput?.addEventListener("keyup", debounce(performSearch, 300));

  // --- Event Listener for City Filter ---
  cityFilter?.addEventListener("change", performSearch);

  // --- Pridanie nemocnice ---
  const addBtn = document.getElementById("add-hospital-btn");
  const addMessage = document.getElementById("add-hospital-message");
  const countrySelect = document.getElementById("hospital-country");

  if (addBtn) {
    addBtn.addEventListener("click", async () => {
      if (addMessage) {
        addMessage.textContent = "";
        addMessage.classList.remove("error", "success");
      }

      const name = (document.getElementById("hospital-name")?.value || "").trim();
      const country = (document.getElementById("hospital-country")?.value || "").trim();
      const city = (document.getElementById("hospital-city")?.value || "").trim();
      const street = (document.getElementById("hospital-street")?.value || "").trim();
      const postal = (document.getElementById("hospital-postal")?.value || "").trim();

      // Validation checks
      if (name.length < 3 || name.length > 255) {
        if (addMessage) {
          addMessage.textContent = "Názov musí mať 3 až 255 znakov.";
          addMessage.classList.add("error");
        }
        return;
      }

      if (!/^[^\d]+$/.test(city) || city.length < 3 || city.length > 255) {
        if (addMessage) {
          addMessage.textContent = "Mesto nesmie obsahovať čísla a musí mať 3 až 255 znakov.";
          addMessage.classList.add("error");
        }
        return;
      }

      if (!/[a-zA-Z]{3,}/.test(street) || !/\d/.test(street) || street.length < 4 || street.length > 255) {
        if (addMessage) {
          addMessage.textContent = "Ulica musí obsahovať aspoň 3 písmená, aspoň jedno číslo a mať 4 až 255 znakov.";
          addMessage.classList.add("error");
        }
        return;
      }

      if (!/^\d{4,8}$/.test(postal)) {
        if (addMessage) {
          addMessage.textContent = "PSČ musí obsahovať iba čísla a mať dĺžku 4 až 8 znakov.";
          addMessage.classList.add("error");
        }
        return;
      }

      if (!name || !country || !city || !street || !postal) {
        if (addMessage) {
          addMessage.textContent = "Vyplňte všetky polia.";
          addMessage.classList.add("error");
        }
        return;
      }

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
