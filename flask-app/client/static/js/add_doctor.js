document.addEventListener("DOMContentLoaded", () => {
  // Get the current date in YYYY-MM-DD format
  const currentDate = new Date().toISOString().split("T")[0];

  // Set the value of the hidden input and display field
  document.getElementById("doctor-created-at").value = currentDate;
  document.getElementById("doctor-created-at-display").value = currentDate;

  const form = document.getElementById("add-doctor-form");
  const userType = form.getAttribute("data-user-type");

  // Elements to hide
  const hospitalGroup = document.getElementById("doctor-hospital-group");
  const superdoctorGroup = document.getElementById("superdoctor-group");

  if (userType !== "super_admin") {
    // Regular admin: Fetch the user's hospital ID and populate the field
    if (hospitalGroup) hospitalGroup.style.display = "none";
    if (superdoctorGroup) superdoctorGroup.style.display = "none";

    fetchUserHospital()
      .then((hospitalId) => {
        const hospitalInput = document.getElementById("doctor-hospital");
        if (!hospitalInput) {
          console.error("Hospital input field not found in the DOM.");
          return;
        }

        // Debugging: Log the hospitalInput element
        console.log("Hospital input element:", hospitalInput);

        // Add the hospital ID as an option to the dropdown if it doesn't exist
        let option = hospitalInput.querySelector(`option[value="${hospitalId}"]`);
        if (!option) {
          option = document.createElement("option");
          option.value = hospitalId;
          option.textContent = `Hospital ${hospitalId}`; // Replace with the actual hospital name if available
          hospitalInput.appendChild(option);
          console.log(`Added hospital ID ${hospitalId} as an option to the dropdown.`);
        }

        // Set the hospital ID
        hospitalInput.value = hospitalId;
        console.log(`Set hospital ID for regular admin: ${hospitalInput.value}`);

        // Debugging: Log the value after setting
        console.log("Hospital input value after setting:", hospitalInput.value);

        hospitalInput.style.display = "none"; // Hide it again if needed
        hospitalInput.required = false; // Remove the required attribute since it's hidden
      })
      .catch((error) => {
        console.error("Error fetching user's hospital:", error);
        alert("Nepodarilo sa načítať nemocnicu používateľa. Skúste to znova neskôr.");
      });

    // Automatically set superdoctor to false
    const superdoctorCheckbox = document.getElementById("superdoctor-checkbox");
    superdoctorCheckbox.checked = false;
    superdoctorCheckbox.disabled = true; // Disable the checkbox for admins
  } else {
    // Super admin: Populate the dropdown with hospital data
    const hospitalDropdown = document.getElementById("doctor-hospital");
    fetch("/hospitals/list")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch hospitals");
        }
        return response.json();
      })
      .then((hospitals) => {
        hospitals.forEach((hospital) => {
          const option = document.createElement("option");
          option.value = hospital.id; // Use hospital ID as the value
          option.textContent = hospital.name; // Display hospital name
          hospitalDropdown.appendChild(option);
        });
        console.log("Hospital dropdown populated for super admin.");
      })
      .catch((error) => {
        console.error("Error fetching hospitals:", error);
        alert("Nepodarilo sa načítať zoznam nemocníc. Skúste to znova neskôr.");
      });
  }

  // Back to List Button
  const backToListButton = document.getElementById("back-to-list-button");
  backToListButton.addEventListener("click", () => {
    window.location.href = "/doctors"; // Replace with the correct route if needed
  });
});

// Submit handler for the form
document.getElementById("add-doctor-form").addEventListener("submit", async function (event) {
  event.preventDefault(); // Prevent form submission

  try {
    const hospitalInput = document.getElementById("doctor-hospital");
    let hospitalValue = hospitalInput ? hospitalInput.value.trim() : "";

    // If the user is a regular admin, ensure the hospital ID is fetched
    const userType = document.getElementById("add-doctor-form").getAttribute("data-user-type");
    if (userType !== "super_admin" && !hospitalValue) {
      hospitalValue = await fetchUserHospital(); // Fetch hospital ID for regular admin
    }

    // Collect form data
    const doctorData = {
      first_name: document.getElementById("doctor-first-name").value.trim(),
      last_name: document.getElementById("doctor-last-name").value.trim(),
      title: document.getElementById("doctor-title").value.trim(),
      email: document.getElementById("doctor-email").value.trim(),
      phone: document.getElementById("doctor-phone").value.trim(),
      hospital: hospitalValue, // Use the hospital value
      created_at: document.getElementById("doctor-created-at").value,
      is_superdoctor: document.getElementById("superdoctor-checkbox").checked, // Include superdoctor status
    };

    // Debugging: Log the collected data
    console.log("Collected doctor data:", doctorData);

    // Validate form data
    if (!doctorData.first_name || !doctorData.last_name || !doctorData.email || !doctorData.phone || !doctorData.hospital) {
      alert("Vyplňte všetky povinné polia!");
      return;
    }

    // Simulate saving the doctor data (replace this with an API call if needed)
    console.log("Doctor added:", doctorData);
    alert("Doktor bol úspešne pridaný!");

    // Reset the form
    document.getElementById("add-doctor-form").reset();

    // Reset the date to the current date
    const currentDate = new Date().toISOString().split("T")[0];
    document.getElementById("doctor-created-at").value = currentDate;
    document.getElementById("doctor-created-at-display").value = currentDate;
  } catch (error) {
    console.error("Error during form submission:", error);
    alert("Nastala chyba pri odosielaní formulára. Skúste to znova.");
  }
});

// Function to fetch the user's hospital ID
function fetchUserHospital() {
  return fetch("/user/data")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to fetch user data: ${response.status} ${response.statusText}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log("Fetched user data:", data); // Debugging: Log the fetched data

      if (!data.hospital_id) {
        throw new Error("User hospital ID not found in user data");
      }

      console.log(`Fetched hospital ID: ${data.hospital_id}`);
      return data.hospital_id; // Return the hospital ID
    })
    .catch((error) => {
      console.error("Error fetching user's hospital:", error);
      throw error; // Re-throw the error to handle it in the calling code
    });
}