// api/inbox/audit.js

// Very small audit handler:
// - Accepts JSON body from Make
// - Stores it in a global variable
// - Returns ok:true

export default async function handler(req, res) {
  // Basic CORS (handy for Figma, Make, curl)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    // Parse JSON body (Make sends JSON already)
    const body =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    // Cache the latest payload in a global variable
    globalThis.__INBOX_LAST_PAYLOAD__ = body;

    // You can log if you want to debug
    console.log("✅ Cached latest payload from Make:", {
      hasAudit: !!body?.audit,
      hasFrames: Array.isArray(body?.frames),
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("❌ Error parsing body in /api/inbox/audit:", error);
    return res.status(400).json({ ok: false, error: "Invalid JSON" });
  }
}
