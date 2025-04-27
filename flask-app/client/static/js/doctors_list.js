let currentView = "table"; // Default view is table
let doctorData = []; // To store doctor data fetched from the server
let currentSortColumn = null; // Track the currently sorted column
let currentSortDirection = "asc"; // Track the current sort direction (asc or desc)

// Fetch doctor data from the /doctors/list endpoint
async function fetchDoctorData() {
  try {
    const response = await fetch('/doctors/list', {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch doctor data: ${response.statusText}`);
    }

    doctorData = await response.json();
    renderTable(doctorData); // Render the table by default
    populateHospitalFilter(); // Populate the Nemocnica filter dynamically
  } catch (error) {
    console.error('Error fetching doctor data:', error);
    alert('Failed to load doctor data. Please try again later.');
  }
}

// Toggle between table and card views
document.getElementById("toggle-view-btn").addEventListener("click", () => {
  const tableContainer = document.getElementById("doctor-table-container");
  const cardsContainer = document.getElementById("doctor-cards-container");
  const toggleButton = document.getElementById("toggle-view-btn");

  // Reset filters
  resetFilters();

  if (currentView === "table") {
    tableContainer.style.display = "none";
    cardsContainer.style.display = "block";
    toggleButton.textContent = "Zobraziť ako Tabuľka";
    currentView = "cards";
    renderCards(doctorData);
  } else {
    tableContainer.style.display = "block";
    cardsContainer.style.display = "none";
    toggleButton.textContent = "Zobraziť ako Karty";
    currentView = "table";
    renderTable(doctorData);
  }
});

// Render table rows
function renderTable(data) {
  const tableBody = document.getElementById("doctor-table-body");
  tableBody.innerHTML = ""; // Clear existing rows

  data.forEach((doctor) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${doctor.name}</td>
      <td>${doctor.hospital || "Neznáma nemocnica"}</td>
      <td>${doctor.created_at || "Neznámy dátum"}</td>
      <td>${doctor.phone_number || "Neznáme číslo"}</td>
      <td>${doctor.email || "Neznámy email"}</td>
    `;

    // Add click event to redirect to the details page
    row.addEventListener("click", () => {
      window.location.href = `/doctors/${doctor.id}`;
    });

    tableBody.appendChild(row);
  });
}

// Render cards
function renderCards(data) {
  const cardsContainer = document.getElementById("doctor-cards");
  cardsContainer.innerHTML = ""; // Clear existing cards

  data.forEach((doctor) => {
    const card = document.createElement("div");
    card.className = "doctor-card";
    card.innerHTML = `
      <h3>${doctor.name}</h3>
      <p><strong>Nemocnica:</strong> ${doctor.hospital || "Neznáma nemocnica"}</p>
      <p><strong>Dátum Vytvorenia:</strong> ${doctor.created_at || "Neznámy dátum"}</p>
      <p><strong>Telefón:</strong> ${doctor.phone_number || "Neznáme číslo"}</p>
      <p><strong>E-mail:</strong> ${doctor.email || "Neznámy email"}</p>
    `;

    // Add click event to redirect to the details page
    card.addEventListener("click", () => {
      window.location.href = `/doctors/${doctor.id}`;
    });

    cardsContainer.appendChild(card);
  });
}

// Filter and search functionality
function applyFilters() {
  const hospitalFilterValue = document.getElementById("filter-hospital").value.toLowerCase();
  const fulltextFilterValue = document.getElementById("filter-fulltext").value.toLowerCase();

  const filteredData = doctorData.filter((doctor) => {
    const matchesHospital = !hospitalFilterValue || (doctor.hospital || "Neznáma nemocnica").toLowerCase() === hospitalFilterValue;
    const matchesFulltext =
      !fulltextFilterValue ||
      Object.values(doctor)
        .join(" ")
        .toLowerCase()
        .includes(fulltextFilterValue);

    return matchesHospital && matchesFulltext;
  });

  currentView === "table" ? renderTable(filteredData) : renderCards(filteredData);
}

// Add event listeners for the fulltext filter
document.getElementById("filter-fulltext").addEventListener("input", applyFilters);

// Populate the Nemocnica filter dynamically
function populateHospitalFilter() {
  const hospitalFilter = document.getElementById("filter-hospital");

  if (!hospitalFilter) {
    console.error("Hospital filter element not found in the DOM.");
    return;
  }

  // Clear existing options
  hospitalFilter.innerHTML = "";

  // Add "All" option
  const allOption = document.createElement("option");
  allOption.value = "";
  allOption.textContent = "Všetky"; // "All" in Slovak
  hospitalFilter.appendChild(allOption);

  // Get unique hospital names from the doctor data
  const hospitals = [...new Set(doctorData.map((doctor) => doctor.hospital || "Neznáma nemocnica"))];
  hospitals.forEach((hospital) => {
    const option = document.createElement("option");
    option.value = hospital;
    option.textContent = hospital;
    hospitalFilter.appendChild(option);
  });
}

// Add event listeners for filters and search field
document.getElementById("filter-hospital").addEventListener("change", applyFilters);
document.getElementById("filter-fulltext").addEventListener("input", applyFilters);

// Add event listeners to column headers for sorting
document.querySelectorAll(".doctor-table th[data-column]").forEach((header) => {
  header.addEventListener("click", () => {
    const column = header.getAttribute("data-column");
    toggleSort(column);
  });
});

// Toggle sorting for a column
function toggleSort(column) {
  if (currentSortColumn === column) {
    // If the column is already sorted, toggle the direction
    currentSortDirection = currentSortDirection === "asc" ? "desc" : "asc";
  } else {
    // If a new column is clicked, reset to ascending order
    currentSortColumn = column;
    currentSortDirection = "asc";
  }

  // Sort the data
  const sortedData = [...doctorData].sort((a, b) => {
    const valueA = a[column].toLowerCase();
    const valueB = b[column].toLowerCase();

    if (valueA < valueB) return currentSortDirection === "asc" ? -1 : 1;
    if (valueA > valueB) return currentSortDirection === "asc" ? 1 : -1;
    return 0;
  });

  // Update the table or cards based on the current view
  currentView === "table" ? renderTable(sortedData) : renderCards(sortedData);

  // Update the header styles to indicate sorting
  updateHeaderStyles(column);
}

// Update header styles to indicate the sorted column and direction
function updateHeaderStyles(column) {
  document.querySelectorAll(".doctor-table th").forEach((header) => {
    header.classList.remove("sorted-asc", "sorted-desc");
  });

  const sortedHeader = document.querySelector(`.doctor-table th[data-column="${column}"]`);
  if (sortedHeader) {
    sortedHeader.classList.add(currentSortDirection === "asc" ? "sorted-asc" : "sorted-desc");
  }
}

// Reset filters
function resetFilters() {
  // Reset fulltext filter
  const fulltextFilter = document.getElementById("filter-fulltext");
  if (fulltextFilter) {
    fulltextFilter.value = "";
  }

  // Reset hospital filter
  const hospitalFilter = document.getElementById("filter-hospital");
  if (hospitalFilter) {
    hospitalFilter.value = "";
  }

  // Reapply filters to show all data
  applyFilters();
}

// Initialize the page
function initializePage() {
  fetchDoctorData().then(() => {
    populateHospitalFilter(); // Populate the Nemocnica filter
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initializePage();
});