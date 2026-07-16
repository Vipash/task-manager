const taskForm = document.getElementById('task-creation-form');
const taskInput = document.getElementById('task');
const priorityInput = document.getElementById('task-priority');
const tasksContainer = document.getElementById('tasks-container');

let tasks = [];

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

    tasks.forEach(function(task) {
        const taskCard = document.createElement('div');

        let cardClasses = 'task-card';
        if (task.priority === 'high') cardClasses += ' border-high';
        if (task.completed) cardClasses += ' task-completed';

        taskCard.className = cardClasses;

        taskCard.innerHTML = `
        <div class="task-details">
            <h4>${task.completed ? `<del>${task.name}</del>` :task.name}</h4>
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

taskForm.addEventListener('submit', async function(event) {
    event.preventDefault();

    const newTask = {
        id: Date.now().toString(),
        name: taskInput.value,
        priority: priorityInput.value
    };

    try {
        const response = await fetch('/api/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newTask)
        });

        if (response.ok) {
            await fetchTasks();
            taskInput.value = '';
        }
    } catch (error) {
        console.error("Error creating task on backend:", error);
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

fetchTasks();