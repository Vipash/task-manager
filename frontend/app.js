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
        taskCard.className = 'task-card';

        if (task.priority === 'high') {
            taskCard.className = 'task-card border-high';
        }

    taskCard.innerHTML = `
    <div class="task-details">
        <h4>${task.name}</h4>
        <p>Priority: ${task.priority.toUpperCase()}</p>
    </div>
    <div class="task-actions">
        <button class="status-btn">Complete</button>
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
    if (event.target.className === 'delete-btn') {
        const idToDelete = event.target.getAttribute('data-id');

        try {
            const response = await fetch(`/api/tasks/${idToDelete}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                await fetchTasks();
            }
        } catch (error) {
            console.error("Error deleting task from backend:", error);
        }
    }
});

fetchTasks();