// db.js — database connect aur setup yahan hota hai
const Database = require('better-sqlite3');

// Ye file-based database hai, "expenses.db" naam ki file bane gi is folder mein
const db = new Database('expenses.db');

// Agar table pehle se nahi hai to bana do (sirf pehli baar chalega)
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
