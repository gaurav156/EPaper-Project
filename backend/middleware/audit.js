module.exports = function audit(action, resource, metaBuilder) {
  return (req, res, next) => {
    res.on("finish", () => {
      if (res.statusCode < 400) {
        AuditLog.create({
          userId: req.user?.id,
          action,
          resource,
          ip: req.ip,
          userAgent: req.headers["user-agent"],
          meta: metaBuilder ? metaBuilder(req) : undefined
        });
      }
    });
    next();
  };
};