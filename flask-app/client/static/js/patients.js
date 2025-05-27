document.addEventListener("DOMContentLoaded", async () => {
  // -- All variables --
  let allPatientsData = [];
  let userType = "";
  let allDoctorsData = [];
  let hospitalsData = [];

  // For "All" tab
  let allCurrentSortColumn = "full_name";
  let allCurrentSortDirection = "asc";

  // DOM elements for view toggles
  const viewCardsBtnAll = document.getElementById("view-cards");
  const viewListBtnAll = document.getElementById("view-list");
  const allCardsContainer = document.getElementById("all-cards-container");
  const allListContainer = document.getElementById("all-list-container");
  const sortOptionsAll = document.getElementById("sort-select")?.closest(".form-group");
  const allPatientsList = document.getElementById("all-patients-list");
  const allListBody = document.getElementById("all-list-body");
  const searchInput = document.getElementById("search-input");
  const sortSelect = document.getElementById("sort-select");
  const hospitalFilterDropdown = document.getElementById("hospital-filter-dropdown");
  const doctorFilterDropdown = document.getElementById("doctor-filter-dropdown");

  // Hide filters by default (at the top, after DOM elements)
  if (hospitalFilterDropdown) {
    const hospitalDropdownWrapper = hospitalFilterDropdown.closest(".dropdown") || hospitalFilterDropdown.parentElement;
    if (hospitalDropdownWrapper) hospitalDropdownWrapper.style.display = "none";
  }
  if (doctorFilterDropdown) {
    const doctorDropdownWrapper = doctorFilterDropdown.closest(".dropdown") || doctorFilterDropdown.parentElement;
    if (doctorDropdownWrapper) doctorDropdownWrapper.style.display = "none";
  }

  // Tab elements
  const tabAll = document.getElementById("tab-all");
  const tabAdd = document.getElementById("tab-add");
  const tabAssign = document.getElementById("tab-assign");

  const tabAllContent = document.getElementById("tab-all-content");
  const tabAddContent = document.getElementById("tab-add-content");
  const tabAssignContent = document.getElementById("tab-assign-content");

  // Form elements - "Add Patient"
  const addPatientMessage = document.getElementById("add-patient-message");
  const addPatientForm = document.getElementById("add-patient-form");
  const doctorSelect = document.getElementById("patient-doctor");

  // ADD THIS LINE to robustly find the form group for the doctor select:
  const doctorFormGroup =
    doctorSelect?.closest(".form-group") ||
    doctorSelect?.parentElement ||
    document.querySelector('label[for="patient-doctor"]')?.parentElement;

  // Polia formulára (Add Patient):
  const firstNameInput = document.getElementById("patient-first-name");
  const lastNameInput = document.getElementById("patient-last-name");
  const phoneInput = document.getElementById("patient-phone");
  const birthNumberInput = document.getElementById("patient-birth-number");
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
  const birthNumberErrorDiv = document.getElementById("patient-birth-number-error");
  const emailErrorDiv = document.getElementById("patient-email-error");
  const passwordErrorDiv = document.getElementById("patient-password-error");
  const confirmPasswordErrorDiv = document.getElementById("patient-password-confirm-error");
  const gdprErrorDiv = document.getElementById("gdpr-error");

  // Ktoré polia boli "dotknuté" (pre zobrazovanie chýb až po vyplnení):
  const touchedFields = {
    firstName: false,
    lastName: false,
    phone: false,
    birthNumber: false,
    email: false,
    password: false,
    confirmPassword: false,
    gdpr: false
  };
  tabAll?.addEventListener("click", () => showTab("all"));
  tabAdd?.addEventListener("click", () => {
    showTab("add");
    resetPatientForm();
  });
  tabAssign?.addEventListener("click", async () => {
    showTab("assign");
    resetAssignForm();
    await loadAllDoctors(); // <-- Add this line to reload doctors and trigger the log
    await loadUnassignedPatientsForAssign(); // <--- Only for assign tab dropdown
  });

  viewCardsBtnAll?.addEventListener("click", () => setViewMode("cards"));
  viewListBtnAll?.addEventListener("click", () => setViewMode("list"));

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

  // Add this debounce function
  function debounce(func, delay) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), delay);
    };
  }

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
  function validateAddPatientForm(showMainError = false) {
    let isValid = true;

    // Reset all error divs
    clearError(firstNameErrorDiv);
    clearError(lastNameErrorDiv);
    clearError(phoneErrorDiv);
    clearError(birthNumberErrorDiv);
    clearError(emailErrorDiv);
    clearError(passwordErrorDiv);
    clearError(confirmPasswordErrorDiv);
    clearError(gdprErrorDiv);

    // Only clear main error if not showing it
    if (!showMainError) {
      addPatientMessage.textContent = "";
      addPatientMessage.classList.remove("error");
    }

    const firstNameVal = firstNameInput.value.trim();
    const lastNameVal = lastNameInput.value.trim();
    const phoneVal = phoneInput.value.trim();
    const birthNumberVal = birthNumberInput.value.trim();
    const emailVal = emailInput.value.trim();
    const passwordVal = passwordInput.value;
    const confirmPasswordVal = confirmPasswordInput.value;
    const isGdprChecked = gdprCheckbox.checked;

    // Validation regex patterns
    const nameRegex = /^[a-zA-ZÀ-ž\s]{2,255}$/; // Allows letters, accents, and spaces (2-255 characters)
const phoneRegex = /^(?:\+\d{3}|\d{3}|0)\d{9}$/;

    // 1. First Name
    if (!firstNameVal) {
      isValid = false;
      if (touchedFields.firstName) {
        showError(firstNameErrorDiv, "Meno je povinné.");
      }
    } else if (!nameRegex.test(firstNameVal)) {
      isValid = false;
      if (touchedFields.firstName) {
        showError(firstNameErrorDiv, "Meno musí obsahovať iba písmená a mať dĺžku 2 až 255 znakov.");
      }
    }

    // 2. Last Name
    if (!lastNameVal) {
      isValid = false;
      if (touchedFields.lastName) {
        showError(lastNameErrorDiv, "Priezvisko je povinné.");
      }
    } else if (!nameRegex.test(lastNameVal)) {
      isValid = false;
      if (touchedFields.lastName) {
        showError(lastNameErrorDiv, "Priezvisko musí obsahovať iba písmená a mať dĺžku 2 až 255 znakov.");
      }
    }

    // 3. Phone (now optional, but validate if filled)
    if (phoneVal) {
      if (!phoneRegex.test(phoneVal)) {
        isValid = false;
        if (touchedFields.phone) {
          showError(phoneErrorDiv, "Neplatné tel. číslo (napr. +421000000000).");
        }
      }
    }
    // Remove the "required" check for phone:
    // if (!phoneVal) {
    //   isValid = false;
    //   if (touchedFields.phone) {
    //     showError(phoneErrorDiv, "Telefón je povinný.");
    //   }
    // }

    // 4. Birth Number (######)
    if (!birthNumberVal) {
      isValid = false;
      if (touchedFields.birthNumber) {
        showError(birthNumberErrorDiv, "Rodné číslo je povinné.");
      }
    } else if (!/^\d{6}$/.test(birthNumberVal)) {
      isValid = false;
      if (touchedFields.birthNumber) {
        showError(birthNumberErrorDiv, "Rodné číslo musí mať 6 číslic.");
      }
    } else {
      // Parse birth number and check validity
      const year = parseInt(birthNumberVal.slice(0, 2), 10);
      let month = parseInt(birthNumberVal.slice(2, 4), 10);
      const day = parseInt(birthNumberVal.slice(4, 6), 10);

      // Gender logic: month > 50 means female
      let gender = "Muž";
      if (month > 50) {
        gender = "Žena";
        month -= 50;
      }

      // Guess century: if year > 30, use 1900s, else 2000s
      const fullYear = year > 30 ? 1900 + year : 2000 + year;

      // Check month and day validity
      const isMonthValid = month >= 1 && month <= 12;
      const isDayValid = day >= 1 && day <= 31;
      let isDateValid = false;
      if (isMonthValid && isDayValid) {
        // Check if the date actually exists (e.g. not 31.02.)
        const testDate = new Date(fullYear, month - 1, day);
        isDateValid =
          testDate.getFullYear() === fullYear &&
          testDate.getMonth() === month - 1 &&
          testDate.getDate() === day;
      }

      if (!isMonthValid || !isDayValid || !isDateValid) {
        isValid = false;
        if (touchedFields.birthNumber) {
          showError(birthNumberErrorDiv, "Rodné číslo obsahuje neplatný dátum narodenia.");
        }
      }
    }

    // 5. Email
    if (!emailVal) {
      isValid = false;
      if (touchedFields.email) {
        showError(emailErrorDiv, "Email je povinný.");
      }
    }

    // 6. Password
    if (!passwordVal) {
      isValid = false;
      if (touchedFields.password) {
        showError(passwordErrorDiv, "Heslo je povinné.");
      }
    }

    // 7. Confirm password (must match password)
    if (!confirmPasswordVal || passwordVal !== confirmPasswordVal) {
      isValid = false;
      if (touchedFields.confirmPassword) {
        showError(confirmPasswordErrorDiv, "Heslá sa nezhodujú.");
      }
    }

    // 8. GDPR
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

    // No birth number validation anymore!
    clearError(assignBirthNumberErrorDiv);

    const selectedPatientId = assignPatientDropdown.value;
    const doctorVal = assignDoctorSelect.value;

    // Validate patient selection
    if (!selectedPatientId) {
      isValid = false;
      // Optionally show error if you want
      // showError(assignBirthNumberErrorDiv, "Vyberte pacienta zo zoznamu.");
    }

    // Validate doctor selection
    if (!doctorVal && ["super_admin", "admin"].includes(userType)) {
      isValid = false;
      if (assignTouchedFields.doctor) {
        assignPatientMessage.textContent = "";
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
assignBirthNumberInput.addEventListener("input", () => {
  // Only allow up to 6 digits, no slash, no more
  let val = assignBirthNumberInput.value.replace(/\D/g, "");
  if (val.length > 6) {
    val = val.slice(0, 6);
  }
  assignBirthNumberInput.value = val;

  updateAssignPatientDropdown();
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
  birthNumberInput.addEventListener("blur", () => markTouched("birthNumber"));
  emailInput.addEventListener("blur", () => markTouched("email"));
  passwordInput.addEventListener("blur", () => markTouched("password"));
  confirmPasswordInput.addEventListener("blur", () => markTouched("confirmPassword"));
  gdprCheckbox.addEventListener("change", () => markTouched("gdpr"));

  // Automatické formátovanie rodného čísla
  birthNumberInput.addEventListener("input", () => {
    let val = birthNumberInput.value.replace(/\D/g, "");
    if (val.length > 6) {
      val = val.substring(0, 6);
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

  // Function to toggle sorting dropdown visibility
  function toggleSortingDropdown(mode) {
    const sortOptionsAll = document.getElementById("sort-select")?.closest(".form-group");
    if (sortOptionsAll) {
      if (mode === "list") {
        sortOptionsAll.style.display = "none"; // Hide in list view
      } else {
        sortOptionsAll.style.display = "flex"; // Show in cards view
      }
    }
  }

  // Ensure filters and sorting persist when switching views
  function setViewMode(mode) {
    localStorage.setItem("patientViewMode", mode);

    if (mode === "list") {
      viewCardsBtnAll?.classList.remove("active");
      viewListBtnAll?.classList.add("active");
      allCardsContainer?.classList.add("hidden");
      allListContainer?.classList.remove("hidden");
    } else { // "cards"
      viewCardsBtnAll?.classList.add("active");
      viewListBtnAll?.classList.remove("active");
      allCardsContainer?.classList.remove("hidden");
      allListContainer?.classList.add("hidden");
      // Always set sort dropdown to alphabetical-asc in cards view
      if (sortSelect) {
        sortSelect.value = "alphabetical-asc";
      }
    }

    toggleSortingDropdown(mode); // Toggle sorting dropdown visibility
    applyFiltersAndSorting(); // Reapply filters and sorting
  }

  // Restore view mode from localStorage on page load
  function restorePatientViewMode() {
    const savedMode = localStorage.getItem("patientViewMode") || "cards";
    // Set default sort select to alphabetical-asc
    if (sortSelect) {
      sortSelect.value = "alphabetical-asc";
    }
    setViewMode(savedMode);
  }

  // Tab switching function
  function showTab(tab) {
    tabAll?.classList.remove("active");
    tabAdd?.classList.remove("active");
    tabAssign?.classList.remove("active");

    tabAllContent?.classList.add("hidden");
    tabAddContent?.classList.add("hidden");
    tabAssignContent?.classList.add("hidden");

    if (tab === "all") {
      tabAll?.classList.add("active");
      tabAllContent?.classList.remove("hidden");
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
    } else if (sortValue === "newest" || sortValue === "creation-desc") {
      // Sort by creation date descending (newest first)
      sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (sortValue === "oldest" || sortValue === "creation-asc" || sortValue === "creation") {
      // Sort by creation date ascending (oldest first)
      sorted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    } else {
      // Default sorting by the selected column
      sorted.sort((a, b) => {
        let valA = a[sortValue] || "";
        let valB = b[sortValue] || "";
        return allCurrentSortDirection === "asc"
          ? valA.toString().localeCompare(valB.toString(), "sk")
          : valB.toString().localeCompare(valA.toString(), "sk");
      });
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

    // Update sort indicators in table headers
    const allListTable = document.getElementById("all-list-table");
    if (allListTable) {
      allListTable.querySelectorAll("th[data-sort]").forEach(th => {
        const col = th.getAttribute("data-sort");
        th.classList.remove("sort-asc", "sort-desc");
        if (col === allCurrentSortColumn) {
          th.classList.add(allCurrentSortDirection === "asc" ? "sort-asc" : "sort-desc");
        }
      });
    }

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
      } else if (allCurrentSortColumn === "created_at") {
        valA = a.created_at || "";
        valB = b.created_at || "";
        // Compare as dates
        return allCurrentSortDirection === "asc"
          ? new Date(valA) - new Date(valB)
          : new Date(valB) - new Date(valA);
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

  // Centralized function to apply filters, sorting, and render the results
  function applyFiltersAndSorting() {
  const searchQuery = searchInput?.value.trim().toLowerCase();
  const selectedHospitalId = hospitalFilterDropdown?.value ? parseInt(hospitalFilterDropdown.value, 10) : null;
  const selectedDoctorValue = doctorFilterDropdown?.value;
  let selectedDoctorId = null;
  let showUnassigned = false;
  if (selectedDoctorValue === "__none__") {
    showUnassigned = true;
  } else if (selectedDoctorValue) {
    selectedDoctorId = parseInt(selectedDoctorValue, 10);
  }
  const mode = localStorage.getItem("patientViewMode") || "cards";

  // Filter patients based on search query, hospital, and doctor
  let filteredPatients = allPatientsData.filter(patient => {
    const fullName = `${patient.first_name} ${patient.last_name}`.toLowerCase();
    const matchesSearch = !searchQuery || fullName.includes(searchQuery) ||
      patient.phone_number?.includes(searchQuery) ||
      patient.email?.toLowerCase().includes(searchQuery) ||
      patient.doctor_name?.toLowerCase().includes(searchQuery) ||
      patient.hospital_name?.toLowerCase().includes(searchQuery);
    const matchesHospital = !selectedHospitalId || patient.hospital_id === selectedHospitalId;
    const matchesDoctor = showUnassigned
      ? !patient.doctor_id // Only patients without doctor
      : (!selectedDoctorId || patient.doctor_id === selectedDoctorId);

    return matchesSearch && matchesHospital && matchesDoctor;
  });

  if (mode === "list") {
    // In list view, sort by table header logic
    let data = [...filteredPatients];
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
      } else if (allCurrentSortColumn === "created_at") {
        valA = a.created_at || "";
        valB = b.created_at || "";
        return allCurrentSortDirection === "asc"
          ? new Date(valA) - new Date(valB)
          : new Date(valB) - new Date(valA);
      } else {
        valA = (a[allCurrentSortColumn] || "").toString();
        valB = (b[allCurrentSortColumn] || "").toString();
      }
      return allCurrentSortDirection === "asc"
        ? valA.localeCompare(valB, "sk")
        : valB.localeCompare(valA, "sk");
    });
    renderAllListTable(data);
  } else {
    // In cards view, use dropdown sorting
    const sortValue = sortSelect?.value || "creation";
    filteredPatients = sortPatients(filteredPatients, sortValue);
    renderPatients(filteredPatients);
  }
}

// Card view rendering (ALL)
  function renderPatients(patients) {

    if (!allPatientsList) {
        return;
    }

    // Ensure the cards container is visible
    allCardsContainer?.classList.remove("hidden");
    allListContainer?.classList.add("hidden");


    // Clear the container before rendering
    allPatientsList.innerHTML = "";

    // Check if there are no patients to display
    if (!Array.isArray(patients) || patients.length === 0) {
        allPatientsList.innerHTML = "<p>Žiadni pacienti nenájdení.</p>";
        return;
    }

    // Create a container for the cards
    const container = document.createElement("div");
    container.classList.add("cards");

    // Render each patient as a card
    patients.forEach(p => {
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

        // Append all elements to the card
        card.appendChild(name);
        card.appendChild(created_at);
        card.appendChild(phone);
        card.appendChild(email);
        card.appendChild(doctor);
        card.appendChild(hospital);

        // Append the card to the container
        container.appendChild(card);
    });

    // Append the container to the patients list
    allPatientsList.appendChild(container);
  }

  // Add this function
  function populateHospitalDropdown(patients) {
    if (!hospitalFilterDropdown) return;

    // Collect unique hospitals from patients
    const uniqueHospitals = [];
    const seenHospitalIds = new Set();
    patients.forEach(p => {
      // Use the hospital_id and hospital_name from the patient object
      if (p.hospital_id && !seenHospitalIds.has(p.hospital_id)) {
        uniqueHospitals.push({ id: p.hospital_id, name: p.hospital_name });
        seenHospitalIds.add(p.hospital_id);
      }
    });

    hospitalFilterDropdown.innerHTML = '<option value="">Všetky nemocnice</option>';
    uniqueHospitals.forEach(hospital => {
      const option = document.createElement("option");
      option.value = hospital.id; // Use the ID as value
      option.textContent = hospital.name;
      hospitalFilterDropdown.appendChild(option);
    });
  }

  function populateDoctorDropdown(patients) {
    if (!doctorFilterDropdown) return;

    // Collect unique doctors from patients
    const uniqueDoctors = [];
    const seenDoctorIds = new Set();
    patients.forEach(p => {
      if (p.doctor_id && !seenDoctorIds.has(p.doctor_id)) {
        uniqueDoctors.push({ id: p.doctor_id, name: p.doctor_name });
        seenDoctorIds.add(p.doctor_id);
      }
    });

    doctorFilterDropdown.innerHTML = `
    <option value="">Všetci doktori</option>
    <option value="__none__">Nezaradené</option>
  `;
    uniqueDoctors.forEach(doctor => {
      const option = document.createElement("option");
      option.value = doctor.id;
      option.textContent = doctor.name;
      doctorFilterDropdown.appendChild(option);
    });
  }

  // Function to populate the doctor select in the Add Patient form
  function populateDoctorSelectForAddPatient() {
    if (!doctorSelect) return;
    // Clear previous options
    doctorSelect.innerHTML = '<option value="" selected>Vyberte doktora (voliteľné)</option>';
    // Add all doctors
    allDoctorsData.forEach(doctor => {
      const option = document.createElement("option");
      option.value = doctor.id;
      option.textContent = `${doctor.first_name} ${doctor.last_name}`;
      doctorSelect.appendChild(option);
    });
  }

  // Function to load all doctors from the API
  async function loadAllDoctors() {
  // Only fetch if NOT a doctor
  if (userType === "doctor") {
    allDoctorsData = [];
    return;
  }
  try {
    const resp = await fetch("/doctors/list", {
      method: "GET",
      headers: { "Accept": "application/json" },
      credentials: "include"
    });
    allDoctorsData = await resp.json();

    // Add this console log ONLY when assign tab is visible
    const assignTabVisible = !tabAssignContent?.classList.contains("hidden");
    if (assignTabVisible) {
      console.log("Doctors loaded for assign tab:", allDoctorsData);
      populateAssignDoctorSelect(); // <-- Add this line
    }

    populateDoctorSelectForAddPatient();
  } catch (err) {
    console.error("Error loading doctors:", err);
    allDoctorsData = [];
  }
}

  // Load data
  async function loadAllPatients() {
    try {
      const response = await fetch("/patients/list", {
        method: "GET",
        headers: { "Accept": "application/json" },
        credentials: "include"
      });
      const patients = await response.json();
      console.log("Fetched /patients/list response:", patients); // <-- Add this line
      if (!response.ok) throw new Error("Chyba pri načítaní pacientov.");

      // Map doctor_id and hospital_id directly from the API response
      allPatientsData = patients.map(patient => {
            const matchedDoctor = allDoctorsData.find(doctor => doctor.id === patient.doctor_id);
            const matchedHospital = hospitalsData.find(hospital => patient.hospital_id === hospital.id);

            return {
                ...patient,
                doctor_name: matchedDoctor
                    ? `${matchedDoctor.first_name} ${matchedDoctor.last_name}`
                    : patient.doctor_name, // Fallback to the original name if no match
                hospital_name: matchedHospital
                    ? matchedHospital.name
                    : patient.hospital_name // Fallback to the original name if no match
            };
        });

        // Populate dropdowns with only the options present in the patient list
        populateDoctorDropdown(allPatientsData);
        populateHospitalDropdown(allPatientsData);

        // Render both views
        renderPatients(allPatientsData, sortSelect?.value);
        renderAllListTable(allPatientsData);
    } catch (err) {
        console.error(err);
        if (allPatientsList) {
            allPatientsList.innerHTML = `<p>Chyba pri načítaní pacientov: ${err.message}</p>`;
        }
    }
  }

  // Remove these functions:
  // function hideFiltersForUser(userType, isSuperDoctor) { ... }
  // function showFiltersForUser(userType, isSuperDoctor) { ... }

  // And update checkUserTypeAndAdjustForm to remove their usage:
  async function checkUserTypeAndAdjustForm() {
    try {
      const response = await fetch("/settings/info", {
        method: "GET",
        headers: { "Accept": "application/json" },
        credentials: "include"
      });

      if (!response.ok) throw new Error("Failed to fetch user type");

      const rawText = await response.clone().text();
      console.log("Raw /settings/info response:", rawText);

      const user = await response.json();
      userType = user.user_type;

      // Determine if doctor is "super doctor" by checking if there are multiple unique doctors in patients
      let isSuperDoctor = false;
      if (userType === "doctor") {
        const uniqueDoctorIds = new Set(allPatientsData.map(p => p.doctor_id).filter(Boolean));
        isSuperDoctor = uniqueDoctorIds.size > 1;
      }

      console.log("User info:", user);
      console.log("User type:", userType, "Super doctor (by patient list):", isSuperDoctor);

      // Hide both filters by default
      if (hospitalFilterDropdown) {
        const hospitalDropdownWrapper = hospitalFilterDropdown.closest(".dropdown") || hospitalFilterDropdown.parentElement;
        if (hospitalDropdownWrapper) hospitalDropdownWrapper.style.display = "none";
      }
      if (doctorFilterDropdown) {
        const doctorDropdownWrapper = doctorFilterDropdown.closest(".dropdown") || doctorFilterDropdown.parentElement;
        if (doctorDropdownWrapper) doctorDropdownWrapper.style.display = "none";
      }

      // Show both filters for super_admin or super doctor
      if (userType === "super_admin" || (userType === "doctor" && isSuperDoctor)) {
        if (hospitalFilterDropdown) {
          const hospitalDropdownWrapper = hospitalFilterDropdown.closest(".dropdown") || hospitalFilterDropdown.parentElement;
          if (hospitalDropdownWrapper) hospitalDropdownWrapper.style.display = "";
        }
        if (doctorFilterDropdown) {
          const doctorDropdownWrapper = doctorFilterDropdown.closest(".dropdown") || doctorFilterDropdown.parentElement;
          if (doctorDropdownWrapper) doctorDropdownWrapper.style.display = "";
        }
      }

      // Show only doctor filter for admin
      else if (userType === "admin") {
        if (doctorFilterDropdown) {
          const doctorDropdownWrapper = doctorFilterDropdown.closest(".dropdown") || doctorFilterDropdown.parentElement;
          if (doctorDropdownWrapper) doctorDropdownWrapper.style.display = "";
        }
      }

      // --- ROBUST HIDE DOCTOR SELECT FOR DOCTOR USER IN ADD TAB ---
      if (userType === "doctor") {
        // Hide by style
        if (doctorFormGroup) doctorFormGroup.style.display = "none";
        // Hide by adding a class (for CSS fallback)
        if (doctorFormGroup) doctorFormGroup.classList.add("hidden");
        // Hide by setting all children to hidden (last resort)
        if (doctorFormGroup) {
          Array.from(doctorFormGroup.children).forEach(child => {
            child.style.display = "none";
          });
        }
        // Store doctor id for later use
        if (doctorSelect) doctorSelect.dataset.doctorId = user.id;
      } else if (doctorFormGroup) {
        // Show for others
        doctorFormGroup.style.display = "";
        doctorFormGroup.classList.remove("hidden");
        Array.from(doctorFormGroup.children).forEach(child => {
          child.style.display = "";
        });
        if (doctorSelect) doctorSelect.dataset.doctorId = "";
      }
    } catch (error) {
      console.error("Error checking user type:", error);
    }
    hideAssignDoctorFieldIfDoctorUser();
  }

  // Helper to robustly hide the doctor select and its label in the ASSIGN form for normal doctors
  function hideAssignDoctorFieldIfDoctorUser() {
    if (userType === "doctor") {
      // Hide the doctor select
      const assignDoctorSelect = document.getElementById("assign-doctor");
      if (assignDoctorSelect) assignDoctorSelect.style.display = "none";
      // Hide the label
      const assignDoctorLabel = document.querySelector('label[for="assign-doctor"]');
      if (assignDoctorLabel) assignDoctorLabel.style.display = "none";
      // Hide the parent form-group for better layout
      const assignDoctorFormGroup = assignDoctorSelect?.closest(".form-group");
      if (assignDoctorFormGroup) assignDoctorFormGroup.style.display = "none";
    }
  }

  // Load data
  await loadAllDoctors();
  await loadAllPatients();
  checkUserTypeAndAdjustForm();

  // Submit new patient
  addBtn.addEventListener("click", async () => {
    addPatientMessage.textContent = "";
    addPatientMessage.classList.remove("error", "success");

    // Skontrolujeme ešte raz, či je form OK:
    touchedFields.firstName = true;
    touchedFields.lastName = true;
    touchedFields.phone = true;
    touchedFields.birthNumber = true;
    touchedFields.email = true;
    touchedFields.password = true;
    touchedFields.confirmPassword = true;
    touchedFields.gdpr = true;

    // Pass true to show main error message only on submit
    const isFormOk = validateAddPatientForm(true);
    if (!isFormOk) {
      if (!addPatientMessage.textContent) {
        addPatientMessage.textContent = "Vyplňte všetky polia správne.";
        addPatientMessage.classList.add("error");
      }
      // Log validation error
      console.error("Form validation failed. Not sending request.");
      return;
    }

    // Ak všetko sedí, odosielame
    let doctorIdValue = doctorSelect.value || null;
    if (userType === "doctor") {
      doctorIdValue = doctorSelect.dataset.doctorId;
      if (!doctorIdValue || doctorIdValue === "undefined") {
        doctorIdValue = null;
      }
    }

    // Generate gender from birth number
    const { gender } = parseBirthNumber(birthNumberInput.value.trim());

    const bodyPayload = {
      first_name: firstNameInput.value.trim(),
      last_name: lastNameInput.value.trim(),
      phone_number: phoneInput.value.trim(),
      birth_number: birthNumberInput.value.trim(),
      gender: gender, // <-- Use generated gender
      doctor_id: doctorIdValue,
      email: emailInput.value.trim(),
      password: passwordInput.value
    };

    // Log what is being sent
    console.log("Sending patient payload:", bodyPayload);

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
      showTab("all");
      loadAllPatients();
    } catch (err) {
      // Log error to console
      console.error("Error while sending patient data:", err);
      addPatientMessage.textContent = err.message || "Nepodarilo sa pridať pacienta.";
      addPatientMessage.classList.add("error");
    }
  });

  // Submit assign patient form
  assignBtn.addEventListener("click", async () => {
    assignPatientMessage.textContent = "";
    assignPatientMessage.classList.remove("error", "success");
    assignTouchedFields.birthNumber = true;
    assignTouchedFields.doctor = true;

    const isFormOk = validateAssignForm();
    if (!isFormOk) {
      assignPatientMessage.textContent = "Vyplňte všetky polia správne.";
      assignPatientMessage.classList.add("error");
      return;
    }

    // Get selected patient ID from dropdown
    const selectedPatientId = assignPatientDropdown.value;

    // For normal doctor, send empty doctor_id
    let doctorIdValue = assignDoctorSelect.value;
    if (userType === "doctor") {
      doctorIdValue = "";
    }

    const bodyPayload = {
      id: selectedPatientId,
      doctor_id: doctorIdValue
    };

    // Log the payload being sent
    console.log("Assign patient payload:", bodyPayload);

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
      showTab("all");
      loadAllPatients();
    } catch (err) {
      console.error(err);
      assignPatientMessage.textContent = err.message || "Nepodarilo sa priradiť pacienta.";
      assignPatientMessage.classList.add("error");
    }
  });

  // Prevent form submit on Enter in the assign patient form
  assignPatientForm.addEventListener("submit", (e) => {
    e.preventDefault();
  });

  // On page load, restore view mode
  restorePatientViewMode();

  // Add these listeners after dropdowns are defined:
hospitalFilterDropdown?.addEventListener("change", applyFiltersAndSorting);
doctorFilterDropdown?.addEventListener("change", applyFiltersAndSorting);
searchInput?.addEventListener("input", debounce(applyFiltersAndSorting, 200));
sortSelect?.addEventListener("change", applyFiltersAndSorting);

// Remove the old event listener on #all-list-table (with blue arrows) and keep only the logic below:

function updateSortIconsPatients() {
  const allHeaderCells = document.querySelectorAll("#all-list-container thead th");
  allHeaderCells.forEach(th => {
    // Remove any existing sort arrow (ours or from static HTML)
    th.classList.remove("sort-asc", "sort-desc");
    th.querySelectorAll('.sort-arrow, .arrow-up, .arrow-down').forEach(el => el.remove());

    const col = th.getAttribute("data-sort") || th.getAttribute("data-column");
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

const allListTableHead = document.querySelector(".patients-list-table thead");
if (allListTableHead) {
  allListTableHead.addEventListener("click", (e) => {
    const th = e.target.closest("th[data-sort], th[data-column]");
    if (!th) return;
    const sortCol = th.getAttribute("data-sort") || th.getAttribute("data-column");
    if (!sortCol) return;

    if (allCurrentSortColumn === sortCol) {
      allCurrentSortDirection = allCurrentSortDirection === "asc" ? "desc" : "asc";
    } else {
      allCurrentSortColumn = sortCol;
      allCurrentSortDirection = "asc";
    }

    updateSortIconsPatients();
    applyFiltersAndSorting();
  });
}

// On initial render, set arrow indicators
updateSortIconsPatients();

// Populate doctor select in assign form
function populateAssignDoctorSelect() {
  if (!assignDoctorSelect) return;
  assignDoctorSelect.innerHTML = '<option value="" selected>Vyberte doktora</option>';
  allDoctorsData.forEach(doctor => {
    // Use hospital name from nested hospital object
    const hospitalName = doctor.hospital && doctor.hospital.name ? doctor.hospital.name : "-";
    const option = document.createElement("option");
    option.value = doctor.id;
    option.textContent = `${doctor.first_name} ${doctor.last_name} (${hospitalName})`;
    assignDoctorSelect.appendChild(option);
  });
}

// --- Add this near your assign form variables ---
const assignPatientDropdown = document.getElementById("assign-patient-dropdown");

// --- Update validateAssignForm to NOT check birth number input ---
function validateAssignForm() {
  let isValid = true;

  // No birth number validation anymore!
  clearError(assignBirthNumberErrorDiv);

  const selectedPatientId = assignPatientDropdown.value;
  const doctorVal = assignDoctorSelect.value;

  // Validate patient selection
  if (!selectedPatientId) {
    isValid = false;
    // Optionally show error if you want
    // showError(assignBirthNumberErrorDiv, "Vyberte pacienta zo zoznamu.");
  }

  // Validate doctor selection
  if (!doctorVal && ["super_admin", "admin"].includes(userType)) {
    isValid = false;
    if (assignTouchedFields.doctor) {
      assignPatientMessage.textContent = "";
      assignPatientMessage.textContent = "Vyberte doktora.";
      assignPatientMessage.classList.add("error");
    }
  }

  assignBtn.disabled = !isValid;
  return isValid;
}

// --- Add this function to update the dropdown as you type ---
function updateAssignPatientDropdown() {
  if (!assignPatientDropdown) return;
  const input = assignBirthNumberInput.value.trim();

  assignPatientDropdown.innerHTML = ""; // Always clear first

  let matches;
  if (input.length === 0) {
    // Show all patients and the "Začnite..." option
    assignPatientDropdown.innerHTML = '<option value="">Začnite písať rodné číslo...</option>';
    matches = allPatientsData;
  } else {
    // Only show filtered patients, NO "Začnite..." option
    matches = allPatientsData.filter(p =>
      p.birth_number && p.birth_number.startsWith(input)
    );
  }

  matches.forEach(p => {
    const option = document.createElement("option");
    option.value = p.id;
    option.textContent = `${p.first_name} ${p.last_name} (${p.birth_number})`;
    assignPatientDropdown.appendChild(option);
  });

  if (matches.length > 0) {
    assignPatientDropdown.size = matches.length + (input.length === 0 ? 1 : 0);
    assignPatientDropdown.style.display = "block";
  } else {
    assignPatientDropdown.size = 1;
    assignPatientDropdown.style.display = "block";
  }
}

// Show all options when input is focused and empty
assignBirthNumberInput.addEventListener("focus", () => {
  updateAssignPatientDropdown();
  if (assignBirthNumberInput.value.trim() === "") {
    assignPatientDropdown.size = allPatientsData.length + 1;
    assignPatientDropdown.style.display = "block";
  }
});

// Allow arrow navigation from input to dropdown
let lastInputValue = "";
let ignoreDropdownChange = false;

assignBirthNumberInput.addEventListener("keydown", (e) => {
  if ((e.key === "ArrowDown" || e.key === "Tab") && assignPatientDropdown.options.length > 1) {
    lastInputValue = assignBirthNumberInput.value; // Save before dropdown
    assignPatientDropdown.focus();
    setTimeout(() => {
      assignPatientDropdown.selectedIndex = 1;
    }, 0);
    e.preventDefault();
  }
});

assignPatientDropdown.addEventListener("keydown", (e) => {
  if (e.key === "ArrowDown" || e.key === "ArrowUp") {
    assignBirthNumberInput.value = lastInputValue;
    ignoreDropdownChange = true;
  }
  if (e.key === "ArrowUp" && assignPatientDropdown.selectedIndex === 1) {
    assignBirthNumberInput.focus();
    e.preventDefault();
  }
  // Only Enter should fill the input:
  if (e.key === "Enter" && assignPatientDropdown.selectedIndex > 0) {
    const selectedId = assignPatientDropdown.value;
    const selectedPatient = allPatientsData.find(p => String(p.id) === String(selectedId));
    if (selectedPatient) {
      assignBirthNumberInput.value = selectedPatient.birth_number;
      updateAssignPatientDropdown();
      validateAssignForm();
      assignPatientDropdown.blur();
      assignBirthNumberInput.focus();
    }
    e.preventDefault();
  }
});

// Only mouse click or change event fills the input, but ignore if triggered by Arrow keys
assignPatientDropdown.addEventListener("change", (e) => {
  if (ignoreDropdownChange) {
    ignoreDropdownChange = false;
    return;
  }
  const selectedId = assignPatientDropdown.value;
  if (!selectedId) {
    // First option selected: clear the search input
    assignBirthNumberInput.value = "";
    updateAssignPatientDropdown();
    validateAssignForm();
    return;
  }
  const selectedPatient = allPatientsData.find(p => String(p.id) === String(selectedId));
  if (selectedPatient) {
    assignBirthNumberInput.value = selectedPatient.birth_number;
    updateAssignPatientDropdown();
    validateAssignForm();
    // Optionally blur dropdown and focus input for better UX:
    assignPatientDropdown.blur();
    assignBirthNumberInput.focus();
  }
});

// Helper to generate date of birth and gender from 6-digit birth number
function parseBirthNumber(birthNumber) {
  if (!/^\d{6}$/.test(birthNumber)) return { dateOfBirth: "", gender: "" };
  const year = parseInt(birthNumber.slice(0, 2), 10);
  let month = parseInt(birthNumber.slice(2, 4), 10);
  const day = parseInt(birthNumber.slice(4, 6), 10);

  let gender = "Muž";
  if (month > 50) {
    gender = "Žena";
    month -= 50;
  }

  // Guess century: if year > 30, use 1900s, else 2000s
  const fullYear = year > 30 ? 1900 + year : 2000 + year;

  // Validate month and day
  const isMonthValid = month >= 1 && month <= 12;
  const isDayValid = day >= 1 && day <= 31;
  let isDateValid = false;
  if (isMonthValid && isDayValid) {
    const testDate = new Date(fullYear, month - 1, day);
    isDateValid =
      testDate.getFullYear() === fullYear &&
      testDate.getMonth() === month - 1 &&
      testDate.getDate() === day;
  }
  if (!isMonthValid || !isDayValid || !isDateValid) {
    return { dateOfBirth: "", gender: "" };
  }

  // Format date as DD.MM.YYYY
  const dateOfBirth = `${String(day).padStart(2, "0")}.${String(month).padStart(2, "0")}.${fullYear}`;
  return { dateOfBirth, gender };
}

// Example usage: update on birth number input
birthNumberInput.addEventListener("input", () => {
  let val = birthNumberInput.value.replace(/\D/g, "");
  if (val.length > 6) val = val.substring(0, 6);
  birthNumberInput.value = val;
  validateAddPatientForm();

  // Generate and display date of birth and gender if needed
  const { dateOfBirth, gender } = parseBirthNumber(val);
  // You can display these values in the UI if you want, e.g.:
  // document.getElementById("patient-dob-preview").textContent = dateOfBirth;
  // document.getElementById("patient-gender-preview").textContent = gender;
});

// --- Add this function to fetch unassigned patients for assign tab only ---
async function loadUnassignedPatientsForAssign() {
  try {
    const response = await fetch("/patients/unassigned_list", {
      method: "GET",
      headers: { "Accept": "application/json" },
      credentials: "include"
    });
    const rawText = await response.clone().text();
    console.log("Raw /patients/unassigned_list response:", rawText);
    const patients = JSON.parse(rawText);
    if (!response.ok) throw new Error("Chyba pri načítaní nezaradených pacientov.");

    // Fill the dropdown for assign tab with these patients
    allPatientsData = patients.map(patient => {
      const matchedDoctor = allDoctorsData.find(doctor => doctor.id === patient.doctor_id);
      const matchedHospital = hospitalsData.find(hospital => patient.hospital_id === hospital.id);

      return {
        ...patient,
        doctor_name: matchedDoctor
          ? `${matchedDoctor.first_name} ${matchedDoctor.last_name}`
          : patient.doctor_name,
        hospital_name: matchedHospital
          ? matchedHospital.name
          : patient.hospital_name
      };
    });

    updateAssignPatientDropdown();
  } catch (err) {
    console.error(err);
    if (assignPatientDropdown) {
      assignPatientDropdown.innerHTML = `<option value="">Chyba pri načítaní pacientov</option>`;
    }
  }
}
});