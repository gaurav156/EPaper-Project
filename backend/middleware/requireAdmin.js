const jwt = require("jsonwebtoken");

module.exports = function requireAdmin(req, res, next) {
  const token = req.cookies?.accessToken;
  if (!token) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.isAdmin) {
      return res.status(403).json({ message: "Admin only" });
    }

    req.user = decoded; // for audit logs
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};