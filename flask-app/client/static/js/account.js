document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById('user-info');

    // Funkcia zabezpečí, že sa cookies odosielajú so žiadosťou
    function fetchWithAuth(url, options = {}) {
        return fetch(url, {
            ...options,
            credentials: 'include', // Cookies sa odosielajú automaticky
            headers: {
                ...(options.headers || {}),
                'Accept': 'application/json'
            }
        });
    }

    async function loadUserInfo() {
        try {
            // Voláme endpoint /account/info, ktorý vráti JSON dáta o používateľovi
            const response = await fetchWithAuth('/account/info');
            if (!response.ok) {
                throw new Error('Nepodarilo sa načítať údaje používateľa. Môže byť neplatný token.');
            }

            const user = await response.json();
            let html = '';

            // Vždy zobrazíme email, lebo je k dispozícii

            html += `<p><strong>Email:</strong> ${user.email}</p>`;
            if (user.user_type) {
                html += `<p><strong>Typ uživateľa:</strong> ${user.user_type}</p>`;
            }
            if (user.first_name) {
                html += `<p><strong>Meno:</strong> ${user.first_name}</p>`;
            }
            if (user.last_name) {
                html += `<p><strong>Priezvisko:</strong> ${user.last_name}</p>`;
            }
            if (user.gender) {
                html += `<p><strong>Pohlavie:</strong> ${user.gender}</p>`;
            }
            if (user.phone_number) {
                html += `<p><strong>Telefón:</strong> ${user.phone_number}</p>`;
            }
            if (user.birth_date) {
                html += `<p><strong>Dátum narodenia:</strong> ${new Date(user.birth_date).toLocaleDateString('sk-SK')}</p>`;
            }
            if (user.birth_number) {
                html += `<p><strong>Rodné číslo:</strong> ${user.birth_number}</p>`;
            }
            html += `<p><strong>ID lekára:</strong> ${user.doctor_id ? user.doctor_id : 'Nepriradený'}</p>`;
            if (user.diagnosis_right_eye) {
                html += `<p><strong>Diagnóza pravého oka:</strong> ${user.diagnosis_right_eye}</p>`;
            }
            if (user.diagnosis_left_eye) {
                html += `<p><strong>Diagnóza ľavého oka:</strong> ${user.diagnosis_left_eye}</p>`;
            }
            container.innerHTML = html;
        } catch (error) {
            console.error(error);
            container.innerHTML = `<p>Chyba pri načítaní údajov: ${error.message}</p>`;
        }
    }

    loadUserInfo();

    // Pri odhlásení presmerujeme používateľa na /logout, ktorý vymaže JWT cookie
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            window.location.href = "/logout";
        });
    }
});
