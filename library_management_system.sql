DROP DATABASE IF EXISTS library_db;

CREATE DATABASE library_db;

USE library_db;


-- ============================================================
-- TABLE: Books
-- ============================================================
CREATE TABLE Books (
    book_id     INT             NOT NULL AUTO_INCREMENT,
    title       VARCHAR(150)    NOT NULL,
    author      VARCHAR(100)    NOT NULL,
    quantity    INT             NOT NULL DEFAULT 1,

    PRIMARY KEY (book_id),
    CONSTRAINT chk_quantity CHECK (quantity >= 0)
);


-- ============================================================
-- TABLE: Students
-- ============================================================
CREATE TABLE Students (
    student_id  INT             NOT NULL AUTO_INCREMENT,
    name        VARCHAR(100)    NOT NULL,
    department  VARCHAR(50)     NOT NULL,
    email       VARCHAR(100)    NOT NULL,

    PRIMARY KEY (student_id),
    CONSTRAINT uq_email UNIQUE (email)
);


-- ============================================================
-- TABLE: Issues
-- ============================================================
CREATE TABLE Issues (
    issue_id    INT             NOT NULL AUTO_INCREMENT,
    student_id  INT             NOT NULL,
    book_id     INT             NOT NULL,
    issue_date  DATE            NOT NULL,
    due_date    DATE            NOT NULL,                      -- Return deadline (issue_date + 14 days)
    return_date DATE            DEFAULT NULL,
    status      ENUM('Issued', 'Returned', 'Overdue')
                                NOT NULL DEFAULT 'Issued',

    PRIMARY KEY (issue_id),

    CONSTRAINT fk_student
        FOREIGN KEY (student_id)
        REFERENCES Students(student_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_book
        FOREIGN KEY (book_id)
        REFERENCES Books(book_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT chk_dates     CHECK (return_date IS NULL OR return_date >= issue_date),
    CONSTRAINT chk_due_date  CHECK (due_date >= issue_date)
);


-- ============================================================
-- SEED DATA
-- ============================================================

INSERT INTO Books (title, author, quantity) VALUES
    ('Database System Concepts',    'Silberschatz, Korth & Sudarshan',  4),
    ('Introduction to Algorithms',  'Cormen, Leiserson & Rivest',       3),
    ('Operating System Principles', 'Abraham Silberschatz',             5),
    ('Computer Networks',           'Andrew S. Tanenbaum',              2),
    ('Let Us C',                    'Yashavant Kanetkar',               6);

INSERT INTO Students (name, department, email) VALUES
    ('Riya Sharma',   'Computer Science',  'riya.sharma@college.edu'),
    ('Arjun Mehta',   'Information Tech',  'arjun.mehta@college.edu'),
    ('Priya Nair',    'Electronics',       'priya.nair@college.edu');

-- due_date = issue_date + 14 days
INSERT INTO Issues (student_id, book_id, issue_date, due_date, return_date, status) VALUES
    (1, 1, '2026-10-01', '2026-10-15', '2026-10-14', 'Returned'),  -- returned before due
    (2, 3, '2026-10-05', '2026-10-19', NULL,          'Overdue'),  -- past due, not returned
    (3, 2, '2026-09-20', '2026-10-04', NULL,          'Overdue'),  -- past due, not returned
    (1, 5, '2026-10-10', '2026-10-24', NULL,          'Overdue'),  -- past due, not returned
    (2, 4, '2026-09-15', '2026-09-29', '2026-09-28',  'Returned'); -- returned before due


-- ============================================================
-- AUTO-MARK OVERDUE  (run this any time to refresh statuses)
-- ============================================================
UPDATE Issues
SET status = 'Overdue'
WHERE status = 'Issued'
  AND due_date < CURDATE();


-- ============================================================
-- SAMPLE QUERIES
-- ============================================================

-- 1. All books
SELECT * FROM Books;

-- 2. All students
SELECT * FROM Students;

-- 3. All issues
SELECT * FROM Issues;

-- 4. Full issue report with student and book details
SELECT
    i.issue_id,
    s.name          AS student_name,
    s.department,
    b.title         AS book_title,
    b.author,
    i.issue_date,
    i.due_date,
    i.return_date,
    i.status
FROM Issues i
JOIN Students s ON i.student_id = s.student_id
JOIN Books    b ON i.book_id    = b.book_id
ORDER BY i.issue_id;

-- 5. Currently issued / overdue books with days left
SELECT
    s.name          AS student_name,
    b.title         AS book_title,
    i.issue_date,
    i.due_date,
    i.status,
    DATEDIFF(i.due_date, CURDATE()) AS days_left
FROM Issues i
JOIN Students s ON i.student_id = s.student_id
JOIN Books    b ON i.book_id    = b.book_id
WHERE i.status IN ('Issued', 'Overdue')
ORDER BY i.due_date ASC;

-- 6. Books issued per student
SELECT
    s.name              AS student_name,
    COUNT(i.issue_id)   AS total_issues
FROM Students s
LEFT JOIN Issues i ON s.student_id = i.student_id
GROUP BY s.student_id, s.name
ORDER BY total_issues DESC;

-- 7. Overdue books with contact info
SELECT
    s.name          AS student_name,
    s.email,
    b.title         AS book_title,
    i.issue_date,
    i.due_date,
    DATEDIFF(CURDATE(), i.due_date) AS days_overdue
FROM Issues i
JOIN Students s ON i.student_id = s.student_id
JOIN Books    b ON i.book_id    = b.book_id
WHERE i.status = 'Overdue'
ORDER BY days_overdue DESC;

-- 8. Book search by keyword (replace %algorithm% with your term)
SELECT
    book_id,
    title,
    author,
    quantity,
    CASE WHEN quantity > 0 THEN 'Available' ELSE 'Not Available' END AS availability
FROM Books
WHERE title LIKE '%algorithm%' OR author LIKE '%algorithm%';


-- ============================================================
-- SCHEMA INSPECTION
-- ============================================================
DESCRIBE Books;
DESCRIBE Students;
DESCRIBE Issues;

SHOW INDEX FROM Books;
SHOW INDEX FROM Students;
SHOW INDEX FROM Issues;
