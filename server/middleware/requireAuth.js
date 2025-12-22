const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : null;

  if (!token) {
    return res.status(401).json({ message: "Missing access token" });
  }

  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) {
    return res.status(500).json({ message: "Server misconfigured" });
  }

  try {
    const payload = jwt.verify(token, secret);
    req.user = {
      id: payload.sub,
      email: payload.email,
    };
    return next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid access token" });
  }
}

module.exports = { requireAuth };


