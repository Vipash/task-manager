const express = require('express');
const path = require('path');
const fs = require('fs').promises;

const crypto = require('crypto');

const app = express();
const PORT = 3000;

const TASKS_FILE_PATH = path.join(__dirname, 'tasks.json');
const USERS_FILE_PATH = path.join(__dirname, 'users.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend')));

function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

async function readUsersFromFile() {
    try {
        const rawData = await fs.readFile(USERS_FILE_PATH, 'utf8');
        return JSON.parse(rawData);
    } catch (error) {
        if (error.code === 'ENOENT') {
            await writeUsersToFile([]);
            return [];
        }
        throw error;
    }
}

async function writeUsersToFile(usersArray) {
    await fs.writeFile(USERS_FILE_PATH, JSON.stringify(usersArray, null, 2), 'utf8');
}

async function readTasksFromFile() {
    try {
        const rawData = await fs.readFile(TASKS_FILE_PATH, 'utf8');
        return JSON.parse(rawData);
    } catch (error) {
        if (error.code === 'ENOENT') {
            await writeTasksToFile([]);
            return [];
        }
        throw error;
    }
}

async function writeTasksToFile(tasksArray) {
    await fs.writeFile(TASKS_FILE_PATH, JSON.stringify(tasksArray, null, 2), 'utf8')
}


app.post('/api/register', async function(req, res) {
    try {
        const {email, password} = req.body;

        if (!email || !password || email.trim() === "" || password.trim() === "") {
            return res.status(400).json({error: "Email and password are required."});
        }

        const users = await readUsersFromFile();

        const userExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
        if (userExists) {
            return res.status(400).json({error: "An account with this email already exists."});
        }

        const newUser = {
            id: Date.now().toString(),
            email: email.toLowerCase(),
            passwordHash: hashPassword(password)
        };

        users.push(newUser);
        await writeUsersToFile(users);

        res.status(201).json({message: "Registration successful!", userId: newUser.id});
    } catch (error) {
        res.status(500).json({error: "Internal server error during registration."});
    }
});

app.post('/api/login', async function(req, res) {
    try {
        const {email, password} = req.body;
        const users = await readUsersFromFile();

        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (!user || user.passwordHash !== hashPassword(password)) {
            return res.status(401).json({error: "Invalid email or password."});
        }

        res.json({message: "Login successful!", userId: user.id, email: user.email });
    } catch (error) {
        res.status(500).json({error: "Internal server error during login."});
    }
});


function getValidatedUserId(req, res) {
    const userId = req.headers['x-user-id'];
    if (!userId) {
        res.status(401).json({error: "Access Denied. No user session detected."});
        return null;
    }
    return userId;
}

app.get('/api/tasks', async function(req, res) {
    try {
        const userId = getValidatedUserId(req, res);
        if (!userId) return;

        const allTasks = await readTasksFromFile();
        const userSpecificTasks = allTasks.filter(task => task.userId === userId);

        res.json(userSpecificTasks);
    } catch (error) {
        res.status(500).json({error: "Failed to load tasks."});
    }
});

app.post('/api/tasks', async function(req, res) {
    try {
        const userId = getValidatedUserId(req, res);
        if (!userId) return;

        const {name, priority, id} = req.body;

        if (!name || name.trim() === "") {
            return res.status(400).json({error: "Task name cannot be empty."});
        }

        const sanitizedName = name
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

        const newTask = {
            id: id || Date.now().toString(),
            userId: userId,
            name: sanitizedName,
            priority: priority || 'low',
            completed: false
        };

        const allTasks = await readTasksFromFile();
        allTasks.push(newTask);
        await writeTasksToFile(allTasks);

        res.status(201).json(newTask);
    } catch (error) {
        res.status(500).json({error: "Failed to save secure task."});
    }
});

app.delete('/api/tasks/:id', async function(req, res) {
    try {
        const userId = getValidatedUserId(req, res);
        if (!userId) return;

        const idToDelete = req.params.id;
        const allTasks = await readTasksFromFile();

        const taskToDelete = allTasks.find(t => t.id === idToDelete);
        if (!taskToDelete || taskToDelete.userId !== userId) {
            return res.status(403).json({error: "Unauthorized task delete request."});
        }

        const updatedTasks = allTasks.filter(task => task.id !== idToDelete);
        await writeTasksToFile(updatedTasks);

        res.json({message: "Task deleted successfully", id: idToDelete});
    } catch (error) {
        res.status(500).json({error: "Failed to delete task."});
    }
});

app.put('/api/tasks/:id', async function(req, res) {
    try {
        const userId = getValidatedUserId(req, res);
        if (!userId) return;

        const idToToggle = req.params.id;
        const allTasks = await readTasksFromFile();

        const taskToUpdate = allTasks.find(t => t.id === idToToggle);
        if (!taskToUpdate || taskToUpdate.userId !== userId) {
            return res.status(403).json({error: "Unauthorized task update request."});
        }

        taskToUpdate.completed = !taskToUpdate.completed;
        await writeTasksToFile(allTasks);

        res.json(taskToUpdate);
    } catch (error) {
        res.status(500).json({error: "Failed to update status."});
    }
});

app.listen(PORT, function() {
    console.log(`Server running at http://localhost:${PORT}`);
});