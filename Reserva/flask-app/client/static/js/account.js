document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("dynamic-profile-form");
  const saveBtn = document.getElementById("save-profile-btn");

  // Volanie s cookies
  function fetchWithAuth(url, options = {}) {
    return fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        ...(options.headers || {}),
        'Accept': 'application/json'
      }
    });
  }

  // 1) Načítame user
  async function loadUserInfo() {
    try {
      const response = await fetchWithAuth('/account/info');
      if (!response.ok) {
        throw new Error('Nepodarilo sa načítať údaje používateľa.');
      }
      const user = await response.json();

      // 2) Vygenerovať formulár
      renderProfileForm(user);
    } catch (err) {
      console.error(err);
      container.innerHTML = `<p>Chyba pri načítaní profilu: ${err.message}</p>`;
    }
  }

  // 2) Podľa user.user_type vygenerujeme iné polia
  function renderProfileForm(user) {
    // V user môžeš mať: user.first_name, user.last_name, user.birth_number, user.address, user.email, user.phone_number,...
    // Nižšie je "univerzálny" príklad. Rozdelíme na "Osobné údaje" (left column), "Kontaktné údaje" (right column).
    // Môžeš pridať Adresa, Súhlasy, atď.

    let personalFields = [];
    let contactFields = [];
    let consents = []; // ak chceš checkboxy na súhlasy

    if (user.user_type === 'patient') {
      personalFields = [
        { label: "Meno",       name: "first_name",    value: user.first_name,  editable: true },
        { label: "Priezvisko", name: "last_name",     value: user.last_name,   editable: true },
        { label: "Rodné číslo",name: "birth_number",  value: user.birth_number,editable: false },
      ];

      contactFields = [
        { label: "Email",     name: "email",        value: user.email,        editable: true },
        { label: "Tel. číslo",name: "phone_number", value: user.phone_number, editable: true },
      ];

      consents = [
        { label: "Súhlasím so spracovaním mojich osobných údajov.", name: "consent_data", checked: true },
        { label: "Súhlasím so spracovaním mojich údajov v receptoch, správach a dokumentoch.", name: "consent_docs", checked: false },
        //{ label: "Súhlasím so spracovaním mojich údajov na účely marketingu.", name: "consent_marketing", checked: false },
      ];

    } else if (user.user_type === 'doctor') {
      personalFields = [
        { label: "Meno",       name: "first_name",     value: user.first_name,   editable: true },
        { label: "Priezvisko", name: "last_name",      value: user.last_name,    editable: true },
        { label: "ID Lekára",  name: "doctor_id",      value: user.doctor_id,    editable: false },
      ];
      contactFields = [
        { label: "Email",      name: "email",         value: user.email,         editable: true },
        { label: "Tel. číslo", name: "phone_number",  value: user.phone_number,  editable: true },
      ];
      consents = [
        { label: "Súhlasím so spracovaním osobných údajov (lekár).", name: "consent_data", checked: true },
      ];
    }
    else if (user.user_type === 'technician') {
      // atď. personalFields/ contactFields / consents
      personalFields = [
        { label: "Meno",       name: "first_name",  value: user.first_name,  editable: true },
        { label: "Priezvisko", name: "last_name",   value: user.last_name,   editable: true },
      ];
      contactFields = [
        { label: "Email", name: "email",           value: user.email,       editable: true },
        { label: "Tel. číslo", name: "phone_number", value: user.phone_number, editable: true },
      ];
      consents = [];
    }
    else if (user.user_type === 'admin') {
      personalFields = [
        { label: "Meno", name: "first_name", value: user.first_name, editable: true },
        { label: "Priezvisko", name: "last_name", value: user.last_name, editable: true },
      ];
      contactFields = [
        { label: "Email", name: "email", value: user.email, editable: true },
      ];
      consents = [];
    }
    else {
      // fallback, ak rola neznáma
      personalFields = [
        { label: "Meno", name: "first_name", value: user.first_name, editable: false },
        { label: "Priezvisko", name: "last_name", value: user.last_name, editable: false },
      ];
      contactFields = [
        { label: "Email", name: "email", value: user.email, editable: false },
      ];
    }

    // Generujeme HTML:
    let html = `<div class="two-columns">`;

    // Ľavý stĺpec: osobné údaje + adresa...
    html += `<div class="column left-col">
      <h3>Osobné údaje</h3>
      <div class="fields">`;
    personalFields.forEach(field => {
      html += createInputField(field.label, field.name, field.value, field.editable);
    });
    // Môžeš pridať "Adresa", "PSČ", "Mesto" ak to user obsahuje
    if (user.address_street) {
      html += createInputField("Ulica a číslo domu", "address_street", user.address_street, true);
    }
    if (user.address_city) {
      html += createInputField("Mesto", "address_city", user.address_city, true);
    }
    if (user.address_zip) {
      html += createInputField("PSČ", "address_zip", user.address_zip, true);
    }
    html += `</div> 
    </div>`; // end left-col

    // Pravý stĺpec: kontaktné údaje
    html += `<div class="column right-col">
      <h3>Kontaktné údaje</h3>
      <div class="fields">`;
    contactFields.forEach(field => {
      html += createInputField(field.label, field.name, field.value, field.editable);
    });
    html += `</div>`;

    // Súhlasy
    if (consents.length > 0) {
      html += `<h3>Súhlasy</h3>
               <div class="fields consents">`;
      consents.forEach(consent => {
        html += createCheckbox(consent.label, consent.name, consent.checked);
      });
      html += `</div>`;
    }

    html += `</div>`; // end right-col
    html += `</div>`; // end two-columns

    container.innerHTML = html;
  }

  // 3) Vytvára input field (zaoblený) => label + input
  function createInputField(label, name, value, editable) {
    // Môžeš použiť <input> type="text" alebo "date" atď.
    // Tu zjednodušene: type="text"
    // Ak editable je false, sprav readonly
    const disabledAttr = editable ? `` : `readonly`;
    return `
      <div class="form-group">
        <label>${label}</label>
        <input type="text" name="${name}" value="${value || ''}" ${disabledAttr} />
      </div>
    `;
  }

  // 4) Vytvára checkbox pre "Súhlasy"
  function createCheckbox(label, name, checked) {
    return `
      <div class="form-group checkbox-group">
        <input type="checkbox" name="${name}" ${checked ? 'checked' : ''} />
        <label>${label}</label>
      </div>
    `;
  }

  // 5) Uloženie
  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      // Pozbieraj polia z dynamic-profile-form
      const allInputs = container.querySelectorAll("input");
      let dataToSave = {};
      allInputs.forEach(inp => {
        if (inp.type === "checkbox") {
          dataToSave[inp.name] = inp.checked;
        } else {
          dataToSave[inp.name] = inp.value;
        }
      });
      console.log("Chcem uložiť:", dataToSave);
      // Tu môžeš spraviť fetchWithAuth('/account/update', { method:'POST', body: JSON.stringify(dataToSave), ... })
      alert("Zmeny uložené (len debug). Pozri console.log");
    });
  }

  loadUserInfo();
});
