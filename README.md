# TruthLayer — AI PDF Fact-Checker

Full-stack app: **React frontend + Express backend**
AI keys live only on the server — never exposed to the browser.

---

## Project Structure

```
truthlayer/
│
├── backend/                        ← Node.js / Express server
│   ├── routes/
│   │   └── factcheck.js            ← POST /api/extract-claims & /api/verify-claims
│   ├── aiProviders.js              ← Gemini + Groq AI logic (keys stay here)
│   ├── server.js                   ← Express app entry point (port 5000)
│   ├── package.json                ← Backend dependencies
│   ├── .env.example                ← Copy to .env and add your AI keys
│   └── .gitignore
│
├── src/                            ← React frontend
│   ├── components/
│   │   ├── ClaimCard.jsx           ← Result card (Verified / Inaccurate / False)
│   │   ├── ProgressBar.jsx         ← Loading progress bar
│   │   ├── StepBar.jsx             ← Step 1→2→3→4 tracker
│   │   └── UploadZone.jsx          ← Drag-and-drop PDF upload
│   ├── utils/
│   │   ├── aiClient.js             ← Calls backend API (no keys here!)
│   │   ├── factChecker.js          ← Orchestrates extract + verify
│   │   └── pdfExtractor.js         ← PDF.js text extraction (client-side)
│   ├── App.jsx                     ← Main page + backend status check
│   ├── main.jsx                    ← React entry point
│   └── index.css                   ← Tailwind + animations
│
├── public/
├── index.html
├── package.json                    ← Frontend dependencies
├── vite.config.js                  ← Vite + /api proxy to backend
├── tailwind.config.js
├── postcss.config.js
└── .env.example                    ← Frontend env (only VITE_API_URL)
```

---

## Setup — Step by Step

### Step 1 — Get Free API Keys

**Google Gemini (free, no credit card):**
1. Go to https://aistudio.google.com/app/apikey
2. Sign in with Google → click "Create API key" → copy it

**Groq (free, no credit card):**
1. Go to https://console.groq.com/keys
2. Sign up → click "Create API Key" → copy it

---

### Step 2 — Configure Backend Keys

```bash
cd backend
cp .env.example .env
```

Open `backend/.env` and fill in your keys:
```
AI_PROVIDER=gemini
GEMINI_API_KEY=AIzaSy_YOUR_KEY_HERE
GROQ_API_KEY=gsk_YOUR_KEY_HERE
```

---

### Step 3 — Install & Run Backend

```bash
cd backend
npm install
npm run dev
```

You should see:
```
🚀 TruthLayer backend running at http://localhost:5000
```

Visit http://localhost:5000/api/health to confirm it's working.

---

### Step 4 — Install & Run Frontend

Open a NEW terminal window:

```bash
cd truthlayer        (the root folder)
cp .env.example .env (leave as-is for local dev)
npm install
npm run dev
```

Open http://localhost:3000 — you'll see a green "Backend connected ✓" indicator.

---

## Deploy to Production

### Backend → Render (free)
1. Push the `backend/` folder to a GitHub repo
2. Go to https://render.com → New Web Service → connect repo
3. Build command: `npm install`
4. Start command: `npm start`
5. Add Environment Variables (same as backend/.env)
6. Deploy → copy your URL e.g. `https://truthlayer-backend.onrender.com`

### Frontend → Vercel (free)
1. Push the root `truthlayer/` folder to GitHub
2. Go to https://vercel.com → New Project → import repo
3. Add Environment Variable:
   `VITE_API_URL` = `https://truthlayer-backend.onrender.com`
4. Deploy → get your live URL

---

## API Endpoints

| Method | Endpoint              | Body                    | Returns              |
|--------|-----------------------|-------------------------|----------------------|
| GET    | /api/health           | —                       | Server status + provider info |
| POST   | /api/extract-claims   | `{ text: "..." }`       | `{ claims: [...] }` |
| POST   | /api/verify-claims    | `{ claims: [...] }`     | `{ results: [...] }` |
