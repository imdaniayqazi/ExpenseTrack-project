require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');
const logger = require('./middleware/logger');
const validateExpense = require('./middleware/validateExpense');
const { getChatReply } = require('./groqService');

const app = express();
const PORT = 3000;

// ── Global middleware (har request ke liye chalte hain) ──
app.use(cors());
app.use(express.json());
app.use(logger);

// ── Routes ──

// Sab expenses laao (latest date pehle)
app.get('/expenses', (req, res) => {
  const rows = db.prepare('SELECT * FROM expenses ORDER BY date DESC, id DESC').all();
  res.json(rows);
});

// Naya expense add karo
app.post('/expenses', validateExpense, (req, res) => {
  const { title, amount, category, date } = req.body;
  const stmt = db.prepare(
    'INSERT INTO expenses (title, amount, category, date) VALUES (?, ?, ?, ?)'
  );
  const result = stmt.run(title.trim(), Number(amount), category, date);

  const newExpense = db.prepare('SELECT * FROM expenses WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(newExpense);
});

// Expense delete karo
app.delete('/expenses/:id', (req, res) => {
  const result = db.prepare('DELETE FROM expenses WHERE id = ?').run(req.params.id);
  if (result.changes === 0) {
    return res.status(404).json({ message: 'Expense not found' });
  }
  res.json({ message: 'Expense deleted' });
});

// Category-wise total (chart ke liye) — e.g. [{category: "Food", total: 1200}, ...]
app.get('/expenses/summary', (req, res) => {
  const rows = db.prepare(`
    SELECT category, SUM(amount) as total
    FROM expenses
    GROUP BY category
    ORDER BY total DESC
  `).all();
  res.json(rows);
});

// Dashboard stats — total, is mahine ka total, top category, total entries
app.get('/expenses/stats', (req, res) => {
  const totalRow = db.prepare('SELECT COALESCE(SUM(amount), 0) as total, COUNT(*) as count FROM expenses').get();

  // strftime se date string se sirf "YYYY-MM" nikalte hain, current month se compare karte hain
  const monthRow = db.prepare(`
    SELECT COALESCE(SUM(amount), 0) as total
    FROM expenses
    WHERE strftime('%Y-%m', date) = strftime('%Y-%m', 'now')
  `).get();

  const topCategory = db.prepare(`
    SELECT category, SUM(amount) as total
    FROM expenses
    GROUP BY category
    ORDER BY total DESC
    LIMIT 1
  `).get();

  res.json({
    total: totalRow.total,
    count: totalRow.count,
    thisMonth: monthRow.total,
    topCategory: topCategory ? topCategory.category : '—'
  });
});

// Chatbot route — Groq API ko user ke expense data ke saath call karta hai
app.post('/chat', async (req, res) => {
  const { message, history } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ message: 'Message is required' });
  }

  try {
    // Chatbot ko dene ke liye current expense data nikaalte hain
    const totals = db.prepare('SELECT COALESCE(SUM(amount), 0) as total, COUNT(*) as count FROM expenses').get();

    const monthTotal = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM expenses
      WHERE strftime('%Y-%m', date) = strftime('%Y-%m', 'now')
    `).get();

    const categoryBreakdown = db.prepare(`
      SELECT category, SUM(amount) as total
      FROM expenses
      GROUP BY category
      ORDER BY total DESC
    `).all();

    const recentExpenses = db.prepare(`
      SELECT title, amount, category, date
      FROM expenses
      ORDER BY date DESC, id DESC
      LIMIT 25
    `).all();

    const expenseContext = {
      today: new Date().toISOString().slice(0, 10),
      totalSpending: totals.total,
      totalEntries: totals.count,
      thisMonthSpending: monthTotal.total,
      categoryBreakdown,
      recentExpenses
    };

    const reply = await getChatReply(message.trim(), history, expenseContext);
    res.json({ reply });
  } catch (err) {
    console.error(err);
    if (err.code === 'NO_API_KEY') {
      return res.status(500).json({ message: 'GROQ_API_KEY not set — add it to backend/.env' });
    }
    res.status(500).json({ message: 'Chatbot could not generate a reply right now' });
  }
});

// ── 404 handler (koi bhi route match na ho to) ──
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ── Error handler (agar kahin error throw ho) ──
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Something went wrong on the server' });
});

app.listen(PORT, () => {
  console.log(`Backend chal raha hai http://localhost:${PORT} par`);
});
