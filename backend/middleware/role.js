// middleware/role.js

const requireRole = (allowedRoles) => {
    return (req, res, next) => {
      if (!allowedRoles.includes(req.user.user_role)) {
        return res.status(403).json({ error: "Access denied: insufficient role" });
      }
      next();
    };
  };
  
  module.exports = requireRole;
  