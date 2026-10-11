# ACRM — Anti Class Representative Motion

**Section C student portal prototype** — a full-stack project built with React, Vite, Three.js / React Three Fiber, FastAPI, SQLAlchemy, and SQLite.

This bundle imports the six attendance CSVs supplied with the project, validates Section C roll numbers against the roster, and generates deterministic date-level attendance entries for the period **20 August–10 October 2026** using each CSV's `Total Classes Held` and `Classes Present` counts.

## Download and run on Windows

### Recommended: one-click launcher

1. Install **Python 3.11 or newer** and **Node.js 20 or newer**.
2. Extract the ZIP to a normal folder (not directly inside the ZIP viewer).
3. Double-click `START_ACRM.bat`.
4. On first launch the script creates a Python virtual environment, installs backend dependencies, installs frontend packages, starts both services, and opens the website at <http://127.0.0.1:5173>.
5. API documentation is at <http://127.0.0.1:8000/docs> while the backend is running.

First launch needs internet access to download Python and npm dependencies. Later launches reuse the installed dependencies.

### Manual startup

Open two terminals in the extracted project folder.

**Terminal 1 — backend**

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

**Terminal 2 — frontend**

```powershell
cd frontend
npm install
npm run dev
```

Then open <http://127.0.0.1:5173>.

## First-time student access

Use a student name exactly as represented in the roster (case is ignored) and one of these roll-number formats:

- `26BPH001` through `26BPH050`
- `26BME091` through `26BME125`

The student name and roll number are checked against the imported Section C roster. On first use, the student creates a password of at least eight characters. The backend stores a salted scrypt password hash in SQLite; it does not store the plain-text password. Later logins require that password.

To reset a local demo account, stop the backend and remove `backend/acrm.sqlite3`, then restart the application. This deletes all locally stored passwords, messages, and demo records, and the roster will be imported again on startup.

## Included features

- ACRM Section C landing/login experience, with an animated 3D Three.js scene.
- FastAPI backend and persistent SQLite database.
- Roster imported from all six supplied subject CSVs (85 students; the importer checks roster name consistency across files).
- Student identification, first-login password setup, signed expiring session token, and password login.
- Subject-wise attendance calendars and statistics; green present dates and red absent dates; the calendar is limited to August–October 2026 in this demo.
- Attendance counts and percentage from the CSV data, with an alert when attendance is below 75%.
- Feedback submissions saved in the local teacher-inbox queue.
- Mental-health check-in alert created before the optional student note is saved to that alert.
- Read-only demo grades and sample assignments/submission statuses for the future teacher dashboard.
- Interactive charts and responsive layout.

## Data accuracy and prototype boundaries

- **Attendance counts** come from the provided CSV files. The CSVs contain counts, not the date of each individual lecture, so the importer distributes each student's present/absent statuses deterministically across 36 weekday sessions in the requested date range. This makes the calendar repeatable, but a specific red/green date should not be treated as the official historical date record.
- **Grades, assignments, and assignment submission statuses are sample/demo data**, because those were not included in the CSV bundle. Student pages cannot change submission status.
- Student feedback and wellbeing alerts are stored in this computer's SQLite database. There is no email, push notification, cloud sync, or teacher-facing inbox page in this student-focused phase. The records are ready for the teacher dashboard to retrieve in the next phase.
- The wellbeing check-in is a support-request mechanism, not an emergency service. Students in immediate danger should contact local emergency services or a trusted person nearby.
- This is a local development prototype, not a production deployment. Before hosting it for real student use, add teacher/admin authentication and authorisation, HTTPS, secure secret management, backups, privacy/retention controls, access logging, rate limiting, and an appropriate institutional wellbeing response workflow. Do not expose the local API or database publicly as-is.

## Project layout

```text
ACRM_FullStack/
├── START_ACRM.bat
├── START_BACKEND.bat
├── START_FRONTEND.bat
├── README.md
├── backend/
│   ├── app/                  # FastAPI routes, models, import logic and security
│   ├── data/csv/             # Six provided subject attendance CSVs
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/                  # React app, styles and Three.js scene
    ├── package.json
    └── vite.config.js
```

## Technology stack

- **Frontend:** React 18, Vite 6, Three.js via React Three Fiber, Recharts, Lucide icons.
- **Backend:** FastAPI, Uvicorn, Pydantic, SQLAlchemy.
- **Persistence:** SQLite file at `backend/acrm.sqlite3` by default.
- **Authentication:** salted scrypt password hashes and signed, expiring bearer tokens.

## Helpful endpoints

- `GET /api/health` — backend health check
- `GET /api/subjects` — canonical subject names
- `POST /api/auth/student/identify` — verify name/roll and determine if password setup is required
- `POST /api/auth/student/setup-password` — one-time password setup
- `POST /api/auth/student/login` — student login
- `GET /api/student/overview` — overall and subject attendance statistics
- `GET /api/student/attendance?subject=Mathematics&year=2026&month=10` — calendar records and statistics
- `GET /api/student/grades` — demo grades
- `GET /api/student/assignments` — demo assignments/statuses
- `POST /api/student/feedback` — queue a teacher message
- `POST /api/student/mental-health/alert` — create a high-priority wellbeing alert
- `POST /api/student/mental-health/{alert_id}/note` — attach the student's optional note
