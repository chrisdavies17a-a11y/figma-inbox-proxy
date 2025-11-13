// test edit so GitHub enables commit
// api/inbox.js
// Single endpoint for both:
// - POST from Make  → cache the latest payload
// - GET  from Figma → return the cached payload

let cachedPayload = null;

function setCORS(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

export default async function handler(req, res) {
  setCORS(res);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  // 1) POST from Make: cache the payload
  if (req.method === "POST") {
    try {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      cachedPayload = body;
      console.log("Cached new payload from Make");
      res.status(200).json({ ok: true });
    } catch (err) {
      console.error("Error parsing JSON from Make:", err);
      res.status(400).json({ ok: false, error: "Invalid JSON" });
    }
    return;
  }

  // 2) GET from Figma / curl: return the cached payload
  if (req.method === "GET") {
    if (!cachedPayload) {
      res.status(200).json({
        ok: false,
        error: "No payload cached yet. Run your Make scenario first.",
      });
    } else {
      res.status(200).json({ ok: true, payload: cachedPayload });
    }
    return;
  }

  // Anything else
  res.status(405).json({ ok: false, error: "Method not allowed" });
}
