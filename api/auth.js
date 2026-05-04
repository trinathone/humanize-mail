// POST /api/auth  { password } → sets httpOnly cookie → 200 or 401
const PASSWORD = process.env.APP_PASSWORD || "Trinath";
const COOKIE_NAME = "hm_auth";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export default function handler(req, res) {
  if (req.method === "POST") {
    let body = req.body;
    if (typeof body === "string") {
      try { body = JSON.parse(body); } catch { /* ignore */ }
    }
    if (body?.password === PASSWORD) {
      res.setHeader(
        "Set-Cookie",
        `${COOKIE_NAME}=1; HttpOnly; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax`
      );
      return res.status(200).json({ ok: true });
    }
    return res.status(401).json({ error: "Wrong password." });
  }

  if (req.method === "DELETE") {
    res.setHeader(
      "Set-Cookie",
      `${COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`
    );
    return res.status(200).json({ ok: true });
  }

  res.setHeader("Allow", "POST, DELETE");
  return res.status(405).json({ error: "Method not allowed." });
}
