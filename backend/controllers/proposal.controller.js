const { generateProposal, getProposalById, listProposals } = require('../services/proposalService')

// POST /ai/b2b-proposal
const create = async (req, res, next) => {
  try {
    const result = await generateProposal({ ...req.body, userId: req.user?.id || null })
    return res.status(201).json({ success: true, data: result })
  } catch (err) {
    if (err.isQuotaZero) {
      return res.status(503).json({ success: false, error: 'AI_QUOTA_EXCEEDED', message: err.message })
    }
    next(err)
  }
}

// GET /ai/b2b-proposal/:id
const getById = async (req, res, next) => {
  try {
    const proposal = await getProposalById(req.params.id)
    if (!proposal) return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Proposal not found' })
    return res.json({ success: true, data: proposal })
  } catch (err) {
    next(err)
  }
}

// GET /ai/b2b-proposals
const list = async (req, res, next) => {
  try {
    const limit     = Math.min(parseInt(req.query.limit) || 20, 100)
    const proposals = await listProposals(req.user.id, limit)
    return res.json({ success: true, data: proposals })
  } catch (err) {
    next(err)
  }
}

module.exports = { create, getById, list }
