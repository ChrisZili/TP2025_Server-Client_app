document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("login-btn");
  const emailInput = document.getElementById("login-email");
  const passwordInput = document.getElementById("login-password");
  const toggleBtn = document.getElementById("toggle-login-password");
  const messageBox = document.getElementById("login-message");

  // Prepínač zobrazenia hesla
  if (toggleBtn && passwordInput) {
    toggleBtn.addEventListener("click", () => {
      const isPassword = passwordInput.type === "password";
      passwordInput.type = isPassword ? "text" : "password";
      toggleBtn.innerHTML = isPassword
        ? '<i class="fas fa-eye"></i>'
        : '<i class="fas fa-eye-slash"></i>';
    });
  }

  // Spracovanie kliknutia na tlačidlo "Prihlásiť"
  if (loginBtn) {
    loginBtn.addEventListener("click", async () => {
      const email = emailInput.value.trim();
      const password = passwordInput.value;

      // Vymaž predchádzajúcu správu
      messageBox.textContent = "";
      messageBox.className = "";

      if (!email || !password) {
        messageBox.textContent = "Zadajte email a heslo.";
        messageBox.classList.add("error");
        return;
      }

      try {
        const response = await fetch("/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // cookie/session podpora
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
          // TODO: uložiť základné info o užívateľovi (napr. z `data`)
          localStorage.setItem("user_type", data.user_type || "");
          localStorage.setItem("full_name", data.full_name || "");

          window.location.href = "/dashboard";
        } else {
          messageBox.textContent = data.error || "Prihlásenie zlyhalo.";
          messageBox.classList.add("error");
        }
      } catch (err) {
        console.error("Chyba prihlásenia:", err);
        messageBox.textContent = "Nastala chyba pri pripojení.";
        messageBox.classList.add("error");
      }
    });
  }
});
