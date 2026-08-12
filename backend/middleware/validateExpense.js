// validateExpense.js — POST request ka data check karta hai save karne se pehle
function validateExpense(req, res, next) {
  const { title, amount, category, date } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ message: 'Title is required' });
  }
  if (amount === undefined || isNaN(amount) || Number(amount) <= 0) {
    return res.status(400).json({ message: 'Amount must be a valid positive number' });
  }
  if (!category || !category.trim()) {
    return res.status(400).json({ message: 'Category is required' });
  }
  if (!date) {
    return res.status(400).json({ message: 'Date is required' });
  }

  next(); // sab theek hai, aage badho
}

module.exports = validateExpense;
