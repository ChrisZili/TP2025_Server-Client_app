document.addEventListener("DOMContentLoaded", () => {
  // -- All variables --
  let allMethodsData = [];

  // For "All" tab
  let allCurrentSortColumn = "name";
  let allCurrentSortDirection = "asc";

  // For "Search" tab
  let searchCurrentSortColumn = "name";
  let searchCurrentSortDirection = "asc";

  // DOM elements for view toggles
  const viewCardsBtnAll = document.getElementById("view-cards");
  const viewListBtnAll = document.getElementById("view-list");
  const allCardsContainer = document.getElementById("all-cards-container");
  const allListContainer = document.getElementById("all-list-container");
  const sortOptionsAll = document.getElementById("sort-options-all");
  const allMethodsList = document.getElementById("all-methods-list");

  // DOM elements for search view toggles
  const viewCardsBtnSearch = document.getElementById("search-view-cards");
  const viewListBtnSearch = document.getElementById("search-view-list");
  const searchCardsContainer = document.getElementById("search-cards-container");
  const searchListContainer = document.getElementById("search-list-container");
  const sortOptionsSearch = document.getElementById("sort-options-search");
  const searchResults = document.getElementById("search-results-cards");
  const searchInput = document.getElementById("search-input");
  const searchSortSelect = document.getElementById("search-sort-select");

  // Tab elements
  const tabAll = document.getElementById("tab-all");
  const tabSearch = document.getElementById("tab-search");
  const tabAdd = document.getElementById("tab-add");

  const tabAllContent = document.getElementById("tab-all-content");
  const tabSearchContent = document.getElementById("tab-search-content");
  const tabAddContent = document.getElementById("tab-add-content");

  // Form elements - "Add Method"
  const sortSelect = document.getElementById("sort-select");
  const allListBody = document.getElementById("all-list-body");
  const searchListBody = document.getElementById("search-list-body");
  const addMethodMessage = document.getElementById("add-method-message");
  const addMethodForm = document.getElementById("add-method-form");

  // Add method form fields
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
    tabSearchContent.classList.add("hidden");
    tabAddContent.classList.add("hidden");

    // Remove active class from all tabs
    tabAll.classList.remove("active");
    tabSearch.classList.remove("active");
    tabAdd.classList.remove("active");

    // Show the selected tab content and set active class
    if (tabId === "all") {
      tabAllContent.classList.remove("hidden");
      tabAll.classList.add("active");
    } else if (tabId === "search") {
      tabSearchContent.classList.remove("hidden");
      tabSearch.classList.add("active");
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

      if (!response.ok) {
        throw new Error("Failed to load methods");
      }

      const data = await response.json();
      allMethodsData = data;
      
      renderMethods(allMethodsData, sortSelect.value);
      renderAllListTable(allMethodsData);
    } catch (err) {
      console.error("Error loading methods:", err);
      allMethodsData = [];
      renderMethods([], sortSelect.value);
      renderAllListTable([]);
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
    
    // Validate name
    if (!nameInput.value.trim()) {
      nameErrorDiv.textContent = "Názov je povinný";
      isValid = false;
    } else {
      nameErrorDiv.textContent = "";
    }

    // Validate parameters (if not empty must be valid JSON)
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
    
    // Validate name
    if (!editNameInput.value.trim()) {
      document.getElementById("edit-method-name-error").textContent = "Názov je povinný";
      isValid = false;
    } else {
      document.getElementById("edit-method-name-error").textContent = "";
    }

    // Validate parameters (if not empty must be valid JSON)
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
  function setViewMode(mode, tab = "ALL") {
    localStorage.setItem("methodViewMode", mode);

    if (tab === "ALL") {
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
    } else if (tab === "SEARCH") {
      if (mode === "cards") {
        viewCardsBtnSearch.classList.add("active");
        viewListBtnSearch.classList.remove("active");
        searchCardsContainer.classList.remove("hidden");
        searchListContainer.classList.add("hidden");
        sortOptionsSearch.classList.remove("hidden");
        performSearch();
      } else {
        viewListBtnSearch.classList.add("active");
        viewCardsBtnSearch.classList.remove("active");
        searchCardsContainer.classList.add("hidden");
        searchListContainer.classList.remove("hidden");
        sortOptionsSearch.classList.add("hidden");
        performSearch();
      }
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
    
    // Format parameters nicely if they exist
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
    
    // Clear error message
    editMethodMessage.textContent = "";
    editMethodMessage.classList.remove("error", "success");
    
    // Show the modal
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

      // Add info elements to container
      infoContainer.appendChild(created);
      infoContainer.appendChild(description);
      infoContainer.appendChild(parameters);

      // Create action buttons
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

      if (method.deletable !== false) {               // ✱ pridaj túto podmienku
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
      

      // Add everything to the card
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
      let valA, valB;

      if (allCurrentSortColumn === "name" || allCurrentSortColumn === "description") {
        valA = a[allCurrentSortColumn] || "";
        valB = b[allCurrentSortColumn] || "";
      } else {
        valA = (a[allCurrentSortColumn] || "").toString();
        valB = (b[allCurrentSortColumn] || "").toString();
      }

      return allCurrentSortDirection === "asc"
        ? valA.localeCompare(valB, "sk")
        : valB.localeCompare(valA, "sk");
    });

    data.forEach(method => {
      const tr = document.createElement("tr");
      
      // Create the description cell with truncated text
      const descriptionTd = document.createElement("td");
      const descSpan = document.createElement("span");
      descSpan.classList.add("description-truncate");
      descSpan.textContent = method.description || "-";
      descriptionTd.appendChild(descSpan);
      
      // Create the actions cell with edit and delete buttons
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

    if (searchResults) {
      searchResults.innerHTML = "";
    }

    if (!query) {
      return;
    }

    const filtered = allMethodsData.filter(m => {
      const name = m.name?.toLowerCase() || "";
      const description = m.description?.toLowerCase() || "";

      return (
        name.includes(query) ||
        description.includes(query)
      );
    });

    const sortValue = searchSortSelect?.value || "creation";

    if (mode === "list") {
      renderSearchListTable(filtered);
    } else {
      // Cards view
      const sortedFiltered = sortMethods(filtered, sortValue);

      if (sortedFiltered.length === 0 && searchResults) {
        searchResults.innerHTML = `<p class="empty-list-message">Pre "${query}" neboli nájdené žiadne výsledky.</p>`;
        return;
      }

      const container = document.createElement("div");
      container.classList.add("cards");

      sortedFiltered.forEach(method => {
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

        // Add info elements to container
        infoContainer.appendChild(created);
        infoContainer.appendChild(description);
        infoContainer.appendChild(parameters);

        // Create action buttons
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
          deleteBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            openDeleteModal(method.id);
          });
          actions.appendChild(deleteBtn);
        }
        // Add everything to the card
        card.appendChild(name);
        card.appendChild(infoContainer);
        card.appendChild(actions);

        container.appendChild(card);
      });

      if (searchResults) {
        searchResults.appendChild(container);
      }
    }
  }

  // Function to render search list table
  function renderSearchListTable(methods) {
    if (!searchListBody) return;
    searchListBody.innerHTML = "";

    if (!Array.isArray(methods) || methods.length === 0) {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td colspan="4" style="text-align: center;">Žiadne metódy nenájdené</td>`;
      searchListBody.appendChild(tr);
      return;
    }

    let data = [...methods];
    data.sort((a, b) => {
      let valA, valB;

      if (searchCurrentSortColumn === "name" || searchCurrentSortColumn === "description") {
        valA = a[searchCurrentSortColumn] || "";
        valB = b[searchCurrentSortColumn] || "";
      } else {
        valA = (a[searchCurrentSortColumn] || "").toString();
        valB = (b[searchCurrentSortColumn] || "").toString();
      }

      return searchCurrentSortDirection === "asc"
        ? valA.localeCompare(valB, "sk")
        : valB.localeCompare(valA, "sk");
    });

    data.forEach(method => {
      const tr = document.createElement("tr");
      
      // Create the description cell with truncated text
      const descriptionTd = document.createElement("td");
      const descSpan = document.createElement("span");
      descSpan.classList.add("description-truncate");
      descSpan.textContent = method.description || "-";
      descriptionTd.appendChild(descSpan);
      
      // Create the actions cell with edit and delete buttons
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
     if (method.deletable !== false) {                // ✱ nová podmienka
        const deleteBtn = document.createElement("button");
        deleteBtn.classList.add("delete-btn");
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.title = "Odstrániť";
        deleteBtn.addEventListener("click", e => {
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
      
      searchListBody.appendChild(tr);
    });
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
  searchSortSelect?.addEventListener("change", performSearch);

  // -- Event Listeners --

  // Tab navigation
  tabAll.addEventListener("click", () => showTab("all"));
  tabSearch.addEventListener("click", () => showTab("search"));
  tabAdd.addEventListener("click", () => showTab("add"));

  // View toggle (cards/list)
  viewCardsBtnAll.addEventListener("click", () => setViewMode("cards"));
  viewListBtnAll.addEventListener("click", () => setViewMode("list"));

  // Sort select for cards view
  sortSelect?.addEventListener("change", () => {
    renderMethods(allMethodsData, sortSelect.value);
  });

  // Table header sorting (ALL tab)
  const allHeaderCells = document.querySelectorAll("#all-list-container thead th");
  allHeaderCells?.forEach(th => {
    th.addEventListener("click", () => {
      const col = th.getAttribute("data-column");
      if (!col || col === "actions") return; // Don't sort the actions column
      
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

  // Table header sorting for Search tab
  const searchHeaderCells = document.querySelectorAll("#search-list-container thead th");
  searchHeaderCells?.forEach(th => {
    th.addEventListener("click", () => {
      const col = th.getAttribute("data-column");
      if (!col || col === "actions") return; // Don't sort the actions column
      
      if (searchCurrentSortColumn === col) {
        searchCurrentSortDirection = (searchCurrentSortDirection === "asc") ? "desc" : "asc";
      } else {
        searchCurrentSortColumn = col;
        searchCurrentSortDirection = "asc";
      }

      searchHeaderCells.forEach(cell => cell.classList.remove("sort-asc", "sort-desc"));
      th.classList.add(searchCurrentSortDirection === "asc" ? "sort-asc" : "sort-desc");

      performSearch();
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

    // Prepare data
    let parametersObject = {};
    if (parametersInput.value.trim()) {
      try {
        parametersObject = JSON.parse(parametersInput.value);
      } catch (e) {
        // Should not happen due to validation
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
      loadAllMethods(); // Reload the methods list
      showTab("all");   // Switch to all tab after successful addition
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

    // Prepare data
    let parametersObject = {};
    if (editParametersInput.value.trim()) {
      try {
        parametersObject = JSON.parse(editParametersInput.value);
      } catch (e) {
        // Should not happen due to validation
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
      
      // Reload the methods list after a short delay
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
      
      // Reload the methods list after a short delay
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
