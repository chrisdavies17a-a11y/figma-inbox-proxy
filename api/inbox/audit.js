export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-make-secret');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  try {
    const providedSecret = req.headers['x-make-secret'];
    const validSecret = process.env.MAKE_SECRET || 'supersecret1234';

    if (providedSecret !== validSecret) {
      return res.status(401).json({ error: 'Invalid secret key' });
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    console.log('✅ Received from Make:', body);

    return res.status(200).json({ ok: true, received: body });
  } catch (error) {
    console.error('❌ Error:', error);
    return res.status(500).json({ ok: false, error: error.message });
  }
}
