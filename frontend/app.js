const taskForm = document.getElementById('task-creation-form');
const taskInput = document.getElementById('task');
const priorityInput = document.getElementById('task-priority');
const tasksContainer = document.getElementById('tasks-container');

taskForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const taskText = taskInput.value;
    const taskPriority = priorityInput.value;

    const taskCard = document.createElement('div');

    taskCard.className = 'task-card';

    if (taskPriority === 'high') {
        taskCard.className = 'task-card border-high';
    }

    taskCard.innerHTML = `
        <div class="task-details">
        <h4>${taskText}</h4>
        <p>Priority: ${taskPriority.toUpperCase()}</p>
        </div>
        <div class="task-actions">
        <button class="status-btn">Complete</button>
        <button class="delete-btn">Delete</button>
        </div>
        `;

        tasksContainer.appendChild(taskCard);

        taskInput.value = '';
});