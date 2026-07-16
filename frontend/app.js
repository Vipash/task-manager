const taskForm = document.getElementById('task-creation-form');
const taskInput = document.getElementById('task');
const priorityInput = document.getElementById('task-priority');
const tasksContainer = document.getElementById('tasks-container');
const sortSelect = document.getElementById('sort-select');
const filterButtons = document.querySelectorAll('.filter-btn');

let tasks = [];
let currentFilter = 'all';
let currentSort = 'none';

async function fetchTasks() {
    try {
        const response = await fetch('/api/tasks');
        tasks = await response.json();
        renderTasks();
    } catch (error) {
        console.error("Failed to load tasks from server:", error);
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

    const priorityWeights = { high: 3, medium: 2, low: 1};

    if (currentSort === 'priority-desc') {
        processedTasks.sort((a,b) => priorityWeights[b.priority] - priorityWeights[a.priority]);
    } else if (currentSort === 'priority-asc') {
        processedTasks.sort((a,b) => priorityWeights[a.priority] - priorityWeights[b.priority]);
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

const errorContainer = document.getElementById('error-message');

taskForm.addEventListener('submit', async function(event) {
    event.preventDefault();

    errorContainer.textContent = '';

    const taskValue = taskInput.value.trim();
    const priorityValue = priorityInput.value;

    if (taskValue === "") {
        errorContainer.textContent = "Please enter a task title before saving!";
        return;
    }
    if (taskValue.length > 100) {
        errorContainer.textContent = "Task title is too long (max 100 characters).";
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
            headers: {
                'Content-Type': 'application/json' 
            },
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
        console.error("Error creating task on backend:", error);
        errorContainer.textContent = "Network error. Could not connect to the server."
    }
});

tasksContainer.addEventListener('click', async function(event) {
    const targetId = event.target.getAttribute('data-id');

    if (event.target.className === 'delete-btn') {
        try {
            const response = await fetch(`/api/tasks/${targetId}`, {method: 'DELETE'});
            if (response.ok) await fetchTasks();
        } catch (error) {
            console.error("Error deleting task:", error);
        }
    }

    if (event.target.className === 'status-btn') {
        try {
            const response = await fetch(`/api/tasks/${targetId}`, {
                method: 'PUT'
            });
            if (response.ok) {
                await fetchTasks();
            }
        } catch (error) {
            console.error("Error updating task status:", error);
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

fetchTasks();