"use strict";

//API routes
const API = {
    tasks: "/api/tasks",
    workers: "/api/users/role=worker",
    notifications: (recipientId) => `/api/notifications/recipientId=${recipientId}`,
    timeLogs: "/api/timelogs",
    updateTask: (taskId) => `/api/tasks/id=${taskId}`,
    deleteTask: (taskId) => `/api/tasks/id=${taskId}`,
};

//Dashboard data
let tasks = [];
let workers = [];
let notifications = [];
let timeLogs = [];

//Logged-in user
const loggedInUser = getLoggedInUser();

if (!loggedInUser || loggedInUser.role !== "supervisor") {
    window.location.href = "/login.html";
}

//HTML element references
const logoutButton = document.getElementById("logoutButton");


//Summary card elements
const totalTasksElement = document.getElementById("totalTasks");
const activeTasksElement = document.getElementById("activeTasks");
const completedTasksElement = document.getElementById("completedTasks");
const availableWorkersElement = document.getElementById("availableEmployees");

//Task form elements
const taskForm = document.getElementById("taskForm");
const taskNumberInput = document.getElementById("taskNumber");
const descriptionInput = document.getElementById("taskDescription");
const requiredSkillSelect = document.getElementById("requiredSkill");
const workerSelect = document.getElementById("workerId");
const taskMessage = document.getElementById("taskMessage");

//Task list elements
const searchTasksInput = document.getElementById("searchTasks");
const taskList = document.getElementById("taskList");

//Worker, notification, and time log elements
const workerList = document.getElementById("workerList");
const notificationList = document.getElementById("notificationList");
const timeLogList = document.getElementById("timeLogList");

//HTML templates
const taskTemplate = document.getElementById("taskTemplate");
const workerTemplate = document.getElementById("workerTemplate");
const notificationTemplate = document.getElementById("notificationTemplate");
const timeLogTemplate = document.getElementById("timeLogTemplate");

//Event listeners
taskForm.addEventListener("submit", createTask);

searchTasksInput.addEventListener("input", handleTaskSearch);

logoutButton.addEventListener("click", logout);

//Initialize dashboard
initializeDashboard();

async function initializeDashboard() {
    displayLoggedInSupervisor();

    setLoadingMessage();

    await loadDashboardData();
}

//Display logged-in supervisor's name
function displayLoggedInSupervisor() {
    const supervisorName = loggedInUser.userName || "Supervisor";

    loggedInUserElement.textContent = `Welcome, ${supervisorName}`;
}

//Load information for dashboard
async function loadDashboardData() {
    await Promise.all([
        loadWorkers(),
        loadTasks(),
        loadNotifications(),
        loadTimeLogs()
    ]);

    updateSummaryCards();
}

//Load workers - retrieves all users whose role is "worker".
async function loadWorkers() {
    try {
        const response = await fetch( API.workers);

        const result = await readJsonResponse(response);

        if (!response.ok) {
            throw new Error(result.message || "Workers could not be loaded.");
        }

        workers = result;
        displayWorkers();
        populateWorkerSelect();
    
    } catch (error) {
        console.error("Worker loading error:",
            error);
        
        workers = [];

        workerList.innerHTML = `
        <p class="error-message">
            ${escapeHTML(error.message)}
        </p> 
        `;

        populateWorkerSelect();
    }
}

//Load tasks - retrieves all tasks from the backend
async function loadTasks() {
    try {
        const response = await fetch(
            API.tasks
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
            ${escapeHTML(error.message)}
            </p>
        `;
    }
}

//Load notifications - retrieves notifications belonging to the logged-in supervisor.
async function loadNotifications() {
    const supervisorId = loggedInUser.userId;

    if (
        supervisorId === undefined || supervisorId === null){
            notifications = [];

            notificationList.innerHTML = `
            <p class="error-message">
                The logged-in supervisor does not have a user ID.
            </p>
            `;

            return;
        }

        try {
            const response = await fetch(API.notifications(supervisorId));

            const result = await readJsonResponse(response);

            if (!response.ok) {
                throw new Error(result.message || "Notifications could not be loaded.");
            }

            notifications = result;

            displayNotifications();
        
        } catch (error) {
            console.error("Notification loading error:", error);
        
            notifications = [];

            notificationList.innerHTML= `
            <p class="error-message"> 
            ${escapeHTML(error.message)}
            </p>
            `;
        }
}

//Load time logs - retrieves time logs 

async function loadTimeLogs() {
    try {
        const response = await fetch(
            API.timeLogs
        );

        const result = await readJsonResponse(response);

        if (!response.ok) {
            throw new Error(
                result.message || "Time logs could not be loaded."
            );
        }

        timeLogs = result;

        displayTimeLogs();

    }   catch (error) {
            console.error("Time log loading error:", error);

            timeLogs = [];

            timeLogList.innerHTML = `
                <p class="error-message">
                    ${escapeHTML(error.message)}
                </p>
            `;
    }
}

//Login storage- retrieves the logged in user from local storage.
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

//Create and assign task
async function createTask(event) {
    event.preventDefault();

    clearTaskMessage();

    const taskNumber = Number(taskNumberInput.value);

    const description = descriptionInput.value.trim();

    const requiredSkill = requiredSkillSelect.value.trim();

    const workerId = Number(workerSelect.value);

    //Validate form value
    if(!Number.isInteger(taskNumber) || taskNumber < 1){
        showTaskMessage("Enter a valid work order number.", "error");

        taskNumberInput.focus();

        return;
    }

    if(!description) {
        showTaskMessage("Enter work order description", "error");

        descriptionInput.focus();

        return;
    }

    if(!requiredSkill) {
        showTaskMessage("Select the skill required for this task.", "error");

        requiredSkillSelect.focus();

        return;
    }

    if(!Number.isInteger(workerId)) {
        showTaskMessage("Select a worker.", "error");

        workerSelect.focus();

        return;
    }

//Find the worker
const selectedWorker = workers.find((worker) => Number(worker.userId) === workerId);

//Check whether the worker can receive the task
const eligibility = checkWorkerEligibility(selectedWorker, requiredSkill);

if (!eligibility.eligible) {
    showTaskMessage(eligibility.message, "error");

    return;
}

const newTask = {taskNumber, description, workerId, requiredSkill, isCompleted: false};

const submitButton = taskForm.querySelector('button[type="submit"]');

submitButton.disabled = true;
submitButton.textContent = "Assigning Task...";

try {
    const response = await fetch(API.tasks,
        {
            method: "POST",
            headers: {"Content-Type": "application/json"
            },
            body: JSON.stringify(newTask)   
        }
    );

    const result = await readJsonResponse(response);

    if (!response.ok) {
        throw new Error(
            result.message || "The task could not be created."
        );
    }

    showTaskMessage(
        `Task assigned to ${selectedWorker.userName}.`, "success"
    );

    taskForm.reset(); 

    await Promise.all([
        loadTasks(), loadWorkers()
    ]);

    updateSummaryCards();

} catch (error) {
    console.error("Task creation error:", error);

    showTaskMessage(error.message, "error");

} finally {
    submitButton.disabled = false;
    submitButton.textContent = "Assign Task";
    }
}

//Check worker eligibility - checks whether a worker can be assigned to a task.
function checkWorkerEligibility(
    worker,requiredSkill
) {
    if (!worker) {
        return {
            eligible: false,
            message: "The selected worker could not be found."
        };
    }

    const workerStatus = 
        String(worker.status || "").trim().toLowerCase();

    if (workerStatus !== "available") {
        return {
            eligible: false,
            message: `${worker.userName} cannot be assigned because their status is ${worker.status}.`
        };
    }

    if (!workerHasRequiredSkill(
        worker, requiredSkill
        )
    ) {return {
        eligible: false,
        message: `${worker.userName} does not have the required ${requiredSkill} skill.`
        };
    }

    if (workerHasUnfinishedTask(worker.userId)) {
        return {
            eligible: false,
            message: `${worker.userName} is already assigned to an active task.`
        };
    }

    return {
        eligible: true,
        message: `${worker.userName} is eligible for this task.`
    };
}

//Check whether a worker has required skill
function workerHasRequiredSkill(
    worker, requiredSkill
) {
    const required = normalizeText(requiredSkill);

    if (!required) {
        return false;
    }

    if (Array.isArray(worker.skillSet)) {
        return worker.skillSet.some(
            (skill) =>
                normalizeText(skill) === required || normalizeText(skill).includes(required)
        );
    }

    const workerSkills =
        normalizeText(worker.skillSet);
    
    return workerSkills.includes(required);
}

//Checks whether a worker has an unfinished task.
function workerHasUnfinishedTask(workerId) {
    return tasks.some(
        (task) => 
            Number(task.workerId) ===
                Number(workerId) &&
            task.isCompleted !== true
    );
}

//Task search
function handleTaskSearch() {
    const searchValue =
        normalizeText(searchTasksInput.value);
    
    if (!searchValue) {
        displayTasks(tasks);

        return
    }

    const filteredTasks = 
        tasks.filter((task) => {
            const taskNumber = 
                normalizeText(task.taskNumber);
            
            const description =
                normalizeText(task.description);
            
            const requiredSkill =
                normalizeText(task.requiredSkill);

            const workerName =
                normalizeText(getWorkerName(task.workerId));

            const workerId =
                normalizeText(task.workerId);
            
            const status =
                task.isCompleted ? "completed" : "active";
            
            return (
                taskNumber.includes(
                    searchValue
                ) || 
                description.includes(
                    searchValue
                ) ||
                requiredSkill.includes(
                    searchValue
                ) ||
                workerName.includes(
                    searchValue
                ) ||
                workerId.includes(
                    searchValue
                ) ||
                status.includes(
                    searchValue
                )
            );
        });
    
    displayTasks(filteredTasks);
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

        await Promise.all([
            loadTasks(),
            loadWorkers()
        ]);

        updateSummaryCards();

    } catch (error) {
        console.error(
            "Task completion error:",
            error
        );

        window.alert(error.message);
    }
}

//Delete task
async function deleteTask(taskId) {
    const task = 
        tasks.find(
           (currentTask) =>
                currentTask._id === taskId 
        );

    if (!task) {
        window.alert(
            "The selected task could not be found."
        );

        return;
    }

    const confirmed = 
        window.confirm(
            `Delete Task #${task.taskNumber}? This action cannot be undone.`
        );

    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(
            API.deleteTask(taskId),
            {
                method: "DELETE"
            }
        );

        const result = 
            await readJsonResponse(response);

        if (!response.ok) {
            throw new Error(
                result.message ||
                "The task could not be deleted."
            );
        }

        await Promise.all([
            loadTasks(),
            loadWorkers()
        ]);

        updateSummaryCards();

    } catch (error) {
        console.error(
            "Task deletion error:",
            error
        );

        window.alert(error.message);
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
                ".task-number"
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
                ".task-worker"
            );

        const completeButton =
            taskFragment.querySelector(
                ".complete-btn"
            );

        const deleteButton =
            taskFragment.querySelector(
                ".delete-btn"
            );

        const workerName =
            getWorkerName(task.workerId);

        taskNumberElement.textContent = 
            `Task #${task.taskNumber}`;
        
        taskDescriptionElement.textContent =
            task.description;

        taskWorkerElement.textContent =
            `Assigned to: ${workerName}`;

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

        if (task.isCompleted === true) {
            taskStatusElement.textContent =
                "Completed";

            taskStatusElement.classList.add(
                "completed-status"
            );

            taskCard.classList.add(
                "completed-task"
            );

            completeButton.textContent =
                "Completed";

            completeButton.disabled = true;

        } else {
            taskStatusElement.textContent =
                "Active";

            taskStatusElement.classList.add(
                "active-status"
            );

            completeButton.textContent =
                "Complete";

            completeButton.disabled = false;
        }

        completeButton.addEventListener(
            "click",
            () => completeTask(task._id)
        );

        deleteButton.addEventListener(
            "click",
            () => deleteTask(task._id)
        );

        taskList.appendChild(taskFragment);
    });
}

//Display workers - displays workers and current status.
function displayWorkers() {
    workerList.innerHTML = "";

    if (!Array.isArray(workers)) {
        workerList.innerHTML = `
            <p class="error-message">
                The worker information is invalid.
            </p>
        `;

        return;
    }

    if (workers.length === 0) {
        workerList.innerHTML = `
            <p class="empty-message">
                No workers were found.
            </p>
        `;

        return;
    }

    workers.forEach((worker) => {
        const workerFragment =
            workerTemplate.content.cloneNode(true);

        const workerCard = 
            workerFragment.querySelector(
                ".worker-card"
            );

        const workerNameElement = 
            workerFragment.querySelector(
                ".worker-name"
            );

        const workerSkillElement = 
            workerFragment.querySelector(
                ".worker-skill"
            );

        const workerStatusElement = 
            workerFragment.querySelector(
                ".worker-status"
            );

        workerNameElement.textContent = 
            worker.userName || "Unnamed worker";

        workerSkillElement.textContent = 
            `Skill set: ${
                worker.skillSet ||
                "Not entered"
            }`;

        workerStatusElement.textContent = 
            `Status: ${
                worker.status ||
                "Unknown"
            }`;

        const normalizedStatus = 
            normalizeText(worker.status);

        if (normalizedStatus === "available") {
            workerCard.classList.add(
                "available-worker"
            );
        }

        if (
            normalizedStatus === "busy" ||
            normalizedStatus === "on task" ||
            normalizedStatus === "assigned"
        ) {
            workerCard.classList.add(
                "busy-worker"
            );
        }

        if (
            normalizedStatus === "off shift" ||
            normalizedStatus === "unavailable"
        ) {
            workerCard.classList.add(
                "unavailable-worker"
            );
        }

        workerList.appendChild(workerFragment);
    });
}


//Worker dropdown
function populateWorkerSelect() { 
    workerSelect.innerHTML = `
        <option value="">
            Select Worker
        </option>
    `;

    workers.forEach((worker) => {
        const option =
            document.createElement("option");

        option.value = worker.userId;

        option.textContent = 
        `${worker.userName} = ` +
        `${worker.status}`;

        const workerStatus = 
            normalizeText(worker.status);

        if (workerStatus !== "available") {
            option.disabled = true;

            option.textContent +=
            " (Unavailable)";
        }

        workerSelect.appendChild(option);
    });
}

//Display notifications
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
                    notification.status
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

        workerElement.textContent =
            getWorkerName(timeLog.workerId);

        taskElement.textContent =
            `Task #${timeLog.taskNumber}`;

        const duration =
            timeLog.startTime && timeLog.endTime
                ? (new Date(timeLog.endTime) - new Date(timeLog.startTime))
                / (1000 * 60 * 60)
                : null;

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

//Summary cards
function updateSummaryCards() {
    const totalTasks =
        tasks.length;

    const completedTasks =
        tasks.filter(
            (task) =>
                task.isCompleted === true
        ).length;

    const activeTasks =
        totalTasks - completedTasks;

    const availableWorkers =
        workers.filter(
            (worker) =>
                normalizeText(worker.status) ===
                "available"
        ).length;

    totalTasksElement.textContent =
        totalTasks;

    activeTasksElement.textContent =
        activeTasks;

    completedTasksElement.textContent =
        completedTasks;

    availableWorkersElement.textContent =
        availableWorkers;
}


//Worker lookup
function getWorkerName(workerId) {
    const matchingWorker =
        workers.find(
            (worker) =>
                Number(worker.userId) ===
                Number(workerId)
        );

    if (!matchingWorker) {
        return `Worker ${workerId}`;
    }

    return matchingWorker.userName;
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

function escapeHTML(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}