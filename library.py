import mysql.connector
from mysql.connector import Error
from datetime import date


def get_connection():
    """Create and return a connection to the library_db database."""
    try:
        conn = mysql.connector.connect(
            host     = "localhost",      
            user     = "root",          
            password = "YOUR_PASSWORD",               
            database = "library_db"      
        )
        return conn
    except Error as e:
        print(f"\n  [ERROR] Could not connect to database: {e}")
        print("  Make sure MySQL is running and your password is correct.\n")
        return None


# ============================================================
# HELPER UTILITIES
# ============================================================

def print_separator(char="─", length=60):
    """Print a decorative separator line."""
    print(char * length)

def print_header(title):
    """Print a formatted section header."""
    print()
    print_separator("═")
    print(f"  {title}")
    print_separator("═")

def print_table(headers, rows):
    """Print query results in a formatted table."""
    if not rows:
        print("  (No records found)")
        return

    
    col_widths = [len(h) for h in headers]
    for row in rows:
        for i, val in enumerate(row):
            col_widths[i] = max(col_widths[i], len(str(val) if val is not None else "NULL"))

    
    fmt = "  " + "  ".join(f"{{:<{w}}}" for w in col_widths)

    # Print header
    print_separator()
    print(fmt.format(*headers))
    print_separator()

    # Print rows
    for row in rows:
        display = [str(v) if v is not None else "NULL" for v in row]
        print(fmt.format(*display))

    print_separator()
    print(f"  Total records: {len(rows)}")


# ============================================================
# OPTION 1: VIEW ALL BOOKS
# ============================================================

def view_books(conn):
    """Display all books in the library with their availability."""
    print_header("📚  ALL BOOKS IN THE LIBRARY")
    try:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT
                book_id,
                title,
                author,
                quantity,
                CASE WHEN quantity > 0 THEN 'Available' ELSE 'Not Available' END AS availability
            FROM Books
            ORDER BY book_id
        """)
        rows = cursor.fetchall()
        headers = ["Book ID", "Title", "Author", "Qty", "Status"]
        print_table(headers, rows)
        cursor.close()
    except Error as e:
        print(f"  [ERROR] {e}")


# ============================================================
# OPTION 2: ADD A BOOK
# ============================================================

def add_book(conn):
    """Add a new book to the library."""
    print_header("➕  ADD A NEW BOOK")
    try:
        title    = input("  Enter Book Title  : ").strip()
        author   = input("  Enter Author Name : ").strip()
        qty_str  = input("  Enter Quantity    : ").strip()

        # Input validation
        if not title or not author:
            print("  [ERROR] Title and Author cannot be empty.")
            return
        if not qty_str.isdigit() or int(qty_str) <= 0:
            print("  [ERROR] Quantity must be a positive integer.")
            return

        quantity = int(qty_str)

        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO Books (title, author, quantity) VALUES (%s, %s, %s)",
            (title, author, quantity)   # Parameterized query (safe from SQL injection)
        )
        conn.commit()
        print(f"\n  [SUCCESS] Book '{title}' added with Book ID: {cursor.lastrowid}")
        cursor.close()
    except Error as e:
        print(f"  [ERROR] {e}")


# ============================================================
# OPTION 3: REGISTER A STUDENT
# ============================================================

def register_student(conn):
    """Register a new student in the library system."""
    print_header("🎓  REGISTER A NEW STUDENT")
    try:
        name       = input("  Enter Student Name   : ").strip()
        department = input("  Enter Department     : ").strip()
        email      = input("  Enter Email Address  : ").strip()

        # Input validation
        if not name or not department or not email:
            print("  [ERROR] All fields are required.")
            return
        if "@" not in email or "." not in email:
            print("  [ERROR] Please enter a valid email address.")
            return

        cursor = conn.cursor()

        # Check if email already exists (enforced by UNIQUE constraint too)
        cursor.execute("SELECT student_id FROM Students WHERE email = %s", (email,))
        if cursor.fetchone():
            print(f"  [ERROR] A student with email '{email}' already exists.")
            cursor.close()
            return

        cursor.execute(
            "INSERT INTO Students (name, department, email) VALUES (%s, %s, %s)",
            (name, department, email)
        )
        conn.commit()
        print(f"\n  [SUCCESS] Student '{name}' registered with Student ID: {cursor.lastrowid}")
        cursor.close()
    except Error as e:
        print(f"  [ERROR] {e}")


# ============================================================
# OPTION 4: ISSUE A BOOK
# ============================================================

def issue_book(conn):
    """Issue a book to a student after checking availability and validating IDs."""
    print_header("📤  ISSUE A BOOK TO A STUDENT")

    # First, show available books for convenience
    view_books(conn)

    try:
        sid_str = input("\n  Enter Student ID : ").strip()
        bid_str = input("  Enter Book ID    : ").strip()

        # Validate inputs are numeric
        if not sid_str.isdigit() or not bid_str.isdigit():
            print("  [ERROR] Student ID and Book ID must be numbers.")
            return

        student_id = int(sid_str)
        book_id    = int(bid_str)

        cursor = conn.cursor()

        # ── Validate Student ID ───────────────────────────────
        cursor.execute("SELECT name FROM Students WHERE student_id = %s", (student_id,))
        student = cursor.fetchone()
        if not student:
            print(f"  [ERROR] No student found with Student ID {student_id}.")
            cursor.close()
            return

        # ── Validate Book ID ──────────────────────────────────
        cursor.execute("SELECT title, quantity FROM Books WHERE book_id = %s", (book_id,))
        book = cursor.fetchone()
        if not book:
            print(f"  [ERROR] No book found with Book ID {book_id}.")
            cursor.close()
            return

        book_title, quantity = book

        
        if quantity <= 0:
            print(f"  [ERROR] '{book_title}' is currently out of stock.")
            cursor.close()
            return

       
        cursor.execute("""
            SELECT issue_id FROM Issues
            WHERE student_id = %s AND book_id = %s AND status = 'Issued'
        """, (student_id, book_id))
        if cursor.fetchone():
            print(f"  [ERROR] Student '{student[0]}' already has '{book_title}' issued.")
            cursor.close()
            return

        # ── Insert Issue Record ───────────────────────────────
        today = date.today()
        cursor.execute("""
            INSERT INTO Issues (student_id, book_id, issue_date, status)
            VALUES (%s, %s, %s, 'Issued')
        """, (student_id, book_id, today))

        # ── Decrease Book Quantity ────────────────────────────
        cursor.execute(
            "UPDATE Books SET quantity = quantity - 1 WHERE book_id = %s",
            (book_id,)
        )

        conn.commit()
        print(f"\n  [SUCCESS] '{book_title}' issued to '{student[0]}' on {today}.")
        print(f"            Issue ID: {cursor.lastrowid}")
        cursor.close()
    except Error as e:
        print(f"  [ERROR] {e}")


# ============================================================
# OPTION 5: RETURN A BOOK
# ============================================================

def return_book(conn):
    """Process the return of an issued book."""
    print_header("📥  RETURN A BOOK")

    try:
        iid_str = input("  Enter Issue ID to return : ").strip()

        if not iid_str.isdigit():
            print("  [ERROR] Issue ID must be a number.")
            return

        issue_id = int(iid_str)

        cursor = conn.cursor()

        # ── Fetch the Issue Record ────────────────────────────
        cursor.execute("""
            SELECT i.issue_id, s.name, b.title, b.book_id, i.status, i.issue_date
            FROM Issues i
            JOIN Students s ON i.student_id = s.student_id
            JOIN Books    b ON i.book_id    = b.book_id
            WHERE i.issue_id = %s
        """, (issue_id,))
        record = cursor.fetchone()

        if not record:
            print(f"  [ERROR] No issue record found with Issue ID {issue_id}.")
            cursor.close()
            return

        rec_issue_id, student_name, book_title, book_id, status, issue_date = record

        # ── Prevent Double Return ─────────────────────────────
        if status == 'Returned':
            print(f"  [ERROR] This book ('{book_title}') was already returned.")
            cursor.close()
            return

        # ── Process Return ────────────────────────────────────
        today = date.today()
        cursor.execute("""
            UPDATE Issues
            SET status = 'Returned', return_date = %s
            WHERE issue_id = %s
        """, (today, issue_id))

        # ── Increase Book Quantity ────────────────────────────
        cursor.execute(
            "UPDATE Books SET quantity = quantity + 1 WHERE book_id = %s",
            (book_id,)
        )

        conn.commit()
        print(f"\n  [SUCCESS] '{book_title}' returned by '{student_name}' on {today}.")
        print(f"            Issued on: {issue_date}  |  Returned on: {today}")
        cursor.close()
    except Error as e:
        print(f"  [ERROR] {e}")


# ============================================================
# OPTION 6: VIEW ISSUED BOOKS
# ============================================================

def view_issued_books(conn):
    """Show all books that are currently issued (not yet returned)."""
    print_header("📋  CURRENTLY ISSUED BOOKS")
    try:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT
                i.issue_id,
                s.student_id,
                s.name          AS student_name,
                b.book_id,
                b.title         AS book_title,
                i.issue_date,
                i.status,
                DATEDIFF(CURDATE(), i.issue_date) AS days_since_issue
            FROM Issues i
            JOIN Students s ON i.student_id = s.student_id
            JOIN Books    b ON i.book_id    = b.book_id
            WHERE i.status IN ('Issued', 'Overdue')
            ORDER BY i.issue_date ASC
        """)
        rows = cursor.fetchall()
        headers = ["Issue ID", "Stu ID", "Student Name", "Book ID", "Book Title",
                   "Issue Date", "Status", "Days Out"]
        print_table(headers, rows)
        cursor.close()
    except Error as e:
        print(f"  [ERROR] {e}")


# ============================================================
# MAIN MENU
# ============================================================

def print_menu():
    """Print the main menu options."""
    print()
    print_separator("─")
    print("         📖  LIBRARY MANAGEMENT SYSTEM")
    print_separator("─")
    print("   1.  View All Books")
    print("   2.  Add a New Book")
    print("   3.  Register a Student")
    print("   4.  Issue a Book")
    print("   5.  Return a Book")
    print("   6.  View Currently Issued Books")
    print("   7.  Exit")
    print_separator("─")


def main():
    """Main program loop."""
    print("\n  Connecting to library_db ...")

    conn = get_connection()

    if conn is None:
        print("  Exiting. Fix the connection settings and try again.")
        return

    print("  Connected successfully!\n")

    while True:
        print_menu()
        choice = input("  Enter your choice (1-7): ").strip()

        if   choice == "1":
            view_books(conn)
        elif choice == "2":
            add_book(conn)
        elif choice == "3":
            register_student(conn)
        elif choice == "4":
            issue_book(conn)
        elif choice == "5":
            return_book(conn)
        elif choice == "6":
            view_issued_books(conn)
        elif choice == "7":
            print("\n  Goodbye! Closing connection.\n")
            conn.close()
            break
        else:
            print("  [ERROR] Invalid choice. Please enter a number between 1 and 7.")

        input("\n  Press Enter to continue...")


# ============================================================
# ENTRY POINT
# ============================================================

if __name__ == "__main__":
    main()
