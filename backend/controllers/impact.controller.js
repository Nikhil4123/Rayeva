const { generateReport, getReportByOrderId } = require('../services/impactService')

// POST /ai/impact-report
const create = async (req, res, next) => {
  try {
    const { orderId, analysisDepth } = req.body
    const result = await generateReport({ orderId, analysisDepth, userId: req.user?.id || null })
    return res.status(201).json({ success: true, data: result })
  } catch (err) {
    if (err.isQuotaZero) {
      return res.status(503).json({ success: false, error: 'AI_QUOTA_EXCEEDED', message: err.message })
    }
    next(err)
  }
}

// GET /ai/impact-report/:orderId
const getByOrderId = async (req, res, next) => {
  try {
    const report = await getReportByOrderId(req.params.orderId)
    if (!report) return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Impact report not found for this order' })
    return res.json({ success: true, data: report })
  } catch (err) {
    next(err)
  }
}

module.exports = { create, getByOrderId }
