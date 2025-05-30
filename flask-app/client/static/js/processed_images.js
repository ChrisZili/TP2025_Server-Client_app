document.addEventListener("DOMContentLoaded", () => {
  // Search functionality
  const allPhotosBtn = document.getElementById('all-photos');
  const searchPhotoBtn = document.getElementById('search-photo');
  const searchContainer = document.querySelector('.search-container');
  const searchInput = document.getElementById('search-input');
  const filtersContainer = document.getElementById('filters');
  const table = document.getElementById('processed-images-table');
  const searchSortSelect = document.getElementById('search-sort-select');
  const rows = Array.from(table.querySelectorAll('tbody tr'));
  let currentTab = 'all';
  let currentSearchTerm = '';

  // Toggle search buttons
  allPhotosBtn.addEventListener('click', () => {
    currentTab = 'all';
    allPhotosBtn.classList.add('active');
    searchPhotoBtn.classList.remove('active');
    searchContainer.style.display = 'none';
    filtersContainer.style.display = 'flex';
    table.classList.remove('empty-search');
    // Show all rows and apply current filters
    applyFilters();
    // Reset sorting
    resetSorting();
  });

  searchPhotoBtn.addEventListener('click', () => {
    currentTab = 'search';
    searchPhotoBtn.classList.add('active');
    allPhotosBtn.classList.remove('active');
    searchContainer.style.display = 'block';
    filtersContainer.style.display = 'none';
    searchInput.focus();
    searchInput.value = '';
    currentSearchTerm = '';
    // Hide table body when switching to search tab
    table.classList.add('empty-search');
  });

  function showAllRows() {
    rows.forEach(row => row.style.display = '');
    table.classList.remove('empty-search');
  }

  // Search functionality with debounce
  function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }

  function parseDate(dateString) {
    if (!dateString || dateString === '-') return new Date(0);
    const [day, month, year] = dateString.split('.').map(Number);
    return new Date(year, month - 1, day);
  }

  function sortSearchResults(rows, sortValue) {
    return [...rows].sort((a, b) => {
      if (sortValue.startsWith('date')) {
        const aDate = parseDate(a.dataset.createdAt);
        const bDate = parseDate(b.dataset.createdAt);
        return sortValue === 'date-desc' ? bDate - aDate : aDate - bDate;
      } else {
        // Sort by patient name by default
        const aName = a.dataset.patientName.toLowerCase();
        const bName = b.dataset.patientName.toLowerCase();
        return sortValue === 'name-desc' ?
          bName.localeCompare(aName, 'sk') :
          aName.localeCompare(bName, 'sk');
      }
    });
  }

  function applySearchAndSort(searchTerm) {
    searchTerm = searchTerm.toLowerCase().trim();
    currentSearchTerm = searchTerm;

    // Show/hide table body based on search term
    if (!searchTerm) {
      table.classList.add('empty-search');
      return;
    }

    table.classList.remove('empty-search');

    // Filter rows
    const filteredRows = rows.filter(row => {
      // Check if any cell contains the search term
      const patientName = row.dataset.patientName?.toLowerCase() || '';
      const method = row.dataset.method?.toLowerCase() || '';
      const status = row.dataset.status?.toLowerCase() || '';
      const answer = row.dataset.answer?.toLowerCase() || '';
      const createdAt = row.dataset.createdAt?.toLowerCase() || '';

      return patientName.includes(searchTerm) ||
             method.includes(searchTerm) ||
             status.includes(searchTerm) ||
             answer.includes(searchTerm) ||
             createdAt.includes(searchTerm);
    });

    // Sort filtered rows
    const sortedRows = sortSearchResults(filteredRows, searchSortSelect.value);

    // Update table
    const tbody = table.querySelector('tbody');
    tbody.innerHTML = '';
    sortedRows.forEach(row => {
      row.style.display = '';
      tbody.appendChild(row);
    });
  }

  const searchTable = debounce((searchTerm) => {
    applySearchAndSort(searchTerm);
  }, 300);

  searchInput.addEventListener('input', (e) => {
    if (currentTab === 'search') {
      searchTable(e.target.value);
    }
  });

  searchSortSelect.addEventListener('change', () => {
    if (currentTab === 'search' && currentSearchTerm) {
      applySearchAndSort(currentSearchTerm);
    }
  });

  // Filter functionality
  const filterElements = ['filter-patient', 'filter-method', 'filter-status', 'filter-answer'];
  filterElements.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('change', () => {
        if (currentTab === 'all') {
          applyFilters();
        }
      });
    }
  });

  function applyFilters() {
    if (currentTab !== 'all') return;

    const patientFilter = document.getElementById('filter-patient')?.value.toLowerCase() || '';
    const methodFilter = document.getElementById('filter-method')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('filter-status')?.value.toLowerCase() || '';
    const answerFilter = document.getElementById('filter-answer')?.value.toLowerCase() || '';

    rows.forEach(row => {
      const patientName = row.querySelector('td:nth-child(1)').textContent.trim().toLowerCase();
      const method = row.querySelector('td:nth-child(2)').textContent.trim().toLowerCase();
      const status = row.querySelector('td:nth-child(3)').textContent.trim().toLowerCase();
      const answer = row.querySelector('td:nth-child(4)').textContent.trim().toLowerCase();

      const patientMatch = !patientFilter || patientName === patientFilter;
      const methodMatch = !methodFilter || method === methodFilter;
      const statusMatch = !statusFilter || status === statusFilter;
      const answerMatch = !answerFilter || answer === answerFilter;

      row.style.display = patientMatch && methodMatch && statusMatch && answerMatch ? '' : 'none';
    });
  }

  // Make table rows clickable
  rows.forEach(function(row) {
    row.addEventListener('click', function() {
      const url = this.getAttribute('data-detail-url');
      if (url) {
        window.location.href = url;
      }
    });
  });

  // Sorting functionality for the main table
  let sortColumn = null;
  let sortAscending = true;

  function getColumnIndex(column) {
    // Map column names to their indices in the table
    // Note: these are 0-based indices
    const columnMap = {
      'patient_name': 0,
      'method': 1,
      'status': 2,
      'answer': 3,
      'created_at': 4,
      'date': 4 // Add this line to allow sorting by both 'created_at' and 'date'
    };
    return columnMap[column] || 0;
  }

  function resetSorting() {
    sortColumn = null;
    sortAscending = true;
    document.querySelectorAll('th.sortable').forEach(th => {
      th.classList.remove('asc', 'desc');
      const icon = th.querySelector('.sort-icon');
      if (icon) icon.classList.remove('asc', 'desc');
    });
  }

  function toggleSort(column) {
    const header = document.querySelector(`th[data-column="${column}"]`);
    const icon = header.querySelector('.sort-icon');

    // Remove sorting classes from all headers
    document.querySelectorAll('th.sortable').forEach(th => {
      if (th !== header) {
        th.classList.remove('asc', 'desc');
        const otherIcon = th.querySelector('.sort-icon');
        if (otherIcon) otherIcon.classList.remove('asc', 'desc');
      }
    });

    if (sortColumn === column) {
      sortAscending = !sortAscending;
    } else {
      sortColumn = column;
      sortAscending = true;
    }

    // Update sort indicators
    header.classList.toggle('asc', sortAscending);
    header.classList.toggle('desc', !sortAscending);
    if (icon) {
      icon.classList.toggle('asc', sortAscending);
      icon.classList.toggle('desc', !sortAscending);
    }

    const sortedRows = rows.sort((a, b) => {
      let aValue, bValue;
      // Allow sorting by both 'created_at' and 'date' columns
      if (column === 'created_at' || column === 'date') {
        aValue = a.getAttribute('data-created-at') || '';
        bValue = b.getAttribute('data-created-at') || '';
        return sortAscending
          ? parseDate(aValue) - parseDate(bValue)
          : parseDate(bValue) - parseDate(aValue);
      } else {
        aValue = a.children[getColumnIndex(column)].textContent.trim();
        bValue = b.children[getColumnIndex(column)].textContent.trim();
        return sortAscending
          ? aValue.localeCompare(bValue, 'sk')
          : bValue.localeCompare(aValue, 'sk');
      }
    });

    const tbody = table.querySelector('tbody');
    tbody.innerHTML = '';
    sortedRows.forEach(row => tbody.appendChild(row));
  }

  // --- Sorting algorithm for all columns ---

  let currentSortColumn = "created_at"; // Default sort column
  let currentSortDirection = "desc";    // Default direction (newest first)

  function getColumnIndex(column) {
    // Map column names to their indices in the table (0-based)
    const columnMap = {
      'patient_name': 0,
      'method': 1,
      'status': 2,
      'answer': 3,
      'created_at': 4,
      'date': 4
      // Add more if you have more columns
    };
    return columnMap[column] ?? 0;
  }

  function getCellValue(row, column) {
    // Always use the data-created-at attribute for both 'created_at' and 'date'
    if (column === "created_at" || column === "date") {
      return row.getAttribute('data-created-at') || "";
    }
    const idx = getColumnIndex(column);
    return row.children[idx]?.textContent.trim().toLowerCase() || "";
  }

  function sortTableRows(rows, column, direction) {
    return [...rows].sort((a, b) => {
      let valA = getCellValue(a, column);
      let valB = getCellValue(b, column);

      // Always parse as date for both 'created_at' and 'date'
      if (column === "created_at" || column === "date") {
        valA = parseDate(valA);
        valB = parseDate(valB);
        return direction === "asc" ? valA - valB : valB - valA;
      }

      if (valA < valB) return direction === "asc" ? -1 : 1;
      if (valA > valB) return direction === "asc" ? 1 : -1;
      return 0;
    });
  }

  function updateSortIcons(headerCells, column, direction) {
    headerCells.forEach(th => {
      const col = th.getAttribute("data-column");
      th.classList.remove("sort-asc", "sort-desc");
      const oldArrow = th.querySelector('.sort-arrow');
      if (oldArrow) th.removeChild(oldArrow);

      if (col === column) {
        th.classList.add(direction === "asc" ? "sort-asc" : "sort-desc");
        const arrow = document.createElement("span");
        arrow.className = "sort-arrow";
        arrow.textContent = direction === "asc" ? " ▲" : " ▼";
        th.appendChild(arrow);
      }
    });
  }

  // Main: Add event listeners to all headers with data-column
  const headerCells = table.querySelectorAll("thead th[data-column]");
  const tbody = table.querySelector("tbody");

  headerCells.forEach(th => {
    th.addEventListener("click", () => {
      const col = th.getAttribute("data-column");
      if (!col) return;

      if (currentSortColumn === col) {
        currentSortDirection = currentSortDirection === "asc" ? "desc" : "asc";
      } else {
        currentSortColumn = col;
        currentSortDirection = "asc";
      }

      updateSortIcons(headerCells, currentSortColumn, currentSortDirection);

      // Sort and re-render rows
      const sortedRows = sortTableRows(rows, currentSortColumn, currentSortDirection);
      tbody.innerHTML = "";
      sortedRows.forEach(row => tbody.appendChild(row));
    });
  });

  // Initial sort icons update and initial sort
  updateSortIcons(headerCells, currentSortColumn, currentSortDirection);
  const sortedRows = sortTableRows(rows, currentSortColumn, currentSortDirection);
  tbody.innerHTML = "";
  sortedRows.forEach(row => tbody.appendChild(row));

  // Show all photos tab by default
  allPhotosBtn.click();
});