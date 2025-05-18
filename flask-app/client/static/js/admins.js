document.addEventListener("DOMContentLoaded", () => {
  // -- All variables --
  let allAdminsData = [];

  // For "All" tab
  let allCurrentSortColumn = "last_name";
  let allCurrentSortDirection = "asc";

  // For "Search" tab
  let searchCurrentSortColumn = "last_name";
  let searchCurrentSortDirection = "asc";

  // DOM elements for view toggles
  const viewCardsBtnAll = document.getElementById("view-cards");
  const viewListBtnAll = document.getElementById("view-list");
  const allCardsContainer = document.getElementById("all-cards-container");
  const allListContainer = document.getElementById("all-list-container");
  const sortOptionsAll = document.getElementById("sort-options-all");
  const allAdminsList = document.getElementById("all-admins-cards");

  // DOM elements for search view toggles
  const viewCardsBtnSearch = document.getElementById("search-view-cards");
  const viewListBtnSearch = document.getElementById("search-view-list");
  const searchCardsContainer = document.getElementById("search-cards-container");
  const searchListContainer = document.getElementById("search-list-container");
  const sortOptionsSearch = document.getElementById("sort-options-search");
  const searchResults = document.getElementById("search-results-cards");
  const searchInput = document.getElementById("search-input");
  const searchSortSelect = document.getElementById("search-sort-select");

  // Tab elements
  const tabAll = document.getElementById("tab-all");
  const tabSearch = document.getElementById("tab-search");
  const tabAdd = document.getElementById("tab-add");

  const tabAllContent = document.getElementById("tab-all-content");
  const tabSearchContent = document.getElementById("tab-search-content");
  const tabAddContent = document.getElementById("tab-add-content");

  // Form elements
  const sortSelect = document.getElementById("sort-select");
  const allListBody = document.getElementById("all-list-body");
  const searchListBody = document.getElementById("search-list-body");
  const addAdminMessage = document.getElementById("add-admin-message");
  const addAdminForm = document.getElementById("add-admin-form");

  // Add references for new dropdown filters
  const adminRoleFilter = document.getElementById("admin-role-filter");
  const adminHospitalFilter = document.getElementById("admin-hospital-filter");

  // Setup password toggle functionality
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
  setupPasswordToggle('admin-password', 'toggle-password');
  setupPasswordToggle('admin-password-confirm', 'toggle-password-confirm');

  // -- View mode toggle function --
  function setViewMode(mode) {
    localStorage.setItem("adminViewMode", mode);

    if (mode === "list") {
      // Activate list view
      viewCardsBtnAll?.classList.remove("active");
      viewListBtnAll?.classList.add("active");
      allCardsContainer?.classList.add("hidden");
      allListContainer?.classList.remove("hidden");

      // Hide the sort dropdown
      sortOptionsAll?.classList.add("hidden"); // Explicitly hide the sort dropdown

      // Ensure the filter dropdown is visible
      adminHospitalFilter?.parentElement?.classList.remove("hidden");
    } else { // "cards"
      // Activate cards view
      viewCardsBtnAll?.classList.add("active");
      viewListBtnAll?.classList.remove("active");
      allCardsContainer?.classList.remove("hidden");
      allListContainer?.classList.add("hidden");

      // Show the sort dropdown
      sortOptionsAll?.classList.remove("hidden"); // Explicitly show the sort dropdown

      // Ensure the filter dropdown is visible
      adminHospitalFilter?.parentElement?.classList.remove("hidden");
    }

    // Reapply search and filters
    performSearch();
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

  function resetAdminForm() {
    if (addAdminForm) {
      addAdminForm.reset();
    }
    if (addAdminMessage) {
      addAdminMessage.textContent = "";
      addAdminMessage.classList.remove("error", "success");
    }
  }

  // Helper function to get full name
  function getFullName(admin) {
    return `${admin.first_name || ""} ${admin.last_name || ""}`.trim().toLowerCase();
  }

  function sortAdmins(admins, sortValue = "creation") {
    let sorted = [...admins];

    if (sortValue === "alphabetical-asc") {
      sorted.sort((a, b) => getFullName(a).localeCompare(getFullName(b)));
    } else if (sortValue === "alphabetical-desc") {
      sorted.sort((a, b) => getFullName(b).localeCompare(getFullName(a)));
    } else if (sortValue === "newest") {
      sorted.sort((a, b) => b.id - a.id);
    } else {
      sorted.sort((a, b) => a.id - b.id);
    }
    return sorted;
  }

  // Render all list table
  function renderAllListTable(admins) {
    if (!allListBody) return;
    allListBody.innerHTML = "";

    if (!Array.isArray(admins) || admins.length === 0) {
      return; // Empty table for no data
    }

    let data = [...admins];
    data.sort((a, b) => {
      let valA, valB;

      if (allCurrentSortColumn === "full_name") {
        valA = getFullName(a);
        valB = getFullName(b);
      } else if (allCurrentSortColumn === "phone_number") {
        valA = a.phone_number || "";
        valB = b.phone_number || "";
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

    data.forEach(a => {
      const tr = document.createElement("tr");
      const fullName = `${a.first_name} ${a.last_name}`.trim();
      const hospitalName = a.hospital?.name || "-";

      tr.innerHTML = `
        <td>${fullName}</td>
        <td>${formatDate(a.created_at) || "-"}</td>
        <td>${a.phone_number || "-"}</td>
        <td>${a.email || "-"}</td>
        <td>${hospitalName}</td>
      `;

      tr.addEventListener("click", () => {
        window.location.href = `/admins/${a.id}`;
      });

      allListBody.appendChild(tr);
    });
  }

  // Search list table rendering
  function renderSearchListTable(admins) {
    if (!searchListBody) return;
    searchListBody.innerHTML = "";

    if (!Array.isArray(admins) || admins.length === 0) {
      return;
    }

    let data = [...admins];
    data.sort((a, b) => {
      let valA, valB;

      if (searchCurrentSortColumn === "full_name") {
        valA = getFullName(a);
        valB = getFullName(b);
      } else if (searchCurrentSortColumn === "phone_number") {
        valA = a.phone_number || "";
        valB = b.phone_number || "";
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

    data.forEach(a => {
      const tr = document.createElement("tr");
      const fullName = `${a.first_name} ${a.last_name}`.trim();
      const hospitalName = a.hospital?.name || "-";

      tr.innerHTML = `
        <td>${fullName}</td>
        <td>${a.created_at || "-"}</td>
        <td>${a.phone_number || "-"}</td>
        <td>${a.email || "-"}</td>
        <td>${hospitalName}</td>
      `;

      tr.addEventListener("click", () => {
        window.location.href = `/admins/${a.id}`;
      });

      searchListBody.appendChild(tr);
    });
  }

  // --- Filter Admins Based on Search and Dropdown Filters ---
  function filterAdmins(query, role, hospital) {
    query = query.toLowerCase();
    return allAdminsData.filter(admin => {
      const matchesQuery =
        (!query || (admin.first_name && admin.first_name.toLowerCase().includes(query)) ||
          (admin.last_name && admin.last_name.toLowerCase().includes(query)) ||
          (admin.email && admin.email.toLowerCase().includes(query)) ||
          (admin.phone_number && admin.phone_number.includes(query)) ||
          (admin.hospital?.name && admin.hospital.name.toLowerCase().includes(query)));

      const matchesRole = !role || (admin.role && admin.role === role);
      const matchesHospital = !hospital || (admin.hospital?.name && admin.hospital.name === hospital);

      return matchesQuery && matchesRole && matchesHospital;
    });
  }

  // --- Perform Search and Apply Filters + Sorting ---
  function performSearch() {
    const mode = localStorage.getItem("adminViewMode") || "cards";
    const query = (searchInput?.value || "").trim();
    const role = adminRoleFilter?.value || "";
    const hospital = adminHospitalFilter?.value || "";
    const sortVal = sortSelect?.value || "creation";

    // Filter admins based on search query and dropdown filters
    let filtered = filterAdmins(query, role, hospital);

    // Sort the filtered admins
    filtered = sortAdmins(filtered, sortVal);

    // Render the results in the selected view mode
    if (mode === "list") {
      renderAllListTable(filtered);
    } else {
      renderAdmins(filtered, sortVal);
    }
  }

  // --- Populate Dropdown Filters ---
  function populateDropdownFilters(admins) {
    if (adminRoleFilter) {
      const uniqueRoles = [...new Set(admins.map(admin => admin.role).filter(role => role))];
      adminRoleFilter.innerHTML = '<option value="">Všetky role</option>';
      uniqueRoles.forEach(role => {
        const option = document.createElement("option");
        option.value = role;
        option.textContent = role;
        adminRoleFilter.appendChild(option);
      });
    }

    if (adminHospitalFilter) {
      const uniqueHospitals = [...new Set(admins.map(admin => admin.hospital?.name).filter(hospital => hospital))];
      adminHospitalFilter.innerHTML = '<option value="">Všetky nemocnice</option>';
      uniqueHospitals.forEach(hospital => {
        const option = document.createElement("option");
        option.value = hospital;
        option.textContent = hospital;
        adminHospitalFilter.appendChild(option);
      });
    }
  }

  async function loadAllAdmins() {
    try {
        const response = await fetch("/admins/list", {
            method: "GET",
            headers: { "Accept": "application/json" },
            credentials: "include"
        });
        if (!response.ok) throw new Error("Chyba pri načítaní adminov.");
        
        const admins = await response.json();
        
        // Log the raw admin data
        console.log("Raw Admins API Response:", admins);
        
        allAdminsData = admins;

        // Populate dropdown filters
        populateDropdownFilters(admins);

        // Render both views
        renderAdmins(admins, sortSelect?.value);
        renderAllListTable(admins);
    } catch (err) {
        console.error(err);
        if (allAdminsList) {
            allAdminsList.innerHTML = `<p>Chyba pri načítaní adminov: ${err.message}</p>`;
        }
    }
  }

  function renderAdmins(admins, sortValue) {
    if (!allAdminsList) return;

    if (!Array.isArray(admins) || admins.length === 0) {
      allAdminsList.innerHTML = "<p>Žiadni admini nenájdení.</p>";
      return;
    }

    const sorted = sortAdmins(admins, sortValue);
    allAdminsList.innerHTML = "";

    const container = document.createElement("div");
    container.classList.add("cards");

    sorted.forEach(a => {
      const hospitalName = a.hospital ? a.hospital.name : "";
      const hospitalStreet = a.hospital ? a.hospital.street : "";
      const hospitalPostal = a.hospital ? a.hospital.postal_code : "";

      const card = document.createElement("div");
      card.classList.add("card");
      card.addEventListener("click", () => {
        window.location.href = `/admins/${a.id}`;
      });

      const name = document.createElement("h3");
      name.textContent = `${a.first_name} ${a.last_name}`;

      const created_at = document.createElement("p");
      created_at.textContent = `Deň vytvorenia: ${formatDate(a.created_at)}`;

      const phone = document.createElement("p");
      phone.textContent = `Telefón: ${a.phone_number}`;

      const email = document.createElement("p");
      email.textContent = `Email: ${a.email}`;

      const hospital = document.createElement("p");
      hospital.textContent = `Nemocnica: ${hospitalName}`;


      card.appendChild(name);
      card.appendChild(created_at)
      card.appendChild(email);
      card.appendChild(phone);
      card.appendChild(hospital);


      container.appendChild(card);
    });

    allAdminsList.appendChild(container);
  }
  function formatDate(dateString) {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString('sk-SK', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  function debounce(func, delay) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), delay);
    };
  }

  const debouncedSearch = debounce(performSearch, 300);
  searchInput?.addEventListener("keyup", debouncedSearch);
  adminRoleFilter?.addEventListener("change", performSearch);
  adminHospitalFilter?.addEventListener("change", performSearch);
  sortSelect?.addEventListener("change", performSearch);

  // -- Event Listeners --
  // Tab switching
  tabAll?.addEventListener("click", () => showTab("all"));
  tabSearch?.addEventListener("click", () => showTab("search"));
  tabAdd?.addEventListener("click", () => {
    showTab("add");
    resetAdminForm();
  });

  // View toggle buttons
  viewCardsBtnAll?.addEventListener("click", () => setViewMode("cards"));
  viewListBtnAll?.addEventListener("click", () => setViewMode("list"));
  viewCardsBtnSearch?.addEventListener("click", () => setViewMode("cards"));
  viewListBtnSearch?.addEventListener("click", () => setViewMode("list"));

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

      performSearch();
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
  const savedMode = localStorage.getItem("adminViewMode") || "cards";
  setViewMode(savedMode);

  // Initial tab
  showTab("all");

  // Load data
  loadAllAdmins();

  // Admin form submission
  const addBtn = document.getElementById("add-admin-btn");
  if (addBtn) {
    addBtn.addEventListener("click", async () => {
      const addMessage = document.getElementById("add-admin-message");
      addMessage.textContent = "";
      addMessage.classList.remove("error", "success");

      const firstName = document.getElementById("admin-first-name").value.trim();
      const lastName = document.getElementById("admin-last-name").value.trim();
      const phone = document.getElementById("admin-phone").value.trim();
      const gender = document.getElementById("admin-gender").value;
      const hospitalCode = document.getElementById("admin-hospital-code").value.trim();
      const email = document.getElementById("admin-email").value.trim();
      const password = document.getElementById("admin-password").value;
      const passwordConfirm = document.getElementById("admin-password-confirm").value;
      const gdprChecked = document.getElementById("gdpr").checked;

      // Validation regex patterns
      const nameRegex = /^[a-zA-ZÀ-ž\s]{2,255}$/; // Allows letters, accents, and spaces (2-255 characters)
      const phoneRegex = /^(?:\+421|421|0)\d{9}$/; // E.164 format for phone numbers

      // Validation checks
      if (!nameRegex.test(firstName)) {
        addMessage.textContent = "Meno musí obsahovať iba písmená a mať dĺžku 2 až 255 znakov.";
        addMessage.classList.add("error");
        return;
      }

      if (!nameRegex.test(lastName)) {
        addMessage.textContent = "Priezvisko musí obsahovať iba písmená a mať dĺžku 2 až 255 znakov.";
        addMessage.classList.add("error");
        return;
      }

      if (!phoneRegex.test(phone)) {
        addMessage.textContent = "Telefónne číslo musí byť vo formáte E.164 (napr. +421123456789).";
        addMessage.classList.add("error");
        return;
      }

      if (!firstName || !lastName || !phone || !gender || !hospitalCode || !email || !password || !passwordConfirm) {
        addMessage.textContent = "Vyplňte všetky polia vrátane emailu a hesla.";
        addMessage.classList.add("error");
        return;
      }

      if (password !== passwordConfirm) {
        addMessage.textContent = "Heslá sa nezhodujú.";
        addMessage.classList.add("error");
        return;
      }

      if (!gdprChecked) {
        addMessage.textContent = "Musíte súhlasiť so spracovaním údajov (GDPR).";
        addMessage.classList.add("error");
        return;
      }

      try {
        const resp = await fetch("/admins/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            first_name: firstName,
            last_name: lastName,
            phone_number: phone,
            gender: gender,
            hospital_code: hospitalCode,
            email: email,
            password: password
          }),
          credentials: "include"
        });

        const data = await resp.json();
        if (!resp.ok) throw new Error(data.error || "Chyba pri vytváraní admina.");

        addMessage.textContent = data.message || "Admin úspešne pridaný.";
        addMessage.classList.add("success");
        resetAdminForm();
        showTab("all");
        loadAllAdmins();
      } catch (err) {
        console.error(err);
        addMessage.textContent = err.message || "Nepodarilo sa pridať admina.";
        addMessage.classList.add("error");
      }
    });
  }
});