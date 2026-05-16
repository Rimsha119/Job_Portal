# WorkBoard — Job Board Portal

A full-stack job board application built with React, Node/Express, MongoDB, JWT, and Bcrypt.

## Features

- **Authentication** — Register/login as candidate or company; JWT-based sessions
- **Role-based access** — Protected routes enforced on both frontend and backend
- **Job Feed** — Browse all jobs with live filtering by keyword, location, type, and salary range
- **Job Details** — Full job detail page with inline application form for candidates
- **Company Dashboard** — Post and delete jobs, view all applicants per job
- **Apply Flow** — Candidates submit name, email, and resume URL; duplicate prevention built in

## Tech Stack

| Layer    | Tech                          |
|----------|-------------------------------|
| Frontend | React 18, Vite, React Router v6, Axios |
| Backend  | Node.js, Express 4, Mongoose  |
| Database | MongoDB                       |
| Auth     | JWT (jsonwebtoken), Bcrypt    |

## Project Structure

```
job-board-portal/
├── backend/          # Express API
│   ├── config/       # MongoDB connection
│   ├── middleware/   # JWT auth & role guards
│   ├── models/       # User, Job, Application schemas
│   ├── routes/       # Auth & Job routes
│   └── server.js     # Entry point
└── frontend/         # React app (Vite)
    └── src/
        ├── context/  # AuthContext (global state)
        ├── components/ # Navbar, ProtectedRoute
        └── pages/    # Login, Register, JobFeed, JobDetail, CompanyDash, Applicants
```

## Setup & Run

### Prerequisites
- Node.js 18+
- MongoDB running locally on port 27017 (or a MongoDB Atlas URI)

### 1. Clone & install backend

```bash
cd job-board-portal/backend
npm install
```

### 2. Configure environment

Edit `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/jobboard
JWT_SECRET=change_this_to_a_strong_random_secret
```

For MongoDB Atlas, replace `MONGO_URI` with your connection string.

### 3. Start the backend

```bash
npm run dev      # with nodemon (hot reload)
# or
npm start        # production
```

Server runs at `http://localhost:5000`

### 4. Install & start frontend

```bash
cd ../frontend
npm install
npm run dev
```

App runs at `http://localhost:5173`

> The Vite dev server proxies `/auth` and `/jobs` requests to the backend automatically.

## API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | — | Register (name, email, password, role) |
| POST | `/auth/login` | — | Login → returns JWT |
| GET | `/jobs` | — | List jobs (query: search, location, type, minSalary, maxSalary) |
| GET | `/jobs/:id` | — | Get single job |
| POST | `/jobs` | Company | Create job |
| DELETE | `/jobs/:id` | Company | Delete own job |
| POST | `/jobs/:id/apply` | Candidate | Submit application |
| GET | `/jobs/:id/applications` | Company | View applicants (own job only) |

## Testing Flow

1. Register a **company** account → you'll land on the dashboard
2. Post a couple of jobs from the dashboard
3. Open a new browser/incognito → register a **candidate** account
4. Browse the job feed, apply filters, open a job, submit an application
5. Back in the company account → dashboard → "View Applicants"

## Evaluation Checklist

- [x] Auth works end-to-end (register, login, token storage)
- [x] Routes protected by role (frontend redirect + backend 403)
- [x] Filter returns correct jobs (location, type, salary range, keyword)
- [x] Application saves to DB with duplicate prevention
- [x] Clean, readable code with consistent structure
