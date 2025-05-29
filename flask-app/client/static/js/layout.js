// TODO: vycitat zakladne info o uzivatelovi user_type, full_name a nahradit permanentne posielanie a vycitavanie user

document.addEventListener("DOMContentLoaded", () => {
  // ===========================
  // 1) Responzívny sidebar (expanded / collapsed / hidden)
  // ===========================
  const sidebar = document.getElementById("sidebar");
  const main = document.getElementById("main");
  const hamburger = document.getElementById("hamburger");
  const sidebarMenu = document.getElementById("sidebar-menu");
  const dashboardCards = document.getElementById("dashboard-cards");

  function getBreakpoint() {
    const w = window.innerWidth;
    if (w >= 1000) return "large";
    if (w >= 600) return "medium";
    return "small";
  }

  function setDefaultState() {
    sidebar.classList.remove("expanded", "collapsed", "hidden");
    const bp = getBreakpoint();
    if (bp === "large") {
      sidebar.classList.add("expanded");  // ~240px
      main.style.marginLeft = "240px";
    } else if (bp === "medium") {
      sidebar.classList.add("collapsed"); // ~50px
      main.style.marginLeft = "50px";
    } else {
      sidebar.classList.add("hidden");    // 0px
      main.style.marginLeft = "0";
    }
  }

  window.addEventListener("load", () => {
    setTimeout(() => {
      lastResizeWidth = window.innerWidth; // nastavíme na začiatku
      setDefaultState();
    }, 50);
  });

  // Zabránime prehnaným resize udalostiam (napr. pri scrollovaní na mobile)
  let lastResizeWidth = window.innerWidth;

  window.addEventListener("resize", () => {
    const currentWidth = window.innerWidth;
    if (Math.abs(currentWidth - lastResizeWidth) > 80) { // Reaguj len na väčšie zmeny (napr. orientácia)
      lastResizeWidth = currentWidth;
      setDefaultState();
    }
  });

  function toggleSidebar() {
    const bp = getBreakpoint();
    if (bp === "large") {
      if (sidebar.classList.contains("expanded")) {
        sidebar.classList.remove("expanded");
        sidebar.classList.add("collapsed");
        main.style.marginLeft = "50px";
      } else {
        sidebar.classList.remove("collapsed");
        sidebar.classList.add("expanded");
        main.style.marginLeft = "240px";
      }
    }
    else if (bp === "medium") {
      if (sidebar.classList.contains("collapsed")) {
        sidebar.classList.remove("collapsed");
        sidebar.classList.add("expanded");
        main.style.marginLeft = "240px";
      } else {
        sidebar.classList.remove("expanded");
        sidebar.classList.add("collapsed");
        main.style.marginLeft = "50px";
      }
    }
    else {
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

  if (hamburger) {
    hamburger.addEventListener("click", toggleSidebar);
  }

  // ===========================
  // 2) Dynamické menu + highlight
  // ===========================

  const menuConfig = {
    patient: [
      { icon: "fa fa-home",    label: "Domov",      link: "/dashboard" },
      { icon: "fa fa-flask",   label: "Výsledky",   link: "/photos/list"  },
      { icon: "fa fa-user-md", label: "Doktor",     link: "/lekari" },
      { icon: "fa fa-envelope",label: "Správy",     link: "/spravy" },
      { icon: "fa fa-cog",     label: "Nastavenie", link: "/settings" },
      { icon: "fa fa-sign-out",label: "Odhlásiť",   link: "/logout", isLogout: true },
    ],
    technician: [
      { icon: "fa fa-home",    label: "Domov",        link: "/dashboard" },
      { icon: "fa fa-images",  label: "Fotky",        link: "/photos/list"},
      { icon: "fa fa-upload",  label: "Pridať fotku", link: "/photos/add_photo" },
      { icon: "fa fa-user-plus", label: "Vytvoriť pacienta", link: "/patients" },
      { icon: "fa fa-envelope", label: "Správy",      link: "/spravy" },
      { icon: "fa fa-cog",      label: "Nastavenie",  link: "/settings" },
      { icon: "fa fa-sign-out", label: "Odhlásiť",    link: "/logout", isLogout: true },
    ],
    doctor: [
      { icon: "fa fa-home",    label: "Domov",         link: "/dashboard" },
      { icon: "fa fa-user-gear", label: "Technici",    link: "/technicians" },
      { icon: "fa fa-users",   label: "Pacienti",      link: "/patients" },
      { icon: "fa fa-upload",  label: "Pridať fotku", link: "/photos/add_photo" },
      { icon: "fa fa-images",  label: "Fotky",      link: "/photos/list" },
      { icon: "fa fa-list",    label: "Spracované fotky",     link: "/photos/processed_images" },
      { icon: "fa fa-envelope", label: "Správy",       link: "/spravy" },
      { icon: "fa fa-cog",     label: "Nastavenie",    link: "/settings" },
      { icon: "fa fa-sign-out",label: "Odhlásiť",      link: "/logout", isLogout: true },
    ],
    admin: [
      { icon: "fa fa-home",    label: "Domov",      link: "/dashboard" },
      { icon: "fa fa-user-md", label: "Doktori",    link: "/doctors" },
      { icon: "fa fa-user-gear", label: "Technici", link: "/technicians" },
      { icon: "fa fa-users",   label: "Pacienti",   link: "/patients" },
      { icon: "fa fa-images",  label: "Fotky",      link: "/photos/list" },
      { icon: "fa fa-upload",  label: "Pridať fotku", link: "/photos/add_photo" },
      { icon: "fa fa-list",    label: "Spracované fotky",     link: "/photos/processed_images" },
      { icon: "fa fa-envelope",label: "Správy",     link: "/spravy" },
      { icon: "fa fa-cog",     label: "Nastavenie", link: "/settings" },
      { icon: "fa fa-sign-out",label: "Odhlásiť",   link: "/logout", isLogout: true },
    ],
    super_admin: [
      { icon: "fa fa-home",    label: "Domov",      link: "/dashboard" },
      { icon: "fa fa-hospital",label: "Nemocnice",  link: "/hospitals" },
      { icon: "fa fa-user-shield", label: "Admini",    link: "/admins" },
      { icon: "fa fa-user-md", label: "Doktori",    link: "/doctors" },
      { icon: "fa fa-user-gear", label: "Technici", link: "/technicians" },
      { icon: "fa fa-users",   label: "Pacienti",   link: "/patients" },
      { icon: "fa fa-upload",  label: "Pridať fotku", link: "/photos/add_photo" },
      { icon: "fa fa-images",  label: "Fotky",      link: "/photos/list" },
      { icon: "fa fa-list",    label: "Spracované fotky",     link: "/photos/processed_images" },
      { icon: "fa fa-microscope", label: "Metódy", link: "/methods" },
      { icon: "fa fa-envelope",label: "Správy",     link: "/messages" },
      { icon: "fa fa-cog",     label: "Nastavenie", link: "/settings" },
      { icon: "fa fa-sign-out",label: "Odhlásiť",   link: "/logout", isLogout: true },
    ],
  };

  function updateSidebarMenu(userType) {
    if (!sidebarMenu) return;

    sidebarMenu.innerHTML = "";

    const items = menuConfig[userType] || [];

    items.forEach(item => {
      const li = document.createElement("li");
      li.innerHTML = `
        <a href="${item.link}" title="${item.label}" aria-label="${item.label}">
          <i class="${item.icon}"></i>
          <span class="sidebar-text">${item.label}</span>
        </a>
      `;
      sidebarMenu.appendChild(li);
    });

    highlightActiveLink();
  }


  // Porovnáva pathname bez trailing slash
  function highlightActiveLink() {
    let currentPath = window.location.pathname.replace(/\/+$/, '');
    if (currentPath === '') currentPath = '/';

    const menuLinks = document.querySelectorAll("#sidebar-menu li a");
    menuLinks.forEach(a => {
      a.parentElement.classList.remove("active");

      let linkPath = a.getAttribute("href").replace(/\/+$/, '');
      if (linkPath === '') linkPath = '/';

      if (linkPath === currentPath) {
        a.parentElement.classList.add("active");
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

  // Po načítaní user-a: generujeme menu
  async function loadSideMenu() {
    try {
      const response = await fetchWithAuth('/settings/info');
      if (!response.ok) {
        throw new Error('Nepodarilo sa načítať údaje používateľa (token?).');
      }
      const user = await response.json();

      // Meno do sidebara
      const nameEl = document.getElementById("username-span");
      if (nameEl && user.first_name && user.last_name) {
        nameEl.textContent = `${user.first_name} ${user.last_name}`;
      }

      updateSidebarMenu(user.user_type);

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

  window.addEventListener("load", async () => {
    await loadSideMenu();               // načítaj meno + menu
    setDefaultState();                  // nastav sidebar
    document.querySelectorAll('.hidden-js').forEach(el => el.classList.remove('hidden-js')); // zobraz až potom
  });

  // Ak máš <li id="logout-btn">, event:
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      window.location.href = "/logout";
    });
  }
});
