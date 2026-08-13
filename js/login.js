"use strict";
console.log("login.js loaded");

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

// show / hide password
toggle.addEventListener("click", () => {
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

// login
form.addEventListener("submit", async (e) => {

    e.preventDefault();

    console.log("Login form submitted");

    const username = document.getElementById("username").value.trim();
    const passwordValue = password.value;

    console.log("Sending login request...");

    if (!username || !passwordValue) {
        error.textContent = "Please enter your username and password."
        return;
    }

    try {

        const response = await fetch("/api/users/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                userName: username,
                password: passwordValue
            })
        });

        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(
                result.message || "Invalid username or password."
            );
        }

        //store logged in user info 
        const loggedInUser = {
            userId: result.userId,
            userName: result.userName,
            role: result.role
        };

        localStorage.setItem(
            "loggedInUser",
            JSON.stringify(loggedInUser)
        );

        //redirect based on user role
        switch (loggedInUser.role) {

            case "worker":
                window.location.href = "/worker-dashboard.html";
                break;

            case "supervisor":
                window.location.href = "/supervisor-dashboard.html";
                break;

            case "administrator":
                window.location.href = "/admin.html";
                break;

            default:
                localStorage.removeItem("loggedInUser");
                error.textContent = "Your account has an invalid role.";
                break;
        }

    } catch (err) {
        console.error("Login error:", err);

        error.textContent = err.message || "Unable to log in.";
    }

});