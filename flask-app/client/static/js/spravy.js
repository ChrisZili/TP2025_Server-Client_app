document.addEventListener("DOMContentLoaded", async () => {
  // -- All variables --
  let userType = "";
  let allMessagesData = [];
  let currentFilterMode = "received";
  let currentUserId = 0;
  const viewCardsBtnAll = document.getElementById("view-cards");
  const viewListBtnAll = document.getElementById("view-list");
  document.getElementById("search-input")?.addEventListener("input", debounce(applyMessageSearch, 200));


  // Load all messages
  async function loadAllMessages() {
    try {
      const response = await fetch("/spravy/list", {
        method: "GET",
        headers: { "Accept": "application/json" },
        credentials: "include"
      });

      const data = await response.json();
      console.log("Fetched /spravy/list response:", data);

      if (!response.ok) throw new Error("Chyba pri načítaní správ.");

      currentUserId = data.user_id;

      allMessagesData = data.messages.map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp).toLocaleString()
      }));

      applyMessageSearch();
    } catch (err) {
      console.error(err);
      const container = document.getElementById("messages-cards-container");
      if (container) {
        container.innerHTML = `<p>Chyba pri načítaní správ: ${err.message}</p>`;
      }
    }
  }



  // Tab elements
  const tabAll = document.getElementById("tab-all");
  const tabAdd = document.getElementById("tab-add");

  const tabAllContent = document.getElementById("tab-all-content");
  const tabAddContent = document.getElementById("tab-add-content");

  tabAll?.addEventListener("click", async () => {
    showTab("all");
    await loadAllMessages();
  });
  tabAdd?.addEventListener("click", () => {
    showTab("add");

    // Clear old message view
    const cards = document.getElementById("messages-list-cards");
    const table = document.getElementById("messages-list-body");

    if (cards) cards.innerHTML = "";
    if (table) table.innerHTML = "";
    document.getElementById("search-input").value = "";
  });

  // Form elements - "Send message"
  const sendMessageForm = document.getElementById("send-message-form"); 
  const recipientInput = document.getElementById("message-recipient");
  const messageInput = document.getElementById("message-text");
  const imageInput = document.getElementById("message-image");
  const feedbackDiv = document.getElementById("send-message-feedback");
  const sendBtn = document.getElementById("send-message-btn");

  // Add this debounce function
  function debounce(func, delay) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), delay);
    };
  }

  // HELPER: show / clear error
  function showError(div, msg) {
    div.textContent = msg;
    div.classList.add("active");
  }
  function clearError(div) {
    div.textContent = "";
    div.classList.remove("active");
  }

  // Tab switching function
  function showTab(tab) {
    const tabMessages = document.getElementById("tab-messages-content");

    tabAll?.classList.remove("active");
    tabAdd?.classList.remove("active");

    tabAllContent?.classList.add("hidden");
    tabAddContent?.classList.add("hidden");
    tabMessages?.classList.add("hidden");

    if (tab === "all") {
      tabAll?.classList.add("active");
      tabAllContent?.classList.remove("hidden");
      tabMessages?.classList.remove("hidden");  // <-- Show message UI
    } else if (tab === "add") {
      tabAdd?.classList.add("active");
      tabAddContent?.classList.remove("hidden");
      // tabMessages remains hidden
    }
  }

  //######################################################
  //here we show messages

  //cards or table wiew
  function setMessageViewMode(mode) {
    localStorage.setItem("messageViewMode", mode);

    const cardsContainer = document.getElementById("messages-cards-container");
    const listContainer = document.getElementById("messages-list-container");

    if (mode === "cards") {
      viewCardsBtnAll?.classList.add("active");
      viewListBtnAll?.classList.remove("active");
      cardsContainer?.classList.remove("hidden");
      listContainer?.classList.add("hidden");
    } else {
      viewCardsBtnAll?.classList.remove("active");
      viewListBtnAll?.classList.add("active");
      cardsContainer?.classList.add("hidden");
      listContainer?.classList.remove("hidden");
    }

    applyMessageSearch(); // Re-filter on switch
  }

  //filter messages (received/sent)
  function applyMessageSearch() {
    const search = document.getElementById("search-input")?.value.trim().toLowerCase() || "";

    const filtered = allMessagesData.filter(m => {
      const matchesSearch =
        m.content.toLowerCase().includes(search) ||
        m.sender_email?.toLowerCase().includes(search) ||
        m.recipient_email?.toLowerCase().includes(search);

      const isSent = m.sender_id === currentUserId;
      const isReceived = m.recipient_id === currentUserId;

      if (currentFilterMode === "sent" && !isSent) return false;
      if (currentFilterMode === "received" && !isReceived) return false;

      return matchesSearch;
    });

    const viewMode = localStorage.getItem("messageViewMode") || "cards";
    if (viewMode === "cards") {
      renderMessagesCards(filtered);
    } else {
      renderMessagesTable(filtered);
    }
  }


  function updateActiveFilterButton(mode) {
    currentFilterMode = mode;

    // Update active state on filter buttons
    document.querySelectorAll(".filter-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.filter === mode);
    });

    // Let applyMessageSearch handle filtering logic
    applyMessageSearch();
  }

  // Attach listeners ONCE to each filter button
  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const selectedMode = btn.dataset.filter;
      updateActiveFilterButton(selectedMode);
    });
  });

  // Run this once on page load to apply initial state
  document.addEventListener("DOMContentLoaded", () => {
    updateActiveFilterButton(currentFilterMode);
  });

  //zobrazit karty
  function renderMessagesCards(messages) {
    const container = document.getElementById("messages-list-cards");
    if (!container) return;

    container.innerHTML = "";

    messages.forEach(msg => {
      const card = document.createElement("div");
      card.className = "card message-card";

      if (!msg.is_read) {
        card.classList.add("unread");
      }

      // Each card is a link to spravy_details/(card_ID)
      card.addEventListener("click", async (event) => {
        if (event.target.closest(".toggle-read-btn")) return;

        // Check if message has images
        if (msg.images && msg.images.length > 0) {
          console.log(`Message ${msg.id} has ${msg.images.length} images`);
        } else {
          console.log(`Message ${msg.id} has no images`);
        }

        try {
          if (!msg.is_read) {
            await fetch(`/spravy/${msg.id}/mark_read`, {
              method: "PUT",
              credentials: "include"
            });
          }

          window.location.href = `/spravy/${msg.id}`;
        } catch (err) {
          console.error("Failed to mark message as read:", err);
          window.location.href = `/spravy/${msg.id}`; // fallback
        }
      });

      card.innerHTML = `
        <strong>${!msg.is_read ? "🔴 " : ""}Správa #${msg.id}</strong><br>
        <p><strong>Od:</strong> ${msg.sender_email}</p>
        <p><strong>Pre:</strong> ${msg.recipient_email}</p>
        <p><strong>Obsah:</strong> ${msg.content}</p>
        <p class="timestamp"><i class="far fa-clock"></i> ${msg.timestamp}</p>
        <button class="toggle-read-btn" data-id="${msg.id}" title="${msg.is_read ? 'Označiť ako neprečítané' : 'Označiť ako prečítané'}">
          ${msg.is_read ? "📫" : "📭"}
        </button>
      `;

      container.appendChild(card);
    });
  }

  //prepnut is_read 1/0 pre karty
  document.getElementById("messages-list-cards").addEventListener("click", async (e) => {
    const btn = e.target.closest(".toggle-read-btn");
    if (!btn) return;

    e.preventDefault();
    e.stopPropagation(); // Prevent triggering card click

    const msgId = btn.dataset.id;

    try {
      const resp = await fetch(`/spravy/${msgId}/toggle_read`, {
        method: "PUT",
        credentials: "include",
        headers: { Accept: "application/json" }
      });

      const result = await resp.json();
      if (!resp.ok) throw new Error(result.error || "Chyba pri prepnutí stavu.");

      // Update local message data
      const message = allMessagesData.find(m => m.id == msgId);
      if (message) {
        message.is_read = result.is_read;
        renderMessagesCards(allMessagesData);
        applyMessageSearch();
      }

    } catch (err) {
      console.error("Toggle error:", err);
      alert("Nepodarilo sa zmeniť stav správy.");
    }
  });

  //zobrazit spravy ako tabulku
  function renderMessagesTable(messages) {
    const tbody = document.getElementById("messages-list-body");
    tbody.innerHTML = "";

    if (!messages.length) {
      tbody.innerHTML = "<tr><td colspan='5'>Žiadne správy.</td></tr>";
      return;
    }

    messages.forEach(msg => {
      const tr = document.createElement("tr");

      // Set row background based on read status
      tr.style.backgroundColor = msg.is_read ? "#ffffff" : "#F3E6B7";

      tr.innerHTML = `
        <td>${msg.sender_email}</td>
        <td>${msg.recipient_email}</td>
        <td class="message-column">${msg.content}</td>
        <td>${msg.timestamp}</td>
        <td>
          <button 
            class="toggle-read-btn" 
            data-id="${msg.id}" 
            title="${msg.is_read ? 'Označiť ako neprečítané' : 'Označiť ako prečítané'}">
            ${msg.is_read ? "📫" : "📭"}
          </button>
        </td>
      `;

      // kliknutim an riadok zobrazime detail spravy
      tr.addEventListener("click", async (event) => {
        if (event.target.closest(".toggle-read-btn")) return;

        try {
          if (!msg.is_read) {
            await fetch(`/spravy/${msg.id}/mark_read`, {
              method: "PUT",
              credentials: "include"
            });
          }
          window.location.href = `/spravy/${msg.id}`;
        } catch (err) {
          console.error("Failed to mark message as read:", err);
          window.location.href = `/spravy/${msg.id}`; // fallback
        }
      });

      tbody.appendChild(tr);
    });
  }
  
  //prepnut is_read 1/0 pre tabulku
  document.getElementById("messages-list-body").addEventListener("click", async (e) => {
  const btn = e.target.closest(".toggle-read-btn");
  if (!btn) return;

  e.preventDefault();
  e.stopPropagation(); // Prevent row click

  const msgId = btn.dataset.id;

  try {
    const resp = await fetch(`/spravy/${msgId}/toggle_read`, {
      method: "PUT",
      credentials: "include",
      headers: { Accept: "application/json" }
    });

    const result = await resp.json();
    if (!resp.ok) throw new Error(result.error || "Chyba pri prepnutí stavu.");

    // Update local message data
    const message = allMessagesData.find(m => m.id == msgId);
    if (message) {
      message.is_read = result.is_read;
      renderMessagesTable(allMessagesData); // <== re-render table
      applyMessageSearch();
    }

  } catch (err) {
    console.error("Toggle error:", err);
    alert("Nepodarilo sa zmeniť stav správy.");
  }
});



  //##################################################################################
  //creating and sending messages

  // Helper to show feedback
  function showFeedback(msg, isError = true) {
    feedbackDiv.textContent = msg;
    feedbackDiv.className = isError ? "error" : "success";
  }

  // Enable SEND button when inputs are not empty
  [recipientInput, messageInput].forEach((el) =>
    el.addEventListener("input", () => {
      sendBtn.disabled = !(recipientInput.value.trim() && messageInput.value.trim());
    })
  );
  
  //poslat spravu
  sendBtn.addEventListener("click", async () => {
    showFeedback("");

    const recipient = recipientInput.value.trim();
    const message = messageInput.value.trim();

    if (!recipient || !message) {
      showFeedback("Príjemca a správa sú povinné polia.");
      return;
    }

    const formData = new FormData();
    formData.append("recipient", recipient);
    formData.append("message", message);

    const files = imageInput.files;
    if (files.length > 10) {
      showFeedback("Môžete priložiť maximálne 10 obrázkov.");
      return;
    }

    for (let i = 0; i < files.length; i++) {
      formData.append("images", files[i]);
    }

    try {
      const response = await fetch("/spravy/send", {
        method: "POST",
        body: formData,
        credentials: "include"
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Chyba pri odosielaní správy.");

      showFeedback(data.message || "Správa bola úspešne odoslaná.", false);
      document.getElementById("send-message-form").reset();
      sendBtn.disabled = true;
    } catch (err) {
      console.error("Sending message failed:", err);
      showFeedback(err.message || "Správu sa nepodarilo odoslať.");
    }
  });

  // Load messages initially
  console.log("Loading messages...");
  await loadAllMessages();

  // Setup view toggles
  document.getElementById("view-cards")?.addEventListener("click", () => setMessageViewMode("cards"));
  document.getElementById("view-list")?.addEventListener("click", () => setMessageViewMode("list"));

  // Setup search
  document.getElementById("search-input")?.addEventListener("input", debounce(applyMessageSearch, 200));

  // Restore saved view
  setMessageViewMode(localStorage.getItem("messageViewMode") || "cards");

});