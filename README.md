# Expense Tracker

## Kaise chalayein

1. Backend start karein:
   ```
   cd backend
   npm install
   ```

2. Chatbot ke liye Groq API key set karein:
   ```
   cp .env.example .env
   ```
   Phir `.env` file kholein aur `GROQ_API_KEY` mein apni key daalein — free key
   [console.groq.com/keys](https://console.groq.com/keys) se mil jaati hai.

3. Backend chalayein:
   ```
   node index.js
   ```

4. Frontend kholein: `frontend/index.html` ko browser mein double-click karein
   (ya VS Code "Live Server" extension use karein)

Backend `http://localhost:3000` par chalega. Data `backend/expenses.db` file mein save hoga — server restart ke baad bhi rahega.

## Folder structure

```
backend/
  index.js               → server + routes (including /chat)
  db.js                  → SQLite connection + table setup
  groqService.js         → Groq API (chatbot) ko call karta hai
  .env.example           → GROQ_API_KEY ke liye template (.env banayein isse copy karke)
  middleware/
    logger.js             → har request console pe print karta hai
    validateExpense.js    → POST data ko validate karta hai
frontend/
  index.html             → title/landing page (rotating background images)
  dashboard.html         → form, stat cards, list, Chart.js chart, aur chatbot widget
```

## Routes

| Method | Route              | Kaam                          |
|--------|---------------------|--------------------------------|
| GET    | /expenses            | Sab expenses laata hai         |
| POST   | /expenses            | Naya expense add karta hai     |
| DELETE | /expenses/:id        | Expense delete karta hai       |
| GET    | /expenses/summary    | Category-wise total (chart ke liye) |
| GET    | /expenses/stats      | Dashboard stat cards ke liye   |
| POST   | /chat                 | Chatbot se message bhejta hai — Groq API user ke expense data ke context ke saath reply karta hai |

## Chatbot

Dashboard ke bottom-right corner mein ek 💬 button hai. Isse click karke aap
apne expenses ke baare mein natural language mein sawaal pooch sakte hain —
jaise "Is mahine sabse zyada kis category pe kharch hua?" ya "Mera total
spending kitna hai?". Backend har message ke saath aapka current expense data
(totals, category breakdown, recent 25 entries) Groq ko bhejta hai taake reply
accurate ho.

Default model `llama-3.3-70b-versatile` hai — change karna ho to `.env` mein
`GROQ_MODEL` set kar dein.

## Groq chatbot setup

The backend is already configured to load `backend/.env`.

Before starting the backend, open `backend/.env` and replace:

`PASTE_YOUR_GROQ_API_KEY_HERE`

with your own Groq API key. Do not put the key in the frontend files or commit the `.env` file to GitHub.

Then run:

```bash
cd backend
npm install
npm start
```

The dashboard uses `http://localhost:3000/chat` for the assistant.
