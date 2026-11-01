-- ====================================================================
-- Lab 2: SQLite database and CRUD routes
-- Database Initialization Script (SQLite CLI compatible)
-- Student: G Sainadh Reddy (252U1R6076) | Section: CSE 2B
-- ====================================================================

-- 1. Create table `book` with schema:
-- id INTEGER PRIMARY KEY AUTOINCREMENT
-- title TEXT NOT NULL
-- author TEXT NOT NULL
-- price INTEGER NOT NULL
-- pages INTEGER NOT NULL
CREATE TABLE IF NOT EXISTS book (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  price INTEGER NOT NULL,
  pages INTEGER NOT NULL
);

-- 2. Clear existing entries (if re-initializing)
DELETE FROM book;

-- 3. Reset auto-increment sequence
DELETE FROM sqlite_sequence WHERE name = 'book';

-- 4. Seed initial 10 books (Task 2: Insert 8-10 rows)
INSERT INTO book (title, author, price, pages) VALUES
  ('Harry Potter and the Sorcerer''s Stone', 'J.K. Rowling', 450, 320),
  ('The Hobbit', 'J.R.R. Tolkien', 399, 310),
  ('To Kill a Mockingbird', 'Harper Lee', 299, 281),
  ('1984', 'George Orwell', 250, 328),
  ('The Great Gatsby', 'F. Scott Fitzgerald', 199, 180),
  ('Pride and Prejudice', 'Jane Austen', 220, 279),
  ('The Catcher in the Rye', 'J.D. Salinger', 310, 234),
  ('Clean Code', 'Robert C. Martin', 850, 464),
  ('The Pragmatic Programmer', 'Andrew Hunt & David Thomas', 920, 352),
  ('Atomic Habits', 'James Clear', 499, 320);
