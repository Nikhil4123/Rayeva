const logger = require('../utils/logger')

if (!process.env.SARVAM_API_KEY) {
  logger.warn('SARVAM_API_KEY not set — AI features will fail at runtime')
}

const SARVAM_API_KEY  = process.env.SARVAM_API_KEY || ''
const SARVAM_BASE_URL = process.env.SARVAM_BASE_URL || 'https://api.sarvam.ai/v1'
const MODEL_NAME      = process.env.SARVAM_MODEL    || 'sarvam-m'

module.exports = { SARVAM_API_KEY, SARVAM_BASE_URL, MODEL_NAME }
