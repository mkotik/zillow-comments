const bcrypt = require("bcryptjs");
const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");
const { verifyGoogleIdToken } = require("../utils/google");
const {
  signAccessToken,
  generateRefreshToken,
  hashRefreshToken,
  getRefreshTokenTtlDays,
  setRefreshCookie,
  clearRefreshCookie,
} = require("../utils/tokens");

function normalizeEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase();
}

function publicUser(user) {
  const profilePictureUrl = user.profilePictureUrl || "";
  const profilePictureHidden = !!user.profilePictureHidden;
  const googlePicture = user.picture || "";
  const effectivePicture = profilePictureHidden
    ? ""
    : profilePictureUrl || googlePicture;

  return {
    id: String(user._id),
    email: user.email,
    name: user.name || "",
    picture: effectivePicture,
    profilePictureUrl,
    profilePictureHidden,
  };
}

async function issueSession(req, res, user) {
  const refreshToken = generateRefreshToken();
  const tokenHash = hashRefreshToken(refreshToken);
  const ttlDays = getRefreshTokenTtlDays();

  const expiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);
  await RefreshToken.create({
    userId: user._id,
    tokenHash,
    expiresAt,
    userAgent: req.get("user-agent"),
    ip: req.ip,
  });

  setRefreshCookie(res, refreshToken);
  const accessToken = signAccessToken(user);
  return { accessToken };
}

exports.signup = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || "");
    const name = String(req.body.name || "").trim();

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }
    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      email,
      passwordHash,
      name: name || email.split("@")[0],
    });

    const { accessToken } = await issueSession(req, res, user);
    return res.status(201).json({ accessToken, user: publicUser(user) });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ message: "Signup failed" });
  }
};

exports.login = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || "");

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    console.log("user found", user);
    if (!user || !user.passwordHash) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    console.log("ok", ok);
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const { accessToken } = await issueSession(req, res, user);
    return res.status(200).json({ accessToken, user: publicUser(user) });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Login failed" });
  }
};

exports.google = async (req, res) => {
  try {
    const idToken = String(req.body.idToken || "");
    if (!idToken) {
      return res.status(400).json({ message: "idToken is required" });
    }

    const payload = await verifyGoogleIdToken(idToken);
    const email = normalizeEmail(payload.email);
    const googleSub = payload.sub;

    if (!email || !googleSub) {
      return res.status(400).json({ message: "Google token missing fields" });
    }

    let user = await User.findOne({ googleSub });
    if (!user) {
      user = await User.findOne({ email });

      if (user) {
        if (user.googleSub && user.googleSub !== googleSub) {
          return res
            .status(409)
            .json({ message: "Account already linked to another Google user" });
        }
        user.googleSub = googleSub;
        if (!user.name && payload.name) user.name = payload.name;
        if (!user.picture && payload.picture) user.picture = payload.picture;
        await user.save();
      } else {
        user = await User.create({
          email,
          googleSub,
          name: payload.name || email.split("@")[0],
          picture: payload.picture || "",
        });
      }
    }

    const { accessToken } = await issueSession(req, res, user);
    return res.status(200).json({ accessToken, user: publicUser(user) });
  } catch (err) {
    console.error("Google auth error:", err);
    return res.status(401).json({ message: "Google authentication failed" });
  }
};

exports.refresh = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({ message: "Missing refresh token" });
    }

    const tokenHash = hashRefreshToken(token);
    const existing = await RefreshToken.findOne({ tokenHash });
    if (
      !existing ||
      existing.revokedAt ||
      (existing.expiresAt && existing.expiresAt.getTime() <= Date.now())
    ) {
      clearRefreshCookie(res);
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const user = await User.findById(existing.userId);
    if (!user) {
      clearRefreshCookie(res);
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    // Rotate refresh token
    existing.revokedAt = new Date();
    await existing.save();

    const { accessToken } = await issueSession(req, res, user);
    return res.status(200).json({ accessToken, user: publicUser(user) });
  } catch (err) {
    console.error("Refresh error:", err);
    return res.status(500).json({ message: "Refresh failed" });
  }
};

exports.logout = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      const tokenHash = hashRefreshToken(token);
      await RefreshToken.updateOne(
        { tokenHash, revokedAt: null },
        { $set: { revokedAt: new Date() } }
      );
    }
    clearRefreshCookie(res);
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Logout error:", err);
    clearRefreshCookie(res);
    return res.status(200).json({ ok: true });
  }
};

exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json({ user: publicUser(user) });
  } catch (err) {
    console.error("Me error:", err);
    return res.status(500).json({ message: "Failed to load user" });
  }
};

exports.updateMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { profilePictureUrl, profilePictureHidden } = req.body || {};

    if (profilePictureHidden !== undefined) {
      if (typeof profilePictureHidden !== "boolean") {
        return res
          .status(400)
          .json({ message: "profilePictureHidden must be a boolean" });
      }
      user.profilePictureHidden = profilePictureHidden;
    }

    if (profilePictureUrl !== undefined) {
      if (typeof profilePictureUrl !== "string") {
        return res
          .status(400)
          .json({ message: "profilePictureUrl must be a string" });
      }

      const trimmed = profilePictureUrl.trim();

      // allow clearing with ""
      if (trimmed && !/^https?:\/\//i.test(trimmed)) {
        return res
          .status(400)
          .json({ message: "profilePictureUrl must be a valid URL" });
      }

      user.profilePictureUrl = trimmed;

      // If a custom URL is being set, it always becomes visible.
      if (trimmed) user.profilePictureHidden = false;
    }

    await user.save();
    return res.status(200).json({ user: publicUser(user) });
  } catch (err) {
    console.error("updateMe error:", err);
    return res.status(500).json({ message: "Failed to update user" });
  }
};
