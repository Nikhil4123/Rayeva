const logger = require('../utils/logger')

// Custom error classes for AI failures
class AIParseError extends Error {
  constructor(message, raw) {
    super(message)
    this.name  = 'AIParseError'
    this.raw   = raw
    this.statusCode = 422
  }
}

class AISchemaError extends Error {
  constructor(message, fields) {
    super(message)
    this.name   = 'AISchemaError'
    this.fields = fields
    this.statusCode = 422
  }
}

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, _next) => {
  const status = err.statusCode || err.status || 500
  const errorId = `ERR-${Date.now()}`

  // Log all 5xx errors with full stack
  if (status >= 500) {
    logger.error(`[${errorId}] ${req.method} ${req.url} — ${err.message}`, { stack: err.stack })
  } else {
    logger.warn(`[${errorId}] ${req.method} ${req.url} — ${err.message}`)
  }

  // Don't leak internal details in production
  const isProd = process.env.NODE_ENV === 'production'

  if (err.name === 'AIParseError' || err.name === 'AISchemaError') {
    return res.status(422).json({
      success: false,
      error:   err.name,
      message: err.message,
      ...(isProd ? {} : { raw: err.raw, fields: err.fields }),
      errorId,
    })
  }

  if (err.name === 'ValidationError') {
    return res.status(422).json({ success: false, error: 'VALIDATION_ERROR', message: err.message, errorId })
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ success: false, error: 'UNAUTHORIZED', message: err.message })
  }

  return res.status(status).json({
    success: false,
    error:   'SERVER_ERROR',
    message: isProd ? 'An unexpected error occurred' : err.message,
    errorId,
  })
}

module.exports = errorHandler
module.exports.AIParseError  = AIParseError
module.exports.AISchemaError = AISchemaError
