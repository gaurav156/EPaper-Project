const jwt = require("jsonwebtoken");

module.exports = function requireAdmin(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.sendStatus(401);

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET
    );

    if (!decoded.isAdmin) return res.sendStatus(403);

    req.user = decoded; // IMPORTANT for audit logs
    next();
  } catch {
    res.sendStatus(401);
  }
};