const API = 'http://localhost:3000/api';

//get logged in user from localstorage
const storedUser = localStorage.getItem("loggedInUser");

if (!storedUser) {
    window.location.href = "/login.html";
}

let loggedInUser;

try {
    loggedInUser = JSON.parse(storedUser);
} catch (error) {
    console.error("Invalid logged-in user data.");
    localStorage.removeItem("loggedInUser");
    window.location.href = "/login.html";
}

// Redirect if not administrator
if (
    !loggedInUser ||
    loggedInUser.role !== "administrator"
) {
    window.location.href = "/login.html";
}

const userId = loggedInUser.userId;
const username = loggedInUser.userName;
const role = loggedInUser.role;

document.getElementById("navUsername").textContent =
    username || "Admin";

// Store all users for filtering
let allUsers = [];

// LOAD USERS ON PAGE LOAD
window.onload = () => {
    loadUsers();
};

// LOAD ALL USERS
const loadUsers = async () => {
    try {
        const res = await fetch(`${API}/users`);
        const users = await res.json();
        allUsers = users;
        updateSummaryCards(users);
        renderUsers(users);
    } catch (err) {
        console.error('Failed to load users:', err);
        document.getElementById('userTableBody').innerHTML =
            '<tr><td colspan="5" class="empty-row">Failed to load users.</td></tr>';
    }
};

// UPDATE SUMMARY CARDS
const updateSummaryCards = (users) => {
    document.getElementById('totalUsers').textContent = users.length;
    document.getElementById('totalWorkers').textContent =
        users.filter(u => u.role === 'worker').length;
    document.getElementById('totalSupervisors').textContent =
        users.filter(u => u.role === 'supervisor').length;
    document.getElementById('totalAdmins').textContent =
        users.filter(u => u.role === 'administrator').length;
};

// RENDER USERS TABLE 
const renderUsers = (users) => {
    const tbody = document.getElementById('userTableBody');
    if (!users || users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-row">No users found.</td></tr>';
        return;
    }
    tbody.innerHTML = users.map(user => `
        <tr>
            <td>${user.name || '—'}</td>
            <td style="color:#718096">${user.userName || '—'}</td>
            <td><span class="role-badge role-${user.role}">${capitalise(user.role)}</span></td>
            <td><span class="status-badge status-${user.status}">${user.status || 'Available'}</span></td>
            <td>
                <button class="btn-edit" onclick="openEditModal('${user._id}', '${user.userName}', '${user.role}')">Edit</button>
                <button class="btn-delete" onclick="deleteUser('${user._id}', '${user.userName}')">Delete</button>
            </td>
        </tr>
    `).join('');
};

// FILTER USERS 
const filterUsers = () => {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const roleFilter = document.getElementById('roleFilter').value;

    const filtered = allUsers.filter(user => {
        const matchSearch = !search ||
            (user.userName || '').toLowerCase().includes(search);
        const matchRole = !roleFilter || user.role === roleFilter;
        return matchSearch && matchRole;
    });

    renderUsers(filtered);
};

// CREATE USER MODAL
const openCreateModal = () => {
    document.getElementById('createName').value = '';
    document.getElementById('createUsername').value = '';
    document.getElementById('createPassword').value = '';
    document.getElementById('createRole').value = 'worker';
    document.getElementById('createError').textContent = '';
    document.getElementById('createModal').classList.remove('hidden');
};

const createUser = async () => {
    const name     = document.getElementById('createName').value.trim();
    const uname    = document.getElementById('createUsername').value.trim();
    const password = document.getElementById('createPassword').value.trim();
    const userRole = document.getElementById('createRole').value;
    const errorEl  = document.getElementById('createError');

    if (!name || !uname || !password) {
        errorEl.textContent = 'All fields are required.';
        return;
    }

    try {
        const res = await fetch(`${API}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: name,
                userName: uname,
                passwordHash: password,
                skillSet: 'N/A',
                status: 'Available',
                role: userRole,
                userId: Date.now()
            })
        });

        const data = await res.json();

        if (!res.ok) {
            errorEl.textContent = data.message || 'Failed to create user.';
            return;
        }

        closeModal('createModal');
        showToast(`User "${uname}" created successfully`);
        loadUsers();
    } catch (err) {
        errorEl.textContent = 'Something went wrong. Please try again.';
        console.error(err);
    }
};

// EDIT USER MODAL 
const openEditModal = (id, name, userRole) => {
    document.getElementById('editUserId').value = id;
    document.getElementById('editName').value = name;
    document.getElementById('editUsername').value = name;
    document.getElementById('editRole').value = userRole;
    document.getElementById('editError').textContent = '';
    document.getElementById('editModal').classList.remove('hidden');
};

const updateUser = async () => {
    const id       = document.getElementById('editUserId').value;
    const uname    = document.getElementById('editUsername').value.trim();
    const userRole = document.getElementById('editRole').value;
    const errorEl  = document.getElementById('editError');

    if (!uname) {
        errorEl.textContent = 'Username is required.';
        return;
    }

    try {
        const res = await fetch(`${API}/users/id=${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userName: uname, role: userRole })
        });

        if (!res.ok) {
            errorEl.textContent = 'Failed to update user.';
            return;
        }

        closeModal('editModal');
        showToast(`User updated successfully`);
        loadUsers();
    } catch (err) {
        errorEl.textContent = 'Something went wrong. Please try again.';
        console.error(err);
    }
};

// DELETE USER 
const deleteUser = async (id, name) => {
    const confirmed = confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`);
    if (!confirmed) return;

    try {
        await fetch(`${API}/users/id=${id}`, { method: 'DELETE' });
        showToast(`User "${name}" deleted`);
        loadUsers();
    } catch (err) {
        console.error('Failed to delete user:', err);
    }
};

// HELPERS 
const closeModal = (id) => {
    document.getElementById(id).classList.add('hidden');
};

const showToast = (message) => {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 3000);
};

const capitalise = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
};

const logout = () => {
    localStorage.removeItem("loggedInUser");
    window.location.href = '/login.html';
};