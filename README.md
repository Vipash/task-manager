 # Full-Stack Task Manager Web App

 ## Overview
A full-stack task management application built from scratch using HTML, CSS, vanilla JavaScript, Node.js/Express, and SQLite (`better-sqlite3`). It supports user registration/login, task creation and editing, filtering, sorting, and persistent storage in a local SQL database.

## Tech Stack
- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: SQLite (`better-sqlite3`)
- **Other**: Git, VS Code

## Features
- Single-Page Application (SPA): Instant interface state transitions between authentication states and the active dashboard without full browser reloads.

- User Authentication: Robust registration and login flows with SHA-256 client-server password hashing.

- Per-User Task Ownership: Contextual request headers ensure users strictly fetch, modify, and see only their own tasks.

- Robust Relational Storage: Upgraded data layer powered by SQLite (better-sqlite3) executing safe atomic transactions.

- Sanitized UI Security: XSS defense layers combined with database-bound prepared statements to safeguard data persistence.

- Modern Responsive Layout: Clean, visual card grid with fluid forms, custom priority left-border accent tags, and dynamic lift animations on hover interactions.

## Project Structure
```text
project-root/
├── server.js           # Express server, routes, DB integration
├── database.db         # SQLite database file (automatically generated)
├── package.json
├── package-lock.json
├── .gitignore          # Ignores node_modules and local database file
├── frontend/
│   ├── index.html      # Single-Page Application core structure (Auth & Dashboard UI)
│   ├── app.js          # Frontend logic (State management, API client, UI transitions)
│   └── style.css       # Responsive design styles & interactive animations
└── README.md
```

## Setup & Usage
### Prerequisites
- Node.js (LTS version)
- npm

### Installation
```bash
git clone https://github.com/Vipash/task-manager.git
cd task-manager
npm install
```

### Initialize Database
The app will create tables on first run if they do not exist.  
If you have a separate DB init script, document it here (e.g. `node init-db.js`).

### Run the App
```bash
node server.js
```
Then open:
- `http://localhost:3000` for login/registration

Note: The application will automatically construct the local database.db relational schema files and initialize tables on its very first launch.

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