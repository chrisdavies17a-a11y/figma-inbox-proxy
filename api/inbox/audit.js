export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-signature, x-make-secret');

  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    if (!body || !Array.isArray(body.frames)) {
      return res.status(400).json({ ok: false, error: 'Invalid JSON: missing frames[]' });
    }

    // Store payload in memory
    globalThis.__INBOX_CACHE__ = {
      receivedAt: Date.now(),
      payload: body
    };

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Error:', err);
    return res.status(400).json({ ok: false, error: 'Invalid JSON' });
  }
}
