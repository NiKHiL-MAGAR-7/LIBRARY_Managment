# 📚 Library Management System

> **DBMS Lab — End-Semester Project**
> A full-featured library management system with a Python + MySQL CLI backend and a standalone HTML/CSS/JS web demo.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Database Setup](#database-setup)
- [Running the CLI App](#running-the-cli-app)
- [Web Demo](#web-demo)
- [Database Schema](#database-schema)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

This project implements a **Library Management System** that allows a college library to:

- Maintain a catalogue of books (with live stock levels)
- Register students
- Issue books with a **14-day due date** and track overdue status automatically
- Process book returns with late-return detection
- Search books by title or author

It ships as **two interfaces**:

| Interface | Technology | Persistence |
|-----------|-----------|-------------|
| **CLI App** | Python + MySQL | MySQL database (`library_db`) |
| **Web Demo** | HTML / CSS / JavaScript | Browser `localStorage` |

---

## Features

- View all books with real-time availability status
- **Search books** by title or author keyword
- Add new books to the catalogue
- Register students (duplicate email detection)
- Issue books — 14-day due date assigned automatically; prevents double-issuing and out-of-stock issues
- Return books — detects late returns and shows how many days overdue
- **Auto-mark overdue** — any book past its due date is automatically flagged `Overdue` when viewing issued books
- View all currently issued / overdue books with days-left counter
- Credentials loaded securely from a `.env` file (never hardcoded)
- Parameterised SQL queries (safe from SQL injection)

---

## Project Structure

```
LIBRARY_Managment/
├── library.py                    # Python CLI application (MySQL backend)
├── library_management_system.sql # Full DB schema + seed data + sample queries
├── requirements.txt              # Python dependencies
├── .env.example                  # Template — copy to .env and add your credentials
├── web/
│   ├── index.html                # Web dashboard
│   ├── style.css                 # Styling
│   └── script.js                 # Frontend logic (localStorage)
├── .gitignore
├── LICENSE
└── README.md
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Language | Python 3.8+ |
| Database | MySQL 8.0+ |
| DB Driver | `mysql-connector-python` |
| Config | `python-dotenv` |
| Web UI | Vanilla HTML5, CSS3, JavaScript (ES6+) |
| Storage (Web) | Browser `localStorage` |

---

## Database Setup

### Prerequisites

- MySQL 8.0+ installed and running
- A MySQL user with CREATE DATABASE privileges

### 1. Import the schema

```bash
mysql -u root -p < library_management_system.sql
```

This will:
1. Drop and recreate `library_db`
2. Create `Books`, `Students`, and `Issues` tables (with `due_date` column)
3. Seed sample books, students, and issue records
4. Auto-mark any seed records past their due date as `Overdue`

### 2. Set up your credentials

```bash
cp .env.example .env
```

Open `.env` and fill in your MySQL details:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_actual_password
DB_NAME=library_db
```

> The `.env` file is listed in `.gitignore` and will **never** be pushed to GitHub.

---

## Running the CLI App

### 1. Clone the repository

```bash
git clone https://github.com/NiKHiL-MAGAR-7/LIBRARY_Managment.git
cd LIBRARY_Managment
```

### 2. Install Python dependencies

```bash
pip install -r requirements.txt
```

### 3. Run

```bash
python library.py
```

You will see an interactive menu:

```
------------------------------------------------------------
         LIBRARY MANAGEMENT SYSTEM
------------------------------------------------------------
   1.  View All Books
   2.  Search Books
   3.  Add a New Book
   4.  Register a Student
   5.  Issue a Book
   6.  Return a Book
   7.  View Issued / Overdue Books
   8.  Exit
------------------------------------------------------------
```

---

## Web Demo

The `web/` folder is a self-contained, zero-dependency frontend that mirrors the CLI functionality using the browser's `localStorage` as a mock database.

**To open:**

```bash
# macOS
open web/index.html

# Linux
xdg-open web/index.html

# Windows
start web/index.html
```

Or simply drag `web/index.html` into any browser — no server required.

---

## Database Schema

### Books

| Column | Type | Notes |
|--------|------|-------|
| `book_id` | INT (PK, AUTO) | Primary key |
| `title` | VARCHAR(150) | Book title |
| `author` | VARCHAR(100) | Author name |
| `quantity` | INT >= 0 | Copies in stock |

### Students

| Column | Type | Notes |
|--------|------|-------|
| `student_id` | INT (PK, AUTO) | Primary key |
| `name` | VARCHAR(100) | Full name |
| `department` | VARCHAR(50) | Department |
| `email` | VARCHAR(100) | Unique |

### Issues

| Column | Type | Notes |
|--------|------|-------|
| `issue_id` | INT (PK, AUTO) | Primary key |
| `student_id` | INT (FK) | References Students |
| `book_id` | INT (FK) | References Books |
| `issue_date` | DATE | When issued |
| `due_date` | DATE | Return deadline (issue_date + 14 days) |
| `return_date` | DATE | NULL if not yet returned |
| `status` | ENUM | `Issued` / `Returned` / `Overdue` |

**Foreign key cascades:** deleting a student or book cascades to `Issues`.

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m "Add my feature"`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## License

This project is open-sourced under the [MIT License](LICENSE).
