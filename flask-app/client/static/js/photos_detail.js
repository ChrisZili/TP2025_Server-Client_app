document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded and parsed.");

  // Ensure processedImages and photoId are accessible
  if (typeof processedImages === "undefined" || typeof photoId === "undefined") {
    console.error("processedImages or photoId is not defined.");
    return;
  }

  console.log("Processed Images in JavaScript:", processedImages);
  console.log("Photo ID in JavaScript:", photoId);

  // Processed Images and Methods
  const checkboxes = document.querySelectorAll('input[type="checkbox"][name="methods"]');
  const processPhotoButton = document.getElementById('process-photo-button');

  // Mark checkboxes for processed images
  processedImages.forEach(image => {
    const methodName = image.method_used; // Use the method_used property
    const checkbox = document.querySelector(`#method-${CSS.escape(methodName)}`);
    if (checkbox) {
      console.log(`Marking checkbox for method: ${methodName}`);
      checkbox.checked = true; // Mark as checked
      checkbox.disabled = true; // Disable to prevent unchecking
    } else {
      console.warn(`Checkbox not found for method: ${methodName}`);
    }
  });

  processedImages.forEach(image => {
    const methodName = image.method_used.toLowerCase();
    const checkbox = document.querySelector(`#method-${CSS.escape(methodName)}`);
    if (checkbox) {
      console.log(`Checkbox for method ${methodName}:`, {
        checked: checkbox.checked,
        disabled: checkbox.disabled,
        visibility: window.getComputedStyle(checkbox).visibility,
        display: window.getComputedStyle(checkbox).display,
      });
    } else {
      console.warn(`Checkbox not found for method: ${methodName}`);
    }
  });

  // Function to check if any new methods are selected
  function updateButtonVisibility() {
    const hasNewMethods = Array.from(checkboxes).some(checkbox => {
      return checkbox.checked && !checkbox.disabled;
    });

    console.log("Has new methods:", hasNewMethods);

    if (processPhotoButton) {
      processPhotoButton.style.display = hasNewMethods ? 'inline-block' : 'none';
    }
  }

  // Add event listeners to checkboxes
  checkboxes.forEach(checkbox => {
    console.log("Attaching event listener to checkbox:", checkbox);
    checkbox.addEventListener('change', updateButtonVisibility);
  });

  // Initial check for button visibility
  updateButtonVisibility();

  // Edit and Save Details
  const editDetailsButton = document.getElementById("edit-details-button");
  const saveDetailsButton = document.getElementById("save-details-button");
  const textElements = document.querySelectorAll('[id$="-text"]');
  const inputElements = document.querySelectorAll('[id$="-input"]');

  if (editDetailsButton && saveDetailsButton) {
    console.log("Edit and Save buttons found.");

    // Show input fields and save button when "Edit" is clicked
    editDetailsButton.addEventListener("click", () => {
      console.log("Edit button clicked.");
      textElements.forEach(text => text.style.display = "none");
      inputElements.forEach(input => {
        if (!input.disabled) input.style.display = "block";
      });
      editDetailsButton.style.display = "none";
      saveDetailsButton.style.display = "inline-block";
    });

    // Save the new details when "Save" is clicked
    saveDetailsButton.addEventListener("click", () => {
      console.log("Save button clicked.");
      const updatedDetails = {};
      inputElements.forEach(input => {
        if (input.style.display === "block") {
          const key = input.id.replace("-input", "");
          updatedDetails[key] = input.value;
        }
      });

      console.log("Updated Details:", updatedDetails);

      fetch(`/photos/update_details/${photoId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedDetails),
      })
        .then(response => {
          if (response.ok) {
            alert("Details successfully saved.");
            location.reload(); // Reload the page to reflect changes
          } else {
            alert("Failed to save details.");
          }
        })
        .catch(error => {
          console.error("Error:", error);
          alert("Error saving details.");
        });
    });
  }

  // Add click event to rows
  const rows = document.querySelectorAll(".clickable-row");
  rows.forEach(row => {
    console.log("Attaching click event to row:", row);
    row.addEventListener("click", () => {
      const href = row.getAttribute("data-href");
      if (href) {
        console.log("Navigating to:", href);
        window.location.href = href;
      }
    });
  });
});