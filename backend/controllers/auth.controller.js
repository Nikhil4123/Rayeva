const bcrypt = require('bcryptjs')
const jwt    = require('jsonwebtoken')
const User   = require('../models/User')

const SALT_ROUNDS = 12

const generateTokens = (user) => {
  const payload = { id: user._id.toString(), email: user.email, role: user.role }
  const access  = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET,  { expiresIn: process.env.ACCESS_TOKEN_EXPIRY  || '1d' })
  const refresh = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d' })
  return { access, refresh }
}

// POST /auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body

    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing) {
      return res.status(409).json({ success: false, error: 'CONFLICT', message: 'Email already registered' })
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)
    const user         = await User.create({ name, email, passwordHash, role: role || 'user' })
    const tokens       = generateTokens(user)

    return res.status(201).json({
      success: true,
      data: {
        user:   { id: user._id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt },
        tokens,
      },
    })
  } catch (err) {
    next(err)
  }
}

// POST /auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email: email.toLowerCase() })

    // Constant-time compare even when user doesn't exist (prevents user enumeration)
    const hash  = user?.passwordHash || '$2b$12$invalidhashpadding000000000000000000000000000000000000000'
    const valid = await bcrypt.compare(password, hash)

    if (!user || !valid) {
      return res.status(401).json({ success: false, error: 'INVALID_CREDENTIALS', message: 'Invalid email or password' })
    }

    const tokens = generateTokens(user)

    return res.json({
      success: true,
      data: {
        user:   { id: user._id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt },
        tokens,
      },
    })
  } catch (err) {
    next(err)
  }
}

// POST /auth/refresh
const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body
    let payload
    try {
      payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
    } catch {
      return res.status(401).json({ success: false, error: 'INVALID_REFRESH_TOKEN', message: 'Refresh token expired or invalid' })
    }

    const user = await User.findById(payload.id).select('_id email role').lean()
    if (!user) return res.status(401).json({ success: false, error: 'USER_NOT_FOUND' })

    const tokens = generateTokens(user)
    return res.json({ success: true, data: { tokens } })
  } catch (err) {
    next(err)
  }
}

// POST /auth/logout  (client simply discards tokens — this endpoint is a no-op)
const logout = (_req, res) => res.json({ success: true, message: 'Logged out' })

// GET /auth/me
const me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash').lean()
    if (!user) return res.status(404).json({ success: false, error: 'NOT_FOUND' })
    return res.json({ success: true, data: { ...user, id: user._id } })
  } catch (err) {
    next(err)
  }
}

module.exports = { register, login, refresh, logout, me }
