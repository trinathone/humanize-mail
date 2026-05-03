import React, { useState, useEffect, useMemo } from "react";
import {
  Loader2,
  Copy,
  Check,
  Sparkles,
  RotateCcw,
  History as HistoryIcon,
  Trash2,
  ArrowRight,
  X,
} from "lucide-react";

const TONES = [
  {
    id: "subtle",
    label: "Subtle",
    description: "Light cleanup. Keeps your structure and length.",
  },
  {
    id: "human",
    label: "Human",
    description: "Sounds like a real person wrote it.",
  },
  {
    id: "ceo",
    label: "CEO",
    description: "Ultra-short. Clipped. Sent-from-iPhone energy.",
  },
];

const STRENGTH_LABELS = ["Light", "Balanced", "Aggressive"];
const HISTORY_KEY = "humanizemail.history.v1";
const MAX_HISTORY = 20;

const EXAMPLE_TEXT = `Hi there,

I hope this email finds you well. I wanted to reach out and ask about potential ways we could work together. I think there's real value in exploring how we'd collaborate going forward. Let me know if you're available for a quick call soon.

Furthermore, I'd love to delve into some of the specifics when we connect. Looking forward to hearing from you.

Best regards,
Alex`;

function tokenize(str) {
  if (!str) return [];
  return str.match(/\s+|[^\s\w]+|\w+(?:['\u2019]\w+)*/g) || [];
}

function diffHighlight(before, after) {
  const beforeTokens = tokenize(before);
  const afterTokens = tokenize(after);
  const beforeCounts = new Map();
  for (const tok of beforeTokens) {
    if (!/\w/.test(tok)) continue;
    const key = tok.toLowerCase();
    beforeCounts.set(key, (beforeCounts.get(key) || 0) + 1);
  }
  return afterTokens.map((tok, i) => {
    if (!/\w/.test(tok)) return { text: tok, changed: false, key: i };
    const key = tok.toLowerCase();
    const remaining = beforeCounts.get(key) || 0;
    if (remaining > 0) {
      beforeCounts.set(key, remaining - 1);
      return { text: tok, changed: false, key: i };
    }
    return { text: tok, changed: true, key: i };
  });
}

function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveHistory(items) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, MAX_HISTORY)));
  } catch {
    /* localStorage may be unavailable */
  }
}

export default function App() {
  const [input, setInput] = useState(EXAMPLE_TEXT);
  const [output, setOutput] = useState("");
  const [toneIdx, setToneIdx] = useState(1);
  const [strength, setStrength] = useState(1); // 0,1,2
  const [lengthPct, setLengthPct] = useState(75); // target length percentage
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [lastInput, setLastInput] = useState("");
  const [provider, setProvider] = useState("");
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  useEffect(() => {
    function onKey(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        if (!loading && input.trim()) runRewrite();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [loading, input, toneIdx, strength, lengthPct]);

  const tone = TONES[toneIdx];
  const diffed = useMemo(
    () => (output ? diffHighlight(lastInput, output) : null),
    [output, lastInput]
  );

  async function runRewrite(opts = {}) {
    const t = opts.toneIdx ?? toneIdx;
    const s = opts.strength ?? strength;
    const l = opts.lengthPct ?? lengthPct;
    const text = input.trim();
    if (!text) {
      setError("Paste some text first.");
      return;
    }
    setError("");
    setLoading(true);
    setOutput("");
    setProvider("");
    const activeTone = TONES[t];

    try {
      const res = await fetch("/api/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          tone: activeTone.id,
          strength: STRENGTH_LABELS[s].toLowerCase(),
          lengthPct: l,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
      setLastInput(text);
      const cleaned = (data.text || "").trim();
      setOutput(cleaned);
      setProvider(data.provider || "");

      // Save to history
      const entry = {
        id: Date.now(),
        ts: new Date().toISOString(),
        tone: activeTone.id,
        toneLabel: activeTone.label,
        strength: STRENGTH_LABELS[s],
        lengthPct: l,
        input: text,
        output: cleaned,
      };
      const next = [entry, ...history].slice(0, MAX_HISTORY);
      setHistory(next);
      saveHistory(next);
    } catch (e) {
      setError(e?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  function handleReset() {
    setInput(EXAMPLE_TEXT);
    setOutput("");
    setLastInput("");
    setError("");
    setProvider("");
  }

  function handleClearInput() {
    setInput("");
    setOutput("");
    setLastInput("");
    setError("");
    setProvider("");
  }

  function handleClearHistory() {
    setHistory([]);
    saveHistory([]);
  }

  function restoreFromHistory(item) {
    setInput(item.input);
    setOutput(item.output);
    setLastInput(item.input);
    const tIdx = TONES.findIndex((x) => x.id === item.tone);
    if (tIdx >= 0) setToneIdx(tIdx);
    const sIdx = STRENGTH_LABELS.findIndex(
      (x) => x.toLowerCase() === (item.strength || "").toLowerCase()
    );
    if (sIdx >= 0) setStrength(sIdx);
    if (typeof item.lengthPct === "number") setLengthPct(item.lengthPct);
    setShowHistory(false);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        color: "var(--text)",
        padding: "32px 20px 80px",
      }}
    >
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        {/* Header */}
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 40,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                background: "var(--accent)",
                borderRadius: 8,
                display: "grid",
                placeItems: "center",
                color: "var(--bg)",
              }}
            >
              <Sparkles size={16} />
            </div>
            <div style={{ fontWeight: 600, fontSize: 17, letterSpacing: "-0.01em" }}>
              HumanizeMail
            </div>
          </div>
          <button
            onClick={() => setShowHistory(true)}
            className="btn-ghost"
            style={btnGhost}
            title="History"
          >
            <HistoryIcon size={15} />
            <span>History</span>
            {history.length > 0 && (
              <span
                style={{
                  background: "var(--surface-2)",
                  padding: "1px 7px",
                  borderRadius: 999,
                  fontSize: 11,
                  fontFamily: "var(--mono)",
                  color: "var(--text-muted)",
                }}
              >
                {history.length}
              </span>
            )}
          </button>
        </header>

        {/* Hero */}
        <div style={{ marginBottom: 32 }}>
          <h1
            style={{
              fontSize: "clamp(28px, 4.4vw, 40px)",
              fontWeight: 600,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              margin: "0 0 10px",
            }}
          >
            Make AI emails sound human.
          </h1>
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: 16,
              margin: 0,
              maxWidth: 560,
            }}
          >
            Paste a draft. Pick a voice. Get back something that doesn't reek of a
            language model.
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: 24,
            boxShadow: "var(--shadow-md)",
          }}
        >
          {/* Tone picker */}
          <Section label="Tone">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 8,
              }}
            >
              {TONES.map((t, i) => (
                <button
                  key={t.id}
                  onClick={() => setToneIdx(i)}
                  style={{
                    background:
                      i === toneIdx ? "var(--accent)" : "var(--surface-2)",
                    color: i === toneIdx ? "var(--bg)" : "var(--text)",
                    border: "1px solid",
                    borderColor:
                      i === toneIdx ? "var(--accent)" : "var(--border)",
                    padding: "10px 12px",
                    borderRadius: "var(--radius)",
                    cursor: "pointer",
                    fontSize: 14,
                    fontWeight: 500,
                    transition: "all 0.15s ease",
                    textAlign: "left",
                  }}
                >
                  <div style={{ fontWeight: 600 }}>{t.label}</div>
                  <div
                    style={{
                      fontSize: 11.5,
                      opacity: i === toneIdx ? 0.8 : 0.65,
                      marginTop: 2,
                      lineHeight: 1.35,
                    }}
                  >
                    {t.description}
                  </div>
                </button>
              ))}
            </div>
          </Section>

          {/* Strength + Length sliders */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 16,
              marginTop: 16,
            }}
          >
            <Section label={`Strength · ${STRENGTH_LABELS[strength]}`}>
              <input
                type="range"
                min={0}
                max={2}
                step={1}
                value={strength}
                onChange={(e) => setStrength(parseInt(e.target.value, 10))}
              />
              <SliderTicks labels={STRENGTH_LABELS} active={strength} />
            </Section>

            <Section label={`Target length · ~${lengthPct}%`}>
              <input
                type="range"
                min={30}
                max={100}
                step={5}
                value={lengthPct}
                onChange={(e) => setLengthPct(parseInt(e.target.value, 10))}
              />
              <SliderTicks
                labels={["30%", "65%", "100%"]}
                active={lengthPct < 50 ? 0 : lengthPct < 85 ? 1 : 2}
              />
            </Section>
          </div>

          {/* Input */}
          <Section label="Your AI-flavored draft" style={{ marginTop: 20 }}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your email here…"
              spellCheck={false}
              style={{
                width: "100%",
                minHeight: 180,
                padding: "14px 16px",
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                color: "var(--text)",
                fontSize: 14.5,
                lineHeight: 1.55,
                resize: "vertical",
                outline: "none",
                fontFamily: "var(--sans)",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "var(--border-strong)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "var(--border)";
              }}
            />
            <div
              style={{
                fontSize: 11,
                color: input.length > 7500 ? "var(--danger)" : input.length > 6000 ? "#d97706" : "var(--text-subtle)",
                fontFamily: "var(--mono)",
                marginTop: 6,
                textAlign: "right",
              }}
            >
              {input.trim().split(/\s+/).filter(Boolean).length} words ·{" "}
              {input.length} / 8000 chars
              {input.length > 6000 && (
                <span style={{ marginLeft: 6 }}>
                  {input.length > 7500 ? "⚠ almost at limit" : "approaching limit"}
                </span>
              )}
            </div>
          </Section>

          {/* Actions */}
          <div
            style={{
              display: "flex",
              gap: 10,
              marginTop: 4,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() => runRewrite()}
              disabled={loading || !input.trim()}
              style={{
                background:
                  loading || !input.trim() ? "var(--text-subtle)" : "var(--accent)",
                color: "var(--bg)",
                border: "none",
                padding: "11px 18px",
                borderRadius: "var(--radius)",
                fontWeight: 500,
                fontSize: 14.5,
                cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                transition: "all 0.15s ease",
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={15} style={{ animation: "spin 0.9s linear infinite" }} />
                  Humanizing…
                </>
              ) : (
                <>
                  <Sparkles size={15} />
                  Humanize as {tone.label}
                  <span style={{ fontSize: 11, opacity: 0.6, marginLeft: 4 }}>
                    ⌘↵
                  </span>
                </>
              )}
            </button>
            <button onClick={handleReset} style={btnGhost}>
              <RotateCcw size={14} />
              Reset
            </button>
            <button onClick={handleClearInput} style={btnGhost}>
              <X size={14} />
              Clear
            </button>
            {error && (
              <span
                style={{
                  color: "var(--danger)",
                  fontSize: 13,
                  fontFamily: "var(--mono)",
                }}
              >
                {error}
              </span>
            )}
          </div>

          {/* Output */}
          {(output || loading) && (
            <div style={{ marginTop: 28, animation: "fadeIn 0.2s ease" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <label
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: 11,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--text-subtle)",
                  }}
                >
                  Human version{" "}
                  {output && (
                    <span style={{ color: "var(--text-muted)" }}>
                      · {tone.label} · {STRENGTH_LABELS[strength]} · ~{lengthPct}%
                      {provider && (
                        <span style={{
                          marginLeft: 6,
                          background: "var(--surface-2)",
                          border: "1px solid var(--border)",
                          borderRadius: 4,
                          padding: "1px 6px",
                          fontSize: 10,
                          fontFamily: "var(--mono)",
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                        }}>
                          {provider}
                        </span>
                      )}
                    </span>
                  )}
                </label>
                {output && (
                  <button
                    onClick={handleCopy}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: copied ? "var(--success)" : "var(--text-muted)",
                      cursor: "pointer",
                      fontSize: 13,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                )}
              </div>
              <div
                style={{
                  padding: "16px 18px",
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  fontSize: 14.5,
                  lineHeight: 1.6,
                  whiteSpace: "pre-wrap",
                  minHeight: 110,
                }}
              >
                {loading && !output ? (
                  <ShimmerLines />
                ) : (
                  diffed &&
                  diffed.map((tok) =>
                    tok.changed ? (
                      <span
                        key={tok.key}
                        style={{
                          background: "var(--highlight)",
                          color: "#18181b",
                          padding: "1px 2px",
                          borderRadius: 2,
                        }}
                      >
                        {tok.text}
                      </span>
                    ) : (
                      <span key={tok.key}>{tok.text}</span>
                    )
                  )
                )}
              </div>
              {output && (
                <div
                  style={{
                    marginTop: 10,
                    fontSize: 11.5,
                    color: "var(--text-subtle)",
                    fontFamily: "var(--mono)",
                    display: "flex",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 8,
                  }}
                >
                  <span>
                    <span
                      style={{
                        background: "var(--highlight)",
                        color: "#18181b",
                        padding: "1px 5px",
                        borderRadius: 2,
                      }}
                    >
                      highlighted
                    </span>{" "}
                    = words the AI changed
                  </span>
                  <span>
                    {lastInput.split(/\s+/).filter(Boolean).length} →{" "}
                    {output.split(/\s+/).filter(Boolean).length} words
                    {" "}({Math.round((output.split(/\s+/).filter(Boolean).length / Math.max(1, lastInput.split(/\s+/).filter(Boolean).length)) * 100)}%)
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* How it works */}
        <div
          style={{
            marginTop: 40,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 12,
          }}
        >
          <HowStep n="01" title="Paste the draft" body="Anything that smells like a language model wrote it." />
          <HowStep n="02" title="Pick a voice" body="Subtle for polish. Human for natural. CEO when brevity wins." />
          <HowStep n="03" title="Send it" body="Copy the output, drop it in Gmail, hit send." />
        </div>

        <footer
          style={{
            marginTop: 56,
            textAlign: "center",
            color: "var(--text-subtle)",
            fontSize: 12,
            fontFamily: "var(--mono)",
          }}
        >
          History stored locally in your browser. Drafts never leave your device
          unless you click Humanize.
        </footer>
      </div>

      {/* History Drawer */}
      {showHistory && (
        <div
          onClick={() => setShowHistory(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            justifyContent: "flex-end",
            zIndex: 50,
            animation: "fadeIn 0.15s ease",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(440px, 100vw)",
              height: "100vh",
              background: "var(--surface)",
              borderLeft: "1px solid var(--border)",
              padding: 20,
              overflowY: "auto",
              boxShadow: "var(--shadow-lg)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 18,
              }}
            >
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 600 }}>
                History
              </h2>
              <div style={{ display: "flex", gap: 6 }}>
                {history.length > 0 && (
                  <button
                    onClick={handleClearHistory}
                    style={btnGhost}
                    title="Clear all"
                  >
                    <Trash2 size={14} />
                    Clear
                  </button>
                )}
                <button
                  onClick={() => setShowHistory(false)}
                  style={btnGhost}
                  title="Close"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {history.length === 0 ? (
              <div
                style={{
                  color: "var(--text-muted)",
                  fontSize: 14,
                  marginTop: 32,
                  textAlign: "center",
                }}
              >
                No history yet. Your rewrites will show up here.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {history.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => restoreFromHistory(item)}
                    style={{
                      background: "var(--surface-2)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius)",
                      padding: 12,
                      textAlign: "left",
                      cursor: "pointer",
                      color: "var(--text)",
                      transition: "border-color 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "var(--border-strong)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--border)";
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 6,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 11,
                          fontFamily: "var(--mono)",
                          color: "var(--text-muted)",
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                        }}
                      >
                        {item.toneLabel} · {item.strength}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          fontFamily: "var(--mono)",
                          color: "var(--text-subtle)",
                        }}
                      >
                        {new Date(item.ts).toLocaleString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: "var(--text-muted)",
                        marginBottom: 6,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {item.input}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 13,
                        color: "var(--text)",
                      }}
                    >
                      <ArrowRight size={13} style={{ flexShrink: 0 }} />
                      <span
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {item.output}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const btnGhost = {
  background: "transparent",
  border: "1px solid var(--border)",
  color: "var(--text)",
  padding: "8px 12px",
  borderRadius: "var(--radius)",
  fontSize: 13,
  fontWeight: 500,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  transition: "all 0.15s ease",
};

function Section({ label, children, style = {} }) {
  return (
    <div style={{ marginBottom: 8, ...style }}>
      <div
        style={{
          fontFamily: "var(--mono)",
          fontSize: 11,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--text-subtle)",
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

function SliderTicks({ labels, active }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginTop: 8,
        fontSize: 11,
        fontFamily: "var(--mono)",
      }}
    >
      {labels.map((l, i) => (
        <span
          key={l + i}
          style={{
            color: i === active ? "var(--text)" : "var(--text-subtle)",
            fontWeight: i === active ? 600 : 400,
          }}
        >
          {l}
        </span>
      ))}
    </div>
  );
}

function ShimmerLines() {
  const line = {
    height: 12,
    borderRadius: 3,
    marginBottom: 10,
    background:
      "linear-gradient(90deg, var(--surface-2) 0%, var(--border) 50%, var(--surface-2) 100%)",
    backgroundSize: "200px 100%",
    animation: "shimmer 1.2s ease-in-out infinite",
  };
  return (
    <div>
      <div style={{ ...line, width: "92%" }} />
      <div style={{ ...line, width: "88%" }} />
      <div style={{ ...line, width: "65%" }} />
      <div style={{ ...line, width: "78%" }} />
    </div>
  );
}

function HowStep({ n, title, body }) {
  return (
    <div
      style={{
        background: "var(--surface)",
        padding: "16px 18px",
        borderRadius: "var(--radius)",
        border: "1px solid var(--border)",
      }}
    >
      <div
        style={{
          fontFamily: "var(--mono)",
          fontSize: 11,
          color: "var(--text-subtle)",
          marginBottom: 6,
          letterSpacing: "0.1em",
        }}
      >
        {n}
      </div>
      <h3
        style={{
          fontSize: 15,
          fontWeight: 600,
          margin: "0 0 4px",
          letterSpacing: "-0.01em",
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: 13,
          color: "var(--text-muted)",
          lineHeight: 1.5,
          margin: 0,
        }}
      >
        {body}
      </p>
    </div>
  );
}
