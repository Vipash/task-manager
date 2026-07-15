const taskForm = document.getElementById('task-creation-form');
const taskInput = document.getElementById('task');
const priorityInput = document.getElementById('task-priority');
const tasksContainer = document.getElementById('tasks-container');

let tasks = JSON.parse(localStorage.getItem('myTasks')) || [];

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

    localStorage.setItem('myTasks', JSON.stringify(tasks));
}

taskForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const newTask = {
        id: Date.now().toString(),
        name: taskInput.value,
        priority: priorityInput.value 
    };

    tasks.push(newTask);
    renderTasks();
    taskInput.value = '';
});

tasksContainer.addEventListener('click', function(event) {
    if (event.target.className === 'delete-btn') {
        const idToDelete = event.target.getAttribute('data-id');
        tasks = tasks.filter(function(task) {
            return task.id !== idToDelete;
        });
        renderTasks();
    }
});

renderTasks();