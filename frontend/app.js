//state management, DOM targets
let tasks = [];
let currentFilter = 'all';
let currentSort = 'none';

let loggedInUserId = localStorage.getItem('userId') || null;
let loggedInUserEmail = localStorage.getItem('userEmail') || null;

const pageBody = document.getElementById('page-body');
const authContainer = document.getElementById('auth-container');
const appContainer = document.getElementById('app-container');
const authForm = document.getElementById('auth-form');
const authEmail = document.getElementById('email');
const authPassword = document.getElementById('pass');
const authSubmitBtn = document.getElementById('submit-btn');
const authTitle = document.getElementById('auth-title');
const authSubtitle = document.getElementById('auth-subtitle');
const authErrorMessage = document.getElementById('auth-error-message');
const authToggleLink = document.getElementById('auth-toggle-link');
const authToggleText = document.getElementById('auth-toggle-text');
const logoutBtn = document.getElementById('logout-btn');
const userDisplayEmail = document.getElementById('user-display-email');

const taskForm = document.getElementById('task-creation-form');
const taskInput = document.getElementById('task');
const priorityInput = document.getElementById('task-priority');
const tasksContainer = document.getElementById('tasks-container');
const errorContainer = document.getElementById('error-message');
const sortSelect = document.getElementById('sort-select');
const filterButtons = document.querySelectorAll('.filter-btn');

let isRegisterMode = false;

//network
function getAuthHeaders() {
    return {
        'Content-Type': 'application/json',
        'X-User-Id': loggedInUserId
    };
}

async function fetchTasks() {
    if (!loggedInUserId) return;

    try {
        const response = await fetch('/api/tasks', {
            headers: getAuthHeaders()
        });

        const data = await response.json();

        if (response.ok) {
            tasks = data;
            renderTasks();
        } else {
            console.error("Server authentication failed:", data.error);
            handleLogout();
        }
    } catch (error) {
        console.error("Failed to load task from server:", error);
    }
}

function renderTasks() {
    tasksContainer.innerHTML = '';
    let processedTasks = [...tasks];

    if (currentFilter === 'active') {
        processedTasks = processedTasks.filter(task => !task.completed);
    } else if (currentFilter === 'completed') {
        processedTasks = processedTasks.filter(task => task.completed);
    }

    const priorityWeights = { high: 3, medium: 2, low:1 };

    if (currentSort === 'priority-desc') {
        processedTasks.sort((a, b) => priorityWeights[b.priority] - priorityWeights[a.priority]);
    } else if (currentSort === 'priority-asc') {
        processedTasks.sort((a, b) => priorityWeights[a.priority] - priorityWeights[b.priority]);
    }

    processedTasks.forEach(function(task) {
        const taskCard = document.createElement('div');

        let cardClasses = 'task-card';
        if (task.priority === 'high') cardClasses += ' border-high';
        if (task.priority === 'medium') cardClasses += ' border-medium';
        if (task.completed) cardClasses += ' task-completed';

        taskCard.className = cardClasses;

        taskCard.innerHTML = `
            <div class="task-details">
                <h4>${task.completed ? `<del>${task.name}</del>` : task.name}</h4>
                <p>Priority: ${task.priority.toUpperCase()}</p>
            </div>
            <div class="task-actions">
                <button class="status-btn" data-id="${task.id}">
                    ${task.completed ? 'Undo' : 'Complete'}
                </button>
                <button class="delete-btn" data-id="${task.id}">Delete</button>
            </div>
        `;

        tasksContainer.appendChild(taskCard);
    });
}

//authentication.. client side
authToggleLink.addEventListener('click', function(event) {
    event.preventDefault();
    isRegisterMode = !isRegisterMode;
    authErrorMessage.textContent = '';

    if (isRegisterMode) {
        authTitle.textContent = "Register Account";
        authSubtitle.textContent = "Create an account to track your unique goals:";
        authSubmitBtn.textContent = "Register";
        authToggleText.textContent = "Already have an account?";
        authToggleLink.textContent = "Login here";
    } else {
        authTitle.textContent = "Welcome to Task Manager";
        authSubtitle.textContent = "Input your details here to login:";
        authSubmitBtn.textContent = "Login";
        authToggleText.textContent = "Don't have an account?";
        authToggleLink.textContent = "Register here";
    }
});

authForm.addEventListener('submit', async function(event) {
    event.preventDefault();
    authErrorMessage.textContent = '';

    const emailVal = authEmail.value.trim();
    const passwordVal = authPassword.value;

    const endpoint = isRegisterMode ? '/api/register' : '/api/login';

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify({email: emailVal, password: passwordVal})
        });

        const data = await response.json();

        if (response.ok) {
            if (isRegisterMode) {
                authToggleLink.click();
                authErrorMessage.style.color = "green";
                authErrorMessage.textContent = "Registration Successful! Please log in.";
                authEmail.value = '';
                authPassword.value = '';
            } else {
                loggedInUserId = data.userId;
                loggedInUserEmail = data.email;
                localStorage.setItem('userId', loggedInUserId);
                localStorage.setItem('userEmail', loggedInUserEmail);

                showAppPanel();
            }
        } else {
            authErrorMessage.style.color = "#dc3545";
            authErrorMessage.textContent = data.error || "Authentication failed.";
        }
    } catch (error) {
        console.error("Auth routing error:", error);
        authErrorMessage.textContent = "Server connection lost.";
    }
});

function handleLogout() {
    loggedInUserId = null;
    loggedInUserEmail = null;
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');

    authEmail.value = '';
    authPassword.value = '';

    showAuthPanel();
}

logoutBtn.addEventListener('click', handleLogout);

function showAuthPanel() {
    authContainer.style.display = 'block';
    appContainer.style.display = 'none';

    pageBody.className = "auth-page";
}

function showAppPanel() {
    authContainer.style.display = 'none';
    appContainer.style.display = 'block';

    pageBody.className = "dashboard-page";

    userDisplayEmail.textContent = `Active User: ${loggedInUserEmail}`;
    fetchTasks();
}

//event listeners
taskForm.addEventListener('submit', async function(event) {
    event.preventDefault();
    errorContainer.textContent = '';

    const taskValue = taskInput.value.trim();
    const priorityValue = priorityInput.value;

    if (taskValue === "") {
        errorContainer.textContent = "Please enter a task title before saving!";
        return;
    }

    const newTask = {
        id: Date.now().toString(),
        name: taskValue,
        priority: priorityValue
    };

    try {
        const response = await fetch('/api/tasks', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(newTask)
        });

        const data = await response.json();

        if (response.ok) {
            await fetchTasks();
            taskInput.value = '';
        } else {
            errorContainer.textContent = data.error || "An unexpected error occurred.";
        }
    } catch (error) {
        console.error("Error creating task:", error);
    }
});

tasksContainer.addEventListener('click', async function(event) {
    const targetId = event.target.getAttribute('data-id');

    if (event.target.className === 'delete-btn') {
        try {
            const response = await fetch(`/api/tasks/${targetId}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            if (response.ok) await fetchTasks();
        } catch (error) {
            console.error("Error deleting task:", error);
        }
    }

    if (event.target.className === 'status-btn') {
        try {
            const response = await fetch(`/api/tasks/${targetId}`, {
                method: 'PUT',
                headers: getAuthHeaders()
            });
            if (response.ok) await fetchTasks();
        } catch (error) {
            console.error("Error updating status:", error);
        }
    }
});

sortSelect.addEventListener('change', function(event) {
    currentSort = event.target.value;
    renderTasks();
});

filterButtons.forEach(button => {
    button.addEventListener('click', function(event) {
        filterButtons.forEach(btn => btn.classList.remove('active-filter'));
        event.target.classList.add('active-filter');
        currentFilter = event.target.getAttribute('data-filter');
        renderTasks();
    });
});

//app initialization entry
if (loggedInUserId) {
    showAppPanel();
} else {
    showAuthPanel();
}