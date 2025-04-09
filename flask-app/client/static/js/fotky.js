document.addEventListener("DOMContentLoaded", () => {
  const photoInput = document.getElementById("photo");
  const photoPreview = document.getElementById("photo-preview");
  const fileName = document.getElementById("file-name");
  const fileInputWrapper = document.querySelector(".file-input-wrapper"); // Target the "Vyberte fotku" wrapper

  if (photoInput && photoPreview && fileName && fileInputWrapper) {
    // Handle file input change
    photoInput.addEventListener("change", (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          photoPreview.src = e.target.result;
          photoPreview.style.display = "block";
        };
        reader.readAsDataURL(file);

        // Update file name and button
        fileName.textContent = `Názov súboru: ${file.name}`;
        fileInputWrapper.style.backgroundColor = "red";
        fileInputWrapper.setAttribute("data-state", "cancel"); // Set state to cancel
        fileInputWrapper.querySelector("::before").textContent = "Zrušiť fotku";
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
        fileName.textContent = "";
        photoInput.value = ""; // Reset the file input

        // Reset button text and color
        fileInputWrapper.style.backgroundColor = "";
        fileInputWrapper.setAttribute("data-state", "upload"); // Set state to upload
        fileInputWrapper.querySelector("::before").textContent = "Vyberte fotku";
      }
    });
  }
});