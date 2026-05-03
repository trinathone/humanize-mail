# HumanizeMail

Make AI-flavored emails sound human again. Modern, minimal webapp with 3 tone presets, strength + length sliders, diff highlighting, and local history.

Inspired by the original Sincerely concept, rewritten with:

- Modern minimal UI (Inter font, light/dark via system preference)
- Pluggable LLM backend — **Gemini** (deployed) or **Ollama** (local)
- Strength slider (Light / Balanced / Aggressive)
- Target length slider (30%–100%)
- Local-only history (last 20 rewrites in your browser, restorable)
- Diff highlighting of changed words
- One-click copy

---

## 1. Pick your LLM

| Setup           | Where it runs                        | What you need                          |
| --------------- | ------------------------------------ | -------------------------------------- |
| **Gemini**      | Vercel (deployed) **or** local       | Free Google AI Studio key              |
| **Ollama**      | Local only (your computer)           | Ollama installed + a model pulled      |

**Recommendation:** Gemini for the deployed daily-use version, Ollama as a private fallback when you're running it locally.

> Vercel can't reach your laptop's Ollama, so Ollama only works when the entire app is running locally.

---

## 2. Run locally

### Option A — Gemini (cloud)

1. Get a free key from <https://aistudio.google.com/app/apikey>
2. Install + configure:
   ```bash
   cd sincerely-app
   npm install
   cp .env.example .env.local
   # edit .env.local and set GEMINI_API_KEY
   ```
3. Install Vercel CLI once: `npm i -g vercel`
4. Run frontend + API together:
   ```bash
   vercel dev
   ```
   Open the printed URL.

### Option B — Ollama (private, local-only)

1. Install Ollama: <https://ollama.com/download>
   - macOS: `brew install ollama` or use the .dmg
   - Linux: `curl -fsSL https://ollama.com/install.sh | sh`
   - Windows: download the installer
2. Start the server (it runs in the background):
   ```bash
   ollama serve
   ```
3. Pull a model in a new terminal:
   ```bash
   ollama pull llama3.1
   # or for something smaller/faster:
   # ollama pull llama3.2:3b
   # or for something stronger if you have the RAM:
   # ollama pull qwen2.5:14b
   ```
4. Configure the app:
   ```bash
   cd sincerely-app
   npm install
   cp .env.example .env.local
   ```
   Edit `.env.local`:
   ```
   LLM_PROVIDER=ollama
   OLLAMA_MODEL=llama3.1
   OLLAMA_URL=http://localhost:11434
   ```
5. Run with Vercel CLI: `vercel dev` (recommended) — this serves both the frontend and the `/api/rewrite` function.

---

## 3. Deploy to Vercel (free tier)

1. Push the `sincerely-app` folder to a GitHub repo:
   ```bash
   cd sincerely-app
   git init
   git add .
   git commit -m "init"
   gh repo create humanize-mail --public --source=. --push
   ```
   (or upload manually via GitHub's web UI)
2. Go to <https://vercel.com> → **New Project** → Import your repo.
3. Under **Environment Variables**, add:
   - `LLM_PROVIDER` = `gemini`
   - `GEMINI_API_KEY` = your key from <https://aistudio.google.com/app/apikey>
   - (optional) `GEMINI_MODEL` = `gemini-2.0-flash`
4. Hit **Deploy**.

You're done. Visit the URL Vercel gives you. The `/api/rewrite` serverless function reads the env vars and calls Gemini.

---

## How the UI works

- **Tone** picks the rewriting style (Subtle / Human / CEO).
- **Strength** controls how aggressive the model is allowed to be.
- **Target length** gives a soft hint to the model about how short to go.
- **History** is purely local (browser localStorage) — nothing leaves your device beyond the rewrite request itself.

The output panel diff-highlights words the model added or replaced relative to your input, so you can quickly spot what changed.

---

## File structure

```
sincerely-app/
├── api/
│   └── rewrite.js      # Vercel serverless function (Gemini + Ollama)
├── src/
│   ├── App.jsx         # Main UI
│   ├── main.jsx        # React entry
│   └── styles.css      # Global styles + theme variables
├── index.html
├── package.json
├── vercel.json
├── vite.config.js
└── .env.example
```

---

## What's next (phase 2 ideas)

- **Telegram bot** — add `api/telegram.js` as a webhook handler that forwards messages to the same rewrite logic. Set the webhook with `https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://your-app.vercel.app/api/telegram`.
- **Share links** — store rewrites in a free tier KV/Postgres (Vercel KV, Neon, Turso) and serve a `/r/<id>` route.
- **Custom tones** — let the user save their own tone presets to localStorage.
- **Browser extension** — strip the React UI down to a popover that runs against the same `/api/rewrite` endpoint.

---

## Notes

- Rate limit: 30 rewrites/hour per IP, in-memory (resets on serverless cold starts). Tune `RATE_LIMIT_PER_HOUR` in `api/rewrite.js`.
- Max input: 8000 characters.
- Drafts aren't stored on the server. The model API may log requests per its own retention policy — check Google's / your local model's docs.
