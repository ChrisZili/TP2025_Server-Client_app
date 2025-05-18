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
        const aName = a.dataset.name.toLowerCase();
        const bName = b.dataset.name.toLowerCase();
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
      const text = Array.from(row.children)
        .map(cell => cell.textContent.trim().toLowerCase())
        .join(' ');
      return text.includes(searchTerm);
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
  const filterElements = ['filter-patient', 'filter-doctor', 'filter-method'];
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
    const doctorFilter = document.getElementById('filter-doctor')?.value.toLowerCase() || '';
    const methodFilter = document.getElementById('filter-method')?.value.toLowerCase() || '';

    rows.forEach(row => {
      const patientName = row.querySelector('td:nth-child(2)').textContent.trim().toLowerCase();
      const doctorName = row.querySelector('td:nth-child(3)').textContent.trim().toLowerCase();
      const method = row.querySelector('td:nth-child(4)').textContent.trim().toLowerCase();
      
      const patientMatch = !patientFilter || patientName === patientFilter;
      const doctorMatch = !doctorFilter || doctorName === doctorFilter;
      const methodMatch = !methodFilter || method === methodFilter;
      
      row.style.display = patientMatch && doctorMatch && methodMatch ? '' : 'none';
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
    const columns = ['name', 'patient_name', 'doctor_name', 'method', 'status', 'created_at'];
    return columns.indexOf(column);
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
      const aValue = a.children[getColumnIndex(column)].textContent.trim();
      const bValue = b.children[getColumnIndex(column)].textContent.trim();
      
      if (column === 'created_at') {
        return sortAscending ? 
          parseDate(aValue) - parseDate(bValue) : 
          parseDate(bValue) - parseDate(aValue);
      } else {
        return sortAscending ? 
          aValue.localeCompare(bValue, 'sk') : 
          bValue.localeCompare(aValue, 'sk');
      }
    });

    const tbody = table.querySelector('tbody');
    tbody.innerHTML = '';
    sortedRows.forEach(row => tbody.appendChild(row));
  }

  // Add sort handlers
  document.querySelectorAll('.sortable').forEach(header => {
    header.addEventListener('click', () => {
      const column = header.getAttribute('data-column');
      toggleSort(column);
    });
  });

  // Show all photos tab by default
  allPhotosBtn.click();
});
