document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById('login-form');
  const messageBox = document.getElementById('message');

  // Tlačidlo na zobrazenie/skrytie hesla
  const toggleBtn = document.getElementById('toggle-password');
  const passwordInput = document.getElementById('password');

  // Zobraziť / skryť heslo
  if (toggleBtn && passwordInput) {
    toggleBtn.addEventListener('click', () => {
      // Ak je type="password", chceme ho "odkryť" (type="text")
      if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        // Zmeníme aj ikonu na "oko bez škrtnutia"
        toggleBtn.innerHTML = '<i class="fas fa-eye"></i>';
      } else {
        // Inak vrátime späť na skryté heslo (type="password")
        passwordInput.type = 'password';
        // Zmeníme ikonu na "oko so škrtnutím"
        toggleBtn.innerHTML = '<i class="fas fa-eye-slash"></i>';
      }
    });
  }

  // AJAX fetch na /login (iba príklad, ak ho používaš)
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault(); // Zrušíme bežný submit

      const email = document.getElementById('email').value.trim();
      const password = passwordInput.value;

      try {
        const response = await fetch('/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
          window.location.href = '/dashboard';
        } else {
          messageBox.textContent = data.error || 'Prihlásenie zlyhalo.';
        }
      } catch (error) {
        messageBox.textContent = 'Nastala chyba pri pripojení.';
        console.error('Login error:', error);
      }
    });
  }
});
