 # Full-Stack Task Manager Web App

 ## Overview
A full-stack task management application built from scratch using HTML, CSS, vanilla JavaScript, Node.js/Express, and SQLite (`better-sqlite3`). It supports user registration/login, task creation and editing, filtering, sorting, and persistent storage in a local SQL database.

## Tech Stack
- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: SQLite (`better-sqlite3`)
- **Other**: Git, VS Code

## Features
- User registration and login
- Per-user task ownership (each user sees only their own tasks)
- Create, update, complete, and delete tasks (CRUD)
- Filter tasks by status (active / completed)
- Sort tasks by priority and other fields
- Persistent storage in SQLite database file (`database.db`)
- Responsive layout for authentication and dashboard pages
- Hover animations and modern card-based UI
- Basic protection against malformed input and injection via prepared statements

## Project Structure
```text
project-root/
├── server.js           # Express server, routes, DB integration
├── database.db         # SQLite database file
├── package.json
├── frontend/
│   ├── index.html      # Login / registration page
│   ├── dashboard.html  # Task dashboard
│   ├── app.js          # Frontend logic (API calls, UI updates)
│   └── style.css       # Layout and styling
└── README.md
```

## Setup & Usage
### Prerequisites
- Node.js (LTS version)
- npm

### Installation
```bash
git clone <your-repo-url>
cd <your-repo-folder>
npm install
```

### Initialize Database
The app will create tables on first run if they do not exist.  
If you have a separate DB init script, document it here (e.g. `node init-db.js`).

### Run the App
```bash
npm start
```

Then open:

- `http://localhost:3000` for login/registration
- `http://localhost:3000/dashboard` for the task dashboard (after login)

## API Endpoints
- `POST /api/register` – Register new user
- `POST /api/login` – Login and start session
- `GET /api/tasks` – Get tasks for current user
- `POST /api/tasks` – Create new task
- `PUT /api/tasks/:id` – Update or complete task
- `DELETE /api/tasks/:id` – Delete task

## Future Improvements
- Add due-date based reminders
- Deploy to a cloud hosting provider with persistent storage