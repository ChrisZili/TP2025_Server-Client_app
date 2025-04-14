// Wait for the DOM to fully load
document.addEventListener("DOMContentLoaded", function () {
  // Get the "Stiahni predchádzajúce obrazy" button by its ID
  const downloadButton = document.getElementById("download-button");

  // Add a click event listener to the button
  if (downloadButton) {
    downloadButton.addEventListener("click", function () {
      console.log("Stiahni predchádzajúce obrazy button clicked!");
      // Placeholder for future functionality
    });
  }
});