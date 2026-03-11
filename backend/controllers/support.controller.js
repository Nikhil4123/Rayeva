const { handleMessage } = require('../services/supportService')
const { v4: uuid }      = require('uuid')

// POST /support/message
const chat = async (req, res, next) => {
  try {
    const { message, sessionId, conversationHistory = [], context = {} } = req.body
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(422).json({ success: false, error: 'VALIDATION_ERROR', message: '"message" is required' })
    }

    const sid    = sessionId || uuid()
    const result = await handleMessage({
      message:             message.trim(),
      sessionId:           sid,
      userId:              req.user?.id || null,
      conversationHistory: Array.isArray(conversationHistory) ? conversationHistory.slice(-10) : [],
      context,
    })

    return res.json({ success: true, data: { ...result, sessionId: sid } })
  } catch (err) {
    next(err)
  }
}

module.exports = { chat }
