document.addEventListener("DOMContentLoaded", () => {
  // -- All variables --
  let allDoctorsData = [];
  let currentSortColumn = "last_name"; // Default sort column
  let currentSortDirection = "asc"; // Default sort direction

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
  const tableHeaders = document.querySelectorAll("#all-list-container thead th"); // Table headers for sorting

  // Tab elements
  const tabAll = document.getElementById("tab-all");
  const tabAdd = document.getElementById("tab-add");
  const tabAllContent = document.getElementById("tab-all-content");
  const tabAddContent = document.getElementById("tab-add-content");

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
  function performSearch() {
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

    renderAllListTable(filtered);
    renderDoctors(filtered);
  }

  // Sort doctors based on the current column and direction
  function sortDoctors(doctors) {
    return [...doctors].sort((a, b) => {
      let valA, valB;

      if (currentSortColumn === "full_name") {
        valA = getFullName(a);
        valB = getFullName(b);
      } else if (currentSortColumn === "hospital") {
        valA = (a.hospital?.name || "").toLowerCase();
        valB = (b.hospital?.name || "").toLowerCase();
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

    const sorted = sortDoctors(doctors);

    sorted.forEach((doctor) => {
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

    // Sort the doctors before rendering
    const sorted = sortDoctors(doctors);

    sorted.forEach((doctor) => {
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

      // Re-render the table and cards with the new sorting
      performSearch();
    });
  });

  // Switch between cards and list views
  function switchView(mode) {
    const sortDropdownContainer = sortSelect?.parentElement; // Parent container of the sort dropdown
    const hospitalDropdownContainer = hospitalFilter?.parentElement; // Parent container of the hospital dropdown

    if (mode === "cards") {
      // Show card view
      allCardsContainer?.classList.remove("hidden");
      allListContainer?.classList.add("hidden");
      viewCardsBtn?.classList.add("active");
      viewListBtn?.classList.remove("active");

      // Show the sort dropdown
      sortDropdownContainer?.classList.remove("hidden");
    } else if (mode === "list") {
      // Show list view
      allCardsContainer?.classList.add("hidden");
      allListContainer?.classList.remove("hidden");
      viewCardsBtn?.classList.remove("active");
      viewListBtn?.classList.add("active");

      // Hide the sort dropdown
      sortDropdownContainer?.classList.add("hidden");
    }

    // Ensure the hospital dropdown is always visible
    hospitalDropdownContainer?.classList.remove("hidden");
  }

  // Helper function to switch tabs
  function switchTab(tab) {
    // Hide all tabs
    tabAllContent?.classList.add("hidden");
    tabAddContent?.classList.add("hidden");

    // Remove active class from all tabs
    tabAll?.classList.remove("active");
    tabAdd?.classList.remove("active");

    // Show the selected tab
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

  // Add Doctor functionality
  const addDoctorBtn = document.getElementById("add-doctor-btn");
  if (addDoctorBtn) {
    addDoctorBtn.addEventListener("click", async () => {
      const addDoctorMessage = document.getElementById("add-doctor-message");
      addDoctorMessage.textContent = "";
      addDoctorMessage.classList.remove("error", "success");

      const firstName = document.getElementById("doctor-first-name").value.trim();
      const lastName = document.getElementById("doctor-last-name").value.trim();
      const phone = document.getElementById("doctor-phone").value.trim();
      const gender = document.getElementById("doctor-gender").value;
      const hospitalCode = document.getElementById("doctor-hospital-code").value.trim();
      const email = document.getElementById("doctor-email").value.trim();
      const password = document.getElementById("doctor-password").value;
      const passwordConfirm = document.getElementById("doctor-password-confirm").value;
      const gdprChecked = document.getElementById("gdpr").checked;

      // Log all input values for debugging
      console.log("First Name:", firstName);
      console.log("Last Name:", lastName);
      console.log("Phone:", phone);
      console.log("Gender:", gender);
      console.log("Hospital Code:", hospitalCode);
      console.log("Email:", email);
      console.log("Password:", password);
      console.log("Password Confirm:", passwordConfirm);
      console.log("GDPR Checked:", gdprChecked);

      // Validation regex patterns
      const nameRegex = /^[a-zA-ZÀ-ž\s]{2,255}$/; // Allows letters, accents, and spaces (2-255 characters)
      const phoneRegex = /^(?:\+421|421|0)\d{9}$/; // E.164 format for phone numbers

      // Validation checks
      if (!nameRegex.test(firstName)) {
        console.error("Validation Error: Invalid First Name");
        addDoctorMessage.textContent = "Meno musí obsahovať iba písmená a mať dĺžku 2 až 255 znakov.";
        addDoctorMessage.classList.add("error");
        return;
      }

      if (!nameRegex.test(lastName)) {
        console.error("Validation Error: Invalid Last Name");
        addDoctorMessage.textContent = "Priezvisko musí obsahovať iba písmená a mať dĺžku 2 až 255 znakov.";
        addDoctorMessage.classList.add("error");
        return;
      }

      if (!phoneRegex.test(phone)) {
        console.error("Validation Error: Invalid Phone Number");
        addDoctorMessage.textContent = "Telefónne číslo musí byť vo formáte E.164 (napr. +421123456789).";
        addDoctorMessage.classList.add("error");
        return;
      }

      if (!firstName || !lastName || !phone || !gender || !hospitalCode || !email || !password || !passwordConfirm) {
        console.error("Validation Error: Missing Required Fields");
        addDoctorMessage.textContent = "Vyplňte všetky polia vrátane emailu a hesla.";
        addDoctorMessage.classList.add("error");
        return;
      }

      if (password !== passwordConfirm) {
        console.error("Validation Error: Passwords Do Not Match");
        addDoctorMessage.textContent = "Heslá sa nezhodujú.";
        addDoctorMessage.classList.add("error");
        return;
      }

      if (!gdprChecked) {
        console.error("Validation Error: GDPR Not Checked");
        addDoctorMessage.textContent = "Musíte súhlasiť so spracovaním údajov (GDPR).";
        addDoctorMessage.classList.add("error");
        return;
      }

      try {
        console.log("Sending data to the server...");
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
            role
          })
        });


        const data = await resp.json();
        if (!resp.ok) throw new Error(data.error || "Chyba pri vytváraní doktora.");

        console.log("Doctor added successfully:", data);
        addDoctorMessage.textContent = data.message || "Doktor úspešne pridaný.";
        addDoctorMessage.classList.add("success");
        resetDoctorForm();
        switchTab("all");
        loadAllDoctors();
      } catch (err) {
        console.error("Error Adding Doctor:", err);
        addDoctorMessage.textContent = err.message || "Nepodarilo sa pridať doktora.";
        addDoctorMessage.classList.add("error");
      }
    });
  }

  // Helper function to reset the "Add Doctor" form
  function resetDoctorForm() {
    const addDoctorForm = document.getElementById("add-doctor-form");
    if (addDoctorForm) {
      addDoctorForm.reset();
    }
    const addDoctorMessage = document.getElementById("add-doctor-message");
    if (addDoctorMessage) {
      addDoctorMessage.textContent = "";
      addDoctorMessage.classList.remove("error", "success");
    }
  }

  // Add event listeners
  searchInput?.addEventListener("keyup", debounce(performSearch, 300));
  hospitalFilter?.addEventListener("change", performSearch);
  viewCardsBtn?.addEventListener("click", () => switchView("cards"));
  viewListBtn?.addEventListener("click", () => switchView("list"));
  tabAll?.addEventListener("click", () => switchTab("all"));
  tabAdd?.addEventListener("click", () => switchTab("add"));

  // Debounce function
  function debounce(func, delay) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), delay);
    };
  }

  // Initial load
  loadAllDoctors();
  switchTab("all"); // Default to "All Doctors" tab
  switchView("cards");
});