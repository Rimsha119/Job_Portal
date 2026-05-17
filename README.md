# WorkBoard — Job Board Portal

A full-stack job board application built with **React**, **Node/Express**, **MongoDB**, **JWT**, and **Bcrypt**.

**Scope**: 6–8 hours • **Version**: v1.0 • **Status**: Complete ✅

---

##  Objective

Build a working mini job board with authentication where:
- **Candidates** browse and apply for jobs
- **Companies** post jobs and view applications
- Focus on clean code, working API, and connected UI with role-based access control

---

## Features

### Authentication
- Register with name, email, password, and role (candidate/company)
- Login returns JWT token stored in localStorage
- Token-based session management
- Protected routes enforced by role on both frontend and backend

###  Job Management (Company)
- Post jobs with title, description, salary, location, and job type
- View all posted jobs on company dashboard
- Delete own jobs
- View all applicants for each job with details (name, email, resume link, application date)

###  Job Browsing & Filtering (Public)
- List all jobs with advanced filtering options
- Search by keyword (job title, description)
- Filter by location, job type, and salary range
- Detailed job page with full job information

###  Application System (Candidate)
- Apply for jobs with name, email, and resume URL
- One application per candidate per job (duplicate prevention)
- Success/error notifications on submission
- Track applied jobs

---

##  Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | React, Vite, React Router v6, Axios | 18+ |
| **Backend** | Node.js, Express.js, Mongoose | 4.x |
| **Database** | MongoDB | 5.x+ |
| **Auth** | JWT (jsonwebtoken), Bcrypt | — |
| **Other** | dotenv, CORS | — |

---

##  Project Structure

```
Job_portal/
├── Backend/                    # Express API Server
│   ├── config/
│   │   └── db.js              # MongoDB connection configuration
│   ├── middleware/
│   │   ├── auth.js            # JWT verification & role guards
│   │   └── fileUpload.js      # Resume upload middleware
│   ├── models/
│   │   ├── User.js            # User schema (name, email, password, role)
│   │   ├── Job.js             # Job schema (title, desc, salary, location, type, postedBy)
│   │   └── Application.js     # Application schema (jobId, name, email, resumeLink, appliedAt)
│   ├── routes/
│   │   ├── authRoutes.js      # POST /auth/register, /auth/login
│   │   └── jobRoutes.js       # GET/POST /jobs, /jobs/:id, /jobs/:id/apply, /jobs/:id/applications
│   ├── uploads/               # Resume storage directory
│   ├── server.js              # Express entry point
│   └── package.json           # Backend dependencies
│
└── Frontend/                   # React + Vite App
    ├── src/
    │   ├── context/
    │   │   └── AuthContext.jsx        # Global auth state (user, token, login/logout)
    │   ├── components/
    │   │   ├── Navbar.jsx            # Navigation with user menu
    │   │   ├── ProtectedRoute.jsx    # Role-based route protection
    │   │   └── icons/
    │   │       └── SvgIcons.jsx      # Reusable SVG icons
    │   ├── pages/
    │   │   ├── Login.jsx             # /login — User login form
    │   │   ├── Register.jsx          # /register — User registration form
    │   │   ├── JobFeed.jsx           # /jobs — List jobs with filters
    │   │   ├── JobDetail.jsx         # /jobs/:id — Job details + apply form
    │   │   ├── CompanyDash.jsx       # /dashboard — Company's posted jobs
    │   │   └── Applicants.jsx        # /dashboard/jobs/:id/applicants — View applicants
    │   ├── App.jsx                   # Main app routing & layout
    │   ├── main.jsx                  # React entry point
    │   ├── index.css                 # Global styles
    │   ├── vite.config.js            # Vite configuration with API proxy
    │   └── package.json              # Frontend dependencies
    └── index.html                    # HTML template
```

---

##  Data Models

### User
```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique),
  password: String (hashed with bcrypt, required),
  role: String (enum: "candidate" | "company", required),
  createdAt: Date (default: now)
}
```

### Job
```javascript
{
  _id: ObjectId,
  title: String (required),
  description: String (required),
  salary: Number (required),
  location: String (required),
  type: String (enum: "full-time" | "part-time" | "internship", required),
  postedBy: ObjectId (ref: User, required),
  createdAt: Date (default: now),
  updatedAt: Date
}
```

### Application
```javascript
{
  _id: ObjectId,
  jobId: ObjectId (ref: Job, required),
  name: String (required),
  email: String (required),
  resumeLink: String (required - URL to uploaded resume),
  appliedAt: Date (default: now)
  // Unique constraint: [jobId, email] to prevent duplicate applications
}
```

---

##  API Reference

### Authentication Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| **POST** | `/auth/register` | — | Register new user (name, email, password, role: "candidate"\|"company") |
| **POST** | `/auth/login` | — | Login → returns JWT token + user data |

### Job Endpoints

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| **GET** | `/jobs` | — | — | List all jobs (supports filters: search, location, type, minSalary, maxSalary) |
| **GET** | `/jobs/:id` | — | — | Get single job details |
| **POST** | `/jobs` | ✅ | Company | Create new job (title, description, salary, location, type) |
| **DELETE** | `/jobs/:id` | ✅ | Company | Delete own job |

### Application Endpoints

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| **POST** | `/jobs/:id/apply` | ✅ | Candidate | Submit application (name, email, resumeLink) |
| **GET** | `/jobs/:id/applications` | ✅ | Company | View all applicants for own job |

### Query Parameters (GET /jobs)
- `search` — Filter by job title or description keyword (case-insensitive)
- `location` — Filter by location (exact match)
- `type` — Filter by job type (full-time, part-time, internship)
- `minSalary` — Filter jobs with salary >= minSalary
- `maxSalary` — Filter jobs with salary <= maxSalary

### Response Examples

**POST /auth/login** (Success)
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "candidate"
  }
}
```

**GET /jobs?location=NYC&type=full-time** (Success)
```json
[
  {
    "_id": "507f1f77bcf86cd799439012",
    "title": "Senior React Developer",
    "description": "Looking for experienced React developer...",
    "salary": 120000,
    "location": "NYC",
    "type": "full-time",
    "postedBy": "507f1f77bcf86cd799439010",
    "createdAt": "2024-05-10T14:30:00Z"
  }
]
```

**POST /jobs/:id/apply** (Success)
```json
{
  "message": "Application submitted successfully",
  "application": {
    "_id": "507f1f77bcf86cd799439013",
    "jobId": "507f1f77bcf86cd799439012",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "resumeLink": "https://example.com/resume.pdf",
    "appliedAt": "2024-05-15T10:20:00Z"
  }
}
```

---

##  Pages & Routes

### Public Routes
| Route | Component | Purpose |
|-------|-----------|---------|
| `/login` | Login.jsx | User login form |
| `/register` | Register.jsx | User registration form (choose role) |
| `/jobs` | JobFeed.jsx | Browse all jobs with filters |
| `/jobs/:id` | JobDetail.jsx | View job details + apply form |

### Protected Routes (Candidate)
| Route | Component | Purpose |
|-------|-----------|---------|
| `/dashboard` | CompanyDash.jsx | Redirects to /jobs (candidates see job feed) |

### Protected Routes (Company)
| Route | Component | Purpose |
|-------|-----------|---------|
| `/dashboard` | CompanyDash.jsx | Company dashboard: list posted jobs, create new job |
| `/dashboard/jobs/:id/applicants` | Applicants.jsx | View all applicants for a specific job |

---

##  Setup & Run

### Prerequisites
- **Node.js** 18+ (or higher)
- **MongoDB** running locally on `mongodb://localhost:27017` OR a MongoDB Atlas connection URI
- **npm** or **yarn** package manager

### Step 1: Clone & Setup Backend

```bash
cd Backend
npm install
```

### Step 2: Configure Environment Variables

Create a `.env` file in the `Backend/` directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/jobboard
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
NODE_ENV=development
```

**For MongoDB Atlas (cloud):**
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/jobboard?retryWrites=true&w=majority
```

### Step 3: Start Backend Server

```bash
npm run dev      # Development with nodemon (hot reload)
# or
npm start        # Production mode
```

 Backend server runs at **http://localhost:5000**

### Step 4: Setup & Run Frontend

In a new terminal:

```bash
cd Frontend
npm install
npm run dev
```

 Frontend app runs at **http://localhost:5173**

> **Note:** The Vite dev server is configured to proxy `/auth` and `/jobs` requests to `http://localhost:5000` (see `vite.config.js`)

### Step 5: Verify Setup

1. Open http://localhost:5173 in your browser
2. You should see the login/register page
3. Check browser console for any errors
4. Check terminal output for backend logs

---

##  Testing & Usage Flow

### Complete End-to-End Test

1. **Register Company Account**
   - Go to `/register` → Select "Company" role
   - Create account with email and password
   - You'll be redirected to `/dashboard`

2. **Post Jobs (Company)**
   - Click "Post New Job" button
   - Fill in: title, description, salary, location, type
   - Submit → Job appears in your dashboard

3. **Register Candidate Account**
   - Open a new browser tab/incognito window (to stay logged out)
   - Go to `/register` → Select "Candidate" role
   - Create account with different email

4. **Browse & Apply (Candidate)**
   - Go to `/jobs` → See all posted jobs
   - Use filters (location, type, salary) to narrow down
   - Click on a job → View details
   - Click "Apply" → Submit name, email, resume URL
   - See success notification

5. **Review Applicants (Company)**
   - Switch back to company account tab
   - Go to `/dashboard` → Click on a job
   - See all applicants: name, email, resume link, application date

---

##  Evaluation Checklist

- [x] **Auth works end-to-end** — Register, login, JWT token storage and retrieval
- [x] **Routes protected by role** — Frontend redirects + backend 403 authorization checks
- [x] **Filters return correct jobs** — Search, location, type, and salary range filtering works
- [x] **Applications save to DB** — Form submission creates record with duplicate prevention
- [x] **Clean, readable code** — Consistent structure, proper separation of concerns, commented logic

---

##  License

This project is part of an internship task. Built with ❤️ as a learning exercise.

---

##  Project Info

- **Full-stack development** following clean code principles
- **Intern Task v1.0**
- **Created**: May 2024
- **Stack**: React + Node/Express + MongoDB + JWT + Bcrypt

## Project Screenshots:
<img width="1920" height="1331" alt="image" src="https://github.com/user-attachments/assets/961b9cad-2321-454e-b214-9505d1587139" />
<img width="1920" height="1178" alt="image" src="https://github.com/user-attachments/assets/0111af23-b458-4f0d-bf42-0a46ed2b83f6" />
<img width="1920" height="1873" alt="image" src="https://github.com/user-attachments/assets/bc5cbb7f-089b-4238-a116-6509262197b8" />
<img width="1905" height="850" alt="image" src="https://github.com/user-attachments/assets/828bee6f-4074-4773-ab35-71907abe7391" />
<img width="1804" height="964" alt="image" src="https://github.com/user-attachments/assets/bdbf9a46-5c4d-4d26-9f9d-04863cb71df9" />
<img width="1920" height="912" alt="image" src="https://github.com/user-attachments/assets/a6d8398e-b10d-4b8f-b44e-631ec960363a" />
<img width="1920" height="2526" alt="image" src="https://github.com/user-attachments/assets/7da02e8f-a1b2-4ce8-9880-0d905a272249" />
<img width="1920" height="1256" alt="image" src="https://github.com/user-attachments/assets/ddce031c-1fd0-4e92-a312-900c02efff9c" />





