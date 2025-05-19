document.addEventListener("DOMContentLoaded", async () => {
  // -- All variables --
  let allTechniciansData = [];
  let userType = "";
  let hospitalsData = []; // New variable to store hospital data

  // For "All" tab sorting
  let allCurrentSortColumn = "full_name"; // Use full_name for A-Z
  let allCurrentSortDirection = "asc";    // Ascending

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

  // Inline error elements
  const firstNameErrorDiv = document.getElementById("technician-first-name-error");
  const lastNameErrorDiv = document.getElementById("technician-last-name-error");
  const hospitalCodeErrorDiv = document.getElementById("technician-hospital-code-error");
  const emailErrorDiv = document.getElementById("technician-email-error");
  const passwordErrorDiv = document.getElementById("technician-password-error");
  const passwordConfirmErrorDiv = document.getElementById("technician-password-confirm-error");
  const gdprErrorDiv = document.getElementById("gdpr-error");

  // Input elements
  const firstNameInput = document.getElementById("technician-first-name");
  const lastNameInput = document.getElementById("technician-last-name");
  const hospitalCodeInput = document.getElementById("technician-hospital-code");
  const emailInput = document.getElementById("technician-email");
  const passwordInput = document.getElementById("technician-password");
  const passwordConfirmInput = document.getElementById("technician-password-confirm");
  const gdprCheckbox = document.getElementById("gdpr");

  // Track which fields have been touched (blurred)
  const touchedFields = {
    firstName: false,
    lastName: false,
    hospitalCode: false,
    email: false,
    password: false,
    passwordConfirm: false,
    gdpr: false
  };

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
    const dropdown = document.getElementById("hospital-filter-dropdown");
    console.log("Hospital Dropdown Found:", dropdown);

    if (!dropdown) {
      console.error("Hospital dropdown not found in the DOM.");
      return;
    }

    // Get a set of hospital IDs present in the technicians list
    const technicianHospitalIds = new Set(
      allTechniciansData
        .filter(technician => technician.hospital && technician.hospital.id) // Ensure hospital exists and has an ID
        .map(technician => technician.hospital.id)
    );

    console.log("Technician Hospital IDs:", technicianHospitalIds);

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

    console.log("Dropdown populated with filtered hospitals:", dropdown);
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
  function setViewMode(mode = "cards") {
    localStorage.setItem("technicianViewMode", mode);

    // Always set sort select to alphabetical-asc when switching views
    if (sortSelect) {
      sortSelect.value = "alphabetical-asc";
    }
    allCurrentSortColumn = "full_name";
    allCurrentSortDirection = "asc";

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

    // Show sort icon on the correct column in list view
    updateSortIcons();

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

  function updateSortIcons() {
    const allHeaderCells = document.querySelectorAll("#all-list-container thead th");
    allHeaderCells.forEach(th => {
      const col = th.getAttribute("data-column");
      th.classList.remove("sort-asc", "sort-desc");
      if (col === allCurrentSortColumn) {
        th.classList.add(allCurrentSortDirection === "asc" ? "sort-asc" : "sort-desc");
      }
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

      updateSortIcons();
      applyFiltersAndSorting();
    });
  });

  // Set initial sort select value to alphabetical-asc
  if (sortSelect) {
    sortSelect.value = "alphabetical-asc";
  }

  // Set initial view mode from localStorage or default to cards
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
      userType = user.user_type;
      const hospitalCodeGroup = document.querySelector('#technician-hospital-code')?.closest('.form-group');

      // Hide hospital filter by default
      if (hospitalFilterDropdown) {
        const hospitalDropdownWrapper = hospitalFilterDropdown.closest(".dropdown") || hospitalFilterDropdown.parentElement;
        if (hospitalDropdownWrapper) hospitalDropdownWrapper.style.display = "none";
      }

      // Show hospital filter only for super_admin
      if (user.user_type === "super_admin") {
        if (hospitalFilterDropdown) {
          const hospitalDropdownWrapper = hospitalFilterDropdown.closest(".dropdown") || hospitalFilterDropdown.parentElement;
          if (hospitalDropdownWrapper) hospitalDropdownWrapper.style.display = "";
        }
      }

      // Hide hospital code input for non-super_admin
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

  // Inline error display functions
  function showError(div, msg) {
    div.textContent = msg;
  }
  function clearError(div) {
    div.textContent = "";
  }

  function validateTechnicianForm(showMainError = false) {
    let isValid = true;
    clearError(firstNameErrorDiv);
    clearError(lastNameErrorDiv);
    clearError(hospitalCodeErrorDiv);
    clearError(emailErrorDiv);
    clearError(passwordErrorDiv);
    clearError(passwordConfirmErrorDiv);
    clearError(gdprErrorDiv);

    const firstNameVal = firstNameInput.value.trim();
    const lastNameVal = lastNameInput.value.trim();
    const hospitalCodeVal = hospitalCodeInput?.value.trim();
    const emailVal = emailInput.value.trim();
    const passwordVal = passwordInput.value;
    const passwordConfirmVal = passwordConfirmInput.value;

    const nameRegex = /^[a-zA-ZÀ-ž\s]{2,255}$/;

    // First name
    if (!firstNameVal) {
      isValid = false;
      if (touchedFields.firstName) showError(firstNameErrorDiv, "Meno je povinné.");
    } else if (!nameRegex.test(firstNameVal)) {
      isValid = false;
      if (touchedFields.firstName) showError(firstNameErrorDiv, "Meno musí obsahovať iba písmená a mať dĺžku 2 až 255 znakov.");
    }

    // Last name
    if (!lastNameVal) {
      isValid = false;
      if (touchedFields.lastName) showError(lastNameErrorDiv, "Priezvisko je povinné.");
    } else if (!nameRegex.test(lastNameVal)) {
      isValid = false;
      if (touchedFields.lastName) showError(lastNameErrorDiv, "Priezvisko musí obsahovať iba písmená a mať dĺžku 2 až 255 znakov.");
    }

    // Hospital code (only for super_admin)
    if (hospitalCodeInput && hospitalCodeInput.offsetParent !== null) {
      if (!hospitalCodeVal) {
        isValid = false;
        if (touchedFields.hospitalCode) showError(hospitalCodeErrorDiv, "Kód nemocnice je povinný.");
      }
    }

    // Email
    if (!emailVal) {
      isValid = false;
      if (touchedFields.email) showError(emailErrorDiv, "Email je povinný.");
    }

    // Password
    if (!passwordVal) {
      isValid = false;
      if (touchedFields.password) showError(passwordErrorDiv, "Heslo je povinné.");
    }

    // Confirm password
    if (!passwordConfirmVal || passwordVal !== passwordConfirmVal) {
      isValid = false;
      if (touchedFields.passwordConfirm) showError(passwordConfirmErrorDiv, "Heslá sa nezhodujú.");
    }

    // GDPR checkbox
    if (!gdprCheckbox.checked) {
      isValid = false;
      if (touchedFields.gdpr) showError(gdprErrorDiv, "Musíte súhlasiť so spracovaním osobných údajov.");
    }

    return isValid;
  }

  // Mark field as touched and validate
  function markTouched(fieldKey) {
    touchedFields[fieldKey] = true;
    validateTechnicianForm();
  }

  // Add blur listeners to mark fields as touched
  firstNameInput.addEventListener("blur", () => markTouched("firstName"));
  lastNameInput.addEventListener("blur", () => markTouched("lastName"));
  if (hospitalCodeInput) hospitalCodeInput.addEventListener("blur", () => markTouched("hospitalCode"));
  emailInput.addEventListener("blur", () => markTouched("email"));
  passwordInput.addEventListener("blur", () => markTouched("password"));
  passwordConfirmInput.addEventListener("blur", () => markTouched("passwordConfirm"));
  gdprCheckbox.addEventListener("blur", () => markTouched("gdpr"));

  // Also validate on input for instant feedback (optional)
  [firstNameInput, lastNameInput, hospitalCodeInput, emailInput, passwordInput, passwordConfirmInput].forEach(input => {
    if (input) input.addEventListener("input", validateTechnicianForm);
  });

  // Also validate on change for instant feedback
  gdprCheckbox.addEventListener("change", validateTechnicianForm);

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

      // Mark all as touched for submit
      Object.keys(touchedFields).forEach(k => touchedFields[k] = true);

      // Validate and show main error if needed
      const isFormOk = validateTechnicianForm(true);
      if (!isFormOk) {
        msg.textContent = "Vyplňte všetky polia správne.";
        msg.classList.add("error");
        return;
      }

      const firstName = document.getElementById("technician-first-name").value.trim();
      const lastName = document.getElementById("technician-last-name").value.trim();
      const email = document.getElementById("technician-email").value.trim();
      const password = document.getElementById("technician-password").value;
      const confirmPassword = document.getElementById("technician-password-confirm").value;
      const hospitalCode = document.getElementById("technician-hospital-code")?.value.trim();
      const gdprChecked = document.getElementById("gdpr")?.checked;

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