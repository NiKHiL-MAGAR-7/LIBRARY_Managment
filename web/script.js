// ============================================================
//  Library Management System — Frontend Demo
//  File    : script.js
//  Storage : localStorage (browser-based, no backend needed)
//  Note    : This is a UI demo. In production, replace
//            localStorage calls with Flask API fetch() calls.
// ============================================================

// ── Default Sample Data ──────────────────────────────────────
const DEFAULT_BOOKS = [
  { id: 1, title: "Database System Concepts",    author: "Silberschatz & Korth",    qty: 4 },
  { id: 2, title: "Introduction to Algorithms",  author: "Cormen, Leiserson & Rivest", qty: 3 },
  { id: 3, title: "Operating System Principles", author: "Abraham Silberschatz",    qty: 5 },
  { id: 4, title: "Computer Networks",           author: "Andrew S. Tanenbaum",     qty: 2 },
  { id: 5, title: "Let Us C",                    author: "Yashavant Kanetkar",      qty: 6 }
];

const DEFAULT_STUDENTS = [
  { id: 1, name: "Riya Sharma",  department: "Computer Science",  email: "riya.sharma@college.edu"  },
  { id: 2, name: "Arjun Mehta",  department: "Information Tech",  email: "arjun.mehta@college.edu"  },
  { id: 3, name: "Priya Nair",   department: "Electronics",       email: "priya.nair@college.edu"   }
];

const DEFAULT_ISSUES = [
  { id: 1, studentId: 1, bookId: 1, issueDate: "2026-10-01", returnDate: "2026-10-14", status: "Returned" },
  { id: 2, studentId: 2, bookId: 3, issueDate: "2026-10-05", returnDate: null,          status: "Issued"   },
  { id: 3, studentId: 3, bookId: 2, issueDate: "2026-09-20", returnDate: null,          status: "Overdue"  }
];

// ── localStorage Helpers ─────────────────────────────────────
function getData(key, fallback) {
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : fallback;
}
function saveData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ── Initialise on first load ─────────────────────────────────
function initData() {
  if (!localStorage.getItem("lms_books"))    saveData("lms_books",    DEFAULT_BOOKS);
  if (!localStorage.getItem("lms_students")) saveData("lms_students", DEFAULT_STUDENTS);
  if (!localStorage.getItem("lms_issues"))   saveData("lms_issues",   DEFAULT_ISSUES);
  if (!localStorage.getItem("lms_next_bid")) saveData("lms_next_bid", 6);
  if (!localStorage.getItem("lms_next_sid")) saveData("lms_next_sid", 4);
  if (!localStorage.getItem("lms_next_iid")) saveData("lms_next_iid", 4);
}

// ── Navigation ───────────────────────────────────────────────
function showPage(pageId) {
  document.querySelectorAll(".page-section").forEach(s => s.classList.remove("active"));
  document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
  document.getElementById("page-" + pageId).classList.add("active");
  document.getElementById("nav-" + pageId).classList.add("active");
  // Close mobile sidebar
  document.getElementById("sidebar").classList.remove("open");
  // Re-render the target page
  if (pageId === "dashboard") renderDashboard();
  if (pageId === "books")     renderBooks();
  if (pageId === "students")  renderStudents();
  if (pageId === "issues")    renderIssues();
}

// ── Flash Messages ───────────────────────────────────────────
function showMsg(text, type = "success") {
  const container = document.getElementById("flash-container");
  const div = document.createElement("div");
  div.className = `flash ${type}`;
  div.innerHTML = `<span>${type === "success" ? "✅" : "❌"}</span>
    <span>${text}</span>
    <button class="flash-close" onclick="this.parentElement.remove()">✕</button>`;
  container.prepend(div);
  setTimeout(() => div.remove(), 4000);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ── Dashboard ─────────────────────────────────────────────────
function renderDashboard() {
  const books    = getData("lms_books", []);
  const students = getData("lms_students", []);
  const issues   = getData("lms_issues", []);
  const active   = issues.filter(i => i.status !== "Returned").length;

  document.getElementById("stat-books").textContent    = books.length;
  document.getElementById("stat-students").textContent = students.length;
  document.getElementById("stat-issued").textContent   = active;

  // Recent activity list
  const actEl = document.getElementById("recent-activity");
  const recentIssues = [...issues].reverse().slice(0, 5);
  if (recentIssues.length === 0) {
    actEl.innerHTML = `<div class="empty-state"><div class="empty-icon">📋</div><p>No activity yet</p></div>`;
    return;
  }
  actEl.innerHTML = recentIssues.map(issue => {
    const student = getData("lms_students", []).find(s => s.id === issue.studentId);
    const book    = getData("lms_books",    []).find(b => b.id === issue.bookId);
    const sName = student ? student.name : "Unknown";
    const bTitle = book  ? book.title   : "Unknown";
    const badgeClass = issue.status === "Issued" ? "issued" : issue.status === "Returned" ? "returned" : "overdue";
    return `
      <div class="activity-row">
        <div class="activity-info">
          <span class="activity-name">${sName}</span>
          <span class="activity-book">→ ${bTitle}</span>
        </div>
        <div class="activity-meta">
          <span class="badge ${badgeClass}">${issue.status}</span>
          <span class="activity-date">${issue.issueDate}</span>
        </div>
      </div>`;
  }).join("");
}

// ── Books ─────────────────────────────────────────────────────
let bookSearchQuery = "";

function renderBooks(query = bookSearchQuery) {
  bookSearchQuery = query;
  let books = getData("lms_books", []);
  if (query) {
    const q = query.toLowerCase();
    books = books.filter(b => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q));
  }
  const tbody = document.getElementById("books-tbody");
  if (books.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state"><div class="empty-icon">📚</div><p>No books found</p></div></td></tr>`;
    return;
  }
  tbody.innerHTML = books.map(b => `
    <tr>
      <td><span class="id-badge">#${b.id}</span></td>
      <td><strong>${escHtml(b.title)}</strong></td>
      <td>${escHtml(b.author)}</td>
      <td>${b.qty}</td>
      <td><span class="badge ${b.qty > 0 ? 'avail' : 'out'}">${b.qty > 0 ? "Available" : "Out of Stock"}</span></td>
      <td>
        <button class="btn-icon danger" onclick="deleteBook(${b.id})" title="Delete Book">🗑</button>
      </td>
    </tr>`).join("");
}

function addBook(e) {
  e.preventDefault();
  const title  = document.getElementById("b-title").value.trim();
  const author = document.getElementById("b-author").value.trim();
  const qty    = parseInt(document.getElementById("b-qty").value);

  if (!title || !author || isNaN(qty) || qty < 1) {
    showMsg("Please fill all fields correctly. Quantity must be ≥ 1.", "error"); return;
  }
  const books   = getData("lms_books", []);
  const nextId  = getData("lms_next_bid", 6);
  books.push({ id: nextId, title, author, qty });
  saveData("lms_books", books);
  saveData("lms_next_bid", nextId + 1);
  document.getElementById("add-book-form").reset();
  renderBooks();
  showMsg(`Book "${title}" added with ID #${nextId}.`);
}

function deleteBook(id) {
  const books = getData("lms_books", []);
  const book  = books.find(b => b.id === id);
  if (!book) return;
  // Check if currently issued
  const issues = getData("lms_issues", []);
  const isActive = issues.some(i => i.bookId === id && i.status === "Issued");
  if (isActive) { showMsg("Cannot delete — this book is currently issued.", "error"); return; }
  if (!confirm(`Delete "${book.title}"? This cannot be undone.`)) return;
  saveData("lms_books", books.filter(b => b.id !== id));
  renderBooks();
  showMsg(`Book "${book.title}" deleted.`);
}

// ── Students ──────────────────────────────────────────────────
let studentSearchQuery = "";

function renderStudents(query = studentSearchQuery) {
  studentSearchQuery = query;
  let students = getData("lms_students", []);
  if (query) {
    const q = query.toLowerCase();
    students = students.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.department.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q));
  }
  const tbody = document.getElementById("students-tbody");
  if (students.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state"><div class="empty-icon">🎓</div><p>No students found</p></div></td></tr>`;
    return;
  }
  tbody.innerHTML = students.map(s => `
    <tr>
      <td><span class="id-badge">#${s.id}</span></td>
      <td><strong>${escHtml(s.name)}</strong></td>
      <td>${escHtml(s.department)}</td>
      <td>${escHtml(s.email)}</td>
      <td>
        <button class="btn-icon danger" onclick="deleteStudent(${s.id})" title="Delete Student">🗑</button>
      </td>
    </tr>`).join("");
}

function addStudent(e) {
  e.preventDefault();
  const name  = document.getElementById("s-name").value.trim();
  const dept  = document.getElementById("s-dept").value.trim();
  const email = document.getElementById("s-email").value.trim();

  if (!name || !dept || !email) {
    showMsg("All student fields are required.", "error"); return;
  }
  if (!email.includes("@") || !email.includes(".")) {
    showMsg("Enter a valid email address.", "error"); return;
  }
  const students = getData("lms_students", []);
  if (students.some(s => s.email === email)) {
    showMsg("A student with this email already exists.", "error"); return;
  }
  const nextId = getData("lms_next_sid", 4);
  students.push({ id: nextId, name, department: dept, email });
  saveData("lms_students", students);
  saveData("lms_next_sid", nextId + 1);
  document.getElementById("add-student-form").reset();
  renderStudents();
  showMsg(`Student "${name}" registered with ID #${nextId}.`);
}

function deleteStudent(id) {
  const students = getData("lms_students", []);
  const student  = students.find(s => s.id === id);
  if (!student) return;
  const issues = getData("lms_issues", []);
  const isActive = issues.some(i => i.studentId === id && i.status === "Issued");
  if (isActive) { showMsg("Cannot delete — student has an active book issue.", "error"); return; }
  if (!confirm(`Delete student "${student.name}"?`)) return;
  saveData("lms_students", students.filter(s => s.id !== id));
  renderStudents();
  showMsg(`Student "${student.name}" removed.`);
}

// ── Issues ────────────────────────────────────────────────────
function renderIssues() {
  const issues   = getData("lms_issues",   []);
  const students = getData("lms_students", []);
  const books    = getData("lms_books",    []);
  const tbody    = document.getElementById("issues-tbody");

  if (issues.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><div class="empty-icon">📋</div><p>No records found</p></div></td></tr>`;
    return;
  }
  tbody.innerHTML = [...issues].reverse().map(issue => {
    const student  = students.find(s => s.id === issue.studentId);
    const book     = books.find(b => b.id === issue.bookId);
    const sName    = student ? student.name  : `ID ${issue.studentId}`;
    const bTitle   = book    ? book.title    : `ID ${issue.bookId}`;
    const retDate  = issue.returnDate || "—";
    const bc       = issue.status === "Issued" ? "issued" : issue.status === "Returned" ? "returned" : "overdue";
    const retBtn   = issue.status !== "Returned"
      ? `<button class="btn-icon success" onclick="returnBook(${issue.id})" title="Return Book">↩ Return</button>`
      : `<span class="text-muted">Returned</span>`;
    return `
      <tr>
        <td><span class="id-badge">#${issue.id}</span></td>
        <td>${escHtml(sName)}</td>
        <td>${escHtml(bTitle)}</td>
        <td>${issue.issueDate}</td>
        <td>${retDate}</td>
        <td><span class="badge ${bc}">${issue.status}</span></td>
        <td>${retBtn}</td>
      </tr>`;
  }).join("");
}

function issueBook(e) {
  e.preventDefault();
  const sid = parseInt(document.getElementById("i-student").value);
  const bid = parseInt(document.getElementById("i-book").value);

  if (isNaN(sid) || isNaN(bid)) {
    showMsg("Enter valid numeric Student ID and Book ID.", "error"); return;
  }
  const students = getData("lms_students", []);
  const books    = getData("lms_books",    []);
  const issues   = getData("lms_issues",   []);

  const student = students.find(s => s.id === sid);
  const book    = books.find(b => b.id === bid);

  if (!student) { showMsg(`No student found with ID ${sid}.`,    "error"); return; }
  if (!book)    { showMsg(`No book found with ID ${bid}.`,        "error"); return; }
  if (book.qty <= 0) { showMsg(`"${book.title}" is out of stock.`, "error"); return; }

  const alreadyIssued = issues.some(i => i.studentId === sid && i.bookId === bid && i.status === "Issued");
  if (alreadyIssued) { showMsg(`${student.name} already has "${book.title}" issued.`, "error"); return; }

  const nextId = getData("lms_next_iid", issues.length + 1);
  const today  = new Date().toISOString().split("T")[0];

  issues.push({ id: nextId, studentId: sid, bookId: bid, issueDate: today, returnDate: null, status: "Issued" });
  book.qty -= 1;

  saveData("lms_issues",   issues);
  saveData("lms_books",    books);
  saveData("lms_next_iid", nextId + 1);

  document.getElementById("issue-book-form").reset();
  renderIssues();
  showMsg(`"${book.title}" issued to ${student.name} (Issue ID #${nextId}).`);
}

function returnBook(issueId) {
  const issues = getData("lms_issues", []);
  const books  = getData("lms_books",  []);
  const issue  = issues.find(i => i.id === issueId);

  if (!issue) { showMsg("Issue record not found.", "error"); return; }
  if (issue.status === "Returned") { showMsg("This book has already been returned.", "error"); return; }

  const book = books.find(b => b.id === issue.bookId);
  const today = new Date().toISOString().split("T")[0];

  issue.status     = "Returned";
  issue.returnDate = today;
  if (book) book.qty += 1;

  saveData("lms_issues",  issues);
  saveData("lms_books",   books);
  renderIssues();
  showMsg(`Book returned successfully! (Issue #${issueId})`);
}

// ── Utility: XSS-safe HTML escape ────────────────────────────
function escHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ── Reset all data (for demo purposes) ───────────────────────
function resetData() {
  if (!confirm("Reset all data to defaults? This will erase your additions.")) return;
  ["lms_books","lms_students","lms_issues","lms_next_bid","lms_next_sid","lms_next_iid"]
    .forEach(k => localStorage.removeItem(k));
  initData();
  renderDashboard();
  showMsg("Data has been reset to sample defaults.");
}

// ── Toggle mobile sidebar ─────────────────────────────────────
function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("open");
}

// ── Boot ─────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  initData();
  renderDashboard();

  // Book form submit
  document.getElementById("add-book-form").addEventListener("submit", addBook);

  // Student form submit
  document.getElementById("add-student-form").addEventListener("submit", addStudent);

  // Issue form submit
  document.getElementById("issue-book-form").addEventListener("submit", issueBook);

  // Book search (live)
  document.getElementById("book-search").addEventListener("input", e => renderBooks(e.target.value));

  // Student search (live)
  document.getElementById("student-search").addEventListener("input", e => renderStudents(e.target.value));
});
