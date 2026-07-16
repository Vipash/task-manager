const express = require('express');
const path = require('path');

const fs = require('fs').promises;

const app = express();
const PORT = 3000;

const TASKS_FILE_PATH = path.join(__dirname, 'tasks.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend')));

async function readTasksFromFile() {
    try {
        const rawData = await fs.readFile(TASKS_FILE_PATH, 'utf8');
        return JSON.parse(rawData);
    } catch (error) {
        if (error.code === 'ENOENT') {
            const defaultTasks = [
                { id: "1", name: "Learn Backend Basics", priority: "high"},
                { id: "2", name: "Build an API", priority: "low"}
            ];
            await writeTasksToFile(defaultTasks);
            return defaultTasks;
        }
        throw error;
    }
}

async function writeTasksToFile(tasksArray) {
    await fs.writeFile(TASKS_FILE_PATH, JSON.stringify(tasksArray, null, 2), 'utf8');
}

//API Endpoints
app.get('/api/tasks', async function(req, res) {
    try {
        const tasks = await readTasksFromFile();
        res.json(tasks);
    } catch (error) {
        res.status(500).json({error: "Failed to read database file."});
    }
});

app.post('/api/tasks', async function(req, res) {
    try {   
        const newTask = req.body;
        const tasks = await readTasksFromFile();

        tasks.push(newTask);
        await writeTasksToFile(tasks);

        res.status(201).json(newTask);
    } catch (error) {
        res.status(500).json({error: "Failed to save task to disk."});
    }
});

app.delete('/api/tasks/:id', async function(req, res) {
    try {
        const idToDelete = req.params.id;
        const tasks = await readTasksFromFile();

        const updatedTasks = tasks.filter(function(task) {
            return task.id !== idToDelete;
        });

        await writeTasksToFile(updatedTasks);

        res.json({message: "Task deleted successfully", id: idToDelete });
    } catch (error) {
        res.status(500).json({error: "Failed to delete task from disk."});
    }
});

app.put('/api/tasks/:id', async function(req, res) {
    try {
        const idToToggle = req.params.id;
        const tasks = await readTasksFromFile();

        const taskToUpdate = tasks.find(function(task) {
            return task.id === idToToggle;
        });

        if (taskToUpdate) {
            taskToUpdate.completed = !taskToUpdate.completed;

            await writeTasksToFile(tasks);
            res.json(taskToUpdate);
        } else {
            res.status(404).json({error: "Task not found."});
        }
    } catch (error) {
        res.status(500).json({error: "Failed to update task status."});
    }
});

app.listen(PORT, function() {
    console.log(`Server is running at http://localhost:${PORT}`);
});