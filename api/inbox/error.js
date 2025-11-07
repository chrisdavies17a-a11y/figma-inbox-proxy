module.exports = (req, res) => {
  if (req.method !== "POST") return res.status(405).end();
  console.error("AI→Figma error:", req.body);
  res.status(200).json({ ok: true });
};
