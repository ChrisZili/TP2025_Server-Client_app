document.addEventListener("DOMContentLoaded", () => {
  // ------------------------------
  // 1. Logika responzívneho sidebaru
  // ------------------------------

  const sidebar = document.getElementById("sidebar");
  const main = document.getElementById("main"); // Obsah (top-bar + .content) presúvame
  const hamburger = document.getElementById("hamburger");

  function getBreakpoint() {
    const w = window.innerWidth;
    if (w >= 900) return "large";
    if (w >= 600) return "medium";
    return "small";
  }

  // Nastaví default stav sidebaru a .main margin-left podľa breakpointu
  function setDefaultState() {
    sidebar.classList.remove("expanded", "collapsed", "hidden");
    let bp = getBreakpoint();

    if (bp === "large") {
      sidebar.classList.add("expanded");  // 240px
      main.style.marginLeft = "240px";
    } else if (bp === "medium") {
      sidebar.classList.add("collapsed"); // 50px
      main.style.marginLeft = "50px";
    } else {
      sidebar.classList.add("hidden");    // 0px
      main.style.marginLeft = "0";
    }
  }

  // Kliknutie na hamburger => toggle stavy
  // large => expanded <-> collapsed
  // medium => collapsed <-> expanded
  // small => hidden <-> expanded
  function toggleSidebar() {
    let bp = getBreakpoint();

    if (bp === "large") {
      if (sidebar.classList.contains("expanded")) {
        // expanded -> collapsed
        sidebar.classList.remove("expanded");
        sidebar.classList.add("collapsed");
        main.style.marginLeft = "50px";
      } else {
        // collapsed -> expanded
        sidebar.classList.remove("collapsed");
        sidebar.classList.add("expanded");
        main.style.marginLeft = "240px";
      }
    }
    else if (bp === "medium") {
      if (sidebar.classList.contains("collapsed")) {
        // collapsed -> expanded
        sidebar.classList.remove("collapsed");
        sidebar.classList.add("expanded");
        main.style.marginLeft = "240px";
      } else {
        // expanded -> collapsed
        sidebar.classList.remove("expanded");
        sidebar.classList.add("collapsed");
        main.style.marginLeft = "50px";
      }
    }
    else {
      // small => hidden <-> expanded
      if (sidebar.classList.contains("hidden")) {
        sidebar.classList.remove("hidden");
        sidebar.classList.add("expanded");
        main.style.marginLeft = "240px";
      } else {
        sidebar.classList.remove("expanded");
        sidebar.classList.add("hidden");
        main.style.marginLeft = "0";
      }
    }
  }

  // Nastavíme default pri načítaní aj pri zmene veľkosti
  window.addEventListener("resize", setDefaultState);
  setDefaultState();

  // Event na hamburger
  hamburger.addEventListener("click", toggleSidebar);


  // ------------------------------
  // 2. Logika dashboardu (fetch, load, roly)
  // ------------------------------

  // Elementy, kam niečo vkladáme (ak existujú)
  const usernameSpan = document.getElementById("username-span"); // v sidebare
  const logoutBtn = document.getElementById("logout-btn");       // pre odhlásenie
  const dashboardContent = document.getElementById("dashboard-content"); // kam vkladáme info

  // fetch s cookies
  function fetchWithAuth(url, options = {}) {
    return fetch(url, {
      ...options,
      credentials: 'include', // posiela cookies
      headers: {
        ...(options.headers || {}),
        'Accept': 'application/json'
      }
    });
  }

  async function loadDashboard() {
    try {
      const response = await fetchWithAuth('/account/info');
      if (!response.ok) {
        throw new Error('Nepodarilo sa načítať údaje používateľa (token?).');
      }

      const user = await response.json();

      // Vložíme meno do sidebara (ak existuje usernameSpan a user má first_name, last_name)
      if (usernameSpan && user.first_name && user.last_name) {
        usernameSpan.textContent = `${user.first_name} ${user.last_name}`;
      }

      // Rozhodneme, akú rolu má user
      // Napr. user.role = "doctor" / "patient" / "technician"
      if (user.role === "doctor") {
        loadDoctorDashboard(user);
      } else if (user.role === "patient") {
        loadPatientDashboard(user);
      } else if (user.role === "technician") {
        loadTechnicianDashboard(user);
      } else {
        // Neznáma rola, zobraz niečo neutrálne
        if (dashboardContent) {
          dashboardContent.innerHTML = "<p>Vitajte v systéme!</p>";
        }
      }
    } catch (error) {
      console.error('Chyba pri načítaní dashboardu:', error);
      if (dashboardContent) {
        dashboardContent.innerHTML = `
          <p>Chyba pri načítaní obsahu: ${error.message}</p>
          <p><a href="/login">Prihláste sa znova</a></p>
        `;
      }
    }
  }

  async function loadDoctorDashboard(user) {
    try {
      const response = await fetchWithAuth('/doctor/patients');
      if (!response.ok) {
        throw new Error('Nepodarilo sa načítať zoznam pacientov');
      }
      const patients = await response.json();
      let html = `<h2>Vaši pacienti</h2>`;
      if (patients.length === 0) {
        html += '<p>Nemáte priradených žiadnych pacientov.</p>';
      } else {
        html += '<ul>';
        patients.forEach(patient => {
          html += `<li data-id="${patient.id}">${patient.name}</li>`;
        });
        html += '</ul>';
      }
      html += `
        <div class="doctor-actions">
          <h3>Možnosti</h3>
          <button id="change-hospital-btn">Zmeniť nemocnicu</button>
        </div>
      `;
      if (dashboardContent) {
        dashboardContent.innerHTML = html;
      }

      const changeHospitalBtn = document.getElementById("change-hospital-btn");
      if (changeHospitalBtn) {
        changeHospitalBtn.addEventListener("click", showChangeHospitalForm);
      }

    } catch (error) {
      console.error("Chyba pri načítaní pacientov:", error);
      if (dashboardContent) {
        dashboardContent.innerHTML = "<p>Chyba pri načítaní pacientov.</p>";
      }
    }
  }

  async function loadPatientDashboard(user) {
    if (dashboardContent) {
      dashboardContent.innerHTML = `
        <h2>Zdravotná dokumentácia</h2>
        <p>Vaše zdravotné údaje budú zobrazené tu.</p>
      `;
    }
  }

  async function loadTechnicianDashboard(user) {
    if (dashboardContent) {
      dashboardContent.innerHTML = `
        <h2>Technické údaje</h2>
        <p>Dashboard technika bude čoskoro dostupný.</p>
      `;
    }
  }

  function showChangeHospitalForm() {
    alert("Formulár na zmenu nemocnice ešte nie je implementovaný.");
  }

  // Odhlásenie
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      window.location.href = "/logout";
    });
  }

  // Spustíme načítanie dashboardu (napr. s krátkym oneskorením)
  setTimeout(loadDashboard, 100);
});
