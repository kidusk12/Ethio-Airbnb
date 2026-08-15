const jwt = require('jsonwebtoken');
// Verifies the Authorization: Bearer <token> header.
// On success, attaches the decoded payload (id, role) to req.user.
// On failure, responds 401 directly — routes using this never run if the token's bad.

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Missing or invalid token' });
  }
}

module.exports = requireAuth;