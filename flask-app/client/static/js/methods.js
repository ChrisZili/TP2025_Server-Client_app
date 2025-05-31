document.addEventListener("DOMContentLoaded", () => {
  // -- All variables --
  let allMethodsData = [];

  // For "All" tab
  let allCurrentSortColumn = "name";
  let allCurrentSortDirection = "asc";

  // DOM elements for view toggles
  const viewCardsBtnAll = document.getElementById("view-cards");
  const viewListBtnAll = document.getElementById("view-list");
  const allCardsContainer = document.getElementById("all-cards-container");
  const allListContainer = document.getElementById("all-list-container");
  const sortOptionsAll = document.getElementById("sort-options-all");
  const allMethodsList = document.getElementById("all-methods-list");
  const sortSelect = document.getElementById("sort-select");
  const allListBody = document.getElementById("all-list-body");
  const searchInput = document.getElementById("search-input");

  // Tab elements
  const tabAll = document.getElementById("tab-all");
  const tabAdd = document.getElementById("tab-add");
  const tabAllContent = document.getElementById("tab-all-content");
  const tabAddContent = document.getElementById("tab-add-content");

  // Form elements - "Add Method"
  const addMethodMessage = document.getElementById("add-method-message");
  const addMethodForm = document.getElementById("add-method-form");
  const nameInput = document.getElementById("method-name");
  const descriptionInput = document.getElementById("method-description");
  const parametersInput = document.getElementById("method-parameters");
  const addBtn = document.getElementById("add-method-btn");

  // Error div elements
  const nameErrorDiv = document.getElementById("method-name-error");
  const descriptionErrorDiv = document.getElementById("method-description-error");
  const parametersErrorDiv = document.getElementById("method-parameters-error");

  // Edit modal elements
  const editModal = document.getElementById("edit-modal");
  const editMethodIdInput = document.getElementById("edit-method-id");
  const editNameInput = document.getElementById("edit-method-name");
  const editDescriptionInput = document.getElementById("edit-method-description");
  const editParametersInput = document.getElementById("edit-method-parameters");
  const updateBtn = document.getElementById("update-method-btn");
  const editMethodMessage = document.getElementById("edit-method-message");

  // Delete modal elements
  const deleteModal = document.getElementById("delete-modal");
  const deleteMethodIdInput = document.getElementById("delete-method-id");
  const confirmDeleteBtn = document.getElementById("confirm-delete-btn");
  const cancelDeleteBtn = document.getElementById("cancel-delete-btn");
  const deleteMethodMessage = document.getElementById("delete-method-message");

  // Close modal buttons
  const closeModals = document.querySelectorAll(".close-modal");

  // -- Functions --

  // Function to show a specific tab
  function showTab(tabId) {
    // Hide all tab contents
    tabAllContent.classList.add("hidden");
    tabAddContent.classList.add("hidden");

    // Remove active class from all tabs
    tabAll.classList.remove("active");
    tabAdd.classList.remove("active");

    // Show the selected tab content and set active class
    if (tabId === "all") {
      tabAllContent.classList.remove("hidden");
      tabAll.classList.add("active");
    } else if (tabId === "add") {
      tabAddContent.classList.remove("hidden");
      tabAdd.classList.add("active");
    }
  }

  // Function to fetch methods from the server
  async function loadAllMethods() {
    try {
      const response = await fetch("/methods/list", {
        method: "GET",
        headers: { "Accept": "application/json" },
        credentials: "include"
      });

      if (!response.ok) throw new Error("Failed to load methods");
      const data = await response.json();
      allMethodsData = data;
      performSearch();
    } catch (err) {
      allMethodsData = [];
      performSearch();
    }
  }

  // Helper function to validate JSON string
  function isValidJSON(str) {
    if (!str.trim()) return true; // Empty is valid
    try {
      JSON.parse(str);
      return true;
    } catch (e) {
      return false;
    }
  }

  // Function to validate add method form
  function validateAddForm() {
    let isValid = true;
    if (!nameInput.value.trim()) {
      nameErrorDiv.textContent = "Názov je povinný";
      isValid = false;
    } else {
      nameErrorDiv.textContent = "";
    }
    if (parametersInput.value.trim() && !isValidJSON(parametersInput.value)) {
      parametersErrorDiv.textContent = "Parametre musia byť vo formáte JSON";
      isValid = false;
    } else {
      parametersErrorDiv.textContent = "";
    }
    return isValid;
  }

  // Function to validate edit method form
  function validateEditForm() {
    let isValid = true;
    if (!editNameInput.value.trim()) {
      document.getElementById("edit-method-name-error").textContent = "Názov je povinný";
      isValid = false;
    } else {
      document.getElementById("edit-method-name-error").textContent = "";
    }
    if (editParametersInput.value.trim() && !isValidJSON(editParametersInput.value)) {
      document.getElementById("edit-method-parameters-error").textContent = "Parametre musia byť vo formáte JSON";
      isValid = false;
    } else {
      document.getElementById("edit-method-parameters-error").textContent = "";
    }
    return isValid;
  }

  // Function to reset add method form
  function resetAddForm() {
    nameInput.value = "";
    descriptionInput.value = "";
    parametersInput.value = "";
    nameErrorDiv.textContent = "";
    descriptionErrorDiv.textContent = "";
    parametersErrorDiv.textContent = "";
  }

  // Function to set view mode (cards or list)
  function setViewMode(mode) {
    localStorage.setItem("methodViewMode", mode);
    if (mode === "cards") {
      viewCardsBtnAll.classList.add("active");
      viewListBtnAll.classList.remove("active");
      allCardsContainer.classList.remove("hidden");
      allListContainer.classList.add("hidden");
      sortOptionsAll.classList.remove("hidden");
      renderMethods(allMethodsData, sortSelect.value);
    } else {
      viewListBtnAll.classList.add("active");
      viewCardsBtnAll.classList.remove("active");
      allCardsContainer.classList.add("hidden");
      allListContainer.classList.remove("hidden");
      sortOptionsAll.classList.add("hidden");
      renderAllListTable(allMethodsData);
    }
  }

  // Function to format date
  function formatDate(dateString) {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("sk-SK", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  }

  // Function to handle method sorting
  function sortMethods(methods, sortValue = "creation") {
    let sorted = [...methods];
    if (sortValue === "alphabetical-asc") {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortValue === "alphabetical-desc") {
      sorted.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortValue === "newest") {
      sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else { // "creation" - oldest first
      sorted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    }
    return sorted;
  }

  // Function to open the edit modal with method data
  function openEditModal(method) {
    editMethodIdInput.value = method.id;
    editNameInput.value = method.name;
    editDescriptionInput.value = method.description || "";
    if (method.parameters) {
      try {
        const formatted = JSON.stringify(method.parameters, null, 2);
        editParametersInput.value = formatted;
      } catch (e) {
        editParametersInput.value = JSON.stringify(method.parameters);
      }
    } else {
      editParametersInput.value = "";
    }
    editMethodMessage.textContent = "";
    editMethodMessage.classList.remove("error", "success");
    editModal.classList.remove("hidden");
  }

  // Function to open the delete confirmation modal
  function openDeleteModal(methodId) {
    deleteMethodIdInput.value = methodId;
    deleteMethodMessage.textContent = "";
    deleteMethodMessage.classList.remove("error", "success");
    deleteModal.classList.remove("hidden");
  }

  // Function to close all modals
  function closeAllModals() {
    editModal.classList.add("hidden");
    deleteModal.classList.add("hidden");
  }

  // Function to render methods in card view
  function renderMethods(methods, sortValue) {
    if (!allMethodsList) return;
    if (!Array.isArray(methods) || methods.length === 0) {
      allMethodsList.innerHTML = "<p class='empty-list-message'>Žiadne metódy nenájdené.</p>";
      return;
    }
    const sorted = sortMethods(methods, sortValue);
    allMethodsList.innerHTML = "";
    sorted.forEach(method => {
      const card = document.createElement("div");
      card.classList.add("card");
      const name = document.createElement("h3");
      name.textContent = method.name;
      const infoContainer = document.createElement("div");
      infoContainer.classList.add("card-info");
      const created = document.createElement("p");
      created.innerHTML = `<strong>Vytvorené:</strong> ${formatDate(method.created_at)}`;
      const description = document.createElement("p");
      description.innerHTML = `<strong>Popis:</strong> ${method.description || "-"}`;
      const parameters = document.createElement("p");
      let paramCount = 0;
      if (method.parameters) {
        try {
          paramCount = Object.keys(method.parameters).length;
        } catch (e) {
          paramCount = 0;
        }
      }
      parameters.innerHTML = `<strong>Parametre:</strong> ${paramCount > 0 ? (paramCount + " definovaných") : "Žiadne"}`;
      infoContainer.appendChild(created);
      infoContainer.appendChild(description);
      infoContainer.appendChild(parameters);
      const actions = document.createElement("div");
      actions.classList.add("card-actions");
      const editBtn = document.createElement("button");
      editBtn.classList.add("edit-btn");
      editBtn.innerHTML = '<i class="fas fa-edit"></i>';
      editBtn.title = "Upraviť";
      editBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        openEditModal(method);
      });
      actions.appendChild(editBtn);
      if (method.deletable !== false) {
        const deleteBtn = document.createElement("button");
        deleteBtn.classList.add("delete-btn");
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.title = "Odstrániť";
        deleteBtn.addEventListener("click", e => {
          e.stopPropagation();
          openDeleteModal(method.id);
        });
        actions.appendChild(deleteBtn);
      }
      card.appendChild(name);
      card.appendChild(infoContainer);
      card.appendChild(actions);
      allMethodsList.appendChild(card);
    });
  }

  // Function to render the list table view
  function renderAllListTable(methods) {
    if (!allListBody) return;
    allListBody.innerHTML = "";
    if (!Array.isArray(methods) || methods.length === 0) {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td colspan="4" style="text-align: center;">Žiadne metódy nenájdené</td>`;
      allListBody.appendChild(tr);
      return;
    }
    let data = [...methods];
    data.sort((a, b) => {
      let valA = a[allCurrentSortColumn] || "";
      let valB = b[allCurrentSortColumn] || "";
      if (allCurrentSortColumn === "created_at") {
        return allCurrentSortDirection === "asc"
          ? parseDate(valA) - parseDate(valB)
          : parseDate(valB) - parseDate(valA);
      } else {
        return allCurrentSortDirection === "asc"
          ? valA.localeCompare(valB, "sk")
          : valB.localeCompare(valA, "sk");
      }
    });
    data.forEach(method => {
      const tr = document.createElement("tr");
      const descriptionTd = document.createElement("td");
      const descSpan = document.createElement("span");
      descSpan.classList.add("description-truncate");
      descSpan.textContent = method.description || "-";
      descriptionTd.appendChild(descSpan);
      const actionsTd = document.createElement("td");
      const actionsDiv = document.createElement("div");
      actionsDiv.classList.add("table-actions");
      const editBtn = document.createElement("button");
      editBtn.classList.add("edit-btn");
      editBtn.innerHTML = '<i class="fas fa-edit"></i>';
      editBtn.title = "Upraviť";
      editBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        openEditModal(method);
      });
      actionsDiv.appendChild(editBtn);
      if (method.deletable !== false) {
        const deleteBtn = document.createElement("button");
        deleteBtn.classList.add("delete-btn");
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.title = "Odstrániť";
        deleteBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          openDeleteModal(method.id);
        });
        actionsDiv.appendChild(deleteBtn);
      }
      actionsTd.appendChild(actionsDiv);
      tr.innerHTML = `
        <td>${method.name}</td>
        <td>${formatDate(method.created_at) || "-"}</td>
      `;
      tr.appendChild(descriptionTd);
      tr.appendChild(actionsTd);
      allListBody.appendChild(tr);
    });
  }

  // Function to perform search
  function performSearch() {
    const query = searchInput?.value.trim().toLowerCase();
    const mode = localStorage.getItem("methodViewMode") || "cards";
    let filtered = allMethodsData;
    if (query) {
      filtered = allMethodsData.filter(m => {
        const name = m.name?.toLowerCase() || "";
        const description = m.description?.toLowerCase() || "";
        return name.includes(query) || description.includes(query);
      });
    }
    if (mode === "list") {
      renderAllListTable(filtered);
    } else {
      renderMethods(filtered, sortSelect.value);
    }
  }

  // Add debouncing for search
  function debounce(func, delay) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), delay);
    };
  }

  const debouncedSearch = debounce(performSearch, 300);
  searchInput?.addEventListener("keyup", debouncedSearch);
  sortSelect?.addEventListener("change", performSearch);
  viewCardsBtnAll.addEventListener("click", () => { setViewMode("cards"); performSearch(); });
  viewListBtnAll.addEventListener("click", () => { setViewMode("list"); performSearch(); });

  // -- Event Listeners --

  // Tab navigation
  tabAll.addEventListener("click", () => showTab("all"));
  tabAdd.addEventListener("click", () => showTab("add"));

  // View toggle (cards/list)
  viewCardsBtnAll.addEventListener("click", () => setViewMode("cards"));
  viewListBtnAll.addEventListener("click", () => setViewMode("list"));

  // Sort select for cards view
  sortSelect?.addEventListener("change", () => {
    renderMethods(allMethodsData, sortSelect.value);
  });

  // Table header sorting (ALL tab)
  const allHeaderCells = document.querySelectorAll("#all-list-container thead th.sortable");
  allHeaderCells?.forEach(th => {
    th.addEventListener("click", () => {
      const col = th.getAttribute("data-column");
      if (!col || col === "actions") return;
      if (allCurrentSortColumn === col) {
        allCurrentSortDirection = (allCurrentSortDirection === "asc") ? "desc" : "asc";
      } else {
        allCurrentSortColumn = col;
        allCurrentSortDirection = "asc";
      }
      allHeaderCells.forEach(cell => cell.classList.remove("sort-asc", "sort-desc"));
      th.classList.add(allCurrentSortDirection === "asc" ? "sort-asc" : "sort-desc");
      renderAllListTable(allMethodsData);
    });
  });

  // Add method form submission
  addBtn?.addEventListener("click", async () => {
    addMethodMessage.textContent = "";
    addMethodMessage.classList.remove("error", "success");
    const isFormOk = validateAddForm();
    if (!isFormOk) {
      addMethodMessage.textContent = "Prosím vyplňte všetky povinné polia správne.";
      addMethodMessage.classList.add("error");
      return;
    }
    let parametersObject = {};
    if (parametersInput.value.trim()) {
      try {
        parametersObject = JSON.parse(parametersInput.value);
      } catch (e) {
        parametersErrorDiv.textContent = "Parametre musia byť vo formáte JSON";
        return;
      }
    }
    const bodyPayload = {
      name: nameInput.value.trim(),
      description: descriptionInput.value.trim(),
      parameters: parametersObject
    };
    try {
      const resp = await fetch("/methods/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload),
        credentials: "include"
      });
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || "Chyba pri pridávaní metódy");
      }
      addMethodMessage.textContent = data.message || "Metóda bola úspešne pridaná";
      addMethodMessage.classList.add("success");
      resetAddForm();
      loadAllMethods();
      showTab("all");
    } catch (err) {
      console.error(err);
      addMethodMessage.textContent = err.message || "Nepodarilo sa pridať metódu";
      addMethodMessage.classList.add("error");
    }
  });

  // Update method
  updateBtn?.addEventListener("click", async () => {
    editMethodMessage.textContent = "";
    editMethodMessage.classList.remove("error", "success");
    const isFormOk = validateEditForm();
    if (!isFormOk) {
      editMethodMessage.textContent = "Prosím vyplňte všetky povinné polia správne.";
      editMethodMessage.classList.add("error");
      return;
    }
    let parametersObject = {};
    if (editParametersInput.value.trim()) {
      try {
        parametersObject = JSON.parse(editParametersInput.value);
      } catch (e) {
        document.getElementById("edit-method-parameters-error").textContent = "Parametre musia byť vo formáte JSON";
        return;
      }
    }
    const bodyPayload = {
      name: editNameInput.value.trim(),
      description: editDescriptionInput.value.trim(),
      parameters: parametersObject
    };
    try {
      const resp = await fetch(`/methods/update/${editMethodIdInput.value}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload),
        credentials: "include"
      });
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || "Chyba pri aktualizácii metódy");
      }
      editMethodMessage.textContent = data.message || "Metóda bola úspešne aktualizovaná";
      editMethodMessage.classList.add("success");
      setTimeout(() => {
        loadAllMethods();
        closeAllModals();
      }, 1500);
    } catch (err) {
      console.error(err);
      editMethodMessage.textContent = err.message || "Nepodarilo sa aktualizovať metódu";
      editMethodMessage.classList.add("error");
    }
  });

  // Delete method
  confirmDeleteBtn?.addEventListener("click", async () => {
    deleteMethodMessage.textContent = "";
    deleteMethodMessage.classList.remove("error", "success");
    try {
      const resp = await fetch(`/methods/delete/${deleteMethodIdInput.value}`, {
        method: "DELETE",
        credentials: "include"
      });
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || "Chyba pri odstraňovaní metódy");
      }
      deleteMethodMessage.textContent = data.message || "Metóda bola úspešne odstránená";
      deleteMethodMessage.classList.add("success");
      setTimeout(() => {
        loadAllMethods();
        closeAllModals();
      }, 1500);
    } catch (err) {
      console.error(err);
      deleteMethodMessage.textContent = err.message || "Nepodarilo sa odstrániť metódu";
      deleteMethodMessage.classList.add("error");
    }
  });

  // Cancel delete button
  cancelDeleteBtn?.addEventListener("click", () => {
    closeAllModals();
  });

  // Close modal buttons
  closeModals.forEach(btn => {
    btn.addEventListener("click", closeAllModals);
  });

  // Close modals when clicking outside
  window.addEventListener("click", (e) => {
    if (e.target === editModal) {
      closeAllModals();
    }
    if (e.target === deleteModal) {
      closeAllModals();
    }
  });

  // Set initial view mode from localStorage, defaulting to cards
  const savedMode = localStorage.getItem("methodViewMode") || "cards";
  setViewMode(savedMode);

  // Initial tab
  showTab("all");

  // Mark the "Názov" column as sorted ascending by default
  setTimeout(() => {
    const allHeaderCells = document.querySelectorAll("#all-list-container thead th.sortable");
    allHeaderCells.forEach(cell => cell.classList.remove("sort-asc", "sort-desc"));
    const nameHeader = document.querySelector('#all-list-container thead th[data-column="name"]');
    if (nameHeader) nameHeader.classList.add("sort-asc");
  }, 0);

  // Load methods on page load
  loadAllMethods();

  // Make hidden-js elements visible after initialization
  setTimeout(() => {
    document.querySelectorAll(".hidden-js").forEach(el => {
      el.style.visibility = "visible";
      el.style.opacity = "1";
      el.classList.remove("hidden-js");
    });
  }, 10);
});

// Function to parse date strings
function parseDate(dateStr) {
  // Accepts "DD.MM.YYYY" or ISO format
  if (!dateStr) return 0;
  const iso = Date.parse(dateStr);
  if (!isNaN(iso)) return iso;
  const parts = dateStr.split(".");
  if (parts.length === 3) {
    const [day, month, year] = parts.map(Number);
    return new Date(year, month - 1, day).getTime();
  }
  return 0;
}