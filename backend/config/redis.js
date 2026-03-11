const Redis  = require('ioredis')
const logger = require('../utils/logger')

let redis

const createRedisClient = () => {
  const client = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    retryStrategy: (times) => {
      if (times > 10) return null         // stop retrying after 10 attempts
      return Math.min(times * 100, 2000)  // exponential back-off up to 2 s
    },
    lazyConnect: false,
  })

  client.on('connect', () => logger.info('Redis: connected'))
  client.on('ready',   () => logger.info('Redis: ready'))
  client.on('error',  (err) => logger.warn(`Redis error: ${err.message}`))
  client.on('close',  () => logger.warn('Redis: connection closed'))

  return client
}

const getRedis = () => {
  if (!redis) redis = createRedisClient()
  return redis
}

module.exports = { getRedis }
