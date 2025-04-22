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