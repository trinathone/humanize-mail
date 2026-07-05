<div align="center">

<img src="https://img.shields.io/badge/version-1.0.0-2dd4bf?style=flat-square&labelColor=0d1117"/>
<img src="https://img.shields.io/badge/deployed-vercel-2dd4bf?style=flat-square&logo=vercel&logoColor=white&labelColor=0d1117"/>
<img src="https://img.shields.io/badge/license-MIT-2dd4bf?style=flat-square&labelColor=0d1117"/>
<img src="https://img.shields.io/github/stars/trinathone/humanize-mail?style=flat-square&color=2dd4bf&labelColor=0d1117"/>

<br/><br/>

# HumanizeMail

### *Paste your AI draft. Get back something that sounds like you wrote it.*

<br/>

[![🚀 Try it Live — no sign-up required](https://img.shields.io/badge/🚀%20Try%20it%20Live%20—%20no%20sign--up%20required-sincerely--app.vercel.app-2dd4bf?style=for-the-badge&labelColor=0d1117)](https://sincerely-app.vercel.app)

</div>

---

## The Problem

You draft an email in ChatGPT. It comes back with:

> *"I hope this email finds you well. I wanted to reach out and explore potential synergies and delve into ways we could collaborate going forward."*

Everyone can tell. HumanizeMail strips the robot out in one click.

```diff
- "I hope this email finds you well. I wanted to reach out and explore
-  potential synergies and delve into ways we could collaborate going forward."

+ "Hope you're doing well — wanted to see if there's something worth
+  building together here."
```

---

## 10-Second Demo

1. Go to **[sincerely-app.vercel.app](https://sincerely-app.vercel.app)**
2. Paste your AI-written email
3. Pick a tone: `Subtle` / `Human` / `CEO`
4. Hit **⌘↵** — done.

No account. No login. Your text never leaves the serverless function.

---

## Features

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

Changed words highlighted in yellow — see exactly what the AI touched.

</td>
<td width="50%">

**📜 Local History**

Last 20 rewrites saved in your browser. Fully restorable. Nothing sent to a server.

</td>
</tr>
</table>

---

## Multi-Provider Fallback

No single point of failure. If one LLM is rate-limited, it tries the next automatically:

```
Your request
   │
   ├─▶  Groq  (llama-3.3-70b)        ← fastest, free tier
   │         │ quota hit?
   ├─▶  OpenRouter (llama-3.3-70b)   ← fallback
   │         │ quota hit?
   └─▶  Gemini (gemini-2.0-flash)    ← last resort
```

Or run it fully local with **Ollama** — zero internet, zero cost, zero data sent anywhere.

---

## Run Locally (60 seconds)

```bash
# 1. Clone
git clone https://github.com/trinathone/humanize-mail
cd humanize-mail

# 2. Install
npm install

# 3. Configure — add at least one API key
cp .env.example .env.local
#  GROQ_API_KEY=gsk_...     ← recommended (free at console.groq.com)

# 4. Start
node dev-server.js &   # API on :3000
npm run dev            # Vite frontend on :5173
```

Open **http://localhost:5173** and start rewriting.

### API Key Options

```bash
# Option A: Groq — free, fastest, recommended
GROQ_API_KEY=gsk_...           # console.groq.com

# Option B: OpenRouter
OPENROUTER_API_KEY=sk-or-...   # openrouter.ai

# Option C: Gemini
GEMINI_API_KEY=AIza...         # aistudio.google.com/app/apikey

# Option D: Ollama — fully local, no internet needed
LLM_PROVIDER=ollama
OLLAMA_MODEL=llama3.1
OLLAMA_URL=http://localhost:11434
```

---

## Deploy Your Own Instance

```bash
npm i -g vercel
vercel --prod
# Set GROQ_API_KEY (or other key) in the Vercel dashboard
# Optional: set APP_PASSWORD to lock the app with a password gate
```

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/trinathone/humanize-mail)

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite 5 |
| Styling | CSS variables, auto dark/light via system preference |
| API | Vercel Serverless Functions (Node.js 22) |
| LLMs | Groq → OpenRouter → Gemini (auto-fallback chain) |
| Auth | HttpOnly cookie, 7-day session (optional password gate) |
| Storage | `localStorage` only — no database, no logs |

---

## Project Structure

```
humanize-mail/
├── api/
│   ├── rewrite.js     # LLM provider chain (Groq → OpenRouter → Gemini)
│   └── auth.js        # Optional password gate (HttpOnly cookie)
├── src/
│   ├── App.jsx        # Full UI — editor, tone picker, diff view, history
│   ├── main.jsx       # React entry
│   └── styles.css     # CSS variables, animations, dark/light theme
├── dev-server.js      # Local dev API server (no Vercel CLI needed)
├── .env.example       # All supported env vars
├── vercel.json        # Routing config
└── vite.config.js     # Vite + proxy config
```

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full guide.

**Good first issues — all well-scoped, no deep context needed:**

| Label | Task |
|---|---|
| `good first issue` | Add character / word count display |
| `good first issue` | "Copy to clipboard" button with toast confirmation |
| `good first issue` | Keyboard shortcut cheat-sheet modal (`?` key) |
| `enhancement` | Custom tone presets (save your own voice to localStorage) |
| `enhancement` | Browser extension — popover on any `<textarea>` |
| `enhancement` | Telegram bot — same rewrite logic via webhook |
| `enhancement` | Share link — short URL for a specific rewrite |

---

## Roadmap

- [ ] Custom tone presets — define and save your own voice
- [ ] Browser extension — rewrite directly in Gmail / Outlook / Notion
- [ ] Telegram bot integration
- [ ] Share links for rewrites
- [ ] More language support (Spanish, French, German)

---

<div align="center">

**Built by [Neo](https://github.com/trinathone) · Live at [sincerely-app.vercel.app](https://sincerely-app.vercel.app)**

<sub>Your drafts never leave your device unless you click Humanize. No logs, no database, no tracking.</sub>

</div>
