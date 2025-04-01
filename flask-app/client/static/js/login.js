document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const messageBox = document.getElementById('message');

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include', // Zabezpečí, že cookies budú zahrnuté v požiadavke
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            // Už nemusíme token ukladať do localStorage – server ho nastaví do HTTP-only cookie.
            window.location.href = '/dashboard';
        } else {
            messageBox.textContent = data.error || 'Prihlásenie zlyhalo';
        }
    } catch (error) {
        messageBox.textContent = 'Nastala chyba pri pripojení';
        console.error('Login error:', error);
    }
});
