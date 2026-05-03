const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token, unauthorized' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Admin access only' });
  }
  next();
};

const staffOnly = (req, res, next) => {
  if (req.user.role !== 'STAFF' && req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Staff access only' });
  }
  next();
};

module.exports = { protect, adminOnly, staffOnly };