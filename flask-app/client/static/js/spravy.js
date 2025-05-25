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

  const tabAllContent = document.getElementById("tab-all-content");
  const tabAddContent = document.getElementById("tab-add-content");

  // Form elements - "Add Patient"
  const addPatientMessage = document.getElementById("add-patient-message");
  const sendMessageForm = document.getElementById("send-message-form");
  const doctorSelect = document.getElementById("patient-doctor");

  // ADD THIS LINE to robustly find the form group for the doctor select:
  const doctorFormGroup =
    doctorSelect?.closest(".form-group") ||
    doctorSelect?.parentElement ||
    document.querySelector('label[for="patient-doctor"]')?.parentElement;

  // Polia formulára (Add Patient):
  //const firstNameInput = document.getElementById("patient-first-name");
  //const lastNameInput = document.getElementById("patient-last-name");
  //const phoneInput = document.getElementById("patient-phone");
  //const birthDateInput = document.getElementById("patient-birth-date");
  //const birthNumberInput = document.getElementById("patient-birth-number");
  //const genderSelect = document.getElementById("patient-gender");
  //const emailInput = document.getElementById("patient-email");
  //const passwordInput = document.getElementById("patient-password");
  //const confirmPasswordInput = document.getElementById("patient-password-confirm");
  //const gdprCheckbox = document.getElementById("gdpr");
  //const addBtn = document.getElementById("add-patient-btn");
  const sendBtn = document.getElementById("send-message-btn");
  const recipientInput = document.getElementById("message-recipient");
  const messageInput = document.getElementById("message-text");
  const imageInput = document.getElementById("message-image");
  const feedbackDiv = document.getElementById("send-message-feedback");

  // Error divy
  //const firstNameErrorDiv = document.getElementById("patient-first-name-error");
  //const lastNameErrorDiv = document.getElementById("patient-last-name-error");
  //const phoneErrorDiv = document.getElementById("patient-phone-error");
  //const birthDateErrorDiv = document.getElementById("patient-birth-date-error");
  /*const birthNumberErrorDiv = document.getElementById("patient-birth-number-error");
  const genderErrorDiv = document.getElementById("patient-gender-error");
  const emailErrorDiv = document.getElementById("patient-email-error");
  const passwordErrorDiv = document.getElementById("patient-password-error");
  const confirmPasswordErrorDiv = document.getElementById("patient-password-confirm-error");
  const gdprErrorDiv = document.getElementById("gdpr-error");*/

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
  tabAdd?.addEventListener("click", () => {
    showTab("add");
    resetPatientForm();
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

    tabAllContent?.classList.add("hidden");
    tabAddContent?.classList.add("hidden");

    if (tab === "all") {
      tabAll?.classList.add("active");
      tabAllContent?.classList.remove("hidden");
    } else if (tab === "add") {
      tabAdd?.classList.add("active");
      tabAddContent?.classList.remove("hidden");
      resetPatientForm(); // Po každom prekliku do "add" formulára ho resetneme.
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
  const selectedDoctorId = doctorFilterDropdown?.value ? parseInt(doctorFilterDropdown.value, 10) : null;
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
    const matchesDoctor = !selectedDoctorId || patient.doctor_id === selectedDoctorId;

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
      // Use the doctor_id and doctor_name from the patient object
      if (p.doctor_id && !seenDoctorIds.has(p.doctor_id)) {
        uniqueDoctors.push({ id: p.doctor_id, name: p.doctor_name });
        seenDoctorIds.add(p.doctor_id);
      }
    });

    doctorFilterDropdown.innerHTML = '<option value="">Všetci doktori</option>';
    uniqueDoctors.forEach(doctor => {
      const option = document.createElement("option");
      option.value = doctor.id; // Use the ID as value
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
  }

  await loadAllDoctors();
  await loadAllPatients();
  checkUserTypeAndAdjustForm();

  

  

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



  // Helper to show feedback
  function showFeedback(msg, isError = true) {
    feedbackDiv.textContent = msg;
    feedbackDiv.className = isError ? "error" : "success";
  }

  // Enable button when inputs are not empty
  [recipientInput, messageInput].forEach((el) =>
    el.addEventListener("input", () => {
      sendBtn.disabled = !(recipientInput.value.trim() && messageInput.value.trim());
    })
  );

  sendBtn.addEventListener("click", async () => {
    showFeedback(""); // Clear previous

    // Simple validation
    const recipient = recipientInput.value.trim();
    const message = messageInput.value.trim();

    if (!recipient || !message) {
      showFeedback("Príjemca a správa sú povinné polia.");
      return;
    }

    const formData = new FormData();
    formData.append("recipient", recipient);
    formData.append("message", message);

    if (imageInput.files.length > 0) {
      formData.append("image", imageInput.files[0]);
    }

    try {
      const response = await fetch("/messages/send", {
        method: "POST",
        body: formData,
        credentials: "include"
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Chyba pri odosielaní správy.");

      showFeedback(data.message || "Správa bola úspešne odoslaná.", false);

      // Reset form
      document.getElementById("send-message-form").reset();
      sendBtn.disabled = true;
    } catch (err) {
      console.error("Sending message failed:", err);
      showFeedback(err.message || "Správu sa nepodarilo odoslať.");
    }
  });






// On initial render, set arrow indicators
updateSortIconsPatients();
});