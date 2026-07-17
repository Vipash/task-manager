const express = require('express');
const path = require('path');
const crypto = require('crypto');
const Database = require('better-sqlite3');

const app = express();
const PORT = 3000;

const db = new Database(path.join(__dirname, 'database.db'));

//database schema initialization
db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        passwordHash TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        name TEXT NOT NULL,
        priority TEXT DEFAULT 'low',
        completed INTEGER DEFAULT 0, -- SQLite doesn't have Boolean; we use 0 (false) and 1 (true)
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );
`);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend')));

// Helper to hash passwords
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

//authentication
app.post('/api/register', async function(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password || email.trim() === "" || password.trim() === "") {
            return res.status(400).json({ error: "Email and password are required." });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const userExistsStmt = db.prepare('SELECT id FROM users WHERE email = ?');
        const existingUser = userExistsStmt.get(normalizedEmail);

        if (existingUser) {
            return res.status(400).json({ error: "An account with this email already exists." });
        }

        const newUser = {
            id: Date.now().toString(),
            email: normalizedEmail,
            passwordHash: hashPassword(password)
        };

        const insertUserStmt = db.prepare('INSERT INTO users (id, email, passwordHash) VALUES (?, ?, ?)');
        insertUserStmt.run(newUser.id, newUser.email, newUser.passwordHash);

        res.status(201).json({ message: "Registration successful!", userId: newUser.id });
    } catch (error) {
        console.error("Registration database error:", error);
        res.status(500).json({ error: "Internal server error during registration." });
    }
});

app.post('/api/login', async function(req, res) {
    try {
        const { email, password } = req.body;
        const normalizedEmail = email.toLowerCase().trim();

        // Fetch user from database
        const getUserStmt = db.prepare('SELECT * FROM users WHERE email = ?');
        const user = getUserStmt.get(normalizedEmail);

        if (!user || user.passwordHash !== hashPassword(password)) {
            return res.status(401).json({ error: "Invalid email or password." });
        }

        res.json({ message: "Login successful!", userId: user.id, email: user.email });
    } catch (error) {
        console.error("Login database error:", error);
        res.status(500).json({ error: "Internal server error during login." });
    }
});

//middleware
function getValidatedUserId(req, res) {
    const userId = req.headers['x-user-id'];
    if (!userId) {
        res.status(401).json({ error: "Access Denied. No user session detected." });
        return null;
    }
    return userId;
}

//task management routing
app.get('/api/tasks', async function(req, res) {
    try {
        const userId = getValidatedUserId(req, res);
        if (!userId) return;

        const getTasksStmt = db.prepare('SELECT * FROM tasks WHERE userId = ?');
        const tasks = getTasksStmt.all(userId);

        const formattedTasks = tasks.map(task => ({
            ...task,
            completed: !!task.completed
        }));

        res.json(formattedTasks);
    } catch (error) {
        console.error("Error reading tasks from DB:", error);
        res.status(500).json({ error: "Failed to load tasks." });
    }
});

app.post('/api/tasks', async function(req, res) {
    try {
        const userId = getValidatedUserId(req, res);
        if (!userId) return;

        const { name, priority, id } = req.body;

        if (!name || name.trim() === "") {
            return res.status(400).json({ error: "Task name cannot be empty." });
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
            completed: 0
        };

        const insertTaskStmt = db.prepare('INSERT INTO tasks (id, userId, name, priority, completed) VALUES (?, ?, ?, ?, ?)');
        insertTaskStmt.run(newTask.id, newTask.userId, newTask.name, newTask.priority, newTask.completed);

        res.status(201).json({
            ...newTask,
            completed: false
        });
    } catch (error) {
        console.error("Error inserting task to DB:", error);
        res.status(500).json({ error: "Failed to save secure task." });
    }
});

app.delete('/api/tasks/:id', async function(req, res) {
    try {
        const userId = getValidatedUserId(req, res);
        if (!userId) return;

        const idToDelete = req.params.id;

        const getTaskStmt = db.prepare('SELECT userId FROM tasks WHERE id = ?');
        const task = getTaskStmt.get(idToDelete);

        if (!task || task.userId !== userId) {
            return res.status(403).json({ error: "Unauthorized task delete request." });
        }

        const deleteTaskStmt = db.prepare('DELETE FROM tasks WHERE id = ?');
        deleteTaskStmt.run(idToDelete);

        res.json({ message: "Task deleted successfully", id: idToDelete });
    } catch (error) {
        console.error("Error deleting task in DB:", error);
        res.status(500).json({ error: "Failed to delete task." });
    }
});

app.put('/api/tasks/:id', async function(req, res) {
    try {
        const userId = getValidatedUserId(req, res);
        if (!userId) return;

        const idToToggle = req.params.id;

        const getTaskStmt = db.prepare('SELECT * FROM tasks WHERE id = ?');
        const task = getTaskStmt.get(idToToggle);

        if (!task || task.userId !== userId) {
            return res.status(403).json({ error: "Unauthorized task update request." });
        }

        const nextCompletedState = task.completed === 1 ? 0 : 1;
        
        const updateTaskStmt = db.prepare('UPDATE tasks SET completed = ? WHERE id = ?');
        updateTaskStmt.run(nextCompletedState, idToToggle);

        res.json({
            ...task,
            completed: !!nextCompletedState
        });
    } catch (error) {
        console.error("Error updating task in DB:", error);
        res.status(500).json({ error: "Failed to update status." });
    }
});

app.listen(PORT, function() {
    console.log(`Server running at http://localhost:${PORT}`);
});