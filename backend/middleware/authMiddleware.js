const jwt  = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer '))
    return res.status(401).json({ message: 'Not authorized, no token' });

  try {
    const decoded = jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) return res.status(401).json({ message: 'User not found' });
    next();
  } catch {
    res.status(401).json({ message: 'Token invalid or expired' });
  }
};

exports.adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin')
    return res.status(403).json({ message: 'Admin access only' });
  next();
};


exports.kitchenOnly = (req, res, next) => {
  if (!['admin', 'kitchen'].includes(req.user?.role))
    return res.status(403).json({ message: 'Kitchen access only' });
  next();
};

exports.userOnly = (req, res, next) => {
  if (req.user?.role !== 'user')
    return res.status(403).json({ message: 'Customer access only' });
  next();
};
