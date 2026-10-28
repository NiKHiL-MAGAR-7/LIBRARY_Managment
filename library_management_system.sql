DROP DATABASE IF EXISTS library_db;

CREATE DATABASE library_db;

USE library_db;


CREATE TABLE Books (
    book_id     INT             NOT NULL AUTO_INCREMENT,  
    title       VARCHAR(150)    NOT NULL,                 
    author      VARCHAR(100)    NOT NULL,                 
    quantity    INT             NOT NULL DEFAULT 1,       

    -- Constraints
    PRIMARY KEY (book_id),                               
    CONSTRAINT chk_quantity CHECK (quantity >= 0)        
);


CREATE TABLE Students (
    student_id  INT             NOT NULL AUTO_INCREMENT,  
    name        VARCHAR(100)    NOT NULL,                 
    department  VARCHAR(50)     NOT NULL,                 
    email       VARCHAR(100)    NOT NULL,                 

    -- Constraints
    PRIMARY KEY (student_id),                            
    CONSTRAINT uq_email UNIQUE (email)                   
);


CREATE TABLE Issues (
    issue_id    INT             NOT NULL AUTO_INCREMENT,  
    student_id  INT             NOT NULL,                 
    book_id     INT             NOT NULL,                 
    issue_date  DATE            NOT NULL,                 
    return_date DATE            DEFAULT NULL,             
    status      ENUM('Issued', 'Returned', 'Overdue')
                                NOT NULL DEFAULT 'Issued',

    -- Constraints
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

    
    CONSTRAINT chk_dates CHECK (return_date IS NULL OR return_date >= issue_date)
);

INSERT INTO Books (title, author, quantity) VALUES
    ('Database System Concepts',     'Silberschatz, Korth & Sudarshan',  4),
    ('Introduction to Algorithms',   'Cormen, Leiserson & Rivest',       3),
    ('Operating System Principles',  'Abraham Silberschatz',             5),
    ('Computer Networks',            'Andrew S. Tanenbaum',              2),
    ('Let Us C',                     'Yashavant Kanetkar',               6);

INSERT INTO Students (name, department, email) VALUES
    ('Riya Sharma',   'Computer Science',    'riya.sharma@college.edu'),
    ('Arjun Mehta',   'Information Tech',    'arjun.mehta@college.edu'),
    ('Priya Nair',    'Electronics',         'priya.nair@college.edu');


INSERT INTO Issues (student_id, book_id, issue_date, return_date, status) VALUES
    (1, 1, '2026-10-01', '2026-10-14', 'Returned'),   
    (2, 3, '2026-10-05', NULL,         'Issued'),      
    (3, 2, '2026-09-20', NULL,         'Overdue'),     
    (1, 5, '2026-10-10', NULL,         'Issued'),      
    (2, 4, '2026-09-15', '2026-09-28', 'Returned');   


SELECT * FROM Books;

SELECT * FROM Students;

SELECT * FROM Issues;

SELECT
    i.issue_id,
    s.name          AS student_name,
    s.department,
    b.title         AS book_title,
    b.author,
    i.issue_date,
    i.return_date,
    i.status
FROM Issues i
JOIN Students s ON i.student_id = s.student_id
JOIN Books   b ON i.book_id     = b.book_id
ORDER BY i.issue_id;

SELECT
    s.name      AS student_name,
    b.title     AS book_title,
    i.issue_date,
    i.status
FROM Issues i
JOIN Students s ON i.student_id = s.student_id
JOIN Books   b ON i.book_id     = b.book_id
WHERE i.status IN ('Issued', 'Overdue');

SELECT
    s.name              AS student_name,
    COUNT(i.issue_id)   AS total_issues
FROM Students s
LEFT JOIN Issues i ON s.student_id = i.student_id
GROUP BY s.student_id, s.name
ORDER BY total_issues DESC;

SELECT
    s.name          AS student_name,
    s.email,
    b.title         AS book_title,
    i.issue_date    AS issued_on,
    DATEDIFF(CURDATE(), i.issue_date) AS days_since_issue
FROM Issues i
JOIN Students s ON i.student_id = s.student_id
JOIN Books   b ON i.book_id     = b.book_id
WHERE i.status = 'Overdue';

DESCRIBE Books;
DESCRIBE Students;
DESCRIBE Issues;

SHOW INDEX FROM Books;
SHOW INDEX FROM Students;
SHOW INDEX FROM Issues;

