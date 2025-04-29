document.addEventListener("DOMContentLoaded", () => {
  // -- All variables --
  let allPatientsData = [];
  let userType = "";
  let allDoctorsData = [];

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
  const allPatientsList = document.getElementById("all-patients-list");

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
  const tabAssign = document.getElementById("tab-assign");

  const tabAllContent = document.getElementById("tab-all-content");
  const tabSearchContent = document.getElementById("tab-search-content");
  const tabAddContent = document.getElementById("tab-add-content");
  const tabAssignContent = document.getElementById("tab-assign-content");

  // Form elements - "Add Patient"
  const sortSelect = document.getElementById("sort-select");
  const allListBody = document.getElementById("all-list-body");
  const searchListBody = document.getElementById("search-list-body");
  const addPatientMessage = document.getElementById("add-patient-message");
  const addPatientForm = document.getElementById("add-patient-form");
  const doctorSelect = document.getElementById("patient-doctor");

  // Polia formulára (Add Patient):
  const firstNameInput = document.getElementById("patient-first-name");
  const lastNameInput = document.getElementById("patient-last-name");
  const phoneInput = document.getElementById("patient-phone");
  const birthDateInput = document.getElementById("patient-birth-date");
  const birthNumberInput = document.getElementById("patient-birth-number");
  const genderSelect = document.getElementById("patient-gender");
  const emailInput = document.getElementById("patient-email");
  const passwordInput = document.getElementById("patient-password");
  const confirmPasswordInput = document.getElementById("patient-password-confirm");
  const gdprCheckbox = document.getElementById("gdpr");
  const addBtn = document.getElementById("add-patient-btn");

  // Polia formualra (Assign Patient):
  const assignPatientForm = document.getElementById("assign-patient-form");
  const assignBirthNumberInput = document.getElementById("assign-birth-number");
  const assignDoctorSelect = document.getElementById("assign-doctor");
  const assignBirthNumberErrorDiv = document.getElementById("assign-birth-number-error");
  const assignPatientMessage = document.getElementById("assign-patient-message");
  const assignBtn = document.getElementById("assign-patient-btn");
  const assignTouchedFields = {
    birthNumber: false,
    doctor: false
  };
  // Error divy
  const firstNameErrorDiv = document.getElementById("patient-first-name-error");
  const lastNameErrorDiv = document.getElementById("patient-last-name-error");
  const phoneErrorDiv = document.getElementById("patient-phone-error");
  const birthDateErrorDiv = document.getElementById("patient-birth-date-error");
  const birthNumberErrorDiv = document.getElementById("patient-birth-number-error");
  const genderErrorDiv = document.getElementById("patient-gender-error");
  const emailErrorDiv = document.getElementById("patient-email-error");
  const passwordErrorDiv = document.getElementById("patient-password-error");
  const confirmPasswordErrorDiv = document.getElementById("patient-password-confirm-error");
  const gdprErrorDiv = document.getElementById("gdpr-error");

  // Ktoré polia boli "dotknuté" (pre zobrazovanie chýb až po vyplnení):
  const touchedFields = {
    firstName: false,
    lastName: false,
    phone: false,
    birthDate: false,
    birthNumber: false,
    gender: false,
    email: false,
    password: false,
    confirmPassword: false,
    gdpr: false
  };
  tabAll?.addEventListener("click", () => showTab("all"));
  tabSearch?.addEventListener("click", () => showTab("search"));
  tabAdd?.addEventListener("click", () => {
    showTab("add");
    resetPatientForm();
  });
  tabAssign?.addEventListener("click", () => {
    showTab("assign");
    resetAssignForm();
  });

  viewCardsBtnAll?.addEventListener("click", () => setViewMode("cards"));
  viewListBtnAll?.addEventListener("click", () => setViewMode("list"));
  viewCardsBtnSearch?.addEventListener("click", () => setViewMode("cards"));
  viewListBtnSearch?.addEventListener("click", () => setViewMode("list"));


  // Setup password toggle functionality
  function setupPasswordToggle(inputId, toggleId) {
    const input = document.getElementById(inputId);
    const toggle = document.getElementById(toggleId);

    if (input && toggle) {
      toggle.addEventListener("click", () => {
        const isHidden = input.type === "password";
        input.type = isHidden ? "text" : "password";
        toggle.innerHTML = `<i class="fas ${isHidden ? "fa-eye" : "fa-eye-slash"}"></i>`;
      });
    }
  }
  setupPasswordToggle("patient-password", "toggle-password");
  setupPasswordToggle("patient-password-confirm", "toggle-password-confirm");

  // HELPER: show / clear error
  function showError(div, msg) {
    div.textContent = msg;
    div.classList.add("active");
  }
  function clearError(div) {
    div.textContent = "";
    div.classList.remove("active");
  }

  // Pomocná funkcia na validáciu (voláme pri blur, input, ...):
  function validateAddPatientForm() {
    let isValid = true;

    // Vyresetovať všetky error divy
    clearError(firstNameErrorDiv);
    clearError(lastNameErrorDiv);
    clearError(phoneErrorDiv);
    clearError(birthDateErrorDiv);
    clearError(birthNumberErrorDiv);
    clearError(genderErrorDiv);
    clearError(emailErrorDiv);
    clearError(passwordErrorDiv);
    clearError(confirmPasswordErrorDiv);
    clearError(gdprErrorDiv);

    const firstNameVal = firstNameInput.value.trim();
    const lastNameVal = lastNameInput.value.trim();
    const phoneVal = phoneInput.value.trim();
    const birthDateVal = birthDateInput.value; // date
    const birthNumberVal = birthNumberInput.value.trim();
    const genderVal = genderSelect.value;
    const emailVal = emailInput.value.trim();
    const passwordVal = passwordInput.value;
    const confirmPasswordVal = confirmPasswordInput.value;
    const isGdprChecked = gdprCheckbox.checked;

    // 1. Meno
    if (!firstNameVal) {
      isValid = false;
      if (touchedFields.firstName) {
        showError(firstNameErrorDiv, "Meno je povinné.");
      }
    }

    // 2. Priezvisko
    if (!lastNameVal) {
      isValid = false;
      if (touchedFields.lastName) {
        showError(lastNameErrorDiv, "Priezvisko je povinné.");
      }
    }

    // 3. Telefón (iba čísla)
    if (!phoneVal) {
      isValid = false;
      if (touchedFields.phone) {
        showError(phoneErrorDiv, "Telefón je povinný.");
      }
    } else if (!/^\d+$/.test(phoneVal)) {
      isValid = false;
      if (touchedFields.phone) {
        showError(phoneErrorDiv, "Telefónne číslo musí obsahovať iba čísla.");
      }
    }

    // 4. Dátum narodenia – nesmie byť v budúcnosti a nie staršie ako 150 r.
    if (!birthDateVal) {
      isValid = false;
      if (touchedFields.birthDate) {
        showError(birthDateErrorDiv, "Dátum narodenia je povinný.");
      }
    } else {
      const enteredDate = new Date(birthDateVal);
      const now = new Date();
      const oldestAllowed = new Date();
      oldestAllowed.setFullYear(oldestAllowed.getFullYear() - 150);

      if (enteredDate > now) {
        isValid = false;
        if (touchedFields.birthDate) {
          showError(birthDateErrorDiv, "Dátum narodenia nemôže byť v budúcnosti.");
        }
      } else if (enteredDate < oldestAllowed) {
        isValid = false;
        if (touchedFields.birthDate) {
          showError(birthDateErrorDiv, "Dátum narodenia je príliš starý.");
        }
      }
    }

    // 5. Rodné číslo (######/####)
    if (!birthNumberVal) {
      isValid = false;
      if (touchedFields.birthNumber) {
        showError(birthNumberErrorDiv, "Rodné číslo je povinné.");
      }
    } else if (!/^\d{6}\/\d{4}$/.test(birthNumberVal)) {
      isValid = false;
      if (touchedFields.birthNumber) {
        showError(birthNumberErrorDiv, "Rodné číslo musí byť vo formáte ######/####");
      }
    }

    // 6. Pohlavie
    if (!genderVal) {
      isValid = false;
      if (touchedFields.gender) {
        showError(genderErrorDiv, "Vyberte pohlavie.");
      }
    }

    // 7. Email
    if (!emailVal) {
      isValid = false;
      if (touchedFields.email) {
        showError(emailErrorDiv, "Email je povinný.");
      }
    }

    // 8. Password
    if (!passwordVal) {
      isValid = false;
      if (touchedFields.password) {
        showError(passwordErrorDiv, "Heslo je povinné.");
      }
    }

    // 9. Confirm password (zhoda s password)
    if (!confirmPasswordVal || passwordVal !== confirmPasswordVal) {
      isValid = false;
      if (touchedFields.confirmPassword) {
        showError(confirmPasswordErrorDiv, "Heslá sa nezhodujú.");
      }
    }

    // 10. GDPR
    if (!isGdprChecked) {
      isValid = false;
      if (touchedFields.gdpr) {
        showError(gdprErrorDiv, "Musíte súhlasiť s GDPR.");
      }
    }

    addBtn.disabled = !isValid;
    return isValid;
  }

  function validateAssignForm() {
    let isValid = true;

    // Reset error messages
    clearError(assignBirthNumberErrorDiv);

    const birthNumberVal = assignBirthNumberInput.value.trim();
    const doctorVal = assignDoctorSelect.value;

    // Validate birth number (format ######/####)
    if (!birthNumberVal) {
      isValid = false;
      if (assignTouchedFields.birthNumber) {
        showError(assignBirthNumberErrorDiv, "Rodné číslo je povinné.");
      }
    } else if (!/^\d{6}\/\d{4}$/.test(birthNumberVal)) {
      isValid = false;
      if (assignTouchedFields.birthNumber) {
        showError(assignBirthNumberErrorDiv, "Rodné číslo musí byť vo formáte ######/####");
      }
    }

    // Validate doctor selection
    if (!doctorVal && ["super_admin", "admin"].includes(userType)) {
      isValid = false;
      if (assignTouchedFields.doctor) {
        // Note: No specific error div for doctor select in the HTML
        assignPatientMessage.textContent = "Vyberte doktora.";
        assignPatientMessage.classList.add("error");
      }
    }

    // Enable/disable assign button
    assignBtn.disabled = !isValid;
    return isValid;
  }

  // Add event listeners to mark fields as touched
  assignBirthNumberInput.addEventListener("blur", () => {
    assignTouchedFields.birthNumber = true;
    validateAssignForm();
  });

  assignDoctorSelect.addEventListener("change", () => {
    assignTouchedFields.doctor = true;
    validateAssignForm();
  });

  // Format birth number as the user types (######/####)
  assignBirthNumberInput.addEventListener("input", () => {
    let val = assignBirthNumberInput.value.replace(/\D/g, "");
    if (val.length > 6) {
      val = val.substring(0, 6) + "/" + val.substring(6, 10);
    }
    assignBirthNumberInput.value = val;
    validateAssignForm();
  });

  // Mark field as touched
  function markTouched(fieldKey) {
    touchedFields[fieldKey] = true;
    validateAddPatientForm();
  }

  // Pridáme event listeners:
  firstNameInput.addEventListener("blur", () => markTouched("firstName"));
  lastNameInput.addEventListener("blur", () => markTouched("lastName"));
  phoneInput.addEventListener("blur", () => markTouched("phone"));
  birthDateInput.addEventListener("blur", () => markTouched("birthDate"));
  birthNumberInput.addEventListener("blur", () => markTouched("birthNumber"));
  genderSelect.addEventListener("change", () => markTouched("gender"));
  emailInput.addEventListener("blur", () => markTouched("email"));
  passwordInput.addEventListener("blur", () => markTouched("password"));
  confirmPasswordInput.addEventListener("blur", () => markTouched("confirmPassword"));
  gdprCheckbox.addEventListener("change", () => markTouched("gdpr"));

  // Automatické formátovanie rodného čísla
  birthNumberInput.addEventListener("input", () => {
    let val = birthNumberInput.value.replace(/\D/g, "");
    if (val.length > 6) {
      val = val.substring(0, 6) + "/" + val.substring(6, 10);
    }
    birthNumberInput.value = val;
    validateAddPatientForm();
  });

  // Reset patient form
  function resetPatientForm() {
    if (addPatientForm) {
      addPatientForm.reset();
    }
    addPatientMessage.textContent = "";
    addPatientMessage.classList.remove("error", "success");

    // Vyresetuj aj touched fields
    Object.keys(touchedFields).forEach(k => touchedFields[k] = false);
    // A hneď skontrolujeme
    validateAddPatientForm();
  }


  function resetAssignForm() {
    if (assignPatientForm) {
      assignPatientForm.reset();
    }
    assignPatientMessage.textContent = "";
    assignPatientMessage.classList.remove("error", "success");

    // Reset touched fields
    Object.keys(assignTouchedFields).forEach(k => assignTouchedFields[k] = false);
    validateAssignForm();
  }

  // -- View mode toggle function --
  function setViewMode(mode) {
    localStorage.setItem("patientViewMode", mode);

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
    renderAllListTable(allPatientsData);
    renderPatients(allPatientsData, sortSelect?.value);
    performSearch(); // Re-render search results
  }

  // Tab switching function
  function showTab(tab) {
    tabAll?.classList.remove("active");
    tabSearch?.classList.remove("active");
    tabAdd?.classList.remove("active");
    tabAssign?.classList.remove("active");

    tabAllContent?.classList.add("hidden");
    tabSearchContent?.classList.add("hidden");
    tabAddContent?.classList.add("hidden");
    tabAssignContent?.classList.add("hidden");

    if (tab === "all") {
      tabAll?.classList.add("active");
      tabAllContent?.classList.remove("hidden");
    } else if (tab === "search") {
      tabSearch?.classList.add("active");
      tabSearchContent?.classList.remove("hidden");
    } else if (tab === "add") {
      tabAdd?.classList.add("active");
      tabAddContent?.classList.remove("hidden");
      resetPatientForm(); // Po každom prekliku do "add" formulára ho resetneme.
    } else if (tab === "assign") {
    tabAssign?.classList.add("active");
    tabAssignContent?.classList.remove("hidden");
    resetAssignForm();
  }
  }

  // Helper function to get full name
  function getFullName(patient) {
    return `${patient.first_name || ""} ${patient.last_name || ""}`.trim().toLowerCase();
  }

  // Patient sorting function
  function sortPatients(patients, sortValue = "creation") {
    let sorted = [...patients];

    if (sortValue === "alphabetical-asc") {
      sorted.sort((a, b) => getFullName(a).localeCompare(getFullName(b)));
    } else if (sortValue === "alphabetical-desc") {
      sorted.sort((a, b) => getFullName(b).localeCompare(getFullName(a)));
    } else if (sortValue === "newest") {
      sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else {
      // "creation" - starší -> novší
      sorted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    }

    return sorted;
  }

  function formatDate(dateString) {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("sk-SK", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  }

  // Render all list table with fixed sorting
  function renderAllListTable(patients) {
    if (!allListBody) return;
    allListBody.innerHTML = "";

    if (!Array.isArray(patients) || patients.length === 0) {
      return; // Empty
    }

    let data = [...patients];
    data.sort((a, b) => {
      let valA, valB;

      if (allCurrentSortColumn === "full_name") {
        valA = getFullName(a);
        valB = getFullName(b);
      } else if (allCurrentSortColumn === "phone_number") {
        valA = a.phone_number || "";
        valB = b.phone_number || "";
      } else if (allCurrentSortColumn === "doctor") {
        valA = a.doctor_name || "";
        valB = b.doctor_name || "";
      } else if (allCurrentSortColumn === "hospital") {
        valA = a.hospital_name || "";
        valB = b.hospital_name || "";
      } else {
        valA = (a[allCurrentSortColumn] || "").toString();
        valB = (b[allCurrentSortColumn] || "").toString();
      }

      return allCurrentSortDirection === "asc"
        ? valA.localeCompare(valB, "sk")
        : valB.localeCompare(valA, "sk");
    });

    data.forEach(p => {
      const tr = document.createElement("tr");
      const fullName = `${p.first_name} ${p.last_name}`.trim();
      tr.innerHTML = `
        <td>${fullName}</td>
        <td>${formatDate(p.created_at) || "-"}</td>
        <td>${p.phone_number || "-"}</td>
        <td>${p.email || "-"}</td>
        <td>${p.doctor_name || "-"}</td>
        <td>${p.hospital_name || "-"}</td>
      `;
      tr.addEventListener("click", () => {
        window.location.href = `/patients/${p.id}`;
      });
      allListBody.appendChild(tr);
    });
  }

  // Search list table rendering with fixed sorting
  function renderSearchListTable(patients) {
    if (!searchListBody) return;
    searchListBody.innerHTML = "";

    if (!Array.isArray(patients) || patients.length === 0) {
      return;
    }

    let data = [...patients];
    data.sort((a, b) => {
      let valA, valB;

      if (searchCurrentSortColumn === "full_name") {
        valA = getFullName(a);
        valB = getFullName(b);
      } else if (searchCurrentSortColumn === "phone_number") {
        valA = a.phone_number || "";
        valB = b.phone_number || "";
      } else if (searchCurrentSortColumn === "doctor") {
        valA = a.doctor_name || "";
        valB = b.doctor_name || "";
      } else if (searchCurrentSortColumn === "hospital") {
        valA = a.hospital_name || "";
        valB = b.hospital_name || "";
      } else {
        valA = (a[searchCurrentSortColumn] || "").toString();
        valB = (b[searchCurrentSortColumn] || "").toString();
      }

      return searchCurrentSortDirection === "asc"
        ? valA.localeCompare(valB, "sk")
        : valB.localeCompare(valA, "sk");
    });

    data.forEach(p => {
      const tr = document.createElement("tr");
      const fullName = `${p.first_name} ${p.last_name}`.trim();
      tr.innerHTML = `
        <td>${fullName}</td>
        <td>${formatDate(p.created_at) || "-"}</td>
        <td>${p.phone_number || "-"}</td>
        <td>${p.email || "-"}</td>
        <td>${p.doctor_name || "-"}</td>
        <td>${p.hospital_name || "-"}</td>
      `;
      tr.addEventListener("click", () => {
        window.location.href = `/patients/${p.id}`;
      });
      searchListBody.appendChild(tr);
    });
  }

  // Card view rendering (ALL)
  function renderPatients(patients, sortValue) {
    if (!allPatientsList) return;
    if (!Array.isArray(patients) || patients.length === 0) {
      allPatientsList.innerHTML = "<p>Žiadni pacienti nenájdení.</p>";
      return;
    }

    const sorted = sortPatients(patients, sortValue);
    allPatientsList.innerHTML = "";

    const container = document.createElement("div");
    container.classList.add("cards");

    sorted.forEach(p => {
      const card = document.createElement("div");
      card.classList.add("card");
      card.addEventListener("click", () => {
        window.location.href = `/patients/${p.id}`;
      });

      const name = document.createElement("h3");
      name.textContent = `${p.first_name} ${p.last_name}`;

      const created_at = document.createElement("p");
      created_at.textContent = `Deň vytvorenia: ${formatDate(p.created_at)}`;

      const phone = document.createElement("p");
      phone.textContent = `Telefón: ${p.phone_number}`;

      const email = document.createElement("p");
      email.textContent = `Email: ${p.email}`;

      const doctor = document.createElement("p");
      doctor.textContent = `Doktor: ${p.doctor_name || "-"}`;

      const hospital = document.createElement("p");
      hospital.textContent = `Nemocnica: ${p.hospital_name || "-"}`;

      card.appendChild(name);
      card.appendChild(created_at);
      card.appendChild(phone);
      card.appendChild(email);
      card.appendChild(doctor);
      card.appendChild(hospital);

      container.appendChild(card);
    });

    allPatientsList.appendChild(container);
  }

  // Search function
  function performSearch() {
    const query = searchInput?.value.trim().toLowerCase();
    const mode = localStorage.getItem("patientViewMode") || "cards";
    if (searchResults) {
      searchResults.innerHTML = "";
    }
    if (!query) {
      // Ak je query prázdne, vymažeme obsah listu, aby neostali staré výsledky
      if (searchListBody) searchListBody.innerHTML = "";
      return;
    }

    const filtered = allPatientsData.filter(p => {
      const fullName = `${p.first_name} ${p.last_name}`.toLowerCase();
      return (
        p.first_name?.toLowerCase().includes(query) ||
        p.last_name?.toLowerCase().includes(query) ||
        p.phone_number?.includes(query) ||
        fullName.includes(query) ||
        p.doctor_name?.toLowerCase().includes(query) ||
        p.hospital_name?.toLowerCase().includes(query)
      );
    });

    const sortValue = searchSortSelect?.value || "creation";

    if (mode === "list") {
      renderSearchListTable(filtered);
    } else {
      // Cards
      const sortedFiltered = sortPatients(filtered, sortValue);

      if (sortedFiltered.length === 0 && searchResults) {
        searchResults.innerHTML = `<p>Pre "${query}" neboli nájdené žiadne výsledky.</p>`;
        return;
      }

      const container = document.createElement("div");
      container.classList.add("cards");

      sortedFiltered.forEach(p => {
        const card = document.createElement("div");
        card.classList.add("card");
        card.addEventListener("click", () => {
          window.location.href = `/patients/${p.id}`;
        });

        const name = document.createElement("h3");
        name.textContent = `${p.first_name} ${p.last_name}`;

        const phone = document.createElement("p");
        phone.textContent = `Telefón: ${p.phone_number}`;

        const email = document.createElement("p");
        email.textContent = `Email: ${p.email}`;

        const doctor = document.createElement("p");
        doctor.textContent = `Doktor: ${p.doctor_name || "-"}`;

        const hospital = document.createElement("p");
        hospital.textContent = `Nemocnica: ${p.hospital_name || "-"}`;

        card.appendChild(name);
        card.appendChild(phone);
        card.appendChild(email);
        card.appendChild(doctor);
        card.appendChild(hospital);
        container.appendChild(card);
      });

      if (searchResults) {
        searchResults.appendChild(container);
      }
    }
  }

  // Debounce pre vyhľadávanie
  function debounce(func, delay) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), delay);
    };
  }
  const debouncedSearch = debounce(performSearch, 300);
  searchInput?.addEventListener("keyup", debouncedSearch);
  searchSortSelect?.addEventListener("change", performSearch);
  sortSelect?.addEventListener("change", () => {
    renderPatients(allPatientsData, sortSelect.value);
  });

  // Table header sorting (ALL)
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

      renderAllListTable(allPatientsData);
    });
  });

  // Table header sorting (SEARCH)
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
  const savedMode = localStorage.getItem("patientViewMode") || "cards";
  setViewMode(savedMode);

  // Initial tab
  showTab("all");

  // Load data
  async function loadAllPatients() {
    try {
      const response = await fetch("/patients/list", {
        method: "GET",
        headers: { "Accept": "application/json" },
        credentials: "include"
      });
      if (!response.ok) throw new Error("Chyba pri načítaní pacientov.");
      const patients = await response.json();
      allPatientsData = patients;

      // Render both views
      renderPatients(patients, sortSelect?.value);
      renderAllListTable(patients);
    } catch (err) {
      console.error(err);
      if (allPatientsList) {
        allPatientsList.innerHTML = `<p>Chyba pri načítaní pacientov: ${err.message}</p>`;
      }
    }
  }
  async function loadDoctors() {
    try {
      const response = await fetch("/doctors/list", {
        method: "GET",
        headers: { "Accept": "application/json" },
        credentials: "include"
      });
      if (!response.ok) throw new Error("Chyba pri načítaní doktorov.");

      allDoctorsData = await response.json();
      if (doctorSelect) {
        doctorSelect.innerHTML = '<option value="" selected>Vyberte doktora (voliteľné)</option>';
        allDoctorsData.forEach(doctor => {
          const option = document.createElement("option");
          option.value = doctor.id;
          option.textContent = `${doctor.title || ""} ${doctor.first_name} ${doctor.last_name} (${doctor.hospital?.name || "Bez nemocnice"})`;
          doctorSelect.appendChild(option);
        });
      }
      if (assignDoctorSelect) {
      assignDoctorSelect.innerHTML = '<option value="" selected>Vyberte doktora</option>';
      allDoctorsData.forEach(doctor => {
        const option = document.createElement("option");
        option.value = doctor.id;
        option.textContent = `${doctor.title || ""} ${doctor.first_name} ${doctor.last_name} (${doctor.hospital?.name || "Bez nemocnice"})`;
        assignDoctorSelect.appendChild(option);
      });
    }
    } catch (err) {
      console.error("Chyba pri načítaní doktorov:", err);
    }
  }
  async function checkUserTypeAndAdjustForm() {
    try {
      const response = await fetch("/settings/info", {
        method: "GET",
        headers: { "Accept": "application/json" },
        credentials: "include"
      });

      if (!response.ok) throw new Error("Failed to fetch user type");

      const user = await response.json();
      userType = user.user_type;

      const addDoctor = document.querySelector('#patient-doctor')?.closest('.form-group');
      const assignDoctor = document.querySelector('#assign-doctor')?.closest('.form-group');

      if (addDoctor && !["super_admin", "admin"].includes(user.user_type)) {
        addDoctor.style.display = "none";
      }
      if (assignDoctor && ["super_admin", "admin"].includes(user.user_type)) {
        loadDoctors();
      }
      if (assignDoctor && !["super_admin", "admin"].includes(user.user_type)) {
        assignDoctor.style.display = "none";
      }

      // Zviditeľni všetko označené ako hidden-js
      setTimeout(() => {
        document.querySelectorAll(".hidden-js").forEach(el => {
          el.style.visibility = "visible";
          el.style.opacity = "1";
          el.classList.remove("hidden-js");
        });
      }, 10);

    } catch (error) {
      console.error("Error checking user type:", error);
    }
  }


  loadAllPatients();
  checkUserTypeAndAdjustForm();

  // Submit new patient
  addBtn.addEventListener("click", async () => {
    addPatientMessage.textContent = "";
    addPatientMessage.classList.remove("error", "success");

    // Skontrolujeme ešte raz, či je form OK:
    touchedFields.firstName = true;
    touchedFields.lastName = true;
    touchedFields.phone = true;
    touchedFields.birthDate = true;
    touchedFields.birthNumber = true;
    touchedFields.gender = true;
    touchedFields.email = true;
    touchedFields.password = true;
    touchedFields.confirmPassword = true;
    touchedFields.gdpr = true;

    const isFormOk = validateAddPatientForm();
    if (!isFormOk) {
      addPatientMessage.textContent = "Vyplňte všetky polia správne.";
      addPatientMessage.classList.add("error");
      return;
    }

    // Ak všetko sedí, odosielame
    const bodyPayload = {
      first_name: firstNameInput.value.trim(),
      last_name: lastNameInput.value.trim(),
      phone_number: phoneInput.value.trim(),
      birth_date: birthDateInput.value,
      birth_number: birthNumberInput.value.trim(),
      gender: genderSelect.value,
      doctor_id: doctorSelect.value || null,
      email: emailInput.value.trim(),
      password: passwordInput.value
    };

    try {
      const resp = await fetch("/patients/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload),
        credentials: "include"
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Chyba pri vytváraní pacienta.");

      addPatientMessage.textContent = data.message || "Pacient úspešne pridaný.";
      addPatientMessage.classList.add("success");
      resetPatientForm();
      // Prepneme sa do ALL tab
      showTab("all");
      // Reload zoznamu
      loadAllPatients();
    } catch (err) {
      console.error(err);
      addPatientMessage.textContent = err.message || "Nepodarilo sa pridať pacienta.";
      addPatientMessage.classList.add("error");
    }
  });

  // Submit assign patient form
  assignBtn.addEventListener("click", async () => {
    assignPatientMessage.textContent = "";
    assignPatientMessage.classList.remove("error", "success");
    console.log("Stalcitl")
    // Mark all fields as touched for validation
    assignTouchedFields.birthNumber = true;
    assignTouchedFields.doctor = true;

    const isFormOk = validateAssignForm();
    if (!isFormOk) {
      assignPatientMessage.textContent = "Vyplňte všetky polia správne.";
      assignPatientMessage.classList.add("error");
      return;
    }

    // Send request
    const bodyPayload = {
      birth_number: assignBirthNumberInput.value.trim(),
      doctor_id: assignDoctorSelect.value
    };

    try {
      const resp = await fetch("/patients/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload),
        credentials: "include"
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Chyba pri priraďovaní pacienta.");

      assignPatientMessage.textContent = data.message || "Pacient úspešne priradený.";
      assignPatientMessage.classList.add("success");
      resetAssignForm();
      // Switch to ALL tab and reload
      showTab("all");
      loadAllPatients();
    } catch (err) {
      console.error(err);
      assignPatientMessage.textContent = err.message || "Nepodarilo sa priradiť pacienta.";
      assignPatientMessage.classList.add("error");
    }
  });
});
