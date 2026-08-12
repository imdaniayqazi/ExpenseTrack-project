require('dotenv').config();
// groqService.js — Groq API (Llama models) ko call karke chatbot ka reply leta hai
require('dotenv').config();

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

// expenseContext = user ke expenses ka summary (stats, category breakdown, recent items)
// history = pichli baar-baar ki messages [{role: 'user'|'assistant', content: '...'}]
async function getChatReply(userMessage, history, expenseContext) {
  if (!process.env.GROQ_API_KEY) {
    const err = new Error('GROQ_API_KEY missing');
    err.code = 'NO_API_KEY';
    throw err;
  }

  const systemPrompt = `You are "Expense Assistant", a friendly personal-finance chatbot built into an expense tracker app.

Rules:
- Answer using ONLY the expense data provided below — never invent numbers.
- If the data doesn't answer the question, say so honestly instead of guessing.
- Keep replies short and conversational (2-4 sentences), unless the user asks for a detailed breakdown.
- Always show money as "Rs <amount>".
- You can help with things like: totals, category breakdowns, spending trends, biggest/smallest expenses, budgeting tips based on their actual data.

Here is the user's current expense data as JSON:
${JSON.stringify(expenseContext)}`;

  // History ko zyada lamba na hone dein (token limit aur cost bachane ke liye)
  const trimmedHistory = Array.isArray(history) ? history.slice(-10) : [];

  const messages = [
    { role: 'system', content: systemPrompt },
    ...trimmedHistory,
    { role: 'user', content: userMessage }
  ];

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages,
      temperature: 0.4,
      max_completion_tokens: 500
    })
  });

  if (!response.ok) {
    const errBody = await response.text();
    console.error('Groq API error:', response.status, errBody);
    const err = new Error('Groq API request failed');
    err.code = 'GROQ_ERROR';
    throw err;
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || "Sorry, I couldn't come up with a reply.";
}

module.exports = { getChatReply };
