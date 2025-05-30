document.addEventListener("DOMContentLoaded", () => {
    const photoInput = document.getElementById("photo");
    const photoPreviewContainer = document.getElementById("photo-preview-container");
    const photoPreview = document.getElementById("photo-preview");
    const fileName = document.getElementById("file-name");
    const fileInputWrapper = document.querySelector(".file-input-wrapper");
    const form = document.querySelector("form");
    const anonymousCheckbox = document.getElementById("anonymous");
    const patientSelect = document.getElementById("patient");
  
    // Function to check server health
    function checkServerHealth() {
      return fetch('/photos/check_server_health', {
        method: 'GET',
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      })
      .then(response => response.json())
      .then(data => {
        if (!data.available) {
          // Show server unavailable message if server is not available
          showServerUnavailableMessage(data.message);
          return false;
        }
        return true;
      })
      .catch(error => {
        console.error('Error checking server health:', error);
        showServerUnavailableMessage('Cannot connect to the processing server');
        return false;
      });
    }
  
    // Function to show server unavailable message
    function showServerUnavailableMessage(message) {
      // Remove any existing error notifications first
      const existingNotifications = document.querySelectorAll('.server-unavailable-notification');
      existingNotifications.forEach(notification => {
        notification.remove();
      });
      
      // Create new notification
      const notification = document.createElement('div');
      notification.className = 'upload-notification error server-unavailable-notification';
      notification.style.position = 'relative';
      notification.style.margin = '20px auto';
      notification.style.textAlign = 'center';
      notification.style.maxWidth = '80%';
      notification.style.left = '0';
      notification.style.right = '0';
      notification.textContent = `Server nedostupný: ${message}`;
      
      const container = document.getElementById('add-photo-container');
      if (container) {
        container.insertBefore(notification, container.firstChild);
      }
    }
  
    // Handle anonymous checkbox interaction
    if (anonymousCheckbox && patientSelect) {
      anonymousCheckbox.addEventListener("change", (event) => {
        if (event.target.checked) {
          patientSelect.disabled = true;
          patientSelect.value = "";
          patientSelect.removeAttribute("required");
        } else {
          patientSelect.disabled = false;
          patientSelect.setAttribute("required", "required");
        }
      });
    }
  
    if (photoInput && photoPreview && photoPreviewContainer && fileName && fileInputWrapper) {
      // Handle file input change
      photoInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file) {
    const allowedTypes = ["image/jpeg", "image/png"];

    if (!allowedTypes.includes(file.type)) {
      alert("Prosím, nahrajte iba súbor vo formáte JPG alebo PNG.");
      resetFileInput(); // zruší náhľad a súbor
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      // Zobraz náhľad
      photoPreview.src = e.target.result;
      photoPreview.style.display = "block";
      photoPreviewContainer.style.display = "flex";
      setTimeout(() => {
        photoPreviewContainer.classList.add("expanded");
      }, 10);
    };
    reader.readAsDataURL(file);

    fileName.textContent = `Názov súboru: ${file.name}`;
    fileName.style.display = "block";
    fileInputWrapper.style.backgroundColor = "red";
    fileInputWrapper.setAttribute("data-state", "cancel");
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
        
        // Remove expanded class first to trigger the transition
        photoPreviewContainer.classList.remove("expanded");
        
        // After transition completes, hide the container entirely
        setTimeout(() => {
          photoPreviewContainer.style.display = "none";
        }, 300); // Match the transition duration in CSS
        
        fileName.style.display = "none";
        fileName.textContent = "";
        photoInput.value = ""; // Reset the file input
  
        // Reset button to "Upload"
        fileInputWrapper.style.backgroundColor = "";
        fileInputWrapper.setAttribute("data-state", "upload");
      }
    }
  
    // Handle form submission
    if (form) {
      form.addEventListener("submit", async (event) => {
        event.preventDefault();
  
        // Get submit button reference outside try/catch to ensure it's always accessible
        const submitButton = form.querySelector('button[type="submit"]');
        const originalButtonText = submitButton ? submitButton.textContent : "Nahrajte fotku";
  
        try {
          // Validate required fields
          const requiredFields = form.querySelectorAll('[required]');
          let missingFields = false;
          
          requiredFields.forEach(field => {
            if (!field.value) {
              field.classList.add('error');
              missingFields = true;
            } else {
              field.classList.remove('error');
            }
          });
          
          if (missingFields) {
            throw new Error('Please fill in all required fields');
          }
          
          // Check server health before proceeding
          submitButton.textContent = "Kontrola servera...";
          submitButton.disabled = true;
          
          const serverIsAvailable = await checkServerHealth();
          if (!serverIsAvailable) {
            // The error message is already shown by checkServerHealth
            submitButton.textContent = originalButtonText;
            submitButton.disabled = false;
            return;
          }
  
          // Create FormData object
          const formData = new FormData(form);
  
          // Show loading state
          submitButton.textContent = "Nahrávanie...";
          submitButton.disabled = true;
  
          // Add X-Requested-With header to identify as AJAX request
          const response = await fetch(form.action, {
            method: 'POST',
            body: formData,
            headers: {
              'X-Requested-With': 'XMLHttpRequest'
            }
          });
  
          // Parse the response based on content type
          let result;
          const contentType = response.headers.get('content-type');
          
          if (contentType && contentType.includes('application/json')) {
            result = await response.json();
          } else {
            result = await response.text();
          }
  
          if (!response.ok) {
            // Server returned an error
            const errorMessage = (result && result.message) ? result.message : `HTTP error! status: ${response.status}`;
            throw new Error(errorMessage);
          }
  
          // Show success message
          const successMessage = (result && result.message) ? result.message : 'Formulár bol úspešne odoslaný!';
          
          // Create a custom styled notification
          const notification = document.createElement('div');
          notification.className = 'upload-notification success';
          notification.textContent = successMessage;
          document.body.appendChild(notification);
          
          // Remove notification after 3 seconds
          setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
              document.body.removeChild(notification);
            }, 500);
          }, 3000);
  
          // Reset form
          form.reset();
          resetFileInput();
          
          // Redirect to photos list page after successful upload
          setTimeout(() => {
            window.location.href = '/photos/list';
          }, 1500);
  
        } catch (error) {
          console.error('Error:', error);
          
          // Create a custom styled notification for errors
          const notification = document.createElement('div');
          notification.className = 'upload-notification error';
          notification.textContent = error.message || 'Nastala chyba pri odosielaní formulára. Prosím, skúste to znova.';
          document.body.appendChild(notification);
          
          // Remove notification after 5 seconds
          setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
              document.body.removeChild(notification);
            }, 500);
          }, 5000);
          
        } finally {
          // Reset button state
          submitButton.textContent = originalButtonText;
          submitButton.disabled = false;
        }
      });
    }
  });