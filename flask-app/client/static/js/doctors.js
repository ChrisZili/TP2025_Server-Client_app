document.addEventListener("DOMContentLoaded", () => {
  // -- All variables --
  let allDoctorsData = [];
  let currentSortColumn = "full_name"; // Default sort column for A-Z
  let currentSortDirection = "asc";    // Default sort direction
  let userType = "";

  // DOM elements
  const searchInput = document.getElementById("search-input");
  const sortSelect = document.getElementById("sort-select");
  const allListBody = document.getElementById("all-list-body");
  const allDoctorsList = document.getElementById("all-doctors-cards");
  const hospitalFilter = document.getElementById("doctor-hospital-filter");
  const viewCardsBtn = document.getElementById("view-cards");
  const viewListBtn = document.getElementById("view-list");
  const allCardsContainer = document.getElementById("all-cards-container");
  const allListContainer = document.getElementById("all-list-container");
  const tableHeaders = document.querySelectorAll("#all-list-container thead th");
  const addDoctorBtn = document.getElementById("add-doctor-btn");
  const addDoctorMessage = document.getElementById("add-doctor-message");
  const addDoctorForm = document.getElementById("add-doctor-form");

  // Tab elements
  const tabAll = document.getElementById("tab-all");
  const tabAdd = document.getElementById("tab-add");
  const tabAllContent = document.getElementById("tab-all-content");
  const tabAddContent = document.getElementById("tab-add-content");

  // Inline error elements
  const doctorTypeErrorDiv = document.getElementById("doctor-type-error");
  const firstNameErrorDiv = document.getElementById("doctor-first-name-error");
  const lastNameErrorDiv = document.getElementById("doctor-last-name-error");
  const phoneErrorDiv = document.getElementById("doctor-phone-error");
  const genderErrorDiv = document.getElementById("doctor-gender-error");
  const titleErrorDiv = document.getElementById("doctor-title-error");
  const suffixErrorDiv = document.getElementById("doctor-suffix-error");
  const hospitalCodeErrorDiv = document.getElementById("doctor-hospital-code-error");
  const emailErrorDiv = document.getElementById("doctor-email-error");
  const passwordErrorDiv = document.getElementById("doctor-password-error");
  const passwordConfirmErrorDiv = document.getElementById("doctor-password-confirm-error");
  const gdprErrorDiv = document.getElementById("doctor-gdpr-error");

  // Input elements
  const doctorTypeInput = document.getElementById("doctor-type");
  const firstNameInput = document.getElementById("doctor-first-name");
  const lastNameInput = document.getElementById("doctor-last-name");
  const phoneInput = document.getElementById("doctor-phone");
  const genderInput = document.getElementById("doctor-gender");
  const titleInput = document.getElementById("doctor-title");
  const suffixInput = document.getElementById("doctor-suffix");
  const hospitalCodeInput = document.getElementById("doctor-hospital-code");
  const emailInput = document.getElementById("doctor-email");
  const passwordInput = document.getElementById("doctor-password");
  const passwordConfirmInput = document.getElementById("doctor-password-confirm");
  const gdprCheckbox = document.getElementById("gdpr");

  // Track which fields have been touched (blurred)
  const touchedFields = {
    doctorType: false,
    firstName: false,
    lastName: false,
    phone: false,
    gender: false,
    title: false,
    suffix: false,
    hospitalCode: false,
    email: false,
    password: false,
    passwordConfirm: false,
    gdpr: false
  };

  // Track if a field was ever focused
  const everFocused = {
    doctorType: false,
    firstName: false,
    lastName: false,
    phone: false,
    gender: false,
    title: false,
    suffix: false,
    hospitalCode: false,
    email: false,
    password: false,
    passwordConfirm: false,
    gdpr: false
  };

  function markFocused(fieldKey) {
    everFocused[fieldKey] = true;
  }

  // Helper function to get full name
  function getFullName(doctor) {
    return `${doctor.first_name || ""} ${doctor.last_name || ""}`.trim().toLowerCase();
  }

  // Populate hospital dropdown
  function populateHospitalDropdown(doctors) {
    if (!hospitalFilter) return;

    const uniqueHospitals = [...new Set(doctors.map((d) => d.hospital?.name).filter((name) => name))];
    hospitalFilter.innerHTML = '<option value="">Všetky nemocnice</option>';
    uniqueHospitals.forEach((hospital) => {
      const option = document.createElement("option");
      option.value = hospital;
      option.textContent = hospital;
      hospitalFilter.appendChild(option);
    });
  }

  // Perform search and render results
  function performSearch(shouldRender = true) {
    const query = searchInput?.value.trim().toLowerCase();
    const selectedHospital = hospitalFilter?.value || "";

    const filtered = allDoctorsData.filter((doctor) => {
      const hospitalName = doctor.hospital?.name?.toLowerCase() || "";
      const fullName = getFullName(doctor);

      const matchesQuery =
        fullName.includes(query) ||
        doctor.email?.toLowerCase().includes(query) ||
        doctor.phone_number?.includes(query) ||
        hospitalName.includes(query);

      const matchesHospital = !selectedHospital || hospitalName === selectedHospital.toLowerCase();

      return matchesQuery && matchesHospital;
    });

    if (shouldRender) {
      const sortedDoctors = sortDoctors(filtered);
      renderAllListTable(sortedDoctors);
      renderDoctors(sortedDoctors);
    }

    return filtered; // Return filtered data for further processing
  }

  // Sort doctors based on the current column and direction
  function sortDoctors(doctors) {
    return [...doctors].sort((a, b) => {
      let valA, valB;

      if (currentSortColumn === "full_name") {
        valA = getFullName(a);
        valB = getFullName(b);
      } else if (currentSortColumn === "phone_number") {
        valA = a.phone_number || "";
        valB = b.phone_number || "";
      } else if (currentSortColumn === "hospital") {
        valA = (a.hospital?.name || "").toLowerCase();
        valB = (b.hospital?.name || "").toLowerCase();
      } else if (currentSortColumn === "created_at") {
        valA = new Date(a.created_at);
        valB = new Date(b.created_at);
      } else {
        valA = (a[currentSortColumn] || "").toString().toLowerCase();
        valB = (b[currentSortColumn] || "").toString().toLowerCase();
      }

      if (valA < valB) return currentSortDirection === "asc" ? -1 : 1;
      if (valA > valB) return currentSortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }

  // Render list view
  function renderAllListTable(doctors) {
    if (!allListBody) return;
    allListBody.innerHTML = "";

    if (!Array.isArray(doctors) || doctors.length === 0) {
      allListBody.innerHTML = "<tr><td colspan='5'>Žiadni doktori nenájdení.</td></tr>";
      return;
    }

    doctors.forEach((doctor) => {
      const tr = document.createElement("tr");
      const fullName = getFullName(doctor);
      const hospitalName = doctor.hospital?.name || "-";

      tr.innerHTML = `
        <td>${fullName}</td>
        <td>${doctor.created_at || "-"}</td>
        <td>${doctor.phone_number || "-"}</td>
        <td>${doctor.email || "-"}</td>
        <td>${hospitalName}</td>
      `;

      tr.addEventListener("click", () => {
        window.location.href = `/doctors/${doctor.id}`;
      });

      allListBody.appendChild(tr);
    });
  }

  // Render card view
  function renderDoctors(doctors) {
    if (!allDoctorsList) return;
    allDoctorsList.innerHTML = "";

    if (!Array.isArray(doctors) || doctors.length === 0) {
      allDoctorsList.innerHTML = "<p>Žiadni doktori nenájdení.</p>";
      return;
    }

    doctors.forEach((doctor) => {
      const card = document.createElement("div");
      card.classList.add("card");
      card.addEventListener("click", () => {
        window.location.href = `/doctors/${doctor.id}`;
      });

      const fullName = getFullName(doctor);
      const hospitalName = doctor.hospital?.name || "-";

      card.innerHTML = `
        <h3>${fullName}</h3>
        <p>Telefón: ${doctor.phone_number || "-"}</p>
        <p>Email: ${doctor.email || "-"}</p>
        <p>Nemocnica: ${hospitalName}</p>
      `;

      allDoctorsList.appendChild(card);
    });
  }

  // Add sorting functionality to table headers
  tableHeaders.forEach((header) => {
    header.addEventListener("click", () => {
      const column = header.getAttribute("data-column");
      if (!column) return;

      // Toggle sort direction if the same column is clicked
      if (currentSortColumn === column) {
        currentSortDirection = currentSortDirection === "asc" ? "desc" : "asc";
      } else {
        currentSortColumn = column;
        currentSortDirection = "asc"; // Default to ascending when a new column is selected
      }

      // Update header styles
      tableHeaders.forEach((th) => th.classList.remove("sort-asc", "sort-desc"));
      header.classList.add(currentSortDirection === "asc" ? "sort-asc" : "sort-desc");

      // Re-render both views
      const filteredDoctors = performSearch(false); // Get filtered data without re-rendering
      const sortedDoctors = sortDoctors(filteredDoctors);
      renderAllListTable(sortedDoctors);
      renderDoctors(sortedDoctors);
      updateSortIcons();
    });
  });

  // Add event listener for sorting dropdown
  sortSelect?.addEventListener("change", () => {
    const sortValue = sortSelect.value;

    // Map dropdown values to columns and directions
    if (sortValue === "alphabetical-asc") {
      currentSortColumn = "full_name";
      currentSortDirection = "asc";
    } else if (sortValue === "alphabetical-desc") {
      currentSortColumn = "full_name";
      currentSortDirection = "desc";
    } else if (sortValue === "newest") {
      currentSortColumn = "created_at";
      currentSortDirection = "desc";
    } else {
      // Default: "creation" (Oldest first)
      currentSortColumn = "created_at";
      currentSortDirection = "asc";
    }

    // Re-render both views
    const filteredDoctors = performSearch(false); // Get filtered data without re-rendering
    const sortedDoctors = sortDoctors(filteredDoctors);
    renderAllListTable(sortedDoctors);
    renderDoctors(sortedDoctors);
    updateSortIcons();
  });

  // --- Remember view mode in localStorage ---
  function switchView(mode) {
    localStorage.setItem("doctorViewMode", mode); // Remember view mode

    const sortDropdownContainer = sortSelect?.parentElement;
    const hospitalDropdownContainer = hospitalFilter?.parentElement;

    if (mode === "cards") {
      allCardsContainer?.classList.remove("hidden");
      allListContainer?.classList.add("hidden");
      viewCardsBtn?.classList.add("active");
      viewListBtn?.classList.remove("active");
      sortDropdownContainer?.classList.remove("hidden");
    } else if (mode === "list") {
      allCardsContainer?.classList.add("hidden");
      allListContainer?.classList.remove("hidden");
      viewCardsBtn?.classList.remove("active");
      viewListBtn?.classList.add("active");
      sortDropdownContainer?.classList.add("hidden");
    }

    hospitalDropdownContainer?.classList.remove("hidden");

    if (mode === "list") {
      updateSortIcons();
    }
  }

  // --- Restore view mode on page load ---
  function restoreDoctorViewMode() {
    const savedMode = localStorage.getItem("doctorViewMode") || "cards";
    switchView(savedMode);
  }

  // Helper function to switch tabs
  function switchTab(tab) {
    tabAllContent?.classList.add("hidden");
    tabAddContent?.classList.add("hidden");
    tabAll?.classList.remove("active");
    tabAdd?.classList.remove("active");

    if (tab === "all") {
      tabAllContent?.classList.remove("hidden");
      tabAll?.classList.add("active");
    } else if (tab === "add") {
      tabAddContent?.classList.remove("hidden");
      tabAdd?.classList.add("active");
    }
  }

  // Load all doctors
  async function loadAllDoctors() {
    try {
        const response = await fetch("/doctors/list", {
            method: "GET",
            headers: { Accept: "application/json" },
            credentials: "include",
        });
        if (!response.ok) throw new Error("Chyba pri načítaní doktorov.");

        const doctors = await response.json();

        allDoctorsData = doctors;

        populateHospitalDropdown(doctors);
        renderAllListTable(doctors);
        renderDoctors(doctors);
    } catch (err) {
        console.error(err);
        if (allDoctorsList) {
            allDoctorsList.innerHTML = `<p>Chyba pri načítaní doktorov: ${err.message}</p>`;
        }
    }
  }

  // Debounce function
  function debounce(func, delay) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), delay);
    };
  }

  // Helper function to reset the form
  function resetDoctorForm() {
    if (addDoctorForm) {
      addDoctorForm.reset();
    }
    if (addDoctorMessage) {
      addDoctorMessage.textContent = "";
      addDoctorMessage.classList.remove("error", "success");
    }
    // Reset touched and everFocused states
    Object.keys(touchedFields).forEach(k => touchedFields[k] = false);
    Object.keys(everFocused).forEach(k => everFocused[k] = false);
    // Clear all inline errors
    clearError(doctorTypeErrorDiv);
    clearError(firstNameErrorDiv);
    clearError(lastNameErrorDiv);
    clearError(phoneErrorDiv);
    clearError(genderErrorDiv);
    clearError(titleErrorDiv);
    clearError(suffixErrorDiv);
    clearError(hospitalCodeErrorDiv);
    clearError(emailErrorDiv);
    clearError(passwordErrorDiv);
    clearError(passwordConfirmErrorDiv);
    clearError(gdprErrorDiv);
  }

  // Add Doctor functionality
  if (addDoctorBtn) {
    addDoctorBtn.addEventListener("click", async () => {
      addDoctorMessage.textContent = "";
      addDoctorMessage.classList.remove("error", "success");

      const role = document.getElementById("doctor-type").value;
      const firstName = document.getElementById("doctor-first-name").value.trim();
      const lastName = document.getElementById("doctor-last-name").value.trim();
      const email = document.getElementById("doctor-email").value.trim();
      const phone = document.getElementById("doctor-phone").value.trim();
      const gender = document.getElementById("doctor-gender").value;
      const title = document.getElementById("doctor-title").value.trim();
      const suffix = document.getElementById("doctor-suffix").value.trim();
      const hospitalCode = document.getElementById("doctor-hospital-code")?.value.trim();
      const password = document.getElementById("doctor-password").value;
      const confirmPassword = document.getElementById("doctor-password-confirm").value;
      const gdprChecked = document.getElementById("gdpr")?.checked;

      // Validation regex patterns
      const nameRegex = /^[a-zA-ZÀ-ž\s]{2,255}$/; // Allows letters, accents, and spaces (2-255 characters)
      const phoneRegex = /^(?:\+421|421|0)\d{9}$/; // E.164 format for phone numbers
      const noNumbersRegex = /^[^\d]*$/; // Ensures no numbers are present

      // Validation checks
      if (!nameRegex.test(firstName)) {
        addDoctorMessage.textContent = "Meno musí obsahovať iba písmená a mať dĺžku 2 až 255 znakov.";
        addDoctorMessage.classList.add("error");
        return;
      }

      if (!nameRegex.test(lastName)) {
        addDoctorMessage.textContent = "Priezvisko musí obsahovať iba písmená a mať dĺžku 2 až 255 znakov.";
        addDoctorMessage.classList.add("error");
        return;
      }

      // if (!phoneRegex.test(phone)) {
      //   addDoctorMessage.textContent = "Telefónne číslo musí byť vo formáte E.164 (napr. +421123456789).";
      //   addDoctorMessage.classList.add("error");
      //   return;
      // }

      if (title && !noNumbersRegex.test(title)) {
        addDoctorMessage.textContent = "Titul nesmie obsahovať čísla.";
        addDoctorMessage.classList.add("error");
        return;
      }

      if (suffix && !noNumbersRegex.test(suffix)) {
        addDoctorMessage.textContent = "Sufix nesmie obsahovať čísla.";
        addDoctorMessage.classList.add("error");
        return;
      }

      if (
        !firstName ||
        !lastName ||
        !email ||
        // !phone ||           // <-- removed from required
        // !gender ||          // <-- removed from required
        !password ||
        !confirmPassword ||
        (!hospitalCode && userType === "super_admin")
      ) {
        addDoctorMessage.textContent = "Vyplňte všetky povinné polia.";
        addDoctorMessage.classList.add("error");
        return;
      }

      if (!role && userType === "super_admin") {
        addDoctorMessage.textContent = "Vyberte typ doktora.";
        addDoctorMessage.classList.add("error");
        return;
      }

      if (password !== confirmPassword) {
        addDoctorMessage.textContent = "Heslá sa nezhodujú.";
        addDoctorMessage.classList.add("error");
        return;
      }

      if (!gdprChecked) {
        addDoctorMessage.textContent = "Musíte súhlasiť so spracovaním údajov (GDPR).";
        addDoctorMessage.classList.add("error");
        return;
      }

      try {
        const response = await fetch("/doctors/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            first_name: firstName,
            last_name: lastName,
            email,
            phone_number: phone,
            gender,
            title,
            suffix,
            password,
            hospital_code: hospitalCode,
            role,
          }),
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Chyba pri vytváraní doktora.");

        addDoctorMessage.textContent = result.message || "Doktor úspešne pridaný.";
        addDoctorMessage.classList.add("success");

        resetDoctorForm();
        switchTab("all");
        loadAllDoctors();
      } catch (err) {
        console.error(err);
        addDoctorMessage.textContent = err.message || "Nepodarilo sa pridať doktora.";
        addDoctorMessage.classList.add("error");
      }
    });
  }

  // Password toggle functionality
  function setupPasswordToggle(inputId, toggleId) {
    const input = document.getElementById(inputId);
    const toggle = document.getElementById(toggleId);

    if (input && toggle) {
      toggle.addEventListener('click', () => {
        const isHidden = input.type === 'password';
        input.type = isHidden ? 'text' : 'password';
        const icon = toggle.querySelector('i');
        if (icon) {
          icon.classList.toggle('fa-eye', isHidden);
          icon.classList.toggle('fa-eye-slash', !isHidden);
        }
      });
    }
  }

  // Setup for both password fields
  setupPasswordToggle('doctor-password', 'toggle-password');
  setupPasswordToggle('doctor-password-confirm', 'toggle-password-confirm');

  // Add event listeners
  searchInput?.addEventListener("keyup", debounce(performSearch, 300));
  hospitalFilter?.addEventListener("change", performSearch);
  viewCardsBtn?.addEventListener("click", () => switchView("cards"));
  viewListBtn?.addEventListener("click", () => switchView("list"));
  tabAll?.addEventListener("click", () => switchTab("all"));
  tabAdd?.addEventListener("click", () => switchTab("add"));

  // Initial setup
  loadAllDoctors();
  switchTab("all");
  restoreDoctorViewMode(); // Use remembered view mode on load

  // After DOMContentLoaded or in your initial setup
  if (sortSelect) {
    sortSelect.value = "alphabetical-asc";
  }

  function updateSortIcons() {
    tableHeaders.forEach((th) => {
      const col = th.getAttribute("data-column");
      th.classList.remove("sort-asc", "sort-desc");
      if (col === currentSortColumn) {
        th.classList.add(currentSortDirection === "asc" ? "sort-asc" : "sort-desc");
      }
    });
  }

  function showError(div, msg) {
    div.textContent = msg;
  }
  function clearError(div) {
    div.textContent = "";
  }

  function validateDoctorForm() {
    let isValid = true;
    clearError(doctorTypeErrorDiv);
    clearError(firstNameErrorDiv);
    clearError(lastNameErrorDiv);
    clearError(phoneErrorDiv);
    clearError(genderErrorDiv);
    clearError(titleErrorDiv);
    clearError(suffixErrorDiv);
    clearError(hospitalCodeErrorDiv);
    clearError(emailErrorDiv);
    clearError(passwordErrorDiv);
    clearError(passwordConfirmErrorDiv);
    clearError(gdprErrorDiv);

    const nameRegex = /^[a-zA-ZÀ-ž\s]{2,255}$/;
const phoneRegex = /^(?:\+\d{3}|\d{3}|0)\d{9}$/;
    const noNumbersRegex = /^[^\d]*$/;

    // Doctor type
    if (!doctorTypeInput.value) {
      isValid = false;
      if (touchedFields.doctorType) showError(doctorTypeErrorDiv, "Typ doktora je povinný.");
    }

    // First name
    if (!firstNameInput.value.trim()) {
      isValid = false;
      if (touchedFields.firstName) showError(firstNameErrorDiv, "Meno je povinné.");
    } else if (!nameRegex.test(firstNameInput.value.trim())) {
      isValid = false;
      if (touchedFields.firstName) showError(firstNameErrorDiv, "Meno musí obsahovať iba písmená a mať dĺžku 2 až 255 znakov.");
    }

    // Last name
    if (!lastNameInput.value.trim()) {
      isValid = false;
      if (touchedFields.lastName) showError(lastNameErrorDiv, "Priezvisko je povinné.");
    } else if (!nameRegex.test(lastNameInput.value.trim())) {
      isValid = false;
      if (touchedFields.lastName) showError(lastNameErrorDiv, "Priezvisko musí obsahovať iba písmená a mať dĺžku 2 až 255 znakov.");
    }

    // Phone
    // if (!phoneInput.value.trim()) {
    //   isValid = false;
    //   if (touchedFields.phone) showError(phoneErrorDiv, "Telefón je povinný.");
    // } else
    if (phoneInput.value.trim() && !phoneRegex.test(phoneInput.value.trim())) {
      isValid = false;
      if (touchedFields.phone) showError(phoneErrorDiv, "Neplatné tel. číslo (napr. +421000000000).");
    }

    // Gender
    // if (!genderInput.value) {
    //   isValid = false;
    //   if (touchedFields.gender) showError(genderErrorDiv, "Pohlavie je povinné.");
    // }

    // Title
    if (titleInput.value && !noNumbersRegex.test(titleInput.value)) {
      isValid = false;
      if (touchedFields.title) showError(titleErrorDiv, "Titul nesmie obsahovať čísla.");
    }

    // Suffix
    if (suffixInput.value && !noNumbersRegex.test(suffixInput.value)) {
      isValid = false;
      if (touchedFields.suffix) showError(suffixErrorDiv, "Sufix nesmie obsahovať čísla.");
    }

    // Hospital code (required for super_admin)
    if (hospitalCodeInput && hospitalCodeInput.offsetParent !== null && !hospitalCodeInput.value.trim()) {
      isValid = false;
      if (touchedFields.hospitalCode) showError(hospitalCodeErrorDiv, "Kód nemocnice je povinný.");
    }

    // Email
    if (!emailInput.value.trim()) {
      isValid = false;
      if (touchedFields.email) showError(emailErrorDiv, "Email je povinný.");
    }

    // Password
    if (!passwordInput.value) {
      isValid = false;
      if (touchedFields.password) showError(passwordErrorDiv, "Heslo je povinné.");
    }

    // Confirm password
    if (!passwordConfirmInput.value || passwordInput.value !== passwordConfirmInput.value) {
      isValid = false;
      if (touchedFields.passwordConfirm) showError(passwordConfirmErrorDiv, "Heslá sa nezhodujú.");
    }

    // GDPR
    if (!gdprCheckbox.checked) {
      isValid = false;
      if (touchedFields.gdpr) showError(gdprErrorDiv, "Musíte súhlasiť so spracovaním osobných údajov.");
    }

    return isValid;
  }

  // Mark field as touched and validate
  function markTouched(fieldKey) {
    touchedFields[fieldKey] = true;
    validateDoctorForm();
  }

  // Add blur listeners to mark fields as touched
  doctorTypeInput.addEventListener("blur", () => markTouched("doctorType"));
  firstNameInput.addEventListener("blur", () => markTouched("firstName"));
  lastNameInput.addEventListener("blur", () => markTouched("lastName"));
  phoneInput.addEventListener("blur", () => markTouched("phone"));
  genderInput.addEventListener("blur", () => markTouched("gender"));
  titleInput.addEventListener("blur", () => markTouched("title"));
  suffixInput.addEventListener("blur", () => markTouched("suffix"));
  hospitalCodeInput.addEventListener("blur", () => markTouched("hospitalCode"));
  emailInput.addEventListener("blur", () => markTouched("email"));
  passwordInput.addEventListener("blur", () => markTouched("password"));
  passwordConfirmInput.addEventListener("blur", () => markTouched("passwordConfirm"));
  gdprCheckbox.addEventListener("blur", () => markTouched("gdpr"));

  // Also validate on input for instant feedback (optional)
  [
    doctorTypeInput, firstNameInput, lastNameInput, phoneInput, genderInput, titleInput, suffixInput,
    hospitalCodeInput, emailInput, passwordInput, passwordConfirmInput
  ].forEach(input => {
    if (input) input.addEventListener("input", validateDoctorForm);
  });
  gdprCheckbox.addEventListener("change", validateDoctorForm);

  // On submit, mark all as touched and validate
  addDoctorBtn.addEventListener("click", async () => {
    // ...existing code...
    Object.keys(touchedFields).forEach(k => touchedFields[k] = true);
    if (!validateDoctorForm()) {
      addDoctorMessage.textContent = "Vyplňte všetky polia správne.";
      addDoctorMessage.classList.add("error");
      return;
    }
    // ...existing code...
  });

  // Find the doctor type form group robustly (move here!)
  const doctorTypeFormGroup =
    document.getElementById("doctor-type")?.closest(".form-group") ||
    document.getElementById("doctor-type")?.parentElement ||
    document.querySelector('label[for="doctor-type"]')?.parentElement;

  // --- Find hospital code form group robustly ---
  const hospitalCodeFormGroup =
    hospitalCodeInput?.closest(".form-group") ||
    hospitalCodeInput?.parentElement ||
    document.querySelector('label[for="doctor-hospital-code"]')?.parentElement;

  async function checkUserTypeAndAdjustFilters() {
    try {
      const response = await fetch("/settings/info", {
        method: "GET",
        headers: { "Accept": "application/json" },
        credentials: "include"
      });
      if (!response.ok) throw new Error("Failed to fetch user type");
      const user = await response.json();
      userType = user.user_type;

      // Hide hospital filter by default
      const hospitalFilterDropdown = document.getElementById("doctor-hospital-filter");
      if (hospitalFilterDropdown) {
        const wrapper = hospitalFilterDropdown.closest(".dropdown") || hospitalFilterDropdown.parentElement;
        if (wrapper) wrapper.style.display = "none";
      }

      // Show hospital filter only for super_admin
      if (userType === "super_admin" && hospitalFilterDropdown) {
        const wrapper = hospitalFilterDropdown.closest(".dropdown") || hospitalFilterDropdown.parentElement;
        if (wrapper) wrapper.style.display = "";
      }

      // Hide doctor type dropdown for admin and set value to "doctor"
      if (userType === "admin" && doctorTypeFormGroup) {
        doctorTypeFormGroup.style.display = "none";
        const doctorTypeInput = document.getElementById("doctor-type");
        if (doctorTypeInput) doctorTypeInput.value = "doctor";
      } else if (doctorTypeFormGroup) {
        doctorTypeFormGroup.style.display = "";
      }

      // --- Hide hospital code input for admin and set value automatically ---
      if (userType === "admin" && hospitalCodeFormGroup) {
        hospitalCodeFormGroup.style.display = "none";
        if (hospitalCodeInput && user.hospital_code) {
          hospitalCodeInput.value = user.hospital_code;
        }
      } else if (hospitalCodeFormGroup) {
        hospitalCodeFormGroup.style.display = "";
      }
    } catch (err) {
      console.error("Error fetching user type:", err);
    }
  }

  // At the end of DOMContentLoaded:
  checkUserTypeAndAdjustFilters();
});