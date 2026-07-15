const express = require('express');
const path = require('path');

const app = express();

const PORT = 3000;

app.use(express.json());

app.use(express.static(path.join(__dirname, 'frontend')));

let serverTasks = [
    {id:"1", name: "Learn Backend Basics", priority: "high"},
    {id:"2", name: "Build an API", priority: "low"}
];

app.get('/api/tasks', function(req, res) {
    res.json(serverTasks);
});

app.post('/api/tasks', function(req, res) {
    const newTask = req.body;
    serverTasks.push(newTask);
    res.status(201).json(newTask);
});

app.delete('/api/tasks/:id', function(req,res) {
    const idToDelete = req.params.id;

    serverTasks = serverTasks.filter(function(task) {
        return task.id !== idToDelete;
    });

    res.json({message: "Task deleted successfully", id: idToDelete });
});

app.listen(PORT, function() {
    console.log(`Server is running at http://localhost:${PORT}`)
});