document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById("sidebar");
  const main = document.getElementById("main");
  const hamburger = document.getElementById("hamburger");

  // Zistí aktuálny breakpoint
  function getBreakpoint() {
    const w = window.innerWidth;
    if (w >= 900) return "large";
    if (w >= 600) return "medium";
    return "small";
  }

  // Nastaví default stav sidebaru (expanded, collapsed, hidden) podľa šírky
  // a nastaví aj margin-left pre .main.
  function setDefaultState() {
    sidebar.classList.remove("expanded", "collapsed", "hidden");
    let bp = getBreakpoint();
    if (bp === "large") {
      // expanded
      sidebar.classList.add("expanded");
      main.style.marginLeft = "240px";
    } else if (bp === "medium") {
      // collapsed
      sidebar.classList.add("collapsed");
      main.style.marginLeft = "50px";
    } else {
      // small => hidden
      sidebar.classList.add("hidden");
      main.style.marginLeft = "0";
    }
  }

  // Prepína stavy pri kliku na hamburger
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
        // hidden -> expanded
        sidebar.classList.remove("hidden");
        sidebar.classList.add("expanded");
        main.style.marginLeft = "240px";
      } else {
        // expanded -> hidden
        sidebar.classList.remove("expanded");
        sidebar.classList.add("hidden");
        main.style.marginLeft = "0";
      }
    }
  }

  // Pri načítaní a pri zmene veľkosti nastavíme predvolený stav
  window.addEventListener("resize", setDefaultState);
  setDefaultState();

  // Klik na hamburger => toggle
  hamburger.addEventListener("click", toggleSidebar);
});
