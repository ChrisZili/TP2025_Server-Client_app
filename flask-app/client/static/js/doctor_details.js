document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded and parsed."); // Debugging

  // Extract the doctor ID from the URL path
  const pathParts = window.location.pathname.split("/");
  const doctorId = pathParts[pathParts.length - 1]; // Get the last part of the path
  console.log("Extracted Doctor ID:", doctorId); // Debugging

  // Validate the doctor ID
  if (!doctorId || isNaN(doctorId)) {
    alert("Doctor ID is missing or invalid in the URL. Redirecting to the doctors list.");
    window.location.href = "/doctors";
    return;
  }

  const form = document.getElementById("doctor-details-form");
  const userType = form.getAttribute("data-user-type");
  console.log("User type:", userType); // Debugging

  const superdoctorCheckbox = document.getElementById("superdoctor-checkbox");
  const hospitalInput = document.getElementById("doctor-hospital");
  const doctorIdField = document.getElementById("doctor-id"); // Reference to the Doctor ID field
  const doctorIdContainer = doctorIdField.closest(".form-group"); // Assuming the field is wrapped in a container with a class like "form-group"

  // Function to fetch doctor details with retry logic
  function fetchDoctorDetails(retry = false) {
    fetch(`/doctors/${doctorId}`)
      .then((response) => {
        console.log("Response status:", response.status); // Debugging
        if (!response.ok) {
          throw new Error(`Failed to fetch doctor data: ${response.statusText}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Doctor data:", data); // Debugging

        // Populate the form with doctor details
        doctorIdField.value = data.id;
        document.getElementById("doctor-first-name").value = data.first_name;
        document.getElementById("doctor-last-name").value = data.last_name;
        document.getElementById("doctor-title").value = data.title;
        document.getElementById("doctor-email").value = data.email;
        document.getElementById("doctor-phone").value = data.phone_number;
        hospitalInput.value = data.hospital;

        // Hide the hospital input field if the user is not a super admin
        if (userType !== "super_admin") {
          console.log("Hiding hospital input for non-super admin user."); // Debugging
          hospitalInput.style.display = "none"; // Hide the field
          hospitalInput.required = false; // Remove the required attribute
        }

        // Hide the doctor ID field and its container if the user is not a super admin
        if (userType !== "super_admin") {
          console.log("Hiding doctor ID field and its container for non-super admin user."); // Debugging
          doctorIdContainer.style.display = "none"; // Hide the container
        }

        // Set the checkbox value based on the doctor's data
        superdoctorCheckbox.checked = data.super_doctor;

        // Disable the checkbox if the user is not a super admin
        if (userType !== "super_admin") {
          superdoctorCheckbox.disabled = true;
        }
      })
      .catch((error) => {
        console.error("Error fetching doctor details:", error);

        // Retry fetching doctor details if not already retried
        if (!retry) {
          console.log("Retrying to fetch doctor details...");
          fetchDoctorDetails(true);
        } else {
          // Only show the error message after the second failure
          alert("Nepodarilo sa načítať údaje doktora.");
        }
      });
  }

  // Fetch doctor details for the first time
  fetchDoctorDetails();

  // Handle form submission
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    // Collect updated doctor data
    const updatedData = {
      first_name: document.getElementById("doctor-first-name").value.trim(),
      last_name: document.getElementById("doctor-last-name").value.trim(),
      title: document.getElementById("doctor-title").value.trim(),
      email: document.getElementById("doctor-email").value.trim(),
      phone_number: document.getElementById("doctor-phone").value.trim(),
      is_superdoctor: superdoctorCheckbox.checked,
    };

    fetch(`/doctors/update/${doctorId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedData),
    })
      .then((response) => {
        if (response.ok) {
          alert("Údaje doktora boli úspešne aktualizované.");
          window.location.href = "/doctors";
        } else {
          throw new Error("Failed to update doctor details.");
        }
      })
      .catch((error) => {
        console.error("Error updating doctor details:", error);
        alert("Nepodarilo sa aktualizovať údaje doktora.");
      });
  });

  // Handle "Back to List" button click
  const cancelButton = document.getElementById("cancel-button");
  if (cancelButton) {
    console.log("Cancel button found:", cancelButton); // Debugging
    cancelButton.addEventListener("click", () => {
      console.log("Cancel button clicked. Redirecting to /doctors."); // Debugging
      window.location.href = "/doctors"; // Redirect to the doctors list page
    });
  } else {
    console.error("Cancel button not found in the DOM."); // Debugging
  }
});