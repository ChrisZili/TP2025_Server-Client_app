document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM Content Loaded - Initializing photo detail functionality');

  // Initialize diagnosis editing functionality
  const editButton = document.querySelector('.edit-button');
  const diagnosisText = document.getElementById('diagnosis-text');
  const diagnosisEdit = document.getElementById('diagnosis-edit');
  const diagnosisInput = document.getElementById('diagnosis-input');
  const saveButton = document.querySelector('.save-button');
  const cancelButton = document.querySelector('.cancel-button');

  if (editButton) {
    console.log('Edit button found, adding click listener');
    editButton.addEventListener('click', function() {
      console.log('Edit button clicked');
      if (diagnosisText) diagnosisText.style.display = 'none';
      if (diagnosisEdit) diagnosisEdit.style.display = 'block';
      if (editButton) editButton.style.display = 'none';
      if (diagnosisInput) {
        diagnosisInput.value = diagnosisText.textContent.trim() === '-' ? '' : diagnosisText.textContent.trim();
        diagnosisInput.focus();
      }
    });
  } else {
    console.warn('Edit button not found');
  }

  if (saveButton) {
    console.log('Save button found, adding click listener');
    saveButton.addEventListener('click', function() {
      console.log('Save button clicked');
      const photoDetail = document.getElementById('photo-detail');
      const photoId = photoDetail.dataset.photoId;
      const newDiagnosis = diagnosisInput ? diagnosisInput.value.trim() : '';

      fetch('/photos/update_diagnosis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          photo_id: photoId,
          diagnosis: newDiagnosis
        })
      })
      .then(response => response.json())
      .then(data => {
        if (data.status === 'success') {
          if (diagnosisText) diagnosisText.textContent = newDiagnosis || '-';
          if (diagnosisText) diagnosisText.style.display = 'inline';
          if (diagnosisEdit) diagnosisEdit.style.display = 'none';
          if (editButton) editButton.style.display = 'inline-block';
        } else {
          alert('Chyba pri ukladaní diagnózy: ' + data.message);
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert('Chyba pri ukladaní diagnózy: ' + error);
      });
    });
  }

  if (cancelButton) {
    console.log('Cancel button found, adding click listener');
    cancelButton.addEventListener('click', function() {
      console.log('Cancel button clicked');
      if (diagnosisText) diagnosisText.style.display = 'inline';
      if (diagnosisEdit) diagnosisEdit.style.display = 'none';
      if (editButton) editButton.style.display = 'inline-block';
    });
  }

  // Get the download button
  const downloadButton = document.getElementById('download-button');
  
  if (downloadButton) {
    downloadButton.addEventListener('click', function() {
      // Get all checked methods
      const checkedMethods = Array.from(document.querySelectorAll('input[name="methods"]:checked'))
        .map(checkbox => checkbox.value);
      
      if (checkedMethods.length === 0) {
        alert('Prosím vyberte aspoň jednu metódu na stiahnutie.');
        return;
      }
      
      alert(`Sťahujem obrázky pre metódy: ${checkedMethods.join(', ')}`);
    });
  }

  // Table sorting functionality
  const table = document.getElementById('processed-images-table');
  let currentSortColumn = null;
  let isAscending = true;

  function sortTable(column) {
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    const headers = table.querySelectorAll('th');
    
    // Remove existing sort classes
    headers.forEach(header => {
      header.classList.remove('asc', 'desc');
    });

    // Update sort direction
    if (currentSortColumn === column) {
      isAscending = !isAscending;
    } else {
      isAscending = true;
      currentSortColumn = column;
    }

    // Add sort class to current header
    const currentHeader = table.querySelector(`th[data-sort="${column}"]`);
    currentHeader.classList.add(isAscending ? 'asc' : 'desc');

    // Sort rows
    rows.sort((a, b) => {
      let aValue = a.children[getColumnIndex(column)].textContent.trim();
      let bValue = b.children[getColumnIndex(column)].textContent.trim();

      // Special handling for dates
      if (column === 'date') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
        return isAscending ? aValue - bValue : bValue - aValue;
      }

      // Regular string comparison
      return isAscending 
        ? aValue.localeCompare(bValue, 'sk')
        : bValue.localeCompare(aValue, 'sk');
    });

    // Reorder rows in the table
    rows.forEach(row => tbody.appendChild(row));
  }

  function getColumnIndex(column) {
    const columns = ['method', 'status', 'date'];
    return columns.indexOf(column);
  }

  // Add click handlers to sortable headers
  table.querySelectorAll('.sortable').forEach(header => {
    header.addEventListener('click', () => {
      const column = header.getAttribute('data-sort');
      sortTable(column);
    });
  });

  // Make processed images table rows clickable
  document.querySelectorAll('.processed-image-row').forEach(function(row) {
    row.addEventListener('click', function() {
      const processedImageId = this.getAttribute('data-processed-image-id');
      if (processedImageId) {
        window.location.href = `/photos/processed/${processedImageId}`;
      }
    });
  });

  const sendBtn = document.getElementById('send-to-processing-button');
  const methodCheckboxes = document.querySelectorAll('input[name="methods"]:not([disabled])');
  const processingLoader = document.getElementById('processing-loader');
  const processingMessage = document.getElementById('processing-message');
  
  // Function to refresh the processed images table
  function refreshProcessedImagesTable() {
    const tableBody = document.querySelector('#processed-images-table tbody');
    if (!tableBody) return;

    const photoDetail = document.getElementById('photo-detail');
    const photoId = photoDetail.dataset.photoId;

    fetch(`/photos/get_processed_images/${photoId}`)
      .then(response => response.json())
      .then(data => {
        // Clear existing rows
        tableBody.innerHTML = '';
        
        // Add new rows
        data.forEach(img => {
          const row = document.createElement('tr');
          row.className = 'processed-image-row';
          row.dataset.processedImageId = img.id;
          if (img.url) {
            row.dataset.url = img.url;
            row.style.cursor = 'pointer';
          }
          
          row.innerHTML = `
            <td class="photo-detail-td">${img.method || '-'}</td>
            <td class="photo-detail-td">
              <span class="status-dot" data-status="${img.status || '-'}"></span>
              ${img.status || '-'}
            </td>
            <td class="photo-detail-td">${img.created_at || '-'}</td>
          `;
          
          // Add click handler for the new row
          row.addEventListener('click', function() {
            if (this.dataset.processedImageId) {
              window.location.href = `/photos/processed/${this.dataset.processedImageId}`;
            }
          });
          
          tableBody.appendChild(row);
        });
      })
      .catch(error => console.error('Error refreshing table:', error));
  }

  // Initially hide the button
  if (sendBtn) {
    sendBtn.style.display = 'none';
  }

  // Add change event listener to all checkboxes
  methodCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      // Show/hide button based on whether any checkbox is checked
      const anyChecked = Array.from(methodCheckboxes).some(cb => cb.checked);
      if (sendBtn) {
        sendBtn.style.display = anyChecked ? 'block' : 'none';
      }
    });
  });

  if (sendBtn) {
    sendBtn.addEventListener('click', function() {
      // Get the photo detail div and its data attributes
      const detailDiv = document.getElementById('photo-detail');
      const photoId = detailDiv.dataset.photoId;
      const userId = detailDiv.dataset.userId;
      const patientId = detailDiv.dataset.patientId;
      const eyeSide = detailDiv.dataset.eyeSide;
      const diagnosis = detailDiv.dataset.diagnosis;
      const deviceName = detailDiv.dataset.deviceName;
      const deviceType = detailDiv.dataset.deviceType;
      const cameraType = detailDiv.dataset.cameraType;

      // Get all checked methods
      const checkedMethods = Array.from(document.querySelectorAll('input[name="methods"]:checked:not([disabled])'));
      if (checkedMethods.length === 0) {
        alert('Prosím vyberte aspoň jednu metódu na spracovanie.');
        return;
      }

      // Collect method names and parameters
      const methodNames = checkedMethods.map(method => method.value);
      const methodParametersList = methodNames.map(() => ({})); // Empty objects for parameters

      // Show loader with initial message
      if (processingLoader) {
        processingLoader.style.display = 'flex';
        processingMessage.textContent = 'Kontrola dostupnosti servera...';
      }

      fetch('/photos/sent_to_processing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          photo_id: photoId,
          method_names: methodNames,
          method_parameters_list: methodParametersList,
          user_id: userId,
          patient_id: patientId,
          eye_side: eyeSide,
          diagnosis: diagnosis,
          device_name: deviceName,
          device_type: deviceType,
          camera_type: cameraType
        })
      })
      .then(response => {
        if (response.status === 503) {
          // Server unavailable - special handling
          return response.json().then(data => {
            throw new Error(`Server nedostupný: ${data.message || 'Spracovateľský server je momentálne nedostupný.'}`);
          });
        }
        if (!response.ok) {
          return response.text().then(text => { throw new Error(text); });
        }
        return response.json();
      })
      .then(data => {
        if (processingLoader) {
          const successCount = data.results ? data.results.filter(r => r.success).length : 0;
          const totalCount = data.results ? data.results.length : 0;

          if (successCount === totalCount) {
            processingMessage.textContent = 'Všetky metódy boli úspešne odoslané na spracovanie!';
            processingMessage.style.color = '#4CAF50';
          } else {
            processingMessage.textContent = `Odoslané na spracovanie: ${successCount} z ${totalCount} metód`;
            processingMessage.style.color = successCount > 0 ? '#FFA500' : '#f44336';
          }

          // Refresh the table and hide the message after 2 seconds
          setTimeout(() => {
            processingLoader.style.display = 'none';
            refreshProcessedImagesTable();
          }, 2000);
        }

        // Reset all unchecked checkboxes
        methodCheckboxes.forEach(cb => {
          if (!cb.disabled) {
            cb.checked = false;
          }
        });
        // Hide the button after processing
        sendBtn.style.display = 'none';
      })
      .catch(error => {
        if (processingLoader) {
          // Check if it's a server availability error
          if (error.message && error.message.includes('Server nedostupný')) {
            processingMessage.textContent = error.message;
            processingMessage.style.color = '#f44336';
          } else {
            processingMessage.textContent = 'Chyba pri odosielaní: ' + error.message;
            processingMessage.style.color = '#f44336';
          }

          setTimeout(() => {
            processingLoader.style.display = 'none';
          }, 3000);
        }
      });
    });
  }
}); 