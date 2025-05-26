document.addEventListener("DOMContentLoaded", async () => {
  // -- All variables --
  let userType = "";
  let allMessagesData = [];
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

      const messages = await response.json();
      console.log("Fetched /spravy/list response:", messages); // Debug log

      if (!response.ok) throw new Error("Chyba pri načítaní správ.");

      // Map or enrich messages if needed (for example: resolving sender/recipient names)
      allMessagesData = messages.map(msg => {
        return {
          ...msg,
          timestamp: new Date(msg.timestamp).toLocaleString() // Format timestamp nicely
        };
      });

      // Placeholder for rendering function
      //renderMessages(allMessagesData);
      applyMessageSearch();
    } catch (err) {
      console.error(err);
      //const container = document.getElementById("all-messages-container");
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
    await loadAllMessages(); // Re-fetch messages when returning
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
  const sendBtn = document.getElementById("send-message-btn");
  const recipientInput = document.getElementById("message-recipient");
  const messageInput = document.getElementById("message-text");
  const imageInput = document.getElementById("message-image");
  const feedbackDiv = document.getElementById("send-message-feedback");

  //viewCardsBtnAll?.addEventListener("click", () => setViewMode("cards"));
  //viewListBtnAll?.addEventListener("click", () => setViewMode("list"));

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

  function applyMessageSearch() {
    const search = document.getElementById("search-input")?.value.trim().toLowerCase() || "";

    const filtered = allMessagesData.filter(m =>
      m.sender_email?.toLowerCase().includes(search)
    );

    const viewMode = localStorage.getItem("messageViewMode") || "cards";

    if (viewMode === "cards") {
      renderMessagesCards(filtered);
    } else {
      renderMessagesTable(filtered);
    }
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

  function applyMessageSearch() {
    const search = document.getElementById("search-input")?.value.trim().toLowerCase() || "";
    const filtered = allMessagesData.filter(m =>
      m.content.toLowerCase().includes(search) ||
      m.sender_email?.toLowerCase().includes(search) ||
      m.recipient_email?.toLowerCase().includes(search)
    );

    const viewMode = localStorage.getItem("messageViewMode") || "cards";
    if (viewMode === "cards") {
      renderMessagesCards(filtered);
    } else {
      renderMessagesTable(filtered);
    }
  }

  function renderMessagesCards(messages) {
    const container = document.getElementById("messages-list-cards");
    if (!container) return;

    container.innerHTML = "";

    messages.forEach(msg => {
      const card = document.createElement("div");
      card.className = "card message-card";

      // Each card is a link to spravy_details/(card_ID)
      card.addEventListener("click", async () => {
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

      card.innerHTML = `
        <strong>${!msg.is_read ? "🔴 " : ""}Správa #${msg.id}</strong><br>
        <p><strong>Od:</strong> ${msg.sender_email}</p>
        <p><strong>Pre:</strong> ${msg.recipient_email}</p>
        <p><strong>Obsah:</strong> ${msg.content}</p>
        <p class="timestamp"><i class="far fa-clock"></i> ${msg.timestamp}</p>
        <button class="toggle-read-btn" data-id="${msg.id}" title="${msg.is_read ? 'Unmark as read' : 'Mark as read'}">
          ${msg.is_read ? "📫" : "📭"}
        </button>
      `;

      container.appendChild(card);
    });
  }


  function renderMessagesTable(messages) {
    const tbody = document.getElementById("messages-list-body");
    tbody.innerHTML = "";

    if (!messages.length) {
      tbody.innerHTML = "<tr><td colspan='4'>Žiadne správy.</td></tr>";
      return;
    }

    messages.forEach(msg => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${msg.sender_email}</td>
        <td>${msg.recipient_email}</td>
        <td>${msg.content}</td>
        <td>${msg.timestamp}</td>
      `;

      tbody.appendChild(tr);
    });
  }

/*
  document.querySelectorAll(".toggle-read-btn").forEach(btn => {
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation(); // Prevent card click
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
        }

      } catch (err) {
        console.error("Toggle error:", err);
        alert("Nepodarilo sa zmeniť stav správy.");
      }
    });
  });
*/

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
    }

  } catch (err) {
    console.error("Toggle error:", err);
    alert("Nepodarilo sa zmeniť stav správy.");
  }
});




  //##################################################################################
  //creating messages

  // Helper to show feedback
  function showFeedback(msg, isError = true) {
    feedbackDiv.textContent = msg;
    feedbackDiv.className = isError ? "error" : "success";
  }

  // Enable button when inputs are not empty
  [recipientInput, messageInput].forEach((el) =>
    el.addEventListener("input", () => {
      sendBtn.disabled = !(recipientInput.value.trim() && messageInput.value.trim());
    })
  );

  sendBtn.addEventListener("click", async () => {
    showFeedback(""); // Clear previous

    // Simple validation
    const recipient = recipientInput.value.trim();
    const message = messageInput.value.trim();

    if (!recipient || !message) {
      showFeedback("Príjemca a správa sú povinné polia.");
      return;
    }

    const formData = new FormData();
    formData.append("recipient", recipient);
    formData.append("message", message);

    if (imageInput.files.length > 0) {
      formData.append("image", imageInput.files[0]);
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

      // Reset form
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