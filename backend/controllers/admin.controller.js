const AILog        = require('../models/AILog')
const Product      = require('../models/Product')
const Proposal     = require('../models/Proposal')
const ImpactReport = require('../models/ImpactReport')

// GET /admin/ai-logs
const getLogs = async (req, res, next) => {
  try {
    const limit  = Math.min(parseInt(req.query.limit)  || 50, 200)
    const offset = parseInt(req.query.offset) || 0
    const module = req.query.module || null

    const filter = module ? { module } : {}

    const [logs, total] = await Promise.all([
      AILog.find(filter)
        .select('_id module userId promptTokens candidateTokens totalTokens latencyMs success errorMessage createdAt')
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .lean(),
      AILog.countDocuments(filter),
    ])

    return res.json({ success: true, data: logs, meta: { total, limit, offset } })
  } catch (err) {
    next(err)
  }
}

// GET /admin/ai-logs/:id
const getLogById = async (req, res, next) => {
  try {
    const log = await AILog.findById(req.params.id).lean()
    if (!log) return res.status(404).json({ success: false, error: 'NOT_FOUND' })
    return res.json({ success: true, data: log })
  } catch (err) {
    next(err)
  }
}

// GET /admin/dashboard-stats
const getDashboardStats = async (req, res, next) => {
  try {
    const [totalProducts, totalProposals, totalReports, totalAILogs, successStats, avgLatencyResult, recentActivity] =
      await Promise.all([
        Product.countDocuments(),
        Proposal.countDocuments(),
        ImpactReport.countDocuments(),
        AILog.countDocuments(),
        AILog.aggregate([
          { $group: { _id: null, total: { $sum: 1 }, successes: { $sum: { $cond: ['$success', 1, 0] } } } },
        ]),
        AILog.aggregate([
          { $match: { success: true } },
          { $group: { _id: null, avg: { $avg: '$latencyMs' } } },
        ]),
        AILog.find().select('module success createdAt').sort({ createdAt: -1 }).limit(10).lean(),
      ])

    const aiSuccessRate = successStats[0]
      ? Math.round((successStats[0].successes / successStats[0].total) * 1000) / 10
      : 0
    const avgLatencyMs = avgLatencyResult[0] ? Math.round(avgLatencyResult[0].avg) : 0

    return res.json({
      success: true,
      data: {
        totalProducts,
        totalProposals,
        totalReports,
        totalAILogs,
        aiSuccessRate,
        avgLatencyMs,
        recentActivity,
      },
    })
  } catch (err) {
    next(err)
  }
}

module.exports = { getLogs, getLogById, getDashboardStats }
