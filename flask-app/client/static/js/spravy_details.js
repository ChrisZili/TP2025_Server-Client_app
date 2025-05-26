document.addEventListener("DOMContentLoaded", async () => {
  const parts = window.location.pathname.split("/");
  const messageId = parts[2];

  try {
    const response = await fetch(`/spravy/${messageId}`, {
      method: "GET",
      headers: { Accept: "application/json" },
      credentials: "include"
    });

    if (!response.ok) throw new Error("Nepodarilo sa načítať správu.");

    const message = await response.json();

    document.getElementById("sender-email").textContent = message.sender_email || "-";
    document.getElementById("recipient-email").textContent = message.recipient_email || "-";
    document.getElementById("timestamp").textContent = new Date(message.timestamp).toLocaleString('sk-SK');
    document.getElementById("message-content").textContent = message.content || "";

    // Reveal hidden content
    document.querySelectorAll(".hidden-js").forEach(el => {
      el.classList.remove("hidden-js");
      el.style.opacity = "1";
      el.style.visibility = "visible";
    });

  } catch (err) {
    console.error("Chyba pri načítaní správy:", err);
    alert(err.message || "Nepodarilo sa načítať správu.");
  }
});
