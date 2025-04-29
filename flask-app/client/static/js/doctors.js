document.addEventListener("DOMContentLoaded", () => {
  // -- All variables --
  let allDoctorsData = [];
  let userType = "";

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
  const allDoctorsList = document.getElementById("all-doctors-cards");

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
  const addDoctorMessage = document.getElementById("add-doctor-message");
  const addDoctorForm = document.getElementById("add-doctor-form");

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
  setupPasswordToggle('doctor-password', 'toggle-password');
  setupPasswordToggle('doctor-password-confirm', 'toggle-password-confirm');

  // -- View mode toggle function --
  function setViewMode(mode) {
    localStorage.setItem("doctorViewMode", mode);

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
    renderAllListTable(allDoctorsData);
    renderDoctors(allDoctorsData, sortSelect?.value);
    performSearch(); // Re-render search results
  }

  // Tab switching function
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

  // Helper function to get full name without title
  function getFullNameWithoutTitle(doctor) {
    return `${doctor.first_name || ""} ${doctor.last_name || ""}`.trim().toLowerCase();
  }

  // Doctor sorting function
  function sortDoctors(doctors, sortValue = "creation") {
    let sorted = [...doctors];

    if (sortValue === "alphabetical-asc") {
      sorted.sort((a, b) => getFullNameWithoutTitle(a).localeCompare(getFullNameWithoutTitle(b)));
    } else if (sortValue === "alphabetical-desc") {
      sorted.sort((a, b) => getFullNameWithoutTitle(b).localeCompare(getFullNameWithoutTitle(a)));
    } else if (sortValue === "newest") {
      sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else { // "creation" - starší po novší
      sorted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    }

    return sorted;
  }

  // Reset doctor form
  function resetDoctorForm() {
    if (addDoctorForm) {
      addDoctorForm.reset();
    }
    if (addDoctorMessage) {
      addDoctorMessage.textContent = "";
      addDoctorMessage.classList.remove("error", "success");
    }
  }

  // Check user type and adjust form visibility
  async function checkUserTypeAndAdjustForm() {
    try {
      const response = await fetch("/settings/info", {
        method: "GET",
        headers: { Accept: "application/json" },
        credentials: "include"
      });
      if (!response.ok) throw new Error("Failed to fetch user type");
      const user = await response.json();
      userType = user.user_type
      const hospitalCodeGroup = document.querySelector('#doctor-hospital-code')?.closest('.form-group');
      const doctorType = document.querySelector('#doctor-type')?.closest('.form-group');

      if (hospitalCodeGroup && user.user_type !== "super_admin") {
        hospitalCodeGroup.style.display = "none";
        doctorType.style.display = "none";
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
  function formatDate(dateString) {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString('sk-SK', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
  // Render all list table with fixed sorting
  function renderAllListTable(doctors) {
    if (!allListBody) return;
    allListBody.innerHTML = "";

    if (!Array.isArray(doctors) || doctors.length === 0) {
      return; // Empty table for no data
    }

    let data = [...doctors];
    data.sort((a, b) => {
      let valA, valB;

      if (allCurrentSortColumn === "full_name") {
        valA = getFullNameWithoutTitle(a);
        valB = getFullNameWithoutTitle(b);
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

    data.forEach(d => {
      const tr = document.createElement("tr");
      const fullName = `${d.title || ""} ${d.first_name} ${d.last_name} ${d.suffix || ""}`.trim();
      const hospitalName = d.hospital?.name || "-";

      tr.innerHTML = `
        <td>${fullName}</td>
        <td>${formatDate(d.created_at) || "-"}</td>
        <td>${d.phone_number || "-"}</td>
        <td>${d.email || "-"}</td>
        <td>${hospitalName}</td>
      `;

      tr.addEventListener("click", () => {
        window.location.href = `/doctors/${d.id}`;
      });

      allListBody.appendChild(tr);
    });
  }

  // Search list table rendering with fixed sorting
  function renderSearchListTable(doctors) {
    if (!searchListBody) return;
    searchListBody.innerHTML = "";

    if (!Array.isArray(doctors) || doctors.length === 0) {
      return;
    }

    let data = [...doctors];
    data.sort((a, b) => {
      let valA, valB;

      if (searchCurrentSortColumn === "full_name") {
        valA = getFullNameWithoutTitle(a);
        valB = getFullNameWithoutTitle(b);
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

    data.forEach(d => {
      const tr = document.createElement("tr");
      const fullName = `${d.title || ""} ${d.first_name} ${d.last_name} ${d.suffix || ""}`.trim();
      const hospitalName = d.hospital?.name || "-";

      tr.innerHTML = `
        <td>${fullName}</td>
        <td>${d.created_at || "-"}</td>
        <td>${d.phone_number || "-"}</td>
        <td>${d.email || "-"}</td>
        <td>${hospitalName}</td>
      `;

      tr.addEventListener("click", () => {
        window.location.href = `/doctors/${d.id}`;
      });

      searchListBody.appendChild(tr);
    });
  }

  // Load all doctors
  async function loadAllDoctors() {
    try {
      const response = await fetch("/doctors/list", {
        method: "GET",
        headers: { "Accept": "application/json" },
        credentials: "include"
      });
      if (!response.ok) throw new Error("Chyba pri načítaní doktorov.");
      const doctors = await response.json();
      allDoctorsData = doctors;

      // Render both views
      renderDoctors(doctors, sortSelect?.value);
      renderAllListTable(doctors);
    } catch (err) {
      console.error(err);
      if (allDoctorsList) {
        allDoctorsList.innerHTML = `<p>Chyba pri načítaní doktorov: ${err.message}</p>`;
      }
    }
  }

  // Card view rendering
  function renderDoctors(doctors, sortValue) {
    if (!allDoctorsList) return;

    if (!Array.isArray(doctors) || doctors.length === 0) {
      allDoctorsList.innerHTML = "<p>Žiadni doktori nenájdení.</p>";
      return;
    }

    const sorted = sortDoctors(doctors, sortValue);
    allDoctorsList.innerHTML = "";

    const container = document.createElement("div");
    container.classList.add("cards");

    sorted.forEach(d => {
      const hospitalName = d.hospital ? d.hospital.name : "";

      const card = document.createElement("div");
      card.classList.add("card");
      card.addEventListener("click", () => {
        window.location.href = `/doctors/${d.id}`;
      });

      const name = document.createElement("h3");
      name.textContent = `${d.title || ""} ${d.first_name} ${d.last_name} ${d.suffix || ""}`.trim();

      const created_at = document.createElement("p");
      created_at.textContent = `Deň vytvorenia: ${formatDate(d.created_at)}`;

      const email = document.createElement("p");
      email.textContent = `Email: ${d.email}`;

      const phone = document.createElement("p");
      phone.textContent = `Telefón: ${d.phone_number}`;

      const hospital = document.createElement("p");
      hospital.textContent = `Nemocnica: ${hospitalName}`;

      card.appendChild(name);
      card.appendChild(created_at)
      card.appendChild(phone);
      card.appendChild(email);
      card.appendChild(hospital);

      container.appendChild(card);
    });

    allDoctorsList.appendChild(container);
  }

  // Search function
  function performSearch() {
    const query = searchInput?.value.trim().toLowerCase();
    const mode = localStorage.getItem("doctorViewMode") || "cards";

    if (searchResults) {
      searchResults.innerHTML = "";
    }

    if (!query) {
      return;
    }

    const filtered = allDoctorsData.filter(d => {
      const hospitalName = d.hospital?.name?.toLowerCase() || "";
      const fullName = `${d.first_name} ${d.last_name}`.toLowerCase();

      return (
        d.first_name?.toLowerCase().includes(query) ||
        d.last_name?.toLowerCase().includes(query) ||
        d.phone_number?.includes(query) ||
        fullName.includes(query) ||
        hospitalName.includes(query)
      );
    });

    const sortValue = searchSortSelect?.value || "creation";

    if (mode === "list") {
      renderSearchListTable(filtered);
    } else {
      // Cards view
      const sortedFiltered = sortDoctors(filtered, sortValue);

      if (sortedFiltered.length === 0 && searchResults) {
        searchResults.innerHTML = `<p>Pre "${query}" neboli nájdené žiadne výsledky.</p>`;
        return;
      }

      const container = document.createElement("div");
      container.classList.add("cards");

      sortedFiltered.forEach(d => {
        const hospitalName = d.hospital?.name || "";

        const card = document.createElement("div");
        card.classList.add("card");
        card.addEventListener("click", () => {
          window.location.href = `/doctors/${d.id}`;
        });

        const name = document.createElement("h3");
        name.textContent = `${d.title || ""} ${d.first_name} ${d.last_name} ${d.suffix || ""}`.trim();

        const phone = document.createElement("p");
        phone.textContent = `Telefón: ${d.phone_number}`;

        const hospital = document.createElement("p");
        hospital.textContent = `Nemocnica: ${hospitalName}`;

        const email = document.createElement("p");
        email.textContent = `Email: ${d.email}`;

        card.appendChild(name);
        card.appendChild(phone);
        card.appendChild(hospital);
        card.appendChild(email);
        container.appendChild(card);
      });

      if (searchResults) {
        searchResults.appendChild(container);
      }
    }
  }

  // Add debouncing for search
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
    renderDoctors(allDoctorsData, sortSelect.value);
  });
  // -- Event Listeners --
  // Tab switching
  tabAll?.addEventListener("click", () => showTab("all"));
  tabSearch?.addEventListener("click", () => showTab("search"));
  tabAdd?.addEventListener("click", () => {
    showTab("add");
    resetDoctorForm();
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

      renderAllListTable(allDoctorsData);
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
  const savedMode = localStorage.getItem("doctorViewMode") || "cards";
  setViewMode(savedMode);

  // Initial tab
  showTab("all");

  // Load data
  loadAllDoctors();
  checkUserTypeAndAdjustForm();

  const addBtn = document.getElementById("add-doctor-btn");
  if (addBtn) {
    addBtn.addEventListener("click", async () => {
      const msg = document.getElementById("add-doctor-message");
      msg.textContent = "";
      msg.classList.remove("error", "success");
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
      console.log(email);
      console.log(password);
      if (!firstName || !lastName || !email || !phone || !gender || !password || !confirmPassword || (!hospitalCode && userType === "super_admin")) {
        msg.textContent = "Vyplňte všetky povinné polia.";
        msg.classList.add("error");
        return;
      }
      if (!role && userType === "super_admin") {
        msg.textContent = "Vyberte typ doktora.";
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

        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Chyba pri vytváraní doktora.");

        msg.textContent = result.message || "Doktor úspešne pridaný.";
        msg.classList.add("success");

        resetDoctorForm();
        showTab("all");
        loadAllDoctors();
      } catch (err) {
        console.error(err);
        msg.textContent = err.message || "Nepodarilo sa pridať doktora.";
        msg.classList.add("error");
      }
    });
  }

});