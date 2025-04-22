let sortColumn = null;
let sortAscending = true;

const COLUMNS = ['name', 'date', 'eye', 'patient', 'doctor', 'hospital'];


document.addEventListener("DOMContentLoaded", () => {
  const selectPhotoButton = document.getElementById("select-photo-button");
  const photoInput = document.getElementById("photo");
  const photoPreviewContainer = document.getElementById("photo-preview-container");
  const photoPreview = document.getElementById("photo-preview");
  const fileName = document.getElementById("file-name");

  if (selectPhotoButton && photoInput) {
    selectPhotoButton.addEventListener("click", () => {
      if (selectPhotoButton.textContent === "Zrušiť") {
        resetPhotoInput();
      } else {
        photoInput.click();
      }
    });
  }

  if (photoInput && photoPreview && photoPreviewContainer && fileName) {
    photoInput.addEventListener("change", handlePhotoInputChange);
  }

  populateFilters();

  document.getElementById("filter-patient").addEventListener("change", debouncedApplyFilters);
  document.getElementById("filter-hospital").addEventListener("change", debouncedApplyFilters);
  document.getElementById("filter-doctor").addEventListener("change", debouncedApplyFilters);
  document.getElementById("filter-eye").addEventListener("change", debouncedApplyFilters);
  document.getElementById("filter-fulltext").addEventListener("input", debouncedApplyFilters);

  const tableBody = document.getElementById('photo-table-body');
  tableBody.addEventListener('click', handleTableRowClick);

  applyVisibilityRules();
});

function resetPhotoInput() {
  const selectPhotoButton = document.getElementById("select-photo-button");
  const photoInput = document.getElementById("photo");
  const photoPreviewContainer = document.getElementById("photo-preview-container");
  const photoPreview = document.getElementById("photo-preview");
  const fileName = document.getElementById("file-name");

  photoInput.value = "";
  photoPreview.src = "#";
  photoPreview.style.display = "none";
  photoPreviewContainer.style.display = "none";
  fileName.style.display = "none";
  fileName.textContent = "";

  // Reset button to "Vyberte fotku" and remove red styling
  selectPhotoButton.textContent = "Vyberte fotku";
  selectPhotoButton.classList.remove("action-button-red");
  selectPhotoButton.classList.add("select-photo-button");
}

function handlePhotoInputChange(event) {
  const selectPhotoButton = document.getElementById("select-photo-button");
  const photoInput = document.getElementById("photo");
  const photoPreviewContainer = document.getElementById("photo-preview-container");
  const photoPreview = document.getElementById("photo-preview");
  const fileName = document.getElementById("file-name");

  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      photoPreview.src = e.target.result;
      photoPreview.style.display = "block";
      photoPreviewContainer.style.display = "flex";
    };
    reader.readAsDataURL(file);

    fileName.textContent = `Názov súboru: ${file.name}`;
    fileName.style.display = "block";

    // Change button to "Zrušiť" and make it red
    selectPhotoButton.textContent = "Zrušiť";
    selectPhotoButton.classList.remove("select-photo-button");
    selectPhotoButton.classList.add("action-button-red");
  } else {
    resetPhotoInput();
  }
}

function handleTableRowClick(event) {
  const row = event.target.closest('tr');
  if (row && row.dataset.photoName) {
    const photoName = encodeURIComponent(row.dataset.photoName);
    window.location.href = `/photos/detail/${photoName}`;
  } else {
    console.warn("Row clicked without a valid photo name.");
  }
}

function applyVisibilityRules() {
  const visibilityRules = {
    patient: ["filter-eye-container"],
    technician: ["filter-eye-container", "filter-patient-container"],
    doctor: ["filter-eye-container", "filter-patient-container"],
    admin: ["filter-eye-container", "filter-patient-container", "filter-doctor-container"],
    super_admin: ["filter-eye-container", "filter-patient-container", "filter-doctor-container", "filter-hospital-container"]
  };

  const filtersToShow = visibilityRules[userType] || [];
  const allFilterContainers = [
    "filter-patient-container",
    "filter-hospital-container",
    "filter-doctor-container",
    "filter-eye-container"
  ];

  allFilterContainers.forEach(containerId => {
    const container = document.getElementById(containerId);
    if (container) {
      container.style.display = filtersToShow.includes(containerId) ? "block" : "none";
    }
  });
}

// Function to filter the table based on dropdowns and full-text search
function applyFilters() {
  const patientFilter = document.getElementById("filter-patient").value.toLowerCase();
  const hospitalFilter = document.getElementById("filter-hospital").value.toLowerCase();
  const doctorFilter = document.getElementById("filter-doctor").value.toLowerCase();
  const eyeFilter = document.getElementById("filter-eye").value.toLowerCase();
  const fulltextFilter = document.getElementById("filter-fulltext").value.toLowerCase();

  const rows = document.querySelectorAll("#photo-table-body tr");

  rows.forEach(row => {
    const id = row.dataset.photoName.toLowerCase();
    const date = row.dataset.photoDate.toLowerCase();
    const eye = row.dataset.photoEye.toLowerCase();
    const patient = row.dataset.photoPatient.toLowerCase();
    const doctor = row.dataset.photoDoctor.toLowerCase();
    const hospital = row.dataset.photoHospital.toLowerCase();
    const patientAge = row.dataset.patientAge.toLowerCase();
    const patientGender = row.dataset.patientGender.toLowerCase();
    const patientPhone = row.dataset.patientPhone.toLowerCase();
    const patientBirthNumber = row.dataset.patientBirthNumber.toLowerCase();

    const matchesPatient = !patientFilter || patient.includes(patientFilter);
    const matchesDoctor = !doctorFilter || doctor.includes(doctorFilter);
    const matchesHospital = !hospitalFilter || hospital.includes(hospitalFilter);
    const matchesEye = !eyeFilter || eye.includes(eyeFilter);

    const matchesFulltext =
      !fulltextFilter ||
      id.includes(fulltextFilter) ||
      date.includes(fulltextFilter) ||
      eye.includes(fulltextFilter) ||
      patient.includes(fulltextFilter) ||
      doctor.includes(fulltextFilter) ||
      hospital.includes(fulltextFilter) ||
      patientAge.includes(fulltextFilter) ||
      patientGender.includes(fulltextFilter) ||
      patientPhone.includes(fulltextFilter) ||
      patientBirthNumber.includes(fulltextFilter);

    if (matchesPatient && matchesDoctor && matchesHospital && matchesEye && matchesFulltext) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  });
}

// Debounce function to delay execution
function debounce(func, delay = 300) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}

const debouncedApplyFilters = debounce(applyFilters, 300);

// Function to toggle sorting
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
      const dateA = parseDate(aValue);
      const dateB = parseDate(bValue);
      return sortAscending ? dateA - dateB : dateB - dateA;
    } else {
      return sortAscending ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    }
  });

  const tbody = document.getElementById('photo-table-body');
  tbody.innerHTML = '';
  sortedRows.forEach(row => tbody.appendChild(row));

  // Update visual indicators
  document.querySelectorAll('th').forEach(th => th.classList.remove('sorted-asc', 'sorted-desc'));
  const sortedColumn = document.querySelector(`th[data-column="${column}"]`);
  if (sortedColumn) {
    sortedColumn.classList.add(sortAscending ? 'sorted-asc' : 'sorted-desc');
  }
}

function getColumnIndex(column) {
  return COLUMNS.indexOf(column);
}

function parseDate(dateString) {
  const [day, month, year] = dateString.split('.').map(Number);
  if (!day || !month || !year) {
    const parsedDate = new Date(dateString); // Fallback for other formats
    if (isNaN(parsedDate)) {
      console.error(`Invalid date format: ${dateString}`);
      return new Date(); // Return current date as a fallback
    }
    return parsedDate;
  }
  return new Date(year, month - 1, day); // Month is 0-indexed in JavaScript
}

// Extract unique values for dropdowns
function populateFilters() {
  const patients = [...new Set(photoData.map(photo => photo.patient).filter(p => p && p !== "-"))];
  const hospitals = [...new Set(photoData.map(photo => photo.hospital).filter(h => h && h !== "-"))];
  const doctors = [...new Set(photoData.map(photo => photo.doctor).filter(d => d && d !== "-"))];

  const patientSelect = document.getElementById("filter-patient");
  const hospitalSelect = document.getElementById("filter-hospital");
  const doctorSelect = document.getElementById("filter-doctor");

  patients.forEach(patient => {
    const option = document.createElement("option");
    option.value = patient;
    option.textContent = patient;
    patientSelect.appendChild(option);
  });

  hospitals.forEach(hospital => {
    const option = document.createElement("option");
    option.value = hospital;
    option.textContent = hospital;
    hospitalSelect.appendChild(option);
  });

  doctors.forEach(doctor => {
    const option = document.createElement("option");
    option.value = doctor;
    option.textContent = doctor;
    doctorSelect.appendChild(option);
  });
}