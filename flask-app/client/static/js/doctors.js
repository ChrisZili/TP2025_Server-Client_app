document.addEventListener("DOMContentLoaded", () => {
  // -- All variables --
  let allDoctorsData = [];
  let currentSortColumn = "last_name"; // Default sort column
  let currentSortDirection = "asc"; // Default sort direction
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
  });

  // Switch between cards and list views
  function switchView(mode) {
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

      if (!phoneRegex.test(phone)) {
        addDoctorMessage.textContent = "Telefónne číslo musí byť vo formáte E.164 (napr. +421123456789).";
        addDoctorMessage.classList.add("error");
        return;
      }

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
        !phone ||
        !gender ||
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
  switchView("cards");
});