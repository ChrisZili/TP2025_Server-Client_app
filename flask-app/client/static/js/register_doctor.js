document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registration-form");
  const registerBtn = document.getElementById("register-btn");

  // HTML polia:
  const firstName = document.getElementById("first_name");      // povinné
  const lastName = document.getElementById("last_name");        // povinné
  const phoneNumber = document.getElementById("phone_number");  // povinné
  const gender = document.getElementById("gender");             // povinné
  const title = document.getElementById("title");               // nepovinné
  const suffix = document.getElementById("suffix");             // nepovinné
  const doctorCode = document.getElementById("doctor_code");    // povinné
  const email = document.getElementById("email");               // povinné
  const password = document.getElementById("password");         // povinné
  const confirmPassword = document.getElementById("confirm_password"); // povinné, musí sa zhodovať s password
  const gdpr = document.getElementById("gdpr");                 // musí byť zaškrtnuté

  // Chybové divy (pod každým poľom)
  const firstNameError = document.getElementById("first_name_error");
  const lastNameError = document.getElementById("last_name_error");
  const phoneNumberError = document.getElementById("phone_number_error");
  const genderError = document.getElementById("gender_error");
  const titleError = document.getElementById("title_error");
  const suffixError = document.getElementById("suffix_error");
  const doctorCodeError = document.getElementById("doctor_code_error");
  const emailError = document.getElementById("email_error");
  const passwordError = document.getElementById("password_error");
  const confirmPasswordError = document.getElementById("confirm_password_error");
  const gdprError = document.getElementById("gdpr_error");

  // Aby sme zobrazovali chyby až po tom, čo user "opustil" pole
  // budeme sledovať, ktoré polia boli dotknuté (touched)
  const touched = {
    first_name: false,
    last_name: false,
    phone_number: false,
    gender: false,
    title: false,
    suffix: false,
    doctor_code: false,
    email: false,
    password: false,
    confirm_password: false,
    gdpr: false
  };

  // Pomocná funkcia: označí pole ako dotknuté a zavolá validateForm()
  function markTouched(fieldName) {
    touched[fieldName] = true;
    validateForm();
  }

  // Nastavíme event listenery (blur pre textové polia, change pre select a checkbox)
  firstName.addEventListener("blur", () => markTouched("first_name"));
  lastName.addEventListener("blur", () => markTouched("last_name"));
  phoneNumber.addEventListener("blur", () => markTouched("phone_number"));
  gender.addEventListener("change", () => markTouched("gender"));
  title.addEventListener("blur", () => markTouched("title"));
  suffix.addEventListener("blur", () => markTouched("suffix"));
  doctorCode.addEventListener("blur", () => markTouched("doctor_code"));
  email.addEventListener("blur", () => markTouched("email"));
  password.addEventListener("blur", () => markTouched("password"));
  confirmPassword.addEventListener("blur", () => markTouched("confirm_password"));
  gdpr.addEventListener("change", () => markTouched("gdpr"));

  // Validácia formulára
  function validateForm() {
    let isValid = true;

    // Najprv vymažeme predchádzajúce chyby
    clearError(firstNameError);
    clearError(lastNameError);
    clearError(phoneNumberError);
    clearError(genderError);
    clearError(titleError);
    clearError(suffixError);
    clearError(doctorCodeError);
    clearError(emailError);
    clearError(passwordError);
    clearError(confirmPasswordError);
    clearError(gdprError);

    // 1) First Name (povinné)
    if (!firstName.value.trim()) {
      isValid = false;
      if (touched.first_name) {
        showError(firstNameError, "First name is required.");
      }
    }

    // 2) Last Name (povinné)
    if (!lastName.value.trim()) {
      isValid = false;
      if (touched.last_name) {
        showError(lastNameError, "Last name is required.");
      }
    }

    // 3) Phone Number (povinné)
    if (!phoneNumber.value.trim()) {
      isValid = false;
      if (touched.phone_number) {
        showError(phoneNumberError, "Phone number is required.");
      }
    }

    // 4) Gender (povinné)
    if (!gender.value) {
      isValid = false;
      if (touched.gender) {
        showError(genderError, "Gender is required.");
      }
    }

    // 5) Title (nepovinné) -> nekontrolujeme
    //    if (title.value ??) only if we had special format – no

    // 6) Suffix (nepovinné) -> rovnako žiadna kontrola

    // 7) Doctor code (povinné, ale zobrazený ako "Hospital Code")
    if (!doctorCode.value.trim()) {
      isValid = false;
      if (touched.doctor_code) {
        showError(doctorCodeError, "Hospital code is required.");
      }
    }

    // 8) Email (povinné)
    if (!email.value.trim()) {
      isValid = false;
      if (touched.email) {
        showError(emailError, "Email is required.");
      }
    }
    // Prípadne by sme mohli pridať regex kontrolu na formát emailu (nie je nutné)

    // 9) Password (povinné)
    if (!password.value) {
      isValid = false;
      if (touched.password) {
        showError(passwordError, "Password is required.");
      }
    }

    // 10) Confirm password – musí zodpovedať password
    if (!confirmPassword.value || confirmPassword.value !== password.value) {
      isValid = false;
      if (touched.confirm_password) {
        showError(confirmPasswordError, "Passwords do not match.");
      }
    }

    // 11) GDPR – checkbox musí byť checked
    if (!gdpr.checked) {
      isValid = false;
      if (touched.gdpr) {
        showError(gdprError, "You must agree to the GDPR terms.");
      }
    }

    // Povoliť/zakázať tlačidlo
    registerBtn.disabled = !isValid;
  }

  // Pomocné funkcie na nastavenie/odstránenie chyby
  function showError(divElem, message) {
    divElem.textContent = message;
    divElem.classList.add("active"); // .field-error.active -> display: block
  }
  function clearError(divElem) {
    divElem.textContent = "";
    divElem.classList.remove("active");
  }

  // Finálna kontrola pri submit
  form.addEventListener("submit", (e) => {
    validateForm();
    if (registerBtn.disabled) {
      e.preventDefault(); // Zabránime odoslaniu, ak je nevalidné
    }
  });
});
