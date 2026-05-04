<div align="center">

<img src="https://img.shields.io/badge/version-1.0.0-2dd4bf?style=flat-square&labelColor=0d1117"/>
<img src="https://img.shields.io/badge/deployed-vercel-2dd4bf?style=flat-square&logo=vercel&logoColor=white&labelColor=0d1117"/>
<img src="https://img.shields.io/badge/license-MIT-2dd4bf?style=flat-square&labelColor=0d1117"/>
<img src="https://img.shields.io/github/stars/trinathone/humanize-mail?style=flat-square&color=2dd4bf&labelColor=0d1117"/>

<br/><br/>

```
██╗  ██╗██╗   ██╗███╗   ███╗ █████╗ ███╗   ██╗██╗███████╗███████╗
██║  ██║██║   ██║████╗ ████║██╔══██╗████╗  ██║██║╚══███╔╝██╔════╝
███████║██║   ██║██╔████╔██║███████║██╔██╗ ██║██║  ███╔╝ █████╗  
██╔══██║██║   ██║██║╚██╔╝██║██╔══██║██║╚██╗██║██║ ███╔╝  ██╔══╝  
██║  ██║╚██████╔╝██║ ╚═╝ ██║██║  ██║██║ ╚████║██║███████╗███████╗
╚═╝  ╚═╝ ╚═════╝ ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝╚══════╝╚══════╝
███╗   ███╗ █████╗ ██╗██╗     
████╗ ████║██╔══██╗██║██║     
██╔████╔██║███████║██║██║     
██║╚██╔╝██║██╔══██║██║██║     
██║ ╚═╝ ██║██║  ██║██║███████╗
╚═╝     ╚═╝╚═╝  ╚═╝╚═╝╚══════╝
```

### *Your AI draft. Human voice. Zero robot residue.*

<br/>

[![Live Demo](https://img.shields.io/badge/🚀%20Try%20it%20Live-sincerely--app.vercel.app-2dd4bf?style=for-the-badge&labelColor=0d1117)](https://sincerely-app.vercel.app)

</div>

---

## `> what is this`

You write an email. AI helps you draft it. Then it comes out sounding like **a language model wrote it** — and everyone can tell.

HumanizeMail fixes that. Paste your draft, pick a voice, get back something that sounds like *you* actually typed it at 2pm between meetings.

```diff
- "I hope this email finds you well. I wanted to reach out and explore 
-  potential synergies and delve into ways we could collaborate going forward."

+ "Hope you're doing well — wanted to see if there's something worth 
+  building together here."
```

---

## `> features`

<table>
<tr>
<td width="50%">

**🎭 3 Tone Presets**
- `Subtle` — light cleanup, keeps your structure
- `Human` — sounds like a real person wrote it  
- `CEO` — ultra-short, sent-from-iPhone energy

</td>
<td width="50%">

**⚡ Smart Controls**
- Strength slider — Light / Balanced / Aggressive
- Target length — compress down to 30%
- Keyboard shortcut — `⌘↵` to humanize instantly

</td>
</tr>
<tr>
<td width="50%">

**🔍 Diff Highlighting**

Changed words highlighted in yellow so you can see exactly what the AI touched.

</td>
<td width="50%">

**📜 Local History**

Last 20 rewrites saved in your browser. Fully restorable. Nothing sent to a server.

</td>
</tr>
</table>

---

## `> provider chain`

No single point of failure. If one provider is rate-limited, it automatically tries the next:

```
Request
   │
   ├─▶  Groq (llama-3.3-70b)        ← fastest
   │         │ quota hit?
   ├─▶  OpenRouter (llama-3.3-70b)  ← fallback
   │         │ quota hit?
   └─▶  Gemini (gemini-2.0-flash)   ← last resort
```

---

## `> stack`

<p align="left">
<img src="https://img.shields.io/badge/React_18-0d1117?style=flat-square&logo=react&logoColor=61DAFB"/>
<img src="https://img.shields.io/badge/Vite_5-0d1117?style=flat-square&logo=vite&logoColor=646CFF"/>
<img src="https://img.shields.io/badge/Vercel_Serverless-0d1117?style=flat-square&logo=vercel&logoColor=white"/>
<img src="https://img.shields.io/badge/Groq_API-0d1117?style=flat-square&logoColor=2dd4bf"/>
<img src="https://img.shields.io/badge/Node.js_22-0d1117?style=flat-square&logo=node.js&logoColor=339933"/>
</p>

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite 5 |
| Styling | CSS variables, dark/light via system preference |
| API | Vercel Serverless Functions (Node.js) |
| LLMs | Groq → OpenRouter → Gemini (auto-fallback) |
| Auth | HttpOnly cookie, 7-day session |
| Storage | localStorage only — no database |

---

## `> run locally`

```bash
# 1. Clone
git clone https://github.com/trinathone/humanize-mail
cd humanize-mail

# 2. Install
npm install

# 3. Configure — copy and fill in at least one key
cp .env.example .env.local

# 4. Start API server + frontend
node dev-server.js &   # API on :3000
npm run dev            # Vite on :5173
```

Open **http://localhost:5173**

### `.env.local` options

```bash
# ── Option A: Groq (recommended, free, fast) ──────────────────────────
GROQ_API_KEY=gsk_...          # console.groq.com

# ── Option B: OpenRouter ──────────────────────────────────────────────
OPENROUTER_API_KEY=sk-or-...  # openrouter.ai

# ── Option C: Gemini ──────────────────────────────────────────────────
GEMINI_API_KEY=AIza...        # aistudio.google.com/app/apikey

# ── Option D: Ollama (fully local, no internet) ───────────────────────
LLM_PROVIDER=ollama
OLLAMA_MODEL=llama3.1
OLLAMA_URL=http://localhost:11434
```

---

## `> deploy your own`

```bash
# 1. Fork this repo, then:
npm i -g vercel
vercel --prod

# 2. Set env vars in Vercel dashboard:
#    GROQ_API_KEY, OPENROUTER_API_KEY, or GEMINI_API_KEY
#    APP_PASSWORD  (optional — locks the app with a password)
```

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/trinathone/humanize-mail)

---

## `> file structure`

```
humanize-mail/
├── api/
│   ├── rewrite.js     # LLM provider chain (Groq → OpenRouter → Gemini)
│   └── auth.js        # Password gate (httpOnly cookie)
├── src/
│   ├── App.jsx        # Full UI + password gate component
│   ├── main.jsx       # React entry
│   └── styles.css     # CSS variables, animations, dark/light theme
├── dev-server.js      # Local dev API server (no Vercel CLI needed)
├── .env.example       # All supported env vars
├── vercel.json        # Routing config
└── vite.config.js     # Vite + proxy config
```

---

## `> roadmap`

- [ ] Telegram bot — same rewrite logic via webhook
- [ ] Share links — short URL for a specific rewrite
- [ ] Custom tone presets — save your own voice to localStorage
- [ ] Browser extension — popover on any text field

---

<div align="center">

**Built by [Neo](https://github.com/trinathone) · Deployed on [Vercel](https://sincerely-app.vercel.app)**

<sub>Drafts never leave your device unless you click Humanize. No logs, no database, no tracking.</sub>

</div>
