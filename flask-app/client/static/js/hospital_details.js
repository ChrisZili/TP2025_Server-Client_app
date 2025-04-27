document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded and parsed."); // Debugging

  // Check if the user is a Super Admin
  const userTypeElement = document.getElementById("user-type");
  if (userTypeElement) {
    const userType = userTypeElement.value; // Assuming this is passed from the backend
    if (userType !== "super_admin") {
      alert("You do not have permission to access this page.");
      window.location.href = "/dashboard"; // Redirect to a safe page
      return;
    }
  } else {
    console.warn("User type element not found. Skipping user type check."); // Debugging
  }

  // Extract the hospital ID from the URL path
  const pathParts = window.location.pathname.split("/");
  const hospitalId = pathParts[pathParts.length - 1]; // Get the last part of the path
  console.log("Extracted Hospital ID:", hospitalId); // Debugging

  // Validate the hospital ID
  if (!hospitalId || isNaN(hospitalId)) {
    alert("Hospital ID is missing or invalid in the URL. Redirecting to the hospitals list.");
    window.location.href = "/hospitals";
    return;
  }

  // Function to fetch hospital details with retry logic
  function fetchHospitalDetails(retry = false) {
    fetch(`/hospitals/${hospitalId}`)
      .then((response) => {
        console.log("Response status:", response.status); // Debugging
        if (!response.ok) {
          throw new Error(`Failed to fetch hospital data: ${response.statusText}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Hospital data:", data); // Debugging

        // Populate the form with hospital details
        document.getElementById("hospital-id").value = data.id;
        document.getElementById("hospital-name").value = data.name;
        document.getElementById("hospital-city").value = data.city;
        document.getElementById("hospital-street").value = data.street;
        document.getElementById("hospital-psc").value = data.postal_code;
      })
      .catch((error) => {
        console.error("Error fetching hospital details:", error);

        // Retry fetching hospital details if not already retried
        if (!retry) {
          console.log("Retrying to fetch hospital details...");
          fetchHospitalDetails(true);
        } else {
          // Only show the error message after the second failure
          alert("Nepodarilo sa načítať údaje nemocnice.");
        }
      });
  }

  // Fetch hospital details for the first time
  fetchHospitalDetails();

  // Handle form submission
  document.getElementById("hospital-details-form").addEventListener("submit", (event) => {
    event.preventDefault();

    // Collect updated hospital data
    const updatedData = {
      name: document.getElementById("hospital-name").value.trim(),
      city: document.getElementById("hospital-city").value.trim(),
      street: document.getElementById("hospital-street").value.trim(),
      postal_code: document.getElementById("hospital-psc").value.trim(),
    };

    fetch(`/hospitals/update/${hospitalId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedData),
    })
      .then((response) => {
        if (response.ok) {
          alert("Údaje nemocnice boli úspešne aktualizované.");
          window.location.href = "/hospitals";
        } else {
          throw new Error("Failed to update hospital details.");
        }
      })
      .catch((error) => {
        console.error("Error updating hospital details:", error);
        alert("Nepodarilo sa aktualizovať údaje nemocnice.");
      });
  });

  // Handle "Back to List" button click
  const cancelButton = document.getElementById("cancel-button");
  if (cancelButton) {
    console.log("Cancel button found:", cancelButton); // Debugging
    cancelButton.addEventListener("click", () => {
      console.log("Cancel button clicked. Redirecting to /hospitals."); // Debugging
      window.location.href = "/hospitals"; // Redirect to the hospitals list page
    });
  } else {
    console.error("Cancel button not found in the DOM."); // Debugging
  }
});
