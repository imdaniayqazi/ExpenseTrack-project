const Database = require('better-sqlite3');
const path = require('path');

const dbPath = process.env.VERCEL
  ? path.join('/tmp', 'expenses.db')
  : path.join(__dirname, 'expenses.db');

const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    amount REAL NOT NULL,
    category TEXT NOT NULL,
    date TEXT NOT NULL
  )
`);

module.exports = db;