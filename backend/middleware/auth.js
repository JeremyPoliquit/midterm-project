const jwt = require('jsonwebtoken');
const JWT_SECRET = 'TpOjmT4K1B5Auv7JDHBhC9bO2wyPBVxCWGFbSaFMeQy7B0kom3iPT7RfxU6fOGqG';

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'No token provided' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    console.log('Decoded user:', user);  // Add this log
    req.user = user; // token payload (email)
    next();
  });
};

exports.requireRole = (role) => {
  return (req, res, next) => {
    if (req.user.user_role !== role) {
      return res.status(403).json({ error: "Access denied" });
    }
    next();
  };
};

module.exports = verifyToken;
