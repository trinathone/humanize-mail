// Minimal local dev server for /api/rewrite
// Reads .env.local and serves the handler on port 3000

import http from "http";
import { readFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env.local
for (const envFile of [".env.local", ".env"]) {
  const p = join(__dirname, envFile);
  if (existsSync(p)) {
    for (const line of readFileSync(p, "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)=(.*)$/);
      if (m) process.env[m[1]] = m[2].trim();
    }
    break;
  }
}

const { default: handler } = await import("./api/rewrite.js");

const server = http.createServer(async (req, res) => {
  if (req.url !== "/api/rewrite") {
    res.writeHead(404).end();
    return;
  }

  let body = "";
  for await (const chunk of req) body += chunk;
  req.body = body;

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") { res.writeHead(204).end(); return; }

  const jsonRes = {
    status: null,
    headers: {},
    body: null,
    setHeader(k, v) { this.headers[k] = v; },
    status(code) { this.status = code; return this; },
    json(obj) {
      const payload = JSON.stringify(obj);
      res.writeHead(this.status || 200, { "Content-Type": "application/json", ...this.headers });
      res.end(payload);
    },
  };
  // Patch: handler calls res.status(x).json(y) or res.status(x) returns res
  const patchedRes = new Proxy(jsonRes, {
    get(t, prop) {
      if (prop === "status") return (code) => { t.status = code; return patchedRes; };
      if (prop === "json") return (obj) => {
        const payload = JSON.stringify(obj);
        res.writeHead(t.status || 200, { "Content-Type": "application/json", ...t.headers });
        res.end(payload);
      };
      if (prop === "setHeader") return (k, v) => res.setHeader(k, v);
      return t[prop];
    },
  });

  await handler(req, patchedRes);
});

server.listen(3000, () => console.log("API server → http://localhost:3000"));
