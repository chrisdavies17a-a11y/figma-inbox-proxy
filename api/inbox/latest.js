export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const cache = globalThis.__INBOX_CACHE__;
  if (!cache || !cache.payload) {
    return res.status(404).json({ ok: false, error: 'No payload cached yet. Run your Make scenario first.' });
  }

  return res.status(200).json({
    ok: true,
    receivedAt: cache.receivedAt,
    ...cache.payload
  });
}
