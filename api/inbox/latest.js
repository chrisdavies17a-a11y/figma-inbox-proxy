// api/inbox/latest.js

// Returns the last payload that /api/inbox/audit stored in memory.

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const payload = globalThis.__INBOX_LAST_PAYLOAD__;

  if (!payload) {
    return res.status(200).json({
      ok: false,
      error: "No payload cached yet. Run your Make scenario first.",
    });
  }

  // Return whatever Make sent to /audit
  return res.status(200).json({
    ok: true,
    ...payload,
  });
}
