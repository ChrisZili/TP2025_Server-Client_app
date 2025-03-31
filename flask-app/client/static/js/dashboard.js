document.addEventListener("DOMContentLoaded", () => {
    // Pridáme log pre overenie, že súbor sa načítal
    console.log("dashboard.js loaded");

    // Získame referencie na HTML elementy
    const authStatus = document.getElementById('auth-status');
    const dashboardContent = document.getElementById('dashboard-content');
    const welcomeMessage = document.getElementById('welcome-message');
    const logoutBtn = document.getElementById('logout-btn');

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

    async function loadDashboard() {
        try {
            // Voláme endpoint, ktorý by mal vrátiť JSON dáta o používateľovi
            const response = await fetchWithAuth('/account/info');
            if (!response.ok) {
                throw new Error('Nepodarilo sa načítať údaje používateľa. Môže byť neplatný token.');
            }

            const user = await response.json();
            // Aktualizujeme HTML s načítanými údajmi
            welcomeMessage.textContent = `Welcome, ${user.first_name} ${user.last_name}`;
            authStatus.innerHTML = '<div class="alert alert-success">Prihlásený</div>';
            // Určíme typ používateľa na základe textu v H1 (môžeš to prispôsobiť)
            const headingText = document.querySelector("h1").textContent.toLowerCase();
            const userType = headingText.includes("doctor")
                ? "doctor"
                : headingText.includes("patient")
                ? "patient"
                : headingText.includes("technician")
                ? "technician"
                : null;

            if (userType === "doctor") {
                loadDoctorDashboard(user);
            } else if (userType === "patient") {
                loadPatientDashboard(user);
            } else if (userType === "technician") {
                loadTechnicianDashboard(user);
            } else {
                dashboardContent.innerHTML = "<p>Vitajte v systéme!</p>";
            }
        } catch (error) {
            console.error('Chyba pri načítaní dashboardu:', error);
            dashboardContent.innerHTML = `
                <p>Chyba pri načítaní obsahu: ${error.message}</p>
                <p><a href="/login">Prihláste sa znova</a></p>
            `;
        }
    }

    async function loadDoctorDashboard(user) {
        try {
            const response = await fetchWithAuth('/doctor/patients');
            const patients = await response.json();
            let html = `
                <h2>Vaši pacienti</h2>
                <div class="patient-list">
            `;
            if (patients.length === 0) {
                html += '<p>Nemáte priradených žiadnych pacientov.</p>';
            } else {
                html += '<ul>';
                patients.forEach(patient => {
                    html += `<li data-id="${patient.id}">${patient.name}</li>`;
                });
                html += '</ul>';
            }
            html += `
                </div>
                <div class="doctor-actions">
                    <h3>Možnosti</h3>
                    <button id="change-hospital-btn">Zmeniť nemocnicu</button>
                </div>
            `;
            dashboardContent.innerHTML = html;
            const changeHospitalBtn = document.getElementById("change-hospital-btn");
            if (changeHospitalBtn) {
                changeHospitalBtn.addEventListener("click", showChangeHospitalForm);
            }
        } catch (error) {
            console.error("Chyba pri načítaní pacientov:", error);
            dashboardContent.innerHTML = "<p>Chyba pri načítaní pacientov.</p>";
        }
    }

    async function loadPatientDashboard(user) {
        dashboardContent.innerHTML = `
            <h2>Zdravotná dokumentácia</h2>
            <p>Vaše zdravotné údaje budú zobrazené tu.</p>
        `;
    }

    async function loadTechnicianDashboard(user) {
        dashboardContent.innerHTML = `
            <h2>Technické údaje</h2>
            <p>Dashboard technika bude čoskoro dostupný.</p>
        `;
    }

    function showChangeHospitalForm() {
        alert("Formulár na zmenu nemocnice ešte nie je implementovaný.");
    }

    // Pri odhlásení presmerujeme používateľa na /logout, kde sa odstráni JWT cookie.
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            window.location.href = "/logout";
        });
    }

    // Načítať dashboard s miernym oneskorením (100 ms)
    setTimeout(loadDashboard, 100);
});
