const jwt = require("jsonwebtoken");
const AdminSession = require("../models/AdminSession");

module.exports = async function requireAdmin(req, res, next) {
  const token = req.cookies.accessToken;
  if (!token) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.isAdmin) {
      return res.status(403).json({ message: "Admin only" });
    }

    const session = await AdminSession.findById(decoded.sid);
    if (!session) return res.sendStatus(401);

    if (session.revokedAt) {
      return res.status(401).json({ message: "Session revoked" });
    }

    req.user = decoded; // for audit logs
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};