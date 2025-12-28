const jwt = require("jsonwebtoken");
const crypto = require("crypto");

exports.signAccessToken = (user) =>
  jwt.sign(
    { id: user._id, isAdmin: true },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

exports.signRefreshToken = (user) =>
  jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

exports.hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");