document.addEventListener("DOMContentLoaded", async () => {
  // -- All variables --
  let allTechniciansData = [];
  let userType = "";
  let hospitalsData = []; // New variable to store hospital data

  // For "All" tab sorting
  let allCurrentSortColumn = "last_name";
  let allCurrentSortDirection = "asc";

  // DOM elements for view toggles
  const viewCardsBtnAll = document.getElementById("view-cards");
  const viewListBtnAll = document.getElementById("view-list");
  const allCardsContainer = document.getElementById("all-cards-container");
  const allListContainer = document.getElementById("all-list-container");
  const sortOptionsAll = document.getElementById("sort-options-all");
  const allList = document.getElementById("all-technicians-list");

  // Tab elements
  const tabAll = document.getElementById("tab-all");
  const tabAdd = document.getElementById("tab-add");

  const tabAllContent = document.getElementById("tab-all-content");
  const tabAddContent = document.getElementById("tab-add-content");

  // Form and list elements
  const sortSelect = document.getElementById("sort-select");
  const allListBody = document.getElementById("all-list-body");
  const searchInput = document.getElementById("search-input"); // Search bar in All Tab
  const hospitalDropdown = document.getElementById("hospital-dropdown"); // New dropdown for hospitals
  const hospitalFilterDropdown = document.getElementById("hospital-filter-dropdown");

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

  // Populate hospital dropdown
  function populateHospitalDropdown() {
    const dropdown = document.getElementById("hospital-filter-dropdown"); // Use the exact ID
    console.log("Dropdown found:", dropdown); // Debugging

    if (!dropdown || !Array.isArray(hospitalsData) || !Array.isArray(allTechniciansData)) {
      console.warn("Dropdown not found or invalid data.");
      return;
    }

    // Get a set of hospital IDs present in the technicians list
    const technicianHospitalIds = new Set(
      allTechniciansData
        .filter(technician => technician.hospital?.id) // Ensure the technician has a hospital ID
        .map(technician => technician.hospital.id)
    );

    console.log("Technician Hospital IDs:", technicianHospitalIds); // Debugging

    // Filter hospitals based on the IDs in the technicians list
    const filteredHospitals = hospitalsData.filter(hospital =>
      technicianHospitalIds.has(hospital.id)
    );

    dropdown.innerHTML = '<option value="">Všetky nemocnice</option>'; // Default option
    filteredHospitals.forEach(hospital => {
      const option = document.createElement("option");
      option.value = hospital.id;
      option.textContent = hospital.name;
      dropdown.appendChild(option);
    });

    console.log("Dropdown populated with filtered hospitals:", dropdown); // Debugging
  }

  // Fetch hospitals data
  async function loadHospitals() {
    try {
      console.log("Fetching hospitals..."); // Debugging
      const response = await fetch("/hospitals/list", {
        method: "GET",
        headers: { "Accept": "application/json" },
        credentials: "include"
      });
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      
      hospitalsData = await response.json();
      console.log("Hospitals Data:", hospitalsData); // Debugging

      if (!Array.isArray(hospitalsData) || hospitalsData.length === 0) {
        console.warn("No hospitals found or invalid data format.");
      }

      populateHospitalDropdown(); // Populate dropdown after fetching data
    } catch (err) {
      console.error("Failed to load hospitals:", err);
    }
  }

  // -- View mode toggle function --
  function setViewMode(mode) {
    localStorage.setItem("technicianViewMode", mode);

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

    // Re-render views with current filters and sorting
    applyFiltersAndSorting();
  }

  function showTab(tab) {
    tabAll?.classList.remove("active");
    tabAdd?.classList.remove("active");

    tabAllContent?.classList.add("hidden");
    tabAddContent?.classList.add("hidden");

    if (tab === "all") {
      tabAll?.classList.add("active");
      tabAllContent?.classList.remove("hidden");
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

  // Centralized filtering and sorting
  function applyFiltersAndSorting() {
    const searchQuery = searchInput?.value.trim().toLowerCase();
    const selectedHospitalId = parseInt(hospitalFilterDropdown?.value, 10);
    const sortValue = sortSelect?.value || "creation";

    let filteredTechnicians = allTechniciansData.filter(technician => {
      const fullName = `${technician.first_name} ${technician.last_name}`.toLowerCase();
      const email = technician.email?.toLowerCase() || "";
      const hospitalName = technician.hospital?.name?.toLowerCase() || "";

      const matchesSearch = !searchQuery || 
        fullName.includes(searchQuery) || 
        email.includes(searchQuery) || 
        hospitalName.includes(searchQuery);

      const matchesHospital = !selectedHospitalId || technician.hospital?.id === selectedHospitalId;

      return matchesSearch && matchesHospital;
    });

    filteredTechnicians = sortTechnicians(filteredTechnicians, sortValue);

    renderAllListTable(filteredTechnicians);
    renderTechnicians(filteredTechnicians, sortValue);
  }

  // Render all list table
  function renderAllListTable(technicians) {
    if (!allListBody) return;
    allListBody.innerHTML = "";

    if (!Array.isArray(technicians) || technicians.length === 0) {
      allListBody.innerHTML = "<tr><td colspan='4'>Žiadni technici nenájdení.</td></tr>";
      return;
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

  // Event listeners
  tabAll?.addEventListener("click", () => showTab("all"));
  tabAdd?.addEventListener("click", () => {
    showTab("add");
    resetTechnicianForm();
  });

  // View toggle buttons
  viewCardsBtnAll?.addEventListener("click", () => setViewMode("cards"));
  viewListBtnAll?.addEventListener("click", () => setViewMode("list"));

  // Search bar event listener
  searchInput?.addEventListener("input", applyFiltersAndSorting);

  // Hospital filter dropdown event listener
  hospitalFilterDropdown?.addEventListener("change", applyFiltersAndSorting);

  // Sorting dropdown event listener
  sortSelect?.addEventListener("change", applyFiltersAndSorting);

  // Column sorting event listener
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

      applyFiltersAndSorting();
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
    } else if (sortValue === "hospital") {
      sorted.sort((a, b) => {
        const valA = (a.hospital?.name || "").toLowerCase();
        const valB = (b.hospital?.name || "").toLowerCase();
        return valA.localeCompare(valB);
      });
    } else { // Default: "creation" - older to newer
      sorted.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
        const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
        return dateA - dateB;
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

  // Initial setup
  showTab("all");
  await loadAllTechnicians(); // Load technicians first
  await loadHospitals(); // Load hospitals
  populateHospitalDropdown(); // Populate dropdown with filtered hospitals
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

      // Validation regex patterns
      const nameRegex = /^[a-zA-ZÀ-ž\s]{2,255}$/; // Allows letters, accents, and spaces (2-255 characters)

      // Validation checks
      if (!nameRegex.test(firstName)) {
        msg.textContent = "Meno musí obsahovať iba písmená a mať dĺžku 2 až 255 znakov.";
        msg.classList.add("error");
        return;
      }

      if (!nameRegex.test(lastName)) {
        msg.textContent = "Priezvisko musí obsahovať iba písmená a mať dĺžku 2 až 255 znakov.";
        msg.classList.add("error");
        return;
      }

      if (!email || !password || !confirmPassword || (!hospitalCode && userType === "super_admin")) {
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

  hospitalFilterDropdown?.addEventListener("change", applyFiltersAndSorting);
});