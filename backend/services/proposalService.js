const { callSarvam: callGemini } = require('./ai/geminiService')
const { buildProposalPrompt }   = require('./ai/promptBuilder')
const { parseProposalResponse } = require('./ai/responseParser')
const { logAICall }             = require('./ai/aiLogger')
const Proposal                  = require('../models/Proposal')
const { getRedis }              = require('../config/redis')
const logger                    = require('../utils/logger')
const { CACHE_TTL_PROPOSAL }    = require('../utils/constants')

const generateProposal = async ({
  companyName,
  companyType,
  monthlyRevenue,
  targetBudget,
  focusCategories,
  sustainabilityGoals,
  notes,
  userId = null,
}) => {
  const cacheKey = `proposal:${Buffer.from(`${companyName}|${targetBudget}|${(focusCategories || []).join(',')}`).toString('base64').slice(0, 64)}`

  // ── Cache check ────────────────────────────────────────────────────────────
  try {
    const redis  = getRedis()
    const cached = await redis.get(cacheKey)
    if (cached) return { ...JSON.parse(cached), _cached: true }
  } catch { /* Redis unavailable */ }

  const prompt = buildProposalPrompt({
    companyName, companyType, monthlyRevenue, targetBudget,
    focusCategories, sustainabilityGoals, notes,
  })

  const start = Date.now()
  let aiResult, parsed

  try {
    aiResult = await callGemini(prompt, { temperature: 0.6, maxOutputTokens: 6144, module: 'b2b_proposal' })
    parsed   = parseProposalResponse(aiResult.text)
  } catch (err) {
    await logAICall({
      module:         'b2b_proposal',
      userId,
      requestPayload: { companyName, companyType },
      latencyMs:      Date.now() - start,
      success:        false,
      errorMessage:   err.message,
    })
    throw err
  }

  const latencyMs = Date.now() - start

  // ── Persist ────────────────────────────────────────────────────────────────
  let proposalId
  try {
    const proposal = await Proposal.create({
      userId:              userId || undefined,
      companyName,
      companyType,
      monthlyRevenue,
      targetBudget,
      focusCategories:     focusCategories     || [],
      sustainabilityGoals: sustainabilityGoals || [],
      notes:               notes               || '',
      aiResult:            parsed,
    })
    proposalId = proposal._id.toString()
  } catch (dbErr) {
    logger.error(`generateProposal: DB insert failed — ${dbErr.message}`)
  }

  await logAICall({
    module:          'b2b_proposal',
    userId,
    requestPayload:  { companyName, companyType, targetBudget },
    responsePayload: parsed,
    promptTokens:    aiResult.promptTokens,
    candidateTokens: aiResult.candidateTokens,
    latencyMs,
    success:         true,
  })

  const result = { ...parsed, proposalId, _cached: false }

  try {
    const redis = getRedis()
    await redis.setex(cacheKey, CACHE_TTL_PROPOSAL, JSON.stringify(result))
  } catch { /* Redis unavailable */ }

  return result
}

const getProposalById = async (proposalId) => {
  const proposal = await Proposal.findById(proposalId).lean()
  if (!proposal) return null
  return { ...proposal, _id: proposal._id.toString() }
}

const listProposals = async (userId, limit = 20) => {
  return Proposal.find({ userId })
    .select('_id companyName companyType targetBudget createdAt')
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean()
}

module.exports = { generateProposal, getProposalById, listProposals }
