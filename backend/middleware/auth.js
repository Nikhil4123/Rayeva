const jwt    = require('jsonwebtoken')
const logger = require('../utils/logger')

const auth = (req, res, next) => {
  const authHeader = req.headers['authorization']
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'UNAUTHORIZED', message: 'Missing Bearer token' })
  }

  const token = authHeader.slice(7)
  try {
    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    req.user = payload
    next()
  } catch (err) {
    logger.warn(`JWT verify failed: ${err.message}`)
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, error: 'TOKEN_EXPIRED', message: 'Access token expired' })
    }
    return res.status(401).json({ success: false, error: 'INVALID_TOKEN', message: 'Invalid access token' })
  }
}

/**
 * Optional: require a specific role (e.g. 'admin').
 */
const requireRole = (role) => (req, res, next) => {
  if (!req.user || req.user.role !== role) {
    return res.status(403).json({ success: false, error: 'FORBIDDEN', message: 'Insufficient permissions' })
  }
  next()
}

module.exports = { auth, requireRole }
