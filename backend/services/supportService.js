const { callSarvam: callGemini } = require('./ai/geminiService')
const { buildSupportPrompt }   = require('./ai/promptBuilder')
const { parseSupportResponse } = require('./ai/responseParser')
const { logAICall }            = require('./ai/aiLogger')
const Conversation             = require('../models/Conversation')
const logger                   = require('../utils/logger')

const handleMessage = async ({ message, sessionId, userId = null, conversationHistory = [], context = {} }) => {
  const prompt = buildSupportPrompt({ message, conversationHistory, context })
  const start  = Date.now()
  let aiResult, parsed

  try {
    aiResult = await callGemini(prompt, { temperature: 0.5, module: 'support_bot' })
    parsed   = parseSupportResponse(aiResult.text)
  } catch (err) {
    await logAICall({
      module:         'support_bot',
      userId,
      requestPayload: { sessionId, intent: 'unknown' },
      latencyMs:      Date.now() - start,
      success:        false,
      errorMessage:   err.message,
    })
    throw err
  }

  const latencyMs = Date.now() - start

  // ── Persist conversation turn ──────────────────────────────────────────────
  try {
    await Conversation.create({
      sessionId,
      userId:      userId || undefined,
      userMessage: message,
      aiResponse:  parsed.response,
      intent:      parsed.intent,
      confidence:  parsed.confidence,
      escalate:    parsed.escalate,
    })
  } catch (dbErr) {
    logger.error(`supportService: DB insert failed — ${dbErr.message}`)
  }

  await logAICall({
    module:          'support_bot',
    userId,
    requestPayload:  { sessionId },
    responsePayload: { intent: parsed.intent, escalate: parsed.escalate },
    promptTokens:    aiResult.promptTokens,
    candidateTokens: aiResult.candidateTokens,
    latencyMs,
    success:         true,
  })

  return parsed
}

module.exports = { handleMessage }
