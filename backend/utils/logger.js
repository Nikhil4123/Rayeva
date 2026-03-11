const winston = require('winston')

const { combine, timestamp, printf, colorize, errors } = winston.format

const consoleFmt = printf(({ level, message, timestamp: ts, stack }) =>
  stack ? `${ts} [${level}] ${message}\n${stack}` : `${ts} [${level}] ${message}`,
)

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  format: combine(errors({ stack: true }), timestamp({ format: 'YYYY-MM-DD HH:mm:ss' })),
  transports: [
    new winston.transports.Console({
      format: combine(colorize(), consoleFmt),
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level:    'error',
      format:   combine(timestamp(), winston.format.json()),
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      format:   combine(timestamp(), winston.format.json()),
    }),
  ],
})

// Add http level for morgan
logger.http = (msg) => logger.log('http', msg)

module.exports = logger
