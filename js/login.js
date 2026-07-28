const form = document.getElementById("loginForm");
const password = document.getElementById("password");
const toggle = document.getElementById("togglePassword");
const error = document.getElementById("errorMessage");
const eyeIcon = document.getElementById("eyeIcon");

const eyeOpen = `
<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/>
<circle cx="12" cy="12" r="3"/>
`;

const eyeClosed = `
<path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C5 20 1 12 1 12a21.81 21.81 0 0 1 5.06-6.94"/>
<path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a21.76 21.76 0 0 1-3.16 4.19"/>
<path d="M1 1l22 22"/>
`;

eyeIcon.innerHTML = eyeOpen;

toggle.addEventListener("click", () => {
// remove placeholder name and password once connected to backend
    if (password.type === "password") {

        password.type = "text";
        eyeIcon.innerHTML = eyeClosed;
        toggle.setAttribute("aria-label", "Hide password");

    } else {

        password.type = "password";
        eyeIcon.innerHTML = eyeOpen;
        toggle.setAttribute("aria-label", "Show password");

    }

});

form.addEventListener("submit", (e) => {

    e.preventDefault();

    const username = document.getElementById("username").value;
    const passwordValue = password.value;
// remove placeholder username and password once connected to backend
    if (username === "admin" && passwordValue === "password") {

        window.location.href = "pages/dashboard.html";

    } else {

        error.textContent = "Invalid username or password.";

    }

});