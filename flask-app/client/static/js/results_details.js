document.addEventListener("DOMContentLoaded", () => {
  console.log("Processed Image:", processedImage);
  console.log("Original Image:", originalImage);
  console.log("URLs:", urls);

  const editDetailsButton = document.getElementById("edit-details-button");
  const saveDetailsButton = document.getElementById("save-details-button");
  const textElements = document.querySelectorAll('[id$="-text"]');
  const inputElements = document.querySelectorAll('[id$="-input"]');

  if (editDetailsButton && saveDetailsButton) {
    // Show input fields and save button when "Edit" is clicked
    editDetailsButton.addEventListener("click", () => {
      textElements.forEach(text => text.style.display = "none");
      inputElements.forEach(input => {
        if (!input.disabled) input.style.display = "block";
      });
      editDetailsButton.style.display = "none";
      saveDetailsButton.style.display = "inline-block";
    });

    // Save the new details when "Save" is clicked
    saveDetailsButton.addEventListener("click", () => {
      const updatedDetails = {};
      inputElements.forEach(input => {
        if (input.style.display === "block") {
          const key = input.id.replace("-input", "");
          updatedDetails[key] = input.value;
        }
      });

      console.log("Updated Details:", updatedDetails); // Debug log

      fetch(`/results/update_details/${processedImage.id}`, { // Use processedImage.id for the API call
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedDetails),
      })
        .then(response => {
          if (response.ok) {
            alert("Details successfully saved.");
            location.reload();
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

  const backButton = document.getElementById("back-button");

  // Navigate back to the previous page when the "Back" button is clicked
  backButton.addEventListener("click", () => {
    window.history.back();
  });

  // Example usage of URLs
  if (urls.preview_url) {
    const previewImage = document.getElementById("preview-image");
    if (previewImage) {
      previewImage.src = urls.preview_url;
    }
  }
});