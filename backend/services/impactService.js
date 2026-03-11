const { callSarvam: callGemini } = require('./ai/geminiService')
const { buildImpactPrompt }   = require('./ai/promptBuilder')
const { parseImpactResponse } = require('./ai/responseParser')
const { logAICall }           = require('./ai/aiLogger')
const ImpactReport            = require('../models/ImpactReport')
const Order                   = require('../models/Order')
const { getRedis }            = require('../config/redis')
const logger                  = require('../utils/logger')
const { CACHE_TTL_IMPACT }    = require('../utils/constants')

const generateReport = async ({ orderId, analysisDepth = 'standard', userId = null }) => {
  const cacheKey = `impact:${orderId}:${analysisDepth}`

  try {
    const redis  = getRedis()
    const cached = await redis.get(cacheKey)
    if (cached) return { ...JSON.parse(cached), _cached: true }
  } catch { /* Redis unavailable */ }

  // ── Fetch order from DB (optional — falls back gracefully if not found) ─────
  let items = [], totalValue = 0
  try {
    const order = await Order.findOne({ orderId }).lean()
    if (order) {
      items      = order.items  || []
      totalValue = Number(order.totalValue) || 0
    } else {
      logger.warn(`generateReport: order ${orderId} not in DB — generating without order data`)
    }
  } catch (err) {
    logger.error(`generateReport: DB order fetch error — ${err.message}`)
    // Use stub data if DB unavailable
  }

  const prompt = buildImpactPrompt({ orderId, items, totalValue, analysisDepth })
  const start  = Date.now()
  let   aiResult, parsed

  try {
    aiResult = await callGemini(prompt, { temperature: 0.3, module: 'impact_report' })
    parsed   = parseImpactResponse(aiResult.text)
  } catch (err) {
    await logAICall({
      module:         'impact_report',
      userId,
      requestPayload: { orderId, analysisDepth },
      latencyMs:      Date.now() - start,
      success:        false,
      errorMessage:   err.message,
    })
    throw err
  }

  const latencyMs = Date.now() - start

  let reportId
  try {
    const report = await ImpactReport.findOneAndUpdate(
      { orderId },
      {
        userId:        userId || undefined,
        analysisDepth,
        aiResult:      parsed,
        overallScore:  parsed.overallScore,
        grade:         parsed.grade,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    )
    reportId = report._id.toString()
  } catch (dbErr) {
    logger.error(`generateReport: DB upsert failed — ${dbErr.message}`)
  }

  await logAICall({
    module:          'impact_report',
    userId,
    requestPayload:  { orderId, analysisDepth },
    responsePayload: parsed,
    promptTokens:    aiResult.promptTokens,
    candidateTokens: aiResult.candidateTokens,
    latencyMs,
    success:         true,
  })

  const result = { ...parsed, reportId, orderId, _cached: false }

  try {
    const redis = getRedis()
    await redis.setex(cacheKey, CACHE_TTL_IMPACT, JSON.stringify(result))
  } catch { /* Redis unavailable */ }

  return result
}

const getReportByOrderId = async (orderId) => {
  const report = await ImpactReport.findOne({ orderId }).sort({ createdAt: -1 }).lean()
  if (!report) return null
  return { ...report, _id: report._id.toString() }
}

module.exports = { generateReport, getReportByOrderId }
