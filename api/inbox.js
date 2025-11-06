// api/inbox.js  — Vercel serverless function that forwards to Make + fixes CORS

const MAKE_WEBHOOK_URL = 'https://hook.eu2.make.com/wclfp4dox4rimnvlafubtvzwatkfo4d5';

export default async function handler(req, res) {
  // CORS for the Figma Desktop/Web app
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    // Preflight OK, no body needed
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Use POST' });
    return;
  }

  try {
    // Forward the incoming body to Make as JSON
    const bodyString =
      typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});

    const makeRes = await fetch(MAKE_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: bodyString,
    });

    const text = await makeRes.text();

    // Try to parse JSON; if it’s plain text, just return it under "raw"
    try {
      const json = JSON.parse(text);
      res.status(200).json(json);
    } catch {
      res.status(200).json({ raw: text });
    }
  } catch (err) {
    res.status(500).json({ error: String(err?.message || err) });
  }
}
