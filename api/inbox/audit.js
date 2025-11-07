const crypto = require("crypto");

// simple in-memory cache (fine for development)
const cache = global.__AI_SYNC_CACHE__ || new Map();
global.__AI_SYNC_CACHE__ = cache;

const SECRET = process.env.MAKE_SIGNING_SECRET || "";

// helper to read raw request body
function readRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.setEncoding("utf8");
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

// helper to verify HMAC
function verify(raw, headerSig) {
  const h = "sha256=" + crypto.createHmac("sha256", SECRET).update(raw).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(h), Buffer.from(headerSig || ""));
  } catch {
    return false;
  }
}

module.exports = async (req, res) => {
  if (req.method === "POST") {
    const raw = await readRawBody(req);
    if (!verify(raw, req.headers["x-signature"])) {
      return res.status(401).json({ ok: false, error: "Bad signature" });
    }
    const ann = JSON.parse(raw || "{}");
    if (!ann.session_id) return res.status(400).json({ ok: false, error: "Missing session_id" });
    cache.set(`${ann.session_id}:audit`, ann);
    return res.status(200).json({ ok: true });
  }

  if (req.method === "GET") {
    const id = (req.query && req.query.session_id) || "";
    const data = cache.get(`${id}:audit`);
    return data ? res.status(200).json(data) : res.status(404).json({ ok: false });
  }

  res.setHeader("Allow", "GET, POST");
  res.status(405).end();
};
