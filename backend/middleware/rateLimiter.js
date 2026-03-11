const rateLimit        = require('express-rate-limit')
const { RateLimitRedisStore } = require('rate-limit-redis')
const { getRedis }     = require('../config/redis')
const logger           = require('../utils/logger')

/**
 * Build a rate-limiter with an optional Redis store.
 * Falls back to in-memory store if Redis is unavailable.
 */
const buildLimiter = ({ windowMs, max, message, keyPrefix }) => {
  let store
  try {
    const redisClient = getRedis()
    store = new RateLimitRedisStore({
      sendCommand: (...args) => redisClient.call(...args),
      prefix:      keyPrefix,
    })
  } catch (err) {
    logger.warn(`Rate-limiter: could not connect to Redis (${err.message}), falling back to memory store`)
  }

  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders:   false,
    store,
    handler: (_req, res) =>
      res.status(429).json({
        success: false,
        error:   'RATE_LIMIT',
        message,
      }),
  })
}

// General API — 300 req / 15 min per IP
const apiLimiter = buildLimiter({
  windowMs:  15 * 60 * 1000,
  max:       300,
  message:   'Too many requests, please try again in 15 minutes.',
  keyPrefix: 'rl:api:',
})

// AI endpoints — 30 req / min per IP (Gemini quota protection)
const aiLimiter = buildLimiter({
  windowMs:  60 * 1000,
  max:       30,
  message:   'AI rate limit reached. Please wait a moment before retrying.',
  keyPrefix: 'rl:ai:',
})

// Proposal generator — 10 req / min (heavy AI call)
const proposalLimiter = buildLimiter({
  windowMs:  60 * 1000,
  max:       10,
  message:   'Proposal generator rate limit reached. Please wait before generating another.',
  keyPrefix: 'rl:proposal:',
})

// Auth endpoints — 20 req / 15 min (brute-force protection)
const authLimiter = buildLimiter({
  windowMs:  15 * 60 * 1000,
  max:       20,
  message:   'Too many authentication attempts. Please try again in 15 minutes.',
  keyPrefix: 'rl:auth:',
})

module.exports = { apiLimiter, aiLimiter, proposalLimiter, authLimiter }
