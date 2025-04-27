document.addEventListener("DOMContentLoaded", () => {
  // Get the current date in YYYY-MM-DD format
  const currentDate = new Date().toISOString().split("T")[0];

  // Set the value of the hidden input and display field
  document.getElementById("hospital-created-at").value = currentDate;
  document.getElementById("hospital-created-at-display").value = currentDate;

  // Full list of states
  const states = [
    "Afganistan", "Albánsko", "Alžírsko", "Americká Samoa", "Andorra", "Angola", "Antigua a Barbuda", "Argentína", "Arménsko", "Aruba", "Austrália", "Rakúsko", "Azerbajdžan",
    "Bahamy", "Bahrajn", "Bangladéš", "Barbados", "Bielorusko", "Belgicko", "Belize", "Benin", "Bermudy", "Bhután", "Bolívia", "Bosna a Hercegovina", "Botswana", "Brazília", "Brunej", "Bulharsko", "Burkina Faso", "Burundi",
    "Kapverdy", "Kambodža", "Kamerun", "Kanada", "Kajmanie ostrovy", "Stredoafrická republika", "Čad", "Čile", "Čína", "Kolumbia", "Komory", "Konžská demokratická republika", "Konžská republika", "Kostarika", "Pobrežie Slonoviny", "Chorvátsko", "Kuba", "Curaçao", "Cyprus", "Česká republika",
    "Dánsko", "Džibutsko", "Dominika", "Dominikánska republika",
    "Východný Timor", "Ekvádor", "Egypt", "Salvádor", "Rovníková Guinea", "Eritrea", "Estónsko", "Eswatini (Svazijsko)", "Etiópia",
    "Faerské ostrovy", "Fidži", "Fínsko", "Francúzsko", "Francúzska Guyana", "Francúzska Polynézia",
    "Gabon", "Gambia", "Pásmo Gazy", "Gruzínsko", "Nemecko", "Ghana", "Grécko", "Grónsko", "Grenada", "Guadeloupe", "Guam", "Guatemala", "Guernsey", "Guinea", "Guinea-Bissau", "Guyana",
    "Haiti", "Honduras", "Hongkong", "Maďarsko",
    "Island", "India", "Indonézia", "Irán", "Irak", "Írsko", "Ostrov Man", "Izrael", "Taliansko",
    "Jamajka", "Japonsko", "Jersey", "Jordánsko",
    "Kazachstan", "Keňa", "Kiribati", "Severná Kórea", "Južná Kórea", "Kosovo", "Kuvajt", "Kirgizsko",
    "Laos", "Lotyšsko", "Libanon", "Lesotho", "Libéria", "Líbya", "Lichtenštajnsko", "Litva", "Luxembursko",
    "Macao", "Madagaskar", "Malawi", "Malajzia", "Maldivy", "Mali", "Malta", "Marshallove ostrovy", "Martinik", "Mauritánia", "Maurícius", "Mayotte", "Mexiko", "Mikronézia", "Moldavsko", "Monako", "Mongolsko", "Čierna Hora", "Maroko", "Mozambik", "Mjanmarsko (Barma)",
    "Namíbia", "Nauru", "Nepál", "Holandsko", "Nová Kaledónia", "Nový Zéland", "Nikaragua", "Niger", "Nigéria", "Severné Macedónsko", "Severné Mariány", "Nórsko",
    "Omán",
    "Pakistan", "Palau", "Panama", "Papua-Nová Guinea", "Paraguaj", "Peru", "Filipíny", "Poľsko", "Portugalsko", "Portoriko",
    "Katar",
    "Réunion", "Rumunsko", "Rusko", "Rwanda",
    "Svätý Krištof a Nevis", "Svätá Lucia", "Svätý Vincent a Grenadíny", "Samoa", "San Maríno", "Svätý Tomáš a Princov ostrov", "Saudská Arábia", "Senegal", "Srbsko", "Seychely", "Sierra Leone", "Singapur", "Sint Maarten", "Slovensko", "Slovinsko", "Šalamúnove ostrovy", "Somálsko", "Južná Afrika", "Španielsko", "Srí Lanka", "Sudán", "Južný Sudán", "Surinam", "Švédsko", "Švajčiarsko", "Sýria",
    "Taiwan", "Tadžikistan", "Tanzánia", "Thajsko", "Togo", "Tonga", "Trinidad a Tobago", "Tunisko", "Turecko", "Turkménsko", "Tuvalu",
    "Uganda", "Ukrajina", "Spojené arabské emiráty", "Spojené kráľovstvo", "Spojené štáty", "Americké Panenské ostrovy", "Uruguaj", "Uzbekistan",
    "Vanuatu", "Vatikán", "Venezuela", "Vietnam",
    "Západný breh",
    "Jemen",
    "Zambia", "Zimbabwe"
  ];

  // Populate the dropdown menu
  const countryDropdown = document.getElementById("hospital-country");
  states.forEach((state) => {
    const option = document.createElement("option");
    option.value = state;
    option.textContent = state;
    countryDropdown.appendChild(option);
  });

  // Enable jumping to a state by typing the first letter
  countryDropdown.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();
    const options = Array.from(countryDropdown.options);
    const matchingOption = options.find(
      (option) => option.textContent.toLowerCase().startsWith(key)
    );
    if (matchingOption) {
      countryDropdown.value = matchingOption.value;
    }
  });

  // Back to List Button
  const backToListButton = document.getElementById("back-to-list-button");
  backToListButton.addEventListener("click", () => {
    window.location.href = "/hospitals"; // Replace with the correct route if needed
  });
});

document.getElementById("add-hospital-form").addEventListener("submit", function (event) {
  event.preventDefault(); // Prevent form submission

  // Collect form data
  const hospitalData = {
    name: document.getElementById("hospital-name").value.trim(),
    country: document.getElementById("hospital-country").value.trim(),
    city: document.getElementById("hospital-city").value.trim(),
    street: document.getElementById("hospital-street").value.trim(),
    postal_code: document.getElementById("hospital-psc").value.trim(),
    created_at: document.getElementById("hospital-created-at").value,
  };

  // Validate form data
  if (!hospitalData.name || !hospitalData.country || !hospitalData.city || !hospitalData.street || !hospitalData.postal_code) {
    alert("Vyplňte všetky polia!");
    return;
  }

  // Simulate saving the hospital data (replace this with an API call if needed)
  console.log("Hospital added:", hospitalData);
  alert("Nemocnica bola úspešne pridaná!");

  // Reset the form
  document.getElementById("add-hospital-form").reset();

  // Reset the date to the current date
  const currentDate = new Date().toISOString().split("T")[0];
  document.getElementById("hospital-created-at").value = currentDate;
  document.getElementById("hospital-created-at-display").value = currentDate;
});