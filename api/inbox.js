// Vercel Serverless Function: /api/inbox
// Purpose: Accept POSTs from your Figma plugin, forward to Make Webhook,
// and relay the JSON response back to the plugin (with proper CORS).

const MAKE_WEBHOOK_URL =
  "https://hook.eu2.make.com/wclfp4dox4rimnvlafubtvzwatkfo4d5"; // <-- your Make webhook

function setCORS(res) {
  // Allow Figma UI (runs on figma.com) to call this
  res.setHeader("Access-Control-Allow-Origin", "https://www.figma.com");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Max-Age", "86400"); // cache preflight for a day
}

export default async function handler(req, res) {
  setCORS(res);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST" });
  }

  try {
    // Parse incoming JSON from the plugin
    const payload = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    // Forward to Make
    const makeResp = await fetch(MAKE_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        _proxyMeta: {
          source: "figma-inbox-proxy",
          when: new Date().toISOString(),
        },
      }),
    });

    // If Make doesn’t return JSON, surface a helpful error
    const text = await makeResp.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      return res
        .status(502)
        .json({ error: "Make did not return JSON", status: makeResp.status, body: text });
    }

    // Relay Make’s JSON back to the plugin
    return res.status(makeResp.ok ? 200 : makeResp.status).json(json);
  } catch (err) {
    console.error("Proxy error:", err);
    return res.status(500).json({ error: "Proxy failed", details: String(err?.message || err) });
  }
}
