// api/inbox.js
// Single endpoint used by both Make (POST) and Figma (GET)

let cachedPayload = null; // <— module-level cache

function setCORS(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

export default async function handler(req, res) {
  setCORS(res);

  // 0) CORS preflight
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  // 1) POST from Make → cache payload
  if (req.method === "POST") {
    try {
      const body =
        typeof req.body === "string" ? JSON.parse(req.body) : req.body;

      if (!body || !Array.isArray(body.frames)) {
        return res
          .status(400)
          .json({ ok: false, error: "No frames array in payload" });
      }

      cachedPayload = body;
      console.log("Cached payload from Make:", JSON.stringify(body).slice(0, 200));

      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error("Error parsing POST body:", err);
      return res
        .status(400)
        .json({ ok: false, error: "Invalid JSON in POST /api/inbox" });
    }
  }

  // 2) GET from Figma / curl → return payload
  if (req.method === "GET") {
    if (!cachedPayload) {
      return res.status(200).json({
        ok: false,
        error: "No payload cached yet. Run your Make scenario first.",
      });
    }
    return res.status(200).json({
      ok: true,
      payload: cachedPayload,
    });
  }

  // 3) Anything else
  return res.status(405).json({ ok: false, error: "Use GET or POST" });
}
