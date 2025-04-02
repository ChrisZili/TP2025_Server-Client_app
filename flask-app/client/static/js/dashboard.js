document.addEventListener("DOMContentLoaded", () => {
  // ===========================
  // 1) Responzívny sidebar (expanded / collapsed / hidden)
  // ===========================
  const dashboardCards = document.getElementById("dashboard-cards"); // <ul id="sidebar-menu">

  const menuConfig = {
    patient: [
      { icon: "fa fa-home",    label: "Domov",      link: "/dashboard" },
      { icon: "fa fa-user",    label: "Profil",     link: "/account" },
      { icon: "fa fa-flask",   label: "Výsledky",   link: "/vysledky" },
      { icon: "fa fa-user-md", label: "Doktor",     link: "/lekari" },
      { icon: "fa fa-envelope",label: "Správy",     link: "/spravy" },
      { icon: "fa fa-cog",     label: "Nastavenie", link: "/nastavenie" },
      { icon: "fa fa-sign-out",label: "Odhlásiť",   link: "/logout", isLogout: true },
    ],
    technician: [
      { icon: "fa fa-home",    label: "Domov",        link: "/dashboard" },
      { icon: "fa fa-user",    label: "Profil",     link: "/account" },
      { icon: "fa fa-images",  label: "Fotky",        link: "/fotky" },
      { icon: "fa fa-upload",  label: "Pridať fotku", link: "/fotky/pridat" },
      { icon: "fa fa-user-plus", label: "Vytvoriť pacienta", link: "/pacient/new" },
      { icon: "fa fa-envelope", label: "Správy",      link: "/spravy" },
      { icon: "fa fa-cog",      label: "Nastavenie",  link: "/nastavenie" },
      { icon: "fa fa-sign-out", label: "Odhlásiť",    link: "/logout", isLogout: true },
    ],
    doctor: [
      { icon: "fa fa-home",    label: "Domov",         link: "/dashboard" },
      { icon: "fa fa-user",    label: "Profil",        link: "/account" },
      { icon: "fa fa-users",   label: "Pacienti",      link: "/doctor/patients" },
      { icon: "fa fa-list",    label: "Zoznam",        link: "/doctor/list" },
      { icon: "fa fa-images",  label: "Fotky",         link: "/fotky" },
      { icon: "fa fa-user-gear", label: "Technici",    link: "/technicians" },
      { icon: "fa fa-envelope", label: "Správy",       link: "/spravy" },
      { icon: "fa fa-cog",     label: "Nastavenie",    link: "/nastavenie" },
      { icon: "fa fa-sign-out",label: "Odhlásiť",      link: "/logout", isLogout: true },
    ],
    admin: [
      { icon: "fa fa-home",    label: "Domov",      link: "/dashboard" },
      { icon: "fa fa-user",    label: "Profil",     link: "/account" },
      { icon: "fa fa-users",   label: "Pacienti",   link: "/admin/patients" },
      { icon: "fa fa-images",  label: "Fotky",      link: "/fotky" },
      { icon: "fa fa-user-gear", label: "Technici", link: "/technicians" },
      { icon: "fa fa-user-md", label: "Doktori",    link: "/doctors" },
      { icon: "fa fa-hospital",label: "Nemocnice",  link: "/hospitals" },
      { icon: "fa fa-list",    label: "Zoznam",     link: "/admin/list" },
      { icon: "fa fa-envelope",label: "Správy",     link: "/spravy" },
      { icon: "fa fa-cog",     label: "Nastavenie", link: "/nastavenie" },
      { icon: "fa fa-sign-out",label: "Odhlásiť",   link: "/logout", isLogout: true },
    ],
  };

  function updateCards(userType) {
  if (!dashboardCards) return;

  // 1) Vyfiltrujeme z menuConfig položky, ktoré nechceme:
  //    - isLogout (ak nechceš Odhlásiť),
  //    - label === "Domov" alebo label === "Profil".
  let items = menuConfig[userType].filter(item => {
    if (item.isLogout) return false;
    if (item.label === "Domov" || item.label === "Profil" || item.label === "Nastavenie") return false;
    return true;
  });

  // 2) Pole farieb, ktoré chceme použiť v cykle
  //    Môžeš si ich dať, koľko chceš, alebo nastaviť ľubovoľne.
  const colorClasses = ["purple", "red", "green", "orange", "teal"];

  // 3) Začneme tvoriť HTML pre .cards
  let html = `<div class="cards">`;

  // 4) Pre každú položku:
  items.forEach((item, index) => {
    // Vyberieme farbu z colorClasses podľa indexu
    const cardColor = colorClasses[index % colorClasses.length];

    html += `
      <div class="card ${cardColor}" onclick="location.href='${item.link}'">
        <h3>${item.label}</h3>
        <p>Popis pre položku "${item.label}"</p>
      </div>
    `;
  });

  html += `</div>`; // koniec .cards

  // 5) Vložíme do #dashboard-cards
  dashboardCards.innerHTML = html;
}

  // fetch s cookies
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

  // Po načítaní user-a: generujeme menu, zobrazíme rolu
  async function loadDashboard() {
    try {
      const response = await fetchWithAuth('/account/info');
      if (!response.ok) {
        throw new Error('Nepodarilo sa načítať údaje používateľa (token?).');
      }
      const user = await response.json();

      updateCards(user.user_type);
      // Zobrazíme príslušný obsah (doctor, patient, atď.)
      if (user.user_type === "doctor") {
        loadDoctorDashboard();
      } else if (user.user_type === "patient") {
        loadPatientDashboard();
      } else if (user.user_type === "technician") {
        loadTechnicianDashboard();
      } else if (user.user_type === "admin") {
        loadAdminDashboard();
      } else {
        const dc = document.getElementById("dashboard-content");
        if (dc) {
          dc.innerHTML = "<p>Vitajte v systéme (neznáma rola)</p>";
        }
      }
    } catch (err) {
      console.error("Chyba pri načítaní usera:", err);
      const dc = document.getElementById("dashboard-content");
      if (dc) {
        dc.innerHTML = `
          <p>Chyba pri načítaní obsahu: ${err.message}</p>
          <p><a href="/login">Prihláste sa znova</a></p>
        `;
      }
    }
  }

  function loadDoctorDashboard() {
    const dc = document.getElementById("dashboard-content");
    if (dc) {
      dc.innerHTML = "<h2>Doktor Dashboard</h2><p>Zoznam pacientov atď.</p>";
    }
  }
  function loadPatientDashboard() {
    const dc = document.getElementById("dashboard-content");
    if (dc) {
      dc.innerHTML = "<h2>Pacient Dashboard</h2><p>Zdravotná dokumentácia atď.</p>";
    }
  }
  function loadTechnicianDashboard() {
    const dc = document.getElementById("dashboard-content");
    if (dc) {
      dc.innerHTML = "<h2>Technik Dashboard</h2><p>Fotky, nahrávanie a pod.</p>";
    }
  }
  function loadAdminDashboard() {
    const dc = document.getElementById("dashboard-content");
    if (dc) {
      dc.innerHTML = "<h2>Admin Dashboard</h2><p>Správa systému, nemocnice, atď.</p>";
    }
  }

  // Spustíme
  loadDashboard();
});
