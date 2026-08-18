const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'vatika_sanctuary_secret_jwt_key_2026_botanical';

function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = (authHeader && authHeader.startsWith('Bearer '))
    ? authHeader.split(' ')[1]
    : (req.headers['x-access-token'] || req.query.token);

  if (!token) {
    return res.status(401).json({ status: 'error', message: 'Access token is required for authentication' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ status: 'error', message: 'Invalid or expired session token' });
  }
}

function optionalToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = (authHeader && authHeader.startsWith('Bearer '))
    ? authHeader.split(' ')[1]
    : (req.headers['x-access-token'] || req.query.token);

  if (token) {
    try {
      req.user = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      req.user = null;
    }
  } else {
    req.user = null;
  }
  next();
}

module.exports = {
  verifyToken,
  optionalToken,
  JWT_SECRET
};
