let sortColumn = null;
let sortAscending = true;

const COLUMNS = ['name', 'date', 'eye', 'patient', 'doctor', 'hospital'];

document.addEventListener("DOMContentLoaded", () => {
  populateFilters();

  const patientFilter = document.getElementById("filter-patient");
  const hospitalFilter = document.getElementById("filter-hospital");
  const doctorFilter = document.getElementById("filter-doctor");
  const eyeFilter = document.getElementById("filter-eye");
  const fulltextFilter = document.getElementById("filter-fulltext");

  if (patientFilter) patientFilter.addEventListener("change", debouncedApplyFilters);
  if (hospitalFilter) hospitalFilter.addEventListener("change", debouncedApplyFilters);
  if (doctorFilter) doctorFilter.addEventListener("change", debouncedApplyFilters);
  if (eyeFilter) eyeFilter.addEventListener("change", debouncedApplyFilters);
  if (fulltextFilter) fulltextFilter.addEventListener("input", debouncedApplyFilters);

  const tableBody = document.getElementById("photo-table-body");
  if (tableBody) tableBody.addEventListener("click", handleTableRowClick);

  applyVisibilityRules();
});

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
  console.log("User Type:", userType); // Debug log

  const visibilityRules = {
    patient: ["filter-eye-container"],
    technician: ["filter-eye-container", "filter-patient-container", "filter-doctor-container"],
    doctor: ["filter-eye-container", "filter-patient-container"],
    admin: ["filter-eye-container", "filter-patient-container", "filter-doctor-container"],
    super_admin: ["filter-eye-container", "filter-patient-container", "filter-doctor-container", "filter-hospital-container"]
  };

  const filtersToShow = visibilityRules[userType] || [];
  console.log("Filters to Show:", filtersToShow); // Debug log

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

function applyFilters() {
  const patientFilter = document.getElementById("filter-patient")?.value.toLowerCase() || "";
  const hospitalFilter = document.getElementById("filter-hospital")?.value.toLowerCase() || "";
  const doctorFilter = document.getElementById("filter-doctor")?.value.toLowerCase() || "";
  const eyeFilter = document.getElementById("filter-eye")?.value.toLowerCase() || "";
  const fulltextFilter = document.getElementById("filter-fulltext")?.value.toLowerCase() || "";

  const rows = document.querySelectorAll("#photo-table-body tr");

  rows.forEach(row => {
    const id = row.dataset.photoName.toLowerCase();
    const date = row.dataset.photoDate.toLowerCase();
    const eye = row.dataset.photoEye.toLowerCase();
    const patient = row.dataset.photoPatient.toLowerCase();
    const doctor = row.dataset.photoDoctor.toLowerCase();
    const hospital = row.dataset.photoHospital.toLowerCase();

    // Include patient-specific data
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

function populateFilters() {
  const patientSelect = document.getElementById("filter-patient");
  const hospitalSelect = document.getElementById("filter-hospital");
  const doctorSelect = document.getElementById("filter-doctor");

  console.log("Patient Select:", patientSelect);
  console.log("Hospital Select:", hospitalSelect);
  console.log("Doctor Select:", doctorSelect);

  const patients = [...new Set(photoData.map(photo => photo.patient).filter(p => p && p !== "-"))];
  const hospitals = [...new Set(photoData.map(photo => photo.hospital).filter(h => h && h !== "-"))];
  const doctors = [...new Set(photoData.map(photo => photo.doctor).filter(d => d && d !== "-"))];

  if (patientSelect) {
    patients.forEach(patient => {
      const option = document.createElement("option");
      option.value = patient;
      option.textContent = patient;
      patientSelect.appendChild(option);
    });
  }

  if (hospitalSelect) {
    hospitals.forEach(hospital => {
      const option = document.createElement("option");
      option.value = hospital;
      option.textContent = hospital;
      hospitalSelect.appendChild(option);
    });
  }

  if (doctorSelect) {
    doctors.forEach(doctor => {
      const option = document.createElement("option");
      option.value = doctor;
      option.textContent = doctor;
      doctorSelect.appendChild(option);
    });
  }
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

function toggleSort(column) {
  if (sortColumn === column) {
    sortAscending = !sortAscending; // Toggle the sort order
  } else {
    sortColumn = column;
    sortAscending = true; // Default to ascending when switching columns
  }

  const rows = Array.from(document.querySelectorAll('#photo-table-body tr'));

  const sortedRows = rows.sort((a, b) => {
    const aValue = a.children[getColumnIndex(column)].textContent.trim().toLowerCase();
    const bValue = b.children[getColumnIndex(column)].textContent.trim().toLowerCase();

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