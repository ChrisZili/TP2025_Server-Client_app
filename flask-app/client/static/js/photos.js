document.addEventListener("DOMContentLoaded", () => {
    // --- File Input Preview Functionality ---
    const photoInput = document.getElementById("photo");
    const photoPreviewContainer = document.getElementById("photo-preview-container");
    const photoPreview = document.getElementById("photo-preview");
    const fileName = document.getElementById("file-name");
    const fileInputWrapper = document.querySelector(".file-input-wrapper");
    const form = document.querySelector("form");
  
    if (photoInput && photoPreview && photoPreviewContainer && fileName && fileInputWrapper) {
      // Handle file input change
      photoInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            // Display the photo preview
            photoPreview.src = e.target.result;
            photoPreview.style.display = "block";
            photoPreviewContainer.style.display = "flex";
          };
          reader.readAsDataURL(file);
  
          // Update file name
          fileName.textContent = `Názov súboru: ${file.name}`;
          fileName.style.display = "block";
  
          // Change the button to "Cancel"
          fileInputWrapper.style.backgroundColor = "red";
          fileInputWrapper.setAttribute("data-state", "cancel");
          // Note: Direct manipulation of ::before pseudo-element content is not possible in JavaScript.
          // Consider using a child <span> element instead if you need to update its text.
        } else {
          resetFileInput();
        }
      });
  
      // Handle click on the file input wrapper to cancel photo
      fileInputWrapper.addEventListener("click", (event) => {
        if (fileInputWrapper.getAttribute("data-state") === "cancel") {
          // Prevent the file browser from opening
          event.preventDefault();
          resetFileInput();
        }
      });
  
      function resetFileInput() {
        photoPreview.src = "#";
        photoPreview.style.display = "none";
        photoPreviewContainer.style.display = "none";
        fileName.style.display = "none";
        fileName.textContent = "";
        photoInput.value = ""; // Reset the file input
  
        // Reset button to "Upload"
        fileInputWrapper.style.backgroundColor = "";
        fileInputWrapper.setAttribute("data-state", "upload");
      }
    }
  
    // --- Filter Event Listeners ---
    const filterElements = ["filter-eye", "filter-patient", "filter-hospital", "filter-doctor"];
    filterElements.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener("change", applyFilters);
      }
    });
  
    // --- Sorting Event Listeners ---
    const sortableHeaders = document.querySelectorAll(".sortable");
    sortableHeaders.forEach(header => {
      header.addEventListener("click", () => {
        const column = header.getAttribute("data-column");
        toggleSort(column);
      });
    });
  
    // Make photo table rows clickable to go to photo detail
    document.querySelectorAll('.photo-row').forEach(function(row) {
      row.addEventListener('click', function() {
        const url = this.getAttribute('data-detail-url');
        if (url) {
          window.location.href = url;
        }
      });
    });
  
    // --- Tab Switching for Photos ---
    const tabAll = document.getElementById("tab-all-photos");
    const tabSearch = document.getElementById("tab-search-photo");
    const allPhotosContainer = document.getElementById("photos-list-container");
    const searchTabContent = document.getElementById("tab-search-photos-content");
    let currentTab = "all";
  
    function showTab(tab) {
      currentTab = tab;
      if (tab === "all") {
        tabAll.classList.add("active");
        tabSearch.classList.remove("active");
        allPhotosContainer.style.display = "block";
        if (searchTabContent) {
          searchTabContent.style.display = "none";
          // Clear search input when switching back to all
          const searchInput = document.getElementById("photo-search-input");
          if (searchInput) {
            searchInput.value = "";
          }
        }
      } else {
        tabAll.classList.remove("active");
        tabSearch.classList.add("active");
        allPhotosContainer.style.display = "none";
        if (searchTabContent) {
          searchTabContent.style.display = "block";
          // Focus search input when switching to search
          const searchInput = document.getElementById("photo-search-input");
          if (searchInput) {
            searchInput.focus();
          }
          renderSearchResults(); // Only render search results when search tab is active
        }
      }
    }
  
    // Event listeners for tab switching
    if (tabAll) {
      tabAll.addEventListener("click", () => showTab("all"));
    }
    if (tabSearch) {
      tabSearch.addEventListener("click", () => showTab("search"));
    }
  
    // Show all photos tab by default
    showTab("all");
  
    // --- Search Tab Logic ---
    const searchInput = document.getElementById("photo-search-input");
    const sortSelect = document.getElementById("photo-search-sort-select");
    const listContainer = document.getElementById("photo-search-list-container");
    const table = listContainer.querySelector("table");
    const tableHead = table.querySelector("thead");
    const resultsList = document.getElementById("photo-search-results-list");
  
    function getAllPhotosData() {
      const rows = Array.from(document.querySelectorAll('#photo-table-body tr'));
      return rows.map(row => ({
        date: row.children[0].textContent.trim(),
        eye: row.children[1].textContent.trim(),
        patient: row.children[2].textContent.trim(),
        doctor: row.children[3].textContent.trim(),
        hospital: row.children[4].textContent.trim(),
        detailUrl: row.getAttribute('data-detail-url'),
        rowHtml: row.innerHTML
      }));
    }
  
    function parseDate(dateString) {
      if (!dateString || dateString === '-') return new Date(0);
      const [day, month, year] = dateString.split('.').map(Number);
      return new Date(year, month - 1, day);
    }
  
    function filterAndSortPhotos(query) {
      let photos = getAllPhotosData();
      query = query.toLowerCase();
      
      if (query) {
        photos = photos.filter(photo =>
          photo.date.toLowerCase().includes(query) ||
          photo.eye.toLowerCase().includes(query) ||
          photo.patient.toLowerCase().includes(query) ||
          photo.doctor.toLowerCase().includes(query) ||
          photo.hospital.toLowerCase().includes(query)
        );
      }
  
      // Sorting
      const sortVal = sortSelect.value;
      if (sortVal === "date-desc") {
        photos.sort((a, b) => parseDate(b.date) - parseDate(a.date));
      } else if (sortVal === "date-asc") {
        photos.sort((a, b) => parseDate(a.date) - parseDate(b.date));
      } else if (sortVal === "name-asc") {
        photos.sort((a, b) => a.patient.localeCompare(b.patient, 'sk'));
      } else if (sortVal === "name-desc") {
        photos.sort((a, b) => b.patient.localeCompare(a.patient, 'sk'));
      }
      return photos;
    }
  
    function renderSearchResults() {
      // Only render if search tab is active
      if (currentTab !== "search") return;
      
      const query = searchInput.value.trim();
      
      // Always show table and header
      table.style.display = "table";
      tableHead.style.display = "table-header-group";
      resultsList.innerHTML = "";
      
      if (!query) {
        // Show empty table body before search
        resultsList.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 20px; color:#666;">Zadajte text pre vyhľadávanie...</td></tr>';
        return;
      }
      
      const photos = filterAndSortPhotos(query);
      
      if (photos.length === 0) {
        resultsList.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 20px; color:#666;">Nenašli sa žiadne fotky.</td></tr>';
        return;
      }
      
      photos.forEach(photo => {
        const tr = document.createElement('tr');
        tr.className = 'photo-row';
        tr.style.cursor = 'pointer';
        tr.innerHTML = `
          <td>${photo.date}</td>
          <td>${photo.eye}</td>
          <td>${photo.patient}</td>
          <td>${photo.doctor}</td>
          <td>${photo.hospital}</td>
        `;
        if (photo.detailUrl) {
          tr.addEventListener('click', () => window.location.href = photo.detailUrl);
        }
        resultsList.appendChild(tr);
      });
    }
  
    // Debounce for search
    function debounce(func, delay) {
      let timeout;
      return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
      };
    }
    const debouncedRender = debounce(renderSearchResults, 200);
    searchInput.addEventListener('input', debouncedRender);
    sortSelect.addEventListener('change', renderSearchResults);
  
    // Initial render
    renderSearchResults();
  });
  
  let sortColumn = null;
  let sortAscending = true;
  
  function toggleSort(column) {
    if (sortColumn === column) {
      sortAscending = !sortAscending; // Toggle the sort order
    } else {
      sortColumn = column;
      sortAscending = true; // Default to ascending when switching columns
    }
  
    const rows = Array.from(document.querySelectorAll('#photo-table-body tr'));
  
    const sortedRows = rows.sort((a, b) => {
      const aValue = a.children[getColumnIndex(column)].textContent.trim();
      const bValue = b.children[getColumnIndex(column)].textContent.trim();
  
      if (column === 'date') {
        // Parse dates for comparison
        const dateA = parseDate(aValue);
        const dateB = parseDate(bValue);
        return sortAscending ? dateA - dateB : dateB - dateA;
      } else {
        // Compare strings
        return sortAscending ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
    });
  
    const tbody = document.getElementById('photo-table-body');
    tbody.innerHTML = '';
    sortedRows.forEach(row => tbody.appendChild(row));
  }
  
  function getColumnIndex(column) {
    const columns = ['date', 'eye', 'patient', 'doctor', 'hospital'];
    return columns.indexOf(column);
  }
  
  function applyFilters() {
    const eyeFilter = document.getElementById('filter-eye')?.value.toLowerCase() || '';
    const hospitalFilter = document.getElementById('filter-hospital')?.value.toLowerCase() || '';
    const doctorFilter = document.getElementById('filter-doctor')?.value.toLowerCase() || '';
    const patientFilter = document.getElementById('filter-patient')?.value.toLowerCase() || '';
  
    const rows = document.querySelectorAll('#photo-table-body tr');
  
    rows.forEach(row => {
      // Get values from table cells
      const date = row.cells[0].textContent.trim().toLowerCase(); // Date is in column 1
      const eye = row.cells[1].textContent.trim().toLowerCase(); // Eye is in column 2
      const patient = row.cells[2].textContent.trim().toLowerCase(); // Patient is in column 3
      const doctor = row.cells[3].textContent.trim().toLowerCase(); // Doctor is in column 4
      const hospital = row.cells[4].textContent.trim().toLowerCase(); // Hospital is in column 5
  
      const matchesEye = !eyeFilter || eye === eyeFilter;
      const matchesPatient = !patientFilter || patient === patientFilter;
      const matchesHospital = !hospitalFilter || hospital === hospitalFilter;
      const matchesDoctor = !doctorFilter || doctor === doctorFilter;
  
      row.style.display = (matchesEye && matchesPatient && matchesHospital && matchesDoctor) ? '' : 'none';
    });
  }
  
  function navigateToPhotoDetail(photoName) {
    window.location.href = `/photos/detail/${encodeURIComponent(photoName)}`;
  }