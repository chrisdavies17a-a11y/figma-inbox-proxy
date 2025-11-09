// pages/api/inbox/audit.js (Next.js Pages API)

export const config = {
  api: {
    // Stop Next/Vercel from auto-parsing the body.
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-signature');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Method not allowed' });
    return;
  }

  // Read RAW body (because we disabled bodyParser)
  let raw = '';
  try {
    for await (const chunk of req) raw += chunk;
  } catch (e) {
    res.status(400).json({ ok: false, error: 'Failed to read body' });
    return;
  }

  if (!raw) {
    res.status(400).json({ ok: false, error: 'Empty body' });
    return;
  }

  let payload;
  try {
    payload = JSON.parse(raw); // Now we parse ourselves
  } catch (e) {
    res.status(400).json({ ok: false, error: 'Invalid JSON', raw });
    return;
  }

  // (Optional) log for debugging
  console.log('Received from Make:', payload);

  // Echo back so Make can see success
  res.status(200).json({ ok: true, received: payload });
}
