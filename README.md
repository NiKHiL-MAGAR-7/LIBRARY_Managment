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

- Maintain a catalogue of books (with stock levels)
- Register students
- Issue books to students and track due status
- Process book returns

It ships as **two interfaces**:

| Interface | Technology | Persistence |
|-----------|-----------|-------------|
| **CLI App** | Python + MySQL | MySQL database (`library_db`) |
| **Web Demo** | HTML / CSS / JavaScript | Browser `localStorage` |

---

## Features

- View all books with real-time availability status
- Add new books to the catalogue
- Register students (duplicate email detection)
- Issue books — prevents double-issuing and out-of-stock issues
- Return books — updates stock automatically
- View all currently issued / overdue books with days-out counter
- Parameterised SQL queries (safe from SQL injection)
- Responsive web dashboard with sidebar navigation (localStorage demo)

---

## Project Structure

```
LIBRARY_Managment/
├── library.py                    # Python CLI application (MySQL backend)
├── library_management_system.sql # Full DB schema + seed data + sample queries
├── requirements.txt              # Python dependencies
├── web/
│   ├── index.html                # Web dashboard
│   ├── style.css                 # Styling
│   └── script.js                 # Frontend logic (localStorage)
└── README.md
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Language | Python 3.8+ |
| Database | MySQL 8.0+ |
| DB Driver | `mysql-connector-python` |
| Web UI | Vanilla HTML5, CSS3, JavaScript (ES6+) |
| Storage (Web) | Browser `localStorage` |

---

## Database Setup

### Prerequisites

- MySQL 8.0+ installed and running
- A MySQL user with CREATE DATABASE privileges (default: `root`)

### 1. Import the schema

```bash
mysql -u root -p < library_management_system.sql
```

This will:
1. Drop and recreate `library_db`
2. Create the `Books`, `Students`, and `Issues` tables
3. Seed sample books, students, and issue records

### 2. Configure your credentials

Open `library.py` and update the connection block with your MySQL credentials:

```python
conn = mysql.connector.connect(
    host     = "localhost",
    user     = "root",
    password = "YOUR_PASSWORD",   # change this
    database = "library_db"
)
```

> **Tip:** For production use, store credentials in a `.env` file and load them with `python-dotenv`. The `.gitignore` already excludes `.env` files.

---

## Running the CLI App

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/LIBRARY_Managment.git
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
   2.  Add a New Book
   3.  Register a Student
   4.  Issue a Book
   5.  Return a Book
   6.  View Currently Issued Books
   7.  Exit
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
| `return_date` | DATE | NULL if not returned |
| `status` | ENUM | Issued / Returned / Overdue |

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
