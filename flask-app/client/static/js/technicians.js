document.addEventListener("DOMContentLoaded", () => {
  // -- All variables --
  let allTechniciansData = [];
  let userType = "";

  // For "All" tab sorting
  let allCurrentSortColumn = "last_name";
  let allCurrentSortDirection = "asc";

  // For "Search" tab sorting
  let searchCurrentSortColumn = "last_name";
  let searchCurrentSortDirection = "asc";

  // DOM elements for view toggles
  const viewCardsBtnAll = document.getElementById("view-cards");
  const viewListBtnAll = document.getElementById("view-list");
  const allCardsContainer = document.getElementById("all-cards-container");
  const allListContainer = document.getElementById("all-list-container");
  const sortOptionsAll = document.getElementById("sort-options-all");
  const allList = document.getElementById("all-technicians-list");

  // DOM elements for search view toggles
  const viewCardsBtnSearch = document.getElementById("search-view-cards");
  const viewListBtnSearch = document.getElementById("search-view-list");
  const searchCardsContainer = document.getElementById("search-cards-container");
  const searchListContainer = document.getElementById("search-list-container");
  const sortOptionsSearch = document.getElementById("sort-options-search");
  const searchResults = document.getElementById("search-results");
  const searchInput = document.getElementById("search-input");
  const searchSortSelect = document.getElementById("search-sort-select");

  // Tab elements
  const tabAll = document.getElementById("tab-all");
  const tabSearch = document.getElementById("tab-search");
  const tabAdd = document.getElementById("tab-add");

  const tabAllContent = document.getElementById("tab-all-content");
  const tabSearchContent = document.getElementById("tab-search-content");
  const tabAddContent = document.getElementById("tab-add-content");

  // Form and list elements
  const sortSelect = document.getElementById("sort-select");
  const allListBody = document.getElementById("all-list-body");
  const searchListBody = document.getElementById("search-list-body");

  function formatDate(dateString) {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString('sk-SK', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  function setupPasswordToggle(inputId, toggleId) {
    const input = document.getElementById(inputId);
    const toggle = document.getElementById(toggleId);

    if (input && toggle) {
      toggle.addEventListener('click', () => {
        const isHidden = input.type === 'password';
        input.type = isHidden ? 'text' : 'password';
        toggle.innerHTML = `<i class="fas ${isHidden ? 'fa-eye' : 'fa-eye-slash'}"></i>`;
      });
    }
  }

  // Password toggle setup
  setupPasswordToggle('technician-password', 'toggle-password');
  setupPasswordToggle('technician-password-confirm', 'toggle-password-confirm');

  // -- View mode toggle function --
  function setViewMode(mode) {
    localStorage.setItem("technicianViewMode", mode);

    // == ALL tab
    if (mode === "list") {
      viewCardsBtnAll?.classList.remove("active");
      viewListBtnAll?.classList.add("active");
      allCardsContainer?.classList.add("hidden");
      allListContainer?.classList.remove("hidden");
      sortOptionsAll?.classList.add("hidden");
    } else { // "cards"
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
    } else { // "cards"
      viewCardsBtnSearch?.classList.add("active");
      viewListBtnSearch?.classList.remove("active");
      searchCardsContainer?.classList.remove("hidden");
      searchListContainer?.classList.add("hidden");
      sortOptionsSearch?.classList.remove("hidden");
    }

    // Re-render views
    renderAllListTable(allTechniciansData);
    renderTechnicians(allTechniciansData, sortSelect?.value);
    performSearch(); // Re-render search results
  }

  function showTab(tab) {
    tabAll?.classList.remove("active");
    tabSearch?.classList.remove("active");
    tabAdd?.classList.remove("active");

    tabAllContent?.classList.add("hidden");
    tabSearchContent?.classList.add("hidden");
    tabAddContent?.classList.add("hidden");

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

  function resetTechnicianForm() {
    const form = document.getElementById("add-technician-form");
    if (form) form.reset();

    const msg = document.getElementById("add-technician-message");
    if (msg) {
      msg.textContent = "";
      msg.classList.remove("error", "success");
    }
  }

  // Render all list table
  function renderAllListTable(technicians) {
    if (!allListBody) return;
    allListBody.innerHTML = "";

    if (!Array.isArray(technicians) || technicians.length === 0) {
      return; // Empty table for no data
    }

    let data = [...technicians];
    data.sort((a, b) => {
      let valA, valB;

      if (allCurrentSortColumn === "full_name") {
        valA = `${a.first_name} ${a.last_name}`.trim().toLowerCase();
        valB = `${b.first_name} ${b.last_name}`.trim().toLowerCase();
      } else if (allCurrentSortColumn === "hospital") {
        valA = (a.hospital?.name || "").toLowerCase();
        valB = (b.hospital?.name || "").toLowerCase();
      } else {
        valA = (a[allCurrentSortColumn] || "").toString().toLowerCase();
        valB = (b[allCurrentSortColumn] || "").toString().toLowerCase();
      }

      if (valA < valB) return allCurrentSortDirection === "asc" ? -1 : 1;
      if (valA > valB) return allCurrentSortDirection === "asc" ? 1 : -1;
      return 0;
    });

    data.forEach(t => {
      const tr = document.createElement("tr");
      const fullName = `${t.first_name} ${t.last_name}`.trim();
      const hospitalName = t.hospital?.name || "-";

      tr.innerHTML = `
        <td>${fullName}</td>
        <td>${formatDate(t.created_at)}</td>
        <td>${t.email || "-"}</td>
        <td>${hospitalName}</td>
      `;

      tr.addEventListener("click", () => {
        window.location.href = `/technicians/${t.id}`;
      });

      allListBody.appendChild(tr);
    });
  }

  // Search list table rendering
  function renderSearchListTable(technicians) {
    if (!searchListBody) return;
    searchListBody.innerHTML = "";

    if (!Array.isArray(technicians) || technicians.length === 0) {
      return;
    }

    let data = [...technicians];
    data.sort((a, b) => {
      let valA, valB;

      if (searchCurrentSortColumn === "full_name") {
        valA = `${a.first_name} ${a.last_name}`.trim().toLowerCase();
        valB = `${b.first_name} ${b.last_name}`.trim().toLowerCase();
      } else if (searchCurrentSortColumn === "hospital") {
        valA = (a.hospital?.name || "").toLowerCase();
        valB = (b.hospital?.name || "").toLowerCase();
      } else {
        valA = (a[searchCurrentSortColumn] || "").toString().toLowerCase();
        valB = (b[searchCurrentSortColumn] || "").toString().toLowerCase();
      }

      if (valA < valB) return searchCurrentSortDirection === "asc" ? -1 : 1;
      if (valA > valB) return searchCurrentSortDirection === "asc" ? 1 : -1;
      return 0;
    });

    data.forEach(t => {
      const tr = document.createElement("tr");
      const fullName = `${t.first_name} ${t.last_name}`.trim();
      const hospitalName = t.hospital?.name || "-";

      tr.innerHTML = `
        <td>${fullName}</td>
        <td>${formatDate(t.created_at)}</td>
        <td>${t.email || "-"}</td>
        <td>${hospitalName}</td>
      `;

      tr.addEventListener("click", () => {
        window.location.href = `/technicians/${t.id}`;
      });

      searchListBody.appendChild(tr);
    });
  }

  // Event listeners
  tabAll?.addEventListener("click", () => showTab("all"));
  tabSearch?.addEventListener("click", () => showTab("search"));
  tabAdd?.addEventListener("click", () => {
    showTab("add");
    resetTechnicianForm();
  });

  // View toggle buttons
  viewCardsBtnAll?.addEventListener("click", () => setViewMode("cards"));
  viewListBtnAll?.addEventListener("click", () => setViewMode("list"));
  viewCardsBtnSearch?.addEventListener("click", () => setViewMode("cards"));
  viewListBtnSearch?.addEventListener("click", () => setViewMode("list"));

  // Sort select handlers
  sortSelect?.addEventListener("change", () => {
    renderTechnicians(allTechniciansData, sortSelect.value);
  });

  // Table header sorting for All tab
  const allHeaderCells = document.querySelectorAll("#all-list-container thead th");
  allHeaderCells?.forEach(th => {
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

      renderAllListTable(allTechniciansData);
    });
  });

  // Table header sorting for Search tab
  const searchHeaderCells = document.querySelectorAll("#search-list-container thead th");
  searchHeaderCells?.forEach(th => {
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

  // Set initial view mode from localStorage
  const savedMode = localStorage.getItem("technicianViewMode") || "cards";
  setViewMode(savedMode);

  async function checkUserTypeAndAdjustForm() {
    try {
      const response = await fetch("/settings/info", {
        method: "GET",
        headers: { Accept: "application/json" },
        credentials: "include"
      });
      const user = await response.json();
      userType = user.user_type
      const hospitalCodeGroup = document.querySelector('#technician-hospital-code')?.closest('.form-group');

      if (hospitalCodeGroup && user.user_type !== "super_admin") {
        hospitalCodeGroup.style.display = "none";
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

  async function loadAllTechnicians() {
    try {
      const response = await fetch("/technicians/list", {
        method: "GET",
        headers: { "Accept": "application/json" },
        credentials: "include"
      });
      if (!response.ok) throw new Error("Chyba pri načítaní technikov.");
      const data = await response.json();
      allTechniciansData = data;

      // Render both views
      renderTechnicians(data, sortSelect?.value);
      renderAllListTable(data);
    } catch (err) {
      console.error(err);
      if (allList) {
        allList.innerHTML = `<p>Chyba pri načítaní technikov: ${err.message}</p>`;
      }
    }
  }

  function sortTechnicians(technicians, sortValue = "creation") {
    let sorted = [...technicians];

    if (sortValue === "alphabetical-asc") {
      sorted.sort((a, b) => `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`));
    } else if (sortValue === "alphabetical-desc") {
      sorted.sort((a, b) => `${b.first_name} ${b.last_name}`.localeCompare(`${a.first_name} ${a.last_name}`));
    } else if (sortValue === "newest") {
      sorted.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
        const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
        return dateB - dateA; // Newer dates first
      });
    } else { // "creation" - starší po novší
      sorted.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
        const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
        return dateA - dateB; // Older dates first
      });
    }
    return sorted;
  }

  function renderTechnicians(list, sortType) {
    if (!allList) return;

    if (!Array.isArray(list) || list.length === 0) {
      allList.innerHTML = "<p>Žiadni technici nenájdení.</p>";
      return;
    }

    const sorted = sortTechnicians(list, sortType);
    allList.innerHTML = "";

    const container = document.createElement("div");
    container.classList.add("cards");

    sorted.forEach(t => {
      const hospital = t.hospital || {};
      const card = document.createElement("div");
      card.classList.add("card");
      card.addEventListener("click", () => {
        window.location.href = `/technicians/${t.id}`;
      });

      const name = document.createElement("h3");
      name.textContent = `${t.first_name} ${t.last_name}`;

      const created_at = document.createElement("p");
      created_at.textContent = `Deň vytvorenia: ${formatDate(t.created_at)}`;

      const email = document.createElement("p");
      email.textContent = `Email: ${t.email}`;

      const hospitalName = document.createElement("p");
      hospitalName.textContent = `Nemocnica: ${hospital.name || ""}`;

      card.append(name, created_at, email, hospitalName);
      container.appendChild(card);
    });

    allList.appendChild(container);
  }

  function debounce(func, delay) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), delay);
    };
  }

  function performSearch() {
    const query = searchInput?.value.trim().toLowerCase();
    const mode = localStorage.getItem("technicianViewMode") || "cards";

    if (searchResults) {
      searchResults.innerHTML = "";
    }

    if (!query) {
      return;
    }

    const filtered = allTechniciansData.filter(t => {
      const hospitalName = t.hospital?.name?.toLowerCase() || "";
      const fullName = `${t.first_name} ${t.last_name}`.toLowerCase();

      return (
        t.first_name?.toLowerCase().includes(query) ||
        t.last_name?.toLowerCase().includes(query) ||
        fullName.includes(query) ||
        t.email?.toLowerCase().includes(query) ||
        hospitalName.includes(query)
      );
    });

    const sortValue = searchSortSelect?.value || "creation";

    if (mode === "list") {
      renderSearchListTable(filtered);
    } else {
      // Cards view
      const sortedFiltered = sortTechnicians(filtered, sortValue);

      if (sortedFiltered.length === 0 && searchResults) {
        searchResults.innerHTML = `<p>Pre "${query}" neboli nájdené žiadne výsledky.</p>`;
        return;
      }

      const container = document.createElement("div");
      container.classList.add("cards");

      sortedFiltered.forEach(t => {
        const hospital = t.hospital || {};
        const card = document.createElement("div");
        card.classList.add("card");
        card.addEventListener("click", () => {
          window.location.href = `/technicians/${t.id}`;
        });

        const name = document.createElement("h3");
        name.textContent = `${t.first_name} ${t.last_name}`;

        const email = document.createElement("p");
        email.textContent = `Email: ${t.email}`;

        const hospitalName = document.createElement("p");
        hospitalName.textContent = `Nemocnica: ${hospital.name || ""}`;

        card.append(name, email, hospitalName);
        container.appendChild(card);
      });

      if (searchResults) {
        searchResults.appendChild(container);
      }
    }
  }

  const debouncedSearch = debounce(performSearch, 300);
  searchInput?.addEventListener("keyup", debouncedSearch);
  searchSortSelect?.addEventListener("change", performSearch);

  // Initial setup
  showTab("all");
  loadAllTechnicians();
  checkUserTypeAndAdjustForm();

  const addBtn = document.getElementById("add-technician-btn");
if (addBtn) {
  addBtn.addEventListener("click", async () => {
    const msg = document.getElementById("add-technician-message");
    msg.textContent = "";
    msg.classList.remove("error", "success");

    const firstName = document.getElementById("technician-first-name").value.trim();
    const lastName = document.getElementById("technician-last-name").value.trim();
    const email = document.getElementById("technician-email").value.trim();
    const password = document.getElementById("technician-password").value;
    const confirmPassword = document.getElementById("technician-password-confirm").value;
    const hospitalCode = document.getElementById("technician-hospital-code")?.value.trim();
    const gdprChecked = document.getElementById("gdpr")?.checked;

    if (!firstName || !lastName || !email || !password || !confirmPassword || (!hospitalCode && userType === "super_admin")) {
      msg.textContent = "Vyplňte všetky povinné údaje.";
      msg.classList.add("error");
      return;
    }

    if (password !== confirmPassword) {
      msg.textContent = "Heslá sa nezhodujú.";
      msg.classList.add("error");
      return;
    }

    if (!gdprChecked) {
      msg.textContent = "Musíte súhlasiť so spracovaním údajov (GDPR).";
      msg.classList.add("error");
      return;
    }

    try {
      const resp = await fetch("/technicians/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email,
          password,
          hospital_code: hospitalCode
        })
      });

      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Chyba pri vytváraní technika.");

      msg.textContent = data.message || "Technik úspešne pridaný.";
      msg.classList.add("success");
      resetTechnicianForm();
      showTab("all");
      loadAllTechnicians();
    } catch (err) {
      console.error(err);
      msg.textContent = err.message || "Nepodarilo sa pridať technika.";
      msg.classList.add("error");
    }
  });
}

});