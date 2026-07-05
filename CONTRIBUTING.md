# Contributing to HumanizeMail

Thanks for wanting to improve HumanizeMail! It's a small, well-scoped codebase — most features can be shipped in an afternoon.

---

## Quick Links

- 🐛 [Report a Bug](.github/ISSUE_TEMPLATE/bug_report.md)
- 💡 [Request a Feature](.github/ISSUE_TEMPLATE/feature_request.md)
- 🚀 [Live App](https://sincerely-app.vercel.app)

---

## Good First Issues

These are self-contained — no deep context required:

| Issue | Description |
|---|---|
| Word / char count | Show live word + character count below the input textarea |
| Copy to clipboard | "Copy" button on the output panel with a toast confirmation (`✓ Copied`) |
| Keyboard shortcut modal | Press `?` to open a cheatsheet of all keyboard shortcuts |
| Loading skeleton | Skeleton placeholder in the output panel while the LLM is responding |

---

## Local Setup

```bash
git clone https://github.com/trinathone/humanize-mail
cd humanize-mail
npm install

# Add at least one API key
cp .env.example .env.local
# GROQ_API_KEY=gsk_...   ← free at console.groq.com

# Start dev servers
node dev-server.js &   # API on :3000
npm run dev            # Vite on :5173
```

Open **http://localhost:5173**.

---

## Project Layout

```
humanize-mail/
├── api/
│   ├── rewrite.js     # Core: LLM provider chain + prompt logic
│   └── auth.js        # Optional password gate
├── src/
│   ├── App.jsx        # Entire UI (intentionally one file — easy to read)
│   ├── main.jsx       # React entry
│   └── styles.css     # CSS variables, dark/light theme
└── dev-server.js      # Express server that mimics Vercel serverless locally
```

`api/rewrite.js` is where the interesting work happens. Read it first.

---

## How the LLM Chain Works

```
POST /api/rewrite
    │
    ├─ try Groq (llama-3.3-70b)
    │       │ success → return
    │       │ 429 / error → next
    ├─ try OpenRouter (llama-3.3-70b)
    │       │ success → return
    │       │ 429 / error → next
    └─ try Gemini (gemini-2.0-flash)
            │ success → return
            └─ error → 503 to client
```

To add a new provider, add a function in `api/rewrite.js` matching the signature of the existing ones and insert it in the `PROVIDERS` array.

---

## Code Style

- **Vanilla React** — no Redux, no complex state management. Keep it that way.
- All styles in `styles.css` via CSS custom properties — no Tailwind, no CSS-in-JS.
- API routes are plain async functions. No framework in `api/`.
- ESM everywhere (`"type": "module"` in `package.json`).

---

## Pull Request Checklist

- [ ] Works locally (`npm run dev` + `node dev-server.js`)
- [ ] Tested with at least one API key (Groq is free)
- [ ] No API keys or personal data in the diff
- [ ] UI matches the existing dark/teal aesthetic
- [ ] PR description explains *what* and *why*

---

## Larger Features

Before starting anything that touches the prompt logic or adds a new provider, open an issue first so we can align on approach.

**Planned larger features:**
- Browser extension (Chrome + Firefox)
- Telegram bot (same prompt chain via webhook)
- Custom tone presets (localStorage-backed)
- Share links for rewrites

---

## License

By contributing, you agree your code is released under [MIT](LICENSE).
