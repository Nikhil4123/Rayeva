const mongoose = require('mongoose')
const logger   = require('../utils/logger')

const connect = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/rayeva_ai'
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS:          45000,
    })
    const safeUri = uri.replace(/\/\/([^@]+)@/, '//<credentials>@')
    logger.info(`MongoDB: connected to ${safeUri}`)
  } catch (err) {
    logger.error(`MongoDB: connection failed — ${err.message}`)
    process.exit(1)
  }

  mongoose.connection.on('disconnected', () => logger.warn('MongoDB: disconnected'))
  mongoose.connection.on('error',        (err) => logger.error(`MongoDB error: ${err.message}`))
}

module.exports = { connect }
