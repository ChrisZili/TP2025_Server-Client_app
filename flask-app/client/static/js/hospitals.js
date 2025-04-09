document.addEventListener("DOMContentLoaded", () => {
  // ---------------------------
  // Taby a prepínanie obsahu
  // ---------------------------
  const tabAll = document.getElementById("tab-all");
  const tabSearch = document.getElementById("tab-search");
  const tabAdd = document.getElementById("tab-add");

  const tabAllContent = document.getElementById("tab-all-content");
  const tabSearchContent = document.getElementById("tab-search-content");
  const tabAddContent = document.getElementById("tab-add-content");

  // Globálna premenná pre zoznam nemocníc
  let allHospitalsData = [];

  function showTab(tab) {
    tabAll.classList.remove("active");
    tabSearch.classList.remove("active");
    tabAdd.classList.remove("active");

    tabAllContent.classList.add("hidden");
    tabSearchContent.classList.add("hidden");
    tabAddContent.classList.add("hidden");

    if (tab === "all") {
      tabAll.classList.add("active");
      tabAllContent.classList.remove("hidden");
    } else if (tab === "search") {
      tabSearch.classList.add("active");
      tabSearchContent.classList.remove("hidden");
    } else if (tab === "add") {
      tabAdd.classList.add("active");
      tabAddContent.classList.remove("hidden");
    }
  }

  tabAll.addEventListener("click", () => showTab("all"));
  tabSearch.addEventListener("click", () => showTab("search"));
  tabAdd.addEventListener("click", () => showTab("add"));

  // Zobrazíme defaultne záložku "all"
  showTab("all");

  // ---------------------------
  // 1) Načítanie zoznamu nemocníc (All)
  // ---------------------------
  const allHospitalsList = document.getElementById("all-hospitals-list");

  async function loadAllHospitals() {
    try {
      const response = await fetch("/hospitals/list", {
        method: "GET",
        headers: { "Accept": "application/json" },
        credentials: "include"
      });
      if (!response.ok) throw new Error("Chyba pri načítaní nemocníc.");
      const hospitals = await response.json();
      allHospitalsData = hospitals; // Uložíme zoznam do globálnej premennej
      renderHospitals(hospitals);
    } catch (err) {
      console.error(err);
      allHospitalsList.innerHTML = `<p>Chyba pri načítaní nemocníc: ${err.message}</p>`;
    }
  }

  function renderHospitals(hospitals) {
    if (!Array.isArray(hospitals) || hospitals.length === 0) {
      allHospitalsList.innerHTML = "<p>Žiadne nemocnice nenájdené.</p>";
      return;
    }
    let html = `<div class="cards">`;
    hospitals.forEach(h => {
      html += `
        <div class="card" onclick="location.href='/hospitals/${h.id}'">
          <h3>${h.name}</h3>
          <p>${h.street}</p>
          <p>${h.city}</p>
          <p>${h.postal_code}</p>
        </div>
      `;
    });
    html += `</div>`;
    allHospitalsList.innerHTML = html;
  }

  loadAllHospitals();

  // ---------------------------
  // 2) Vyhľadávanie nemocníc (Search) – automatické vyhľadávanie po každom znaku
  // ---------------------------
  const searchInput = document.getElementById("search-input");
  const searchResults = document.getElementById("search-results");

  function debounce(func, delay) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), delay);
    };
  }

  async function performSearch() {
    const query = searchInput.value.trim().toLowerCase();
    if (!query) {
      searchResults.innerHTML = "";
      return;
    }
    // Filtrovanie z načítaného zoznamu nemocníc
    const filtered = allHospitalsData.filter(h => {
      return (
        (h.name && h.name.toLowerCase().includes(query)) ||
        (h.city && h.city.toLowerCase().includes(query)) ||
        (h.postal_code && h.postal_code.toLowerCase().includes(query))
      );
    });
    if (filtered.length === 0) {
      searchResults.innerHTML = `<p>Pre "${query}" neboli nájdené žiadne výsledky.</p>`;
    } else {
      let html = `<div class="cards">`;
      filtered.forEach(h => {
        html += `
          <div class="card" onclick="location.href='/hospitals/${h.id}'">
            <h3>${h.name}</h3>
            <p>${h.street}</p>
            <p>${h.city}</p>
            <p>${h.postal_code}</p>
          </div>
        `;
      });
      html += `</div>`;
      searchResults.innerHTML = html;
    }
  }

  const debouncedSearch = debounce(performSearch, 300);
  if (searchInput) {
    searchInput.addEventListener("keyup", debouncedSearch);
  }

  // ---------------------------
  // 3) Pridanie nemocnice (Add)
  // ---------------------------
  const addBtn = document.getElementById("add-hospital-btn");
  const addMessage = document.getElementById("add-hospital-message"); // Element na vypísanie error/success hlásení
  if (addBtn) {
    addBtn.addEventListener("click", async () => {
      // Vymažeme predchádzajúce hlásenie
      addMessage.textContent = "";
      addMessage.classList.remove("error", "success");

      const name = document.getElementById("hospital-name").value.trim();
      const country = document.getElementById("hospital-country").value.trim();
      const city = document.getElementById("hospital-city").value.trim();
      const street = document.getElementById("hospital-street").value.trim();
      const postal = document.getElementById("hospital-postal").value.trim();

      if (!name || !country || !city || !street || !postal) {
        addMessage.textContent = "Vyplňte všetky polia.";
        addMessage.classList.add("error");
        return;
      }

      // Kontrola, že PSČ obsahuje iba čísla
      if (!/^\d+$/.test(postal)) {
        addMessage.textContent = "PSČ musí obsahovať iba čísla.";
        addMessage.classList.add("error");
        return;
      }

      try {
        let resp = await fetch("/hospitals/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, country, city, street, postal_code: postal }),
          credentials: "include"
        });
        let data = await resp.json();
        if (!resp.ok) throw new Error(data.error || "Chyba pri vytváraní nemocnice");
        addMessage.textContent = data.message || "Nemocnica pridaná.";
        addMessage.classList.add("success");
        showTab("all");
        loadAllHospitals();
      } catch (err) {
        console.error(err);
        addMessage.textContent = err.message || "Nepodarilo sa pridať nemocnicu.";
        addMessage.classList.add("error");
      }
    });
  }
});
