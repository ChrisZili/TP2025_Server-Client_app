document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("btn-login");
  const registerBtn = document.getElementById("btn-register");

  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      window.location.href = "/login";
    });
  }

  if (registerBtn) {
    registerBtn.addEventListener("click", () => {
      window.location.href = "/register";
    });
  }
});
