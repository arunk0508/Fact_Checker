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
