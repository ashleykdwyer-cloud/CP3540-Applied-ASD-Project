"use strict";

const API = {

    tasks: (workerId) =>
        `/api/tasks/workerId=${workerId}`,

    notifications: (workerId) =>
        `/api/notifications/recipientId=${workerId}`,

    timeLogs: (workerId) =>
        `/api/timelogs/workerId=${workerId}`,

    checkIns: (workerId) =>
        `/api/checkins/worker/${workerId}`,

    completeCheckIn: (checkInId) =>
        `/api/checkins/${checkInId}`,

    updateTask: (taskId) =>
        `/api/tasks/id=${taskId}`,

    updateStatus: (workerId) =>
        `/api/users/id=${workerId}`
};

let tasks = [];
let notifications = [];
let timeLogs = [];
let checkIns = [];

const loggedInUser = getLoggedInUser();

if (!loggedInUser || loggedInUser.role !== "worker") {
    window.location.href = "login.html";
}

const welcomeMessage = document.getElementById("welcomeMessage");
const logoutButton = document.getElementById("logoutButton");
const assignedTaskElement = document.getElementById("assignedTasks");
const completedTasksElement = document.getElementById("completedTasks");
const hoursTodayElement = document.getElementById("hoursToday");
const statusSelect = document.getElementById("workerStatus");
const taskList = document.getElementById("taskList");
const notificationList = document.getElementById("notificationList");
const timeLogList = document.getElementById("timeLogList")
const checkInList = document.getElementById("checkInList");
const checkInTemplate = document.getElementById("checkInTemplate")

logoutButton.addEventListener("click", logout);
statusSelect.addEventListener("change", updateWorkerStatus);


initializeDashboard();
async function initializeDashboard() {
    displayLoggedInWorker();
    await loadDashboardData();
}

async function loadDashboardData() {
    await Promise.all([
        loadTasks(),
        loadNotifications(),
        loadTimeLogs(),
        loadCheckIns()
    ]);
    updateSummaryCards();
}

// Update worker summary cards
function updateSummaryCards() {

    const assignedTasks =
        tasks.filter(
            (task) =>
                task.isCompleted !== true &&
                task.status !== "Completed"
        ).length;

    const completedTasks =
        tasks.filter(
            (task) =>
                task.isCompleted === true ||
                task.status === "Completed"
        ).length;

    let hoursToday = 0;

    timeLogs.forEach((timeLog) => {

        const duration =
            timeLog.duration ??
            (
                timeLog.startTime &&
                timeLog.endTime
                    ? (
                        new Date(timeLog.endTime) -
                        new Date(timeLog.startTime)
                    ) / (1000 * 60 * 60)
                    : 0
            );

        if (duration) {
            hoursToday += Number(duration);
        }
    });

    assignedTaskElement.textContent =
        assignedTasks;

    completedTasksElement.textContent =
        completedTasks;

    hoursTodayElement.textContent =
        hoursToday.toFixed(1);
}

// Update worker status
async function updateWorkerStatus() {
    const newStatus = statusSelect.value;

    try {
        const response = await fetch(
            API.updateStatus(loggedInUser.userId),
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    status: newStatus
                })
            }
        );

        const result = await readJsonResponse(response);

        if (!response.ok) {
            throw new Error(
                result.message ||
                "Worker status could not be updated."
            );
        }

        console.log("Worker status updated:", newStatus);

    } catch (error) {
        console.error(
            "Status update error:",
            error
        );

        alert(error.message);
    }
}

function displayLoggedInWorker() {
    const workerName = loggedInUser.userName || "Worker";
    welcomeMessage.textContent = `Welcome, ${workerName}`;
}

//Loading tasks
async function loadTasks() {
    try {
        const response = await fetch(
            API.tasks(loggedInUser.userId)
        );

        const result = await readJsonResponse(response);

        if (!response.ok) {
            throw new Error(result.message || "Tasks could not be loaded.");
        }

        tasks = result;

        displayTasks(tasks);

    } catch (error) {
        console.error("Task loading error:", error);

        tasks = [];

        taskList.innerHTML = `
            <p class="error-message">
            ${escapeHtml(error.message)}
            </p>
        `;
    }
}

// Load check-in requests for the logged-in worker
async function loadCheckIns() {
    try {
        const response = await fetch(
            API.checkIns(loggedInUser.userId)
        );

        const result = await readJsonResponse(response);

        if (!response.ok) {
            throw new Error(
                result.message ||
                "Check-in requests could not be loaded."
            );
        }

        checkIns = result;

        displayCheckIns();

    } catch (error) {
        console.error(
            "Check-in loading error:",
            error
        );

        checkIns = [];

        checkInList.innerHTML = `
            <p class="error-message">
                ${escapeHtml(error.message)}
            </p>
        `;
    }
}

// Display check-in requests
function displayCheckIns() {
    checkInList.innerHTML = "";

    if (!Array.isArray(checkIns)) {
        checkInList.innerHTML = `
            <p class="error-message">
                The check-in information is invalid.
            </p>
        `;

        return;
    }

    const pendingCheckIns = checkIns.filter(
        (checkIn) =>
            normalizeText(checkIn.status) === "pending"
    );

    if (pendingCheckIns.length === 0) {
        checkInList.innerHTML = `
            <p class="empty-message">
                No pending check-in requests.
            </p>
        `;

        return;
    }

    pendingCheckIns.forEach((checkIn) => {
        const checkInCard = document.createElement("div");

        checkInCard.className = "checkin-card";

        checkInCard.innerHTML = `
            <h3>Check-In Request</h3>

            <p>
                Your supervisor has requested a check-in.
            </p>

            <p class="checkin-time">
                Requested:
                ${formatDateTime(checkIn.requestedAt)}
            </p>

            <button class="checkin-button">
                Check In
            </button>
        `;

        const checkInButton =
            checkInCard.querySelector(".checkin-button");

        checkInButton.addEventListener(
            "click",
            () => completeCheckIn(checkIn._id)
        );

        checkInList.appendChild(checkInCard);
    });
}

//Start task
async function startTask(taskId) {
    try {
        const response = await fetch(API.updateTask(taskId), {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                status: "In Progress"
            })
        });

        if (!response.ok) {
            throw new Error("Failed to start task.");
        }

        await loadTasks();
        updateSummaryCards();

    }
    catch (error) {
        console.error(error);
        alert("Unable to start task.");
    }
}

//Complete task - mark task as completed
async function completeTask(taskId) {
    const task =
        tasks.find(
            (currentTask) =>
                currentTask._id === taskId      
        );

    if (!task) {
        window.alert("The selected task could not be found.");

        return;
    }

    if (task.isCompleted === true) {
        window.alert(
            "This task is already completed."
        );

        return;
    }

    const confirmed = 
        window.confirm(
            `Mark Task #${task.taskNumber} as completed?`
        );

    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(
            API.updateTask(taskId),
            {
                method: "PUT",
                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    isCompleted: true
                })
            }
        );

        const result =
            await readJsonResponse(response);

        if (!response.ok) {
            throw new Error(
                result.message ||
                "The task could not be completed."
            );
        }

        await loadTasks();

        updateSummaryCards();

    } catch (error) {
        console.error(
            "Task completion error:",
            error
        );

        window.alert(error.message);
    }
}

// Complete a check-in request
async function completeCheckIn(checkInId) {
    if (!checkInId) {
        window.alert(
            "The check-in request ID is missing."
        );

        return;
    }

    try {
        const response = await fetch(
            API.completeCheckIn(checkInId),
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

        const result = await readJsonResponse(response);

        if (!response.ok) {
            throw new Error(
                result.message ||
                "The check-in could not be completed."
            );
        }

        window.alert(
            "Check-in completed successfully."
        );

        await loadCheckIns();

    } catch (error) {
        console.error(
            "Check-in completion error:",
            error
        );

        window.alert(error.message);
    }
}

function getLoggedInUser(){
    const savedUser = localStorage.getItem("loggedInUser");

    if (!savedUser) {
        return null;
    }

    try {
        return JSON.parse(savedUser);

    } catch (error) {
        console.error("Unable to find login information", error);

        localStorage.removeItem(
            "loggedInUser"
        );

        return null;
    }
}

//Display tasks
function displayTasks(taskData) {
    taskList.innerHTML = "";

    if (!Array.isArray(taskData)) {
        taskList.innerHTML = `
            <p class="error-message">
                The task information is invalid.
            </p>
        `;

        return;
    }

    if (taskData.length === 0) {
        taskList.innerHTML = `
            <p class="empty-message">
                No tasks were found.
            </p>
        `;

        return;
    }

    taskData.forEach((task) => {
        const taskFragment = 
            taskTemplate.content.cloneNode(true);
        
        const taskCard = 
            taskFragment.querySelector(
                ".task-card"
            );
        
        const taskNumberElement = 
            taskFragment.querySelector(
                ".task-title"
            );

        const taskStatusElement = 
            taskFragment.querySelector(
                ".task-status" 
            );

        const taskDescriptionElement =
            taskFragment.querySelector(
                ".task-description"
            );

        const taskWorkerElement =
            taskFragment.querySelector(
                ".task-supervisor"
            );

        const completeButton =
            taskFragment.querySelector(
                ".complete-btn"
            );

        const startButton =
            taskFragment.querySelector(
                ".start-btn"
            );

        taskNumberElement.textContent = 
            `Task #${task.taskNumber}`;
        
        taskDescriptionElement.textContent =
            task.description;

        taskWorkerElement.textContent =
            `Assigned by: ${task.supervisorName}`;

        if (task.requiredSkill) {
            const skillElement = 
                document.createElement("p");

            skillElement.className =
                "task-required-skill";

            skillElement.textContent = 
                `Required skill: ${task.requiredSkill}`;

            taskWorkerElement.insertAdjacentElement(
                "afterend", skillElement
            );
        }

        switch(task.status) {
            case "Pending":
                taskStatusElement.textContent = "Pending";
                startButton.style.display = "inline-block";
                completeButton.style.display = "none";
                startButton.addEventListener("click", () => startTask(task._id));
                break;

            case "In Progress":
                taskStatusElement.textContent = "In Progress";
                startButton.style.display = "none";
                completeButton.style.display = "inline-block";
                completeButton.addEventListener("click", () => completeTask(task._id));
                break;

            case "Completed":
                taskStatusElement.textContent = "Completed";
                startButton.style.display = "none";
                completeButton.style.display = "inline-block";
                completeButton.textContent = "Completed";
                completeButton.disabled = true;
                break;
            
            default:
                taskStatusElement.textContent = "Unknown";
                startButton.style.display = "none";
                completeButton.style.display = "none";
                break;
        }

        taskList.appendChild(taskFragment);
    });
}

// Load notifications
async function loadNotifications() {
    try {
        const response = await fetch(
            API.notifications(loggedInUser.userId)
        );

        const result = await readJsonResponse(response);

        if (!response.ok) {
            throw new Error(
                result.message ||
                "Notifications could not be loaded."
            );
        }

        notifications = result;

        displayNotifications();

    } catch (error) {
        console.error(
            "Notification loading error:",
            error
        );

        notifications = [];

        notificationList.innerHTML = `
            <p class="error-message">
                ${escapeHtml(error.message)}
            </p>
        `;
    }
}

function displayNotifications() {
    notificationList.innerHTML = "";

    if (!Array.isArray(notifications)) {
        notificationList.innerHTML = `
            <p class="error-message">
                The notification information is invalid.
            </p>
        `;

        return;
    }

    if (notifications.length === 0) {
        notificationList.innerHTML = `
            <p class="empty-message">
                There are no notifications.
            </p>
        `;

        return;
    }

//Show newest notifications first.
    const sortedNotifications = 
        [...notifications].sort(
            (firstNotification, secondNotification) => {
                const firstDate =
                    new Date(
                        firstNotification.createdAt || 0
                    );

                const secondDate = 
                    new Date(
                        secondNotification.createdAt || 0
                    );

                return secondDate - firstDate;
            }
        );

    sortedNotifications.forEach(
        (notification) => {
            const notificationFragment = 
                notificationTemplate
                    .content
                    .cloneNode(true);

            const notificationCard =
                notificationFragment.querySelector(
                    ".notification-card"
                );

            const notificationMessageElement = 
                notificationFragment.querySelector(
                    ".notification-message"
                );

            
            const notificationDateElement =
                notificationFragment.querySelector(
                    ".notification-date"
                );

            notificationMessageElement.textContent =
                notification.content || "Notification";

             notificationDateElement.textContent =
                formatDateTime(
                    notification.createdAt
                );

            const notificationStatus =
                normalizeText(
                    notification.status || ""
                );

            if (
                notificationStatus === "unread" ||
                notificationStatus === "new"
            ) {
                notificationCard.classList.add(
                    "unread-notification"
                );
            }

            if (
                notificationStatus === "read" ||
                notificationStatus === "acknowledged"
            ) {
                notificationCard.classList.add(
                    "read-notification"
                );
            }

            notificationList.appendChild(
                notificationFragment
            );
        }
    );
    }

// Load time logs for the logged-in worker
async function loadTimeLogs() {
    try {
        const response = await fetch(
            API.timeLogs(loggedInUser.userId)
        );

        const result = await readJsonResponse(response);

        if (!response.ok) {
            throw new Error(
                result.message ||
                "Time logs could not be loaded."
            );
        }

        timeLogs = result;

        displayTimeLogs();

    } catch (error) {
        console.error(
            "Time log loading error:",
            error
        );

        timeLogs = [];

        timeLogList.innerHTML = `
            <p class="error-message">
                ${escapeHtml(error.message)}
            </p>
        `;
    }
}

//Display time logs - most recent time logs
function displayTimeLogs() {
    timeLogList.innerHTML = "";

    if (!Array.isArray(timeLogs)) {
        timeLogList.innerHTML = `
            <p class="error-message">
                The time log information is invalid.
            </p>
        `;

        return;
    }

    if (timeLogs.length === 0) {
        timeLogList.innerHTML = `
            <p class="empty-message">
                No time logs were found.
            </p>
        `;

        return;
    }

    const sortedTimeLogs =
        [...timeLogs].sort(
            (firstLog, secondLog) => {
                const firstDate =
                    new Date(
                        firstLog.createdAt ||
                        firstLog.startTime ||
                        0
                    );

                const secondDate =
                    new Date(
                        secondLog.createdAt ||
                        secondLog.startTime ||
                        0
                    );

                return secondDate - firstDate;
            }
        );

    //only display ten most recent logs.
    const recentTimeLogs = 
        sortedTimeLogs.slice(0, 10);

    recentTimeLogs.forEach((timeLog) => {
        const timeLogFragment =
            timeLogTemplate.content.cloneNode(true);

        const workerElement = 
            timeLogFragment.querySelector(
                ".timelog-worker"
            );

        const taskElement =
            timeLogFragment.querySelector(
                ".timelog-task"
            );

        const hoursElement =
            timeLogFragment.querySelector(
                ".timelog-hours"
            );

        taskElement.textContent =
            `Task #${timeLog.taskNumber}`;
        
        const duration = timeLog.duration ?? (
            timeLog.startTime && timeLog.endTime 
                ? (
                    new Date(timeLog.endTime) - new Date(timeLog.startTime)
                ) / (1000 * 60 * 60)
                : null
        );
        
        hoursElement.textContent =
            duration !== null
                ? `Time worked: ${duration} hours`
                : "Time worked: unavailable";

        if (timeLog.notes) {
            const notesElement =
                document.createElement("p");

            notesElement.className =
                "timelog-notes";

            notesElement.textContent =
                `Notes: ${timeLog.notes}`;

            hoursElement.insertAdjacentElement(
                "afterend",
                notesElement
            );
        }

        timeLogList.appendChild(
            timeLogFragment
        );
    });
}

//Logout
function logout() {
    const confirmed =
        window.confirm(
            "Are you sure you want to log out?"
        );

    if (!confirmed) {
        return;
    }

    localStorage.removeItem(
        "loggedInUser"
    );

    window.location.replace(
        "../login.html"
    );
}

//API repsonse
async function readJsonResponse(response) {
    const contentType =
        response.headers.get(
            "content-type"
        );

    if (
        contentType &&
        contentType.includes(
            "application/json"
        )
    ) {
        return response.json();
    }

    return {};
}

function normalizeText(value) {
    return String(value ?? "")
        .trim()
        .toLowerCase();
}

//Date formatting
function formatDateTime(value) {
    if (!value) {
        return "";
    }

    const date =
        new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return date.toLocaleString(
        "en-CA",
        {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit"
        }
    );
}

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

