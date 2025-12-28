const AuditLog = require("../models/AuditLog");

module.exports = function audit(action, resource) {
  return (req, res, next) => {
    res.on("finish", () => {
      if (res.statusCode < 400) {
        AuditLog.create({
          userId: req.user?.id,
          action,
          resource,
          ip: req.ip
        });
      }
    });
    next();
  };
};