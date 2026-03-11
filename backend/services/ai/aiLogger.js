const AILog  = require('../../models/AILog')
const logger = require('../../utils/logger')

/**
 * Write a document to the ai_logs collection.
 * Called in a finally block so it never throws to the caller.
 *
 * @param {{
 *   module:          string,
 *   userId:          string|null,
 *   requestPayload:  object,
 *   responsePayload: object|null,
 *   promptTokens:    number,
 *   candidateTokens: number,
 *   latencyMs:       number,
 *   success:         boolean,
 *   errorMessage:    string|null,
 * }} params
 */
const logAICall = async (params) => {
  const {
    module,
    userId          = null,
    requestPayload  = {},
    responsePayload = null,
    promptTokens    = 0,
    candidateTokens = 0,
    latencyMs       = 0,
    success         = true,
    errorMessage    = null,
  } = params

  try {
    await AILog.create({
      module,
      userId:          userId      || undefined,
      requestPayload,
      responsePayload: responsePayload || undefined,
      promptTokens,
      candidateTokens,
      totalTokens:     promptTokens + candidateTokens,
      latencyMs,
      success,
      errorMessage:    errorMessage || undefined,
    })
  } catch (err) {
    // Never propagate — logging should not break the main request
    logger.error(`aiLogger.logAICall failed: ${err.message}`)
  }
}

module.exports = { logAICall }
