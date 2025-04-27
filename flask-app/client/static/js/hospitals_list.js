let currentView = "table"; // Default view is table
let hospitalData = []; // To store hospital data fetched from the server
let currentSortColumn = null; // Track the currently sorted column
let currentSortDirection = "asc"; // Track the current sort direction (asc or desc)

// Fetch hospital data from the /hospitals/list endpoint
async function fetchHospitalData() {
  try {
    const response = await fetch('/hospitals/list', {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch hospital data: ${response.statusText}`);
    }

    hospitalData = await response.json();
    renderTable(hospitalData); // Render the table by default
    populateFilters(); // Populate filters dynamically
  } catch (error) {
    console.error('Error fetching hospital data:', error);
    alert('Failed to load hospital data. Please try again later.');
  }
}

// Toggle between table and card views
document.getElementById("toggle-view-btn").addEventListener("click", () => {
  const tableContainer = document.getElementById("hospital-table-container");
  const cardsContainer = document.getElementById("hospital-cards-container");
  const toggleButton = document.getElementById("toggle-view-btn");

  // Reset filters
  resetFilters();

  if (currentView === "table") {
    tableContainer.style.display = "none";
    cardsContainer.style.display = "block";
    toggleButton.textContent = "Zobraziť ako Tabuľka";
    currentView = "cards";
    renderCards(hospitalData);
  } else {
    tableContainer.style.display = "block";
    cardsContainer.style.display = "none";
    toggleButton.textContent = "Zobraziť ako Karty";
    currentView = "table";
    renderTable(hospitalData);
  }
});

// Render table rows
function renderTable(data) {
  const tableBody = document.getElementById("hospital-table-body");
  tableBody.innerHTML = ""; // Clear existing rows

  data.forEach((hospital) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${hospital.name}</td>
      <td>${hospital.created_at || "Neznámy dátum"}</td>
      <td>${hospital.city}</td>
      <td>${hospital.street}</td>
      <td>${hospital.postal_code}</td>
    `;

    // Add click event to redirect to the details page
    row.addEventListener("click", () => {
      window.location.href = `/hospitals/${hospital.id}`;
    });

    tableBody.appendChild(row);
  });
}

// Render cards
function renderCards(data) {
  const cardsContainer = document.getElementById("hospital-cards");
  cardsContainer.innerHTML = ""; // Clear existing cards

  data.forEach((hospital) => {
    const card = document.createElement("div");
    card.className = "hospital-card";
    card.innerHTML = `
      <h3>${hospital.name}</h3>
      <p><strong>Dátum Vytvorenia:</strong> ${hospital.created_at || "Neznámy dátum"}</p>
      <p><strong>Mesto:</strong> ${hospital.city}</p>
      <p><strong>Ulica:</strong> ${hospital.street}</p>
      <p><strong>PSČ:</strong> ${hospital.postal_code}</p>
    `;

    // Add click event to redirect to the details page
    card.addEventListener("click", () => {
      window.location.href = `/hospitals/${hospital.id}`;
    });

    cardsContainer.appendChild(card);
  });
}

// Filter and search functionality
function applyFilters() {
  const cityFilterValue = document.getElementById("filter-city").value.toLowerCase();
  const fulltextFilterValue = document.getElementById("filter-fulltext").value.toLowerCase();

  const filteredData = hospitalData.filter((hospital) => {
    const matchesCity = !cityFilterValue || hospital.city.toLowerCase().includes(cityFilterValue);
    const matchesFulltext =
      !fulltextFilterValue ||
      Object.values(hospital)
        .join(" ")
        .toLowerCase()
        .includes(fulltextFilterValue);

    return matchesCity && matchesFulltext;
  });

  currentView === "table" ? renderTable(filteredData) : renderCards(filteredData);
}

// Add event listeners for both filters
document.getElementById("filter-city").addEventListener("input", applyFilters);
document.getElementById("filter-fulltext").addEventListener("input", applyFilters);

// Populate filters dynamically
function populateFilters() {
  const cityFilter = document.getElementById("filter-city");

  if (!cityFilter) {
    console.error("City filter element not found in the DOM.");
    return;
  }

  // Clear existing options
  cityFilter.innerHTML = "";

  // Add "All" option
  const allOption = document.createElement("option");
  allOption.value = "";
  allOption.textContent = "Všetky"; // "All" in Slovak
  cityFilter.appendChild(allOption);

  // Populate city options
  const cities = [...new Set(hospitalData.map((hospital) => hospital.city))];
  cities.forEach((city) => {
    const option = document.createElement("option");
    option.value = city;
    option.textContent = city;
    cityFilter.appendChild(option);
  });
}

// Add event listeners to column headers for sorting
document.querySelectorAll(".hospital-table th[data-column]").forEach((header) => {
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
  const sortedData = [...hospitalData].sort((a, b) => {
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
  document.querySelectorAll(".hospital-table th").forEach((header) => {
    header.classList.remove("sorted-asc", "sorted-desc");
  });

  const sortedHeader = document.querySelector(`.hospital-table th[data-column="${column}"]`);
  if (sortedHeader) {
    sortedHeader.classList.add(currentSortDirection === "asc" ? "sorted-asc" : "sorted-desc");
  }
}

// Reset filters
function resetFilters() {
  // Reset city filter
  const cityFilter = document.getElementById("filter-city");
  if (cityFilter) {
    cityFilter.value = "";
  }

  // Reset fulltext filter
  const fulltextFilter = document.getElementById("filter-fulltext");
  if (fulltextFilter) {
    fulltextFilter.value = "";
  }

  // Reapply filters to show all data
  applyFilters();
}

// Initialize the page
function initializePage() {
  fetchHospitalData(); // Fetch data and initialize the page
}

document.addEventListener("DOMContentLoaded", () => {
  fetchHospitalData();
});