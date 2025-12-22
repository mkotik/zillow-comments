const crypto = require("crypto");
const jwt = require("jsonwebtoken");

function getAccessTokenTtl() {
  return process.env.JWT_ACCESS_TTL || "15m";
}

function signAccessToken(user) {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) throw new Error("JWT_ACCESS_SECRET is required");

  return jwt.sign(
    {
      email: user.email,
    },
    secret,
    {
      subject: String(user._id),
      expiresIn: getAccessTokenTtl(),
    }
  );
}

function getRefreshTokenTtlDays() {
  const raw = process.env.REFRESH_TOKEN_TTL_DAYS;
  const days = raw ? Number(raw) : 180;
  return Number.isFinite(days) && days > 0 ? days : 180;
}

function generateRefreshToken() {
  return crypto.randomBytes(48).toString("base64url");
}

function hashRefreshToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function getRefreshCookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd, // required for SameSite=None in browsers
    sameSite: isProd ? "None" : "Lax",
    path: "/auth/refresh",
  };
}

function setRefreshCookie(res, token) {
  const days = getRefreshTokenTtlDays();
  res.cookie("refreshToken", token, {
    ...getRefreshCookieOptions(),
    maxAge: days * 24 * 60 * 60 * 1000,
  });
}

function clearRefreshCookie(res) {
  res.clearCookie("refreshToken", getRefreshCookieOptions());
}

module.exports = {
  signAccessToken,
  generateRefreshToken,
  hashRefreshToken,
  getRefreshTokenTtlDays,
  setRefreshCookie,
  clearRefreshCookie,
};


