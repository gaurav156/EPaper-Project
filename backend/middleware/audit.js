const AuditLog = require("../models/AuditLog");

module.exports = function audit(action, resource, detailsFn) {
  return (req, res, next) => {
    res.on("finish", async () => {
      if (res.statusCode < 400) {
        await AuditLog.create({
          userId: req.user?.id,
          action,
          resource,
          details: detailsFn ? detailsFn(req) : undefined,
          ip: req.ip,
          userAgent: req.headers["user-agent"]
        });
      }
    });
    next();
  };
};