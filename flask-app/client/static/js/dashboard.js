// TODO: vycitat zakladne info o uzivatelovi user_type, full_name a nahradit permanentne posielanie a vycitavanie user

document.addEventListener("DOMContentLoaded", () => {
  // ===========================
  // 1) Responzívny sidebar (expanded / collapsed / hidden)
  // ===========================
  const dashboardCards = document.getElementById("dashboard-cards"); // <ul id="sidebar-menu">
  const menuConfig = {
    patient: [
      { icon: "fa fa-home",    label: "Domov",      link: "/dashboard"},
      { icon: "fa fa-envelope", label: "Správy", link: "/messages", countTemplate: "${data.message_count} Všetkých správ" },
      { icon: "fa fa-cog",     label: "Nastavenie", link: "/settings"},
      { icon: "fa fa-sign-out",label: "Odhlásiť",   link: "/logout", isLogout: true },
    ],
    technician: [
      { icon: "fa fa-home",    label: "Domov",        link: "/dashboard" },
      { icon: "fa fa-images", label: "Fotky", link: "/photos/list", countTemplate: "${data.original_image_count} Všetkých fotiek" },
      { icon: "fa fa-envelope", label: "Správy", link: "/messages", countTemplate: "${data.message_count} Všetkých správ" },
      { icon: "fa fa-cog",      label: "Nastavenie",  link: "/settings" },
      { icon: "fa fa-sign-out", label: "Odhlásiť",    link: "/logout", isLogout: true },
    ],
    doctor: [
      { icon: "fa fa-home",    label: "Domov",         link: "/dashboard" },
      { icon: "fa fa-user-gear", label: "Technici", link: "/technicians", countTemplate: "${data.technician_count} Všetkých technikov" },
      { icon: "fa fa-users", label: "Pacienti", link: "/patients", countTemplate: "${data.patient_count} Všetkých pacientov" },
      { icon: "fa fa-images", label: "Fotky", link: "/photos/list", countTemplate: "${data.original_image_count} Všetkých fotiek" },
      { icon: "fa fa-list",    label: "Spracované fotky", link: "/photos/processed_images" , countTemplate: "${data.processed_image_count} Všetkých záznamov" },
      { icon: "fa fa-envelope", label: "Správy", link: "/messages", countTemplate: "${data.message_count} Všetkých správ" },
      { icon: "fa fa-cog",     label: "Nastavenie",    link: "/settings" },
      { icon: "fa fa-sign-out",label: "Odhlásiť",      link: "/logout", isLogout: true },
    ],
    admin: [
      { icon: "fa fa-home",    label: "Domov",      link: "/dashboard" },
      { icon: "fa fa-user-md", label: "Doktori", link: "/doctors", countTemplate: "${data.doctor_count} Všetkých doktorov" },
      { icon: "fa fa-user-gear", label: "Technici", link: "/technicians", countTemplate: "${data.technician_count} Všetkých technikov" },
      { icon: "fa fa-users", label: "Pacienti", link: "/patients", countTemplate: "${data.patient_count} Všetkých pacientov" },
      { icon: "fa fa-images", label: "Fotky", link: "/photos/list", countTemplate: "${data.original_image_count} Všetkých fotiek" },
      { icon: "fa fa-list",    label: "Spracované fotky", link: "/photos/processed_images" , countTemplate: "${data.processed_image_count} Všetkých záznamov" },
      { icon: "fa fa-envelope", label: "Správy", link: "/messages", countTemplate: "${data.message_count} Všetkých správ" },
      { icon: "fa fa-cog",     label: "Nastavenie", link: "/settings" },
      { icon: "fa fa-sign-out",label: "Odhlásiť",   link: "/logout", isLogout: true },
    ],
    super_admin: [
      { icon: "fa fa-home",    label: "Domov",      link: "/dashboard"},
      { icon: "fa fa-hospital", label: "Nemocnice", link: "/hospitals", countTemplate: "${data.hospital_count} Všetkých nemocníc" },
      { icon: "fa fa-user-shield", label: "Admini", link: "/admins", countTemplate: "${data.admin_count} Všetkých adminov" },
      { icon: "fa fa-user-md", label: "Doktori", link: "/doctors", countTemplate: "${data.doctor_count} Všetkých doktorov" },
      { icon: "fa fa-user-gear", label: "Technici", link: "/technicians", countTemplate: "${data.technician_count} Všetkých technikov" },
      { icon: "fa fa-users", label: "Pacienti", link: "/patients", countTemplate: "${data.patient_count} Všetkých pacientov" },
      { icon: "fa fa-images", label: "Fotky", link: "/photos/list", countTemplate: "${data.original_image_count} Všetkých fotiek" },
      { icon: "fa fa-list",    label: "Spracované fotky", link: "/photos/processed_images" , countTemplate: "${data.processed_image_count} Všetkých záznamov" },
      { icon: "fa fa-envelope", label: "Správy", link: "/messages", countTemplate: "${data.message_count} Všetkých správ" },
      { icon: "fa fa-cog",     label: "Nastavenie", link: "/settings" },
      { icon: "fa fa-sign-out",label: "Odhlásiť",   link: "/logout", isLogout: true },
    ],
  };

  function updateCards(data) {
    if (!dashboardCards) return;
    const userType = data.user_type;
    const items = menuConfig[userType].filter(item =>
      !item.isLogout && !["Domov", "Profil", "Nastavenie"].includes(item.label)
    );

    const labelToColorClass = {
      "Nemocnice": "hospitalSky",
      "Admini": "adminSteel",
      "Doktor": "doctorOcean",
      "Doktori": "doctorOcean",
      "Technici": "techNavy",
      "Pacienti": "patientSoft",
      "Fotky": "photoSky",
      "Výsledky": "photoSky",
      "Zoznam": "listBlue",
      "Spracované fotky": "resultsIce",
      "Správy": "messageCool",
      "Pridať fotku": "addPhoto",
      "Vytvoriť pacienta": "newPatient",
    };
    /*const labelToColorClass = {
      "Nemocnice": "hospitalSky",
      "Admini": "adminShield",
      "Doktori": "doctorOcean",
      "Pacienti": "patientCare",
      "Technici": "techGear",
      "Fotky": "photoFlow",
      "Zoznam": "listView",
      "Výsledky": "resultsGlow",
      "Správy": "messagePulse",
    };*/



    dashboardCards.innerHTML = "";

    const container = document.createElement("div");
    container.classList.add("cards");

    items.forEach((item) => {
      const colorClass = labelToColorClass[item.label] || "defaultCard";
      const countText = item.countTemplate
      ? item.countTemplate.replace(/\${data\.(\w+)}/g, (_, key) => data[key] || 0)
      : "0";
      const card = document.createElement("div");
      card.classList.add("card", colorClass);
      card.dataset.link = item.link;

      // HLAVIČKA – farebný pás s názvom a ikonou
      const header = document.createElement("div");
      header.classList.add("card-header");
      header.innerHTML = `
        <span><i class="${item.icon}"></i> ${item.label}</span>
        <i class="fa fa-arrow-right"></i>
      `;

      // TELO – biela časť s popisom
      const body = document.createElement("div");
      body.classList.add("card-body");
      body.innerHTML = `
        <span>Popis pre položku <strong>${item.label}</strong></span>
        <span class="highlight">${countText}</span>
      `;

      card.appendChild(header);
      card.appendChild(body);
      container.appendChild(card);
    });

    dashboardCards.appendChild(container);

    // Kliknutie presmeruje na danú URL
    container.addEventListener("click", (e) => {
      const card = e.target.closest(".card");
      if (card && card.dataset.link) {
        window.location.href = card.dataset.link;
      }
    });
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
      const response = await fetchWithAuth('/dashboard/info');
      if (!response.ok) {
        throw new Error('Nepodarilo sa načítať údaje používateľa (token?).');
      }
      const data = await response.json();

      updateCards(data);
      // Zobrazíme príslušný obsah (doctor, patient, atď.)
      if (data.user_type === "doctor") {
        loadDoctorDashboard();
      } else if (data.user_type === "patient") {
        loadPatientDashboard();
      } else if (data.user_type === "technician") {
        loadTechnicianDashboard();
      } else if (data.user_type === "admin") {
        loadAdminDashboard();
      } else if (data.user_type === "super_admin") {
        loadSuperAdminDashboard();
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
  function loadSuperAdminDashboard() {
    const dc = document.getElementById("dashboard-content");
    if (dc) {
      dc.innerHTML = "<h2>Super Admin Dashboard</h2><p>Správa systému, atď.</p>";
    }
  }

  // Spustíme
  loadDashboard();
});