// Serverless rewrite endpoint with pluggable LLM providers.
//
// Configure with env vars:
//   LLM_PROVIDER       = "gemini" | "ollama"   (default: "gemini")
//   GEMINI_API_KEY     = your Google AI Studio key  (required if provider=gemini)
//   GEMINI_MODEL       = e.g. "gemini-2.0-flash"    (default)
//   OLLAMA_URL         = e.g. "http://localhost:11434" (default)
//   OLLAMA_MODEL       = e.g. "llama3.1"            (default)
//
// On Vercel, only "gemini" works for the deployed URL — Vercel can't reach
// your laptop's Ollama. For local dev (`vercel dev` or `npm run dev`), either
// works.

const RATE_LIMIT_PER_HOUR = 30;
const MAX_INPUT_CHARS = 8000;

const TONE_INSTRUCTIONS = {
  subtle:
    "Do a LIGHT cleanup. Remove only the most obvious AI clichés ('I hope this email finds you well', 'furthermore', 'delve', 'it's important to note', tricolon filler). Keep the overall length, structure, greetings, and sign-offs. Small, surgical edits only.",
  human:
    "Rewrite this so it sounds like a real human wrote it. Cut AI tells and hedging filler. Use short sentences, contractions, and plain words. Keep every specific fact, name, number, and ask exactly as written. Don't invent content. If the original has no greeting or sign-off, don't add one.",
  ceo:
    "Rewrite this as if a busy CEO dashed it off from their phone. Aggressively cut. Fragments are fine. Drop 'I' where natural. No pleasantries, no greeting, no sign-off. Lowercase is acceptable. End with 'Sent from my iPhone'. Keep every specific fact, name, number, and ask — just compress everything around them.",
};

const STRENGTH_MODIFIERS = {
  light: "Be conservative — only change what is clearly necessary.",
  balanced: "Apply the rewrite confidently but don't over-edit.",
  aggressive:
    "Rewrite boldly — restructure sentences, cut hard, prefer punchy phrasing.",
};

const SYSTEM_PROMPT =
  "You rewrite text to sound like a real human wrote it, not an AI. Output ONLY the rewritten text — no preamble, no explanation, no surrounding quotes, no markdown fencing. Preserve all specific facts, names, numbers, dates, and explicit asks from the original. Never invent content.";

const hits = new Map();

function clientIp(req) {
  const fwd = req.headers["x-forwarded-for"];
  if (typeof fwd === "string" && fwd.length) return fwd.split(",")[0].trim();
  return req.socket?.remoteAddress || "unknown";
}

function checkRate(ip) {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000;
  const arr = (hits.get(ip) || []).filter((t) => now - t < windowMs);
  if (arr.length >= RATE_LIMIT_PER_HOUR) {
    const oldest = arr[0];
    const retryInSec = Math.ceil((windowMs - (now - oldest)) / 1000);
    return { ok: false, retryInSec };
  }
  arr.push(now);
  hits.set(ip, arr);
  return { ok: true };
}

function buildUserPrompt({ text, tone, strength, lengthPct }) {
  const lines = [TONE_INSTRUCTIONS[tone]];
  if (strength && STRENGTH_MODIFIERS[strength]) {
    lines.push(STRENGTH_MODIFIERS[strength]);
  }
  if (typeof lengthPct === "number" && lengthPct >= 30 && lengthPct <= 100) {
    lines.push(
      `Target length: roughly ${lengthPct}% of the original. Don't pad to hit it; trim toward it.`
    );
  }
  lines.push("\nHere is the text to rewrite:\n\n---\n" + text + "\n---");
  return lines.join("\n");
}

function getGeminiKeys() {
  const keys = [
    process.env.GEMINI_API_KEY_1,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
    process.env.GEMINI_API_KEY, // fallback to single key
  ].filter(Boolean);
  if (!keys.length) throw new Error("Server is missing GEMINI_API_KEY.");
  return keys;
}

async function callGeminiWithKey({ system, userPrompt, apiKey }) {
  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model
  )}:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { role: "system", parts: [{ text: system }] },
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
    }),
  });

  if (!res.ok) {
    const raw = await res.text();
    let msg = `Gemini API error (${res.status}).`;
    let isQuota = false;
    try {
      const parsed = JSON.parse(raw);
      if (parsed?.error?.message) msg = parsed.error.message;
      if (parsed?.error?.status === "RESOURCE_EXHAUSTED") isQuota = true;
    } catch { /* ignore */ }
    const err = new Error(msg);
    err.isQuota = isQuota || res.status === 429;
    throw err;
  }

  const data = await res.json();
  const out =
    (data.candidates || [])
      .flatMap((c) => c.content?.parts || [])
      .map((p) => p.text || "")
      .join("")
      .trim() || "";
  if (!out) throw new Error("Empty response from Gemini.");
  return out;
}

async function callGemini({ system, userPrompt }) {
  const keys = getGeminiKeys();
  let lastError;
  for (const apiKey of keys) {
    try {
      return await callGeminiWithKey({ system, userPrompt, apiKey });
    } catch (e) {
      lastError = e;
      if (!e.isQuota) throw e; // non-quota error, don't bother trying next key
      // quota error → try next key
    }
  }
  throw lastError;
}

async function callOllama({ system, userPrompt }) {
  const base = process.env.OLLAMA_URL || "http://localhost:11434";
  const model = process.env.OLLAMA_MODEL || "llama3.1";
  const res = await fetch(`${base.replace(/\/$/, "")}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      stream: false,
      messages: [
        { role: "system", content: system },
        { role: "user", content: userPrompt },
      ],
      options: { temperature: 0.7, num_predict: 1500 },
    }),
  });

  if (!res.ok) {
    const raw = await res.text();
    throw new Error(`Ollama error (${res.status}): ${raw.slice(0, 200)}`);
  }
  const data = await res.json();
  const out = (data.message?.content || "").trim();
  if (!out) throw new Error("Empty response from Ollama.");
  return out;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  const provider = (process.env.LLM_PROVIDER || "gemini").toLowerCase();

  const ip = clientIp(req);
  const gate = checkRate(ip);
  if (!gate.ok) {
    return res.status(429).json({
      error: `Rate limit reached (${RATE_LIMIT_PER_HOUR}/hour). Try again in ${Math.ceil(
        gate.retryInSec / 60
      )} minutes.`,
    });
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: "Invalid JSON body." });
    }
  }
  const { text, tone, strength, lengthPct } = body || {};

  if (typeof text !== "string" || !text.trim()) {
    return res.status(400).json({ error: "Missing text." });
  }
  if (text.length > MAX_INPUT_CHARS) {
    return res
      .status(400)
      .json({ error: `Input too long. Max ${MAX_INPUT_CHARS} characters.` });
  }
  if (!Object.prototype.hasOwnProperty.call(TONE_INSTRUCTIONS, tone)) {
    return res.status(400).json({ error: "Invalid tone." });
  }

  const userPrompt = buildUserPrompt({ text, tone, strength, lengthPct });

  try {
    let out;
    if (provider === "ollama") {
      out = await callOllama({ system: SYSTEM_PROMPT, userPrompt });
    } else if (provider === "gemini") {
      out = await callGemini({ system: SYSTEM_PROMPT, userPrompt });
    } else {
      return res
        .status(500)
        .json({ error: `Unknown LLM_PROVIDER: ${provider}` });
    }
    out = out.replace(/^["']|["']$/g, "").trim();
    return res.status(200).json({ text: out, provider });
  } catch (e) {
    return res.status(502).json({ error: e?.message || "Upstream error." });
  }
}
