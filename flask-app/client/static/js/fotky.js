document.addEventListener("DOMContentLoaded", () => {
  const photoInput = document.getElementById("photo");
  const photoPreviewContainer = document.getElementById("photo-preview-container");
  const photoPreview = document.getElementById("photo-preview");
  const fileName = document.getElementById("file-name");
  const fileInputWrapper = document.querySelector(".file-input-wrapper"); // Target the "Vyberte fotku" wrapper

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
          photoPreviewContainer.style.display = "flex"; // Show the container
        };
        reader.readAsDataURL(file);

        // Update file name
        fileName.textContent = `Názov súboru: ${file.name}`;
        fileName.style.display = "block";

        // Change the button to "Cancel"
        fileInputWrapper.style.backgroundColor = "red";
        fileInputWrapper.setAttribute("data-state", "cancel");
        fileInputWrapper.querySelector("::before").textContent = "Zrušiť fotku";
      } else {
        // Hide the preview and file name if no file is selected
        photoPreview.src = "#";
        photoPreview.style.display = "none";
        photoPreviewContainer.style.display = "none";
        fileName.style.display = "none";
        fileName.textContent = "";

        // Reset the button to "Upload"
        fileInputWrapper.style.backgroundColor = "";
        fileInputWrapper.setAttribute("data-state", "upload");
        fileInputWrapper.querySelector("::before").textContent = "Vyberte fotku";
      }
    });

    // Handle click on the file input wrapper to cancel photo
    fileInputWrapper.addEventListener("click", (event) => {
      if (fileInputWrapper.getAttribute("data-state") === "cancel") {
        // Prevent the file browser from opening
        event.preventDefault();

        // Clear the photo preview and file input
        photoPreview.src = "#";
        photoPreview.style.display = "none";
        photoPreviewContainer.style.display = "none";
        fileName.style.display = "none";
        fileName.textContent = "";
        photoInput.value = ""; // Reset the file input

        // Reset button to "Upload"
        fileInputWrapper.style.backgroundColor = "";
        fileInputWrapper.setAttribute("data-state", "upload");
        fileInputWrapper.querySelector("::before").textContent = "Vyberte fotku";
      }
    });
  }
});