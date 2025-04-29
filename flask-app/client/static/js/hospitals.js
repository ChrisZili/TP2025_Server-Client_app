document.addEventListener("DOMContentLoaded", () => {
  // =========================================
  // 1) Deklarácia premenných (viditeľných pre všetky funkcie nižšie)
  // =========================================

  // Zoznam nemocníc
  let allHospitalsData = [];

  // Premenné pre triedenie tabulky "All"
  let allCurrentSortColumn = "name";
  let allCurrentSortDirection = "asc";

  // Premenné pre triedenie tabulky "Search"
  let searchCurrentSortColumn = "name";
  let searchCurrentSortDirection = "asc";

  // ==== Taby (All / Search / Add) ====
  const tabAll = document.getElementById("tab-all");
  const tabSearch = document.getElementById("tab-search");
  const tabAdd = document.getElementById("tab-add");

  const tabAllContent = document.getElementById("tab-all-content");
  const tabSearchContent = document.getElementById("tab-search-content");
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

  // ==== Karty & Zoznam pre "SEARCH" ====
  const viewCardsBtnSearch = document.getElementById("search-view-cards");
  const viewListBtnSearch = document.getElementById("search-view-list");
  const searchCardsContainer = document.getElementById("search-cards-container");
  const searchListContainer = document.getElementById("search-list-container");
  const sortOptionsSearch = document.getElementById("sort-options-search");
  const searchCards = document.getElementById("search-results-cards");
  const searchListBody = document.getElementById("search-list-body");
  const searchInput = document.getElementById("search-input");
  const searchSortSelect = document.getElementById("sort-select-search");

  // ==== Pridanie nemocnice (Add) ====
  const addBtn = document.getElementById("add-hospital-btn");
  const addMessage = document.getElementById("add-hospital-message");
  const countrySelect = document.getElementById("hospital-country");

  // =========================================
  // 2) Definícia funkcií (teraz už môžu používať vyššie deklarované premené)
  // =========================================

  // --- Prepínanie tabov (All / Search / Add) ---
  function showTab(tab) {
    [tabAll, tabSearch, tabAdd].forEach(el => el?.classList.remove("active"));
    [tabAllContent, tabSearchContent, tabAddContent].forEach(el => el?.classList.add("hidden"));

    if (tab === "all") {
      tabAll?.classList.add("active");
      tabAllContent?.classList.remove("hidden");
    } else if (tab === "search") {
      tabSearch?.classList.add("active");
      tabSearchContent?.classList.remove("hidden");
    } else if (tab === "add") {
      tabAdd?.classList.add("active");
      tabAddContent?.classList.remove("hidden");
    }
  }

  // --- Prepínanie režimu zobrazenia (Karty / Zoznam) ---
  function setViewMode(mode) {
    localStorage.setItem("hospitalViewMode", mode);

    // == ALL tab
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

    // == SEARCH tab
    if (mode === "list") {
      viewCardsBtnSearch?.classList.remove("active");
      viewListBtnSearch?.classList.add("active");
      searchCardsContainer?.classList.add("hidden");
      searchListContainer?.classList.remove("hidden");
      sortOptionsSearch?.classList.add("hidden");
    } else {
      // "cards"
      viewCardsBtnSearch?.classList.add("active");
      viewListBtnSearch?.classList.remove("active");
      searchCardsContainer?.classList.remove("hidden");
      searchListContainer?.classList.add("hidden");
      sortOptionsSearch?.classList.remove("hidden");
    }

    // Znova vykreslenie pre ALL (karty & list)
    renderAllListTable(allHospitalsData);
    renderAllCards(allHospitalsData, allSortSelect?.value);

    // Znova pre SEARCH
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

      // Vykreslíme do kariet a do tabuľky
      renderAllCards(hospitals, allSortSelect.value);
      renderAllListTable(hospitals);
    } catch (err) {
      console.error(err);
      if (allCards) {
        allCards.innerHTML = `<p>Chyba pri načítaní nemocníc: ${err.message}</p>`;
      }
    }
  }

  // --- All: Karty (triedenie podľa <select>) ---

  function sortHospitalsForCards(hospitals, sortValue = "alphabetical-asc") {
    let sorted = [...hospitals];
    if (sortValue === "alphabetical-asc") {
      sorted.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    } else if (sortValue === "alphabetical-desc") {
      sorted.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
    } else if (sortValue === "newest") {
      sorted.sort((a, b) => (b.id || 0) - (a.id || 0));
    } else {
      // creation => staršie => novšie
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
      return; // Žiadne data => prázdna tabuľka
    }

    let data = [...hospitals];
    data.sort((a, b) => {
      let valA = (a[allCurrentSortColumn] || "").toString().toLowerCase();
      let valB = (b[allCurrentSortColumn] || "").toString().toLowerCase();
      if (valA < valB) return allCurrentSortDirection === "asc" ? -1 : 1;
      if (valA > valB) return allCurrentSortDirection === "asc" ? 1 : -1;
      return 0;
    });

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

  // --- Search: Tabuľka ---
  function renderSearchListTable(hospitals) {
    if (!searchListBody) return;
    searchListBody.innerHTML = "";
    if (!hospitals || hospitals.length === 0) {
      return;
    }

    let data = [...hospitals];
    data.sort((a, b) => {
      let valA = (a[searchCurrentSortColumn] || "").toString().toLowerCase();
      let valB = (b[searchCurrentSortColumn] || "").toString().toLowerCase();
      if (valA < valB) return searchCurrentSortDirection === "asc" ? -1 : 1;
      if (valA > valB) return searchCurrentSortDirection === "asc" ? 1 : -1;
      return 0;
    });

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
      searchListBody.appendChild(tr);
    });
  }

  function sortHospitalsForSearchCards(hospitals, sortValue) {
    let sorted = [...hospitals];
    if (sortValue === "alphabetical-asc") {
      sorted.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    } else if (sortValue === "alphabetical-desc") {
      sorted.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
    } else if (sortValue === "newest") {
      sorted.sort((a, b) => (b.id || 0) - (a.id || 0));
    } else {
      // creation
      sorted.sort((a, b) => (a.id || 0) - (b.id || 0));
    }
    return sorted;
  }

  function renderSearchCards(hospitals, sortValue) {
    if (!searchCards) return;
    searchCards.innerHTML = "";
    if (!hospitals || hospitals.length === 0) {
      searchCards.innerHTML = "<p>Žiadne výsledky.</p>";
      return;
    }

    const container = document.createElement("div");
    container.classList.add("cards");
    const sorted = sortHospitalsForSearchCards(hospitals, sortValue);

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
    searchCards.appendChild(container);
  }

  function filterHospitals(query) {
    query = query.toLowerCase();
    return allHospitalsData.filter(h => {
      return (
        (h.name && h.name.toLowerCase().includes(query)) ||
        (h.city && h.city.toLowerCase().includes(query)) ||
        (h.postal_code && h.postal_code.toLowerCase().includes(query))
      );
    });
  }

  // --- Vyhľadávanie + re-render karty/tabuľka ---
  function performSearch() {
    const mode = localStorage.getItem("hospitalViewMode") || "cards";
    const query = (searchInput?.value || "").trim();
    const sortVal = searchSortSelect?.value || "alphabetical-asc";

    if (!query) {
      // vyčisti karty aj list
      searchCards && (searchCards.innerHTML = "");
      searchListBody && (searchListBody.innerHTML = "");
      return;
    }

    const filtered = filterHospitals(query);

    if (mode === "list") {
      // tab
      renderSearchListTable(filtered);
    } else {
      // cards
      renderSearchCards(filtered, sortVal);
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
  tabSearch?.addEventListener("click", () => showTab("search"));
  tabAdd?.addEventListener("click", () => showTab("add"));

  // --- Nastavíme predvolene "all" tab ---
  showTab("all");

  // --- Režim zobrazenia (LocalStorage) ---
  const savedMode = localStorage.getItem("hospitalViewMode") || "cards";
  setViewMode(savedMode);

  // --- Kliknutia: All (cards / list) ---
  viewCardsBtnAll?.addEventListener("click", () => setViewMode("cards"));
  viewListBtnAll?.addEventListener("click", () => setViewMode("list"));

  // --- Kliknutia: Search (cards / list) ---
  viewCardsBtnSearch?.addEventListener("click", () => setViewMode("cards"));
  viewListBtnSearch?.addEventListener("click", () => setViewMode("list"));

  // --- Klikanie na hlavičky (All) ---
  const allHeaderCells = document.querySelectorAll("#all-list-container thead th");
  allHeaderCells.forEach(th => {
    th.addEventListener("click", () => {
      const col = th.getAttribute("data-column");
      if (!col) return;
      if (allCurrentSortColumn === col) {
        allCurrentSortDirection = (allCurrentSortDirection === "asc") ? "desc" : "asc";
      } else {
        allCurrentSortColumn = col;
        allCurrentSortDirection = "asc";
      }

      allHeaderCells.forEach(cell => cell.classList.remove("sort-asc", "sort-desc"));
      th.classList.add(allCurrentSortDirection === "asc" ? "sort-asc" : "sort-desc");

      renderAllListTable(allHospitalsData);
    });
  });

  // --- Klikanie na hlavičky (Search) ---
  const searchHeaderCells = document.querySelectorAll("#search-list-container thead th");
  searchHeaderCells.forEach(th => {
    th.addEventListener("click", () => {
      const col = th.getAttribute("data-column");
      if (!col) return;
      if (searchCurrentSortColumn === col) {
        searchCurrentSortDirection = (searchCurrentSortDirection === "asc") ? "desc" : "asc";
      } else {
        searchCurrentSortColumn = col;
        searchCurrentSortDirection = "asc";
      }

      searchHeaderCells.forEach(cell => cell.classList.remove("sort-asc", "sort-desc"));
      th.classList.add(searchCurrentSortDirection === "asc" ? "sort-asc" : "sort-desc");

      performSearch();
    });
  });

  // --- Zmena selectu pre All (karty) ---
  allSortSelect?.addEventListener("change", () => {
    renderAllCards(allHospitalsData, allSortSelect.value);
  });

  // --- Vyhľadávanie: input + sort select ---
  const debouncedSearch = debounce(performSearch, 300);
  searchInput?.addEventListener("keyup", debouncedSearch);
  searchSortSelect?.addEventListener("change", performSearch);

  // --- Pridanie nemocnice ---
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

      if (!name || !country || !city || !street || !postal) {
        if (addMessage) {
          addMessage.textContent = "Vyplňte všetky polia.";
          addMessage.classList.add("error");
        }
        return;
      }

      if (!/^\d+$/.test(postal)) {
        if (addMessage) {
          addMessage.textContent = "PSČ musí obsahovať iba čísla.";
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
