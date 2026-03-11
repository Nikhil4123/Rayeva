const router   = require('express').Router()
const product  = require('../controllers/product.controller')
const proposal = require('../controllers/proposal.controller')
const impact   = require('../controllers/impact.controller')
const { auth } = require('../middleware/auth')
const { validate, schemas }      = require('../middleware/validateRequest')
const { aiLimiter, proposalLimiter } = require('../middleware/rateLimiter')

// Product Tagger
router.post('/product-categorize',     auth, aiLimiter,       validate(schemas.categorizeProduct), product.categorize)
router.get ('/product-categorize/:tagId', auth,               product.getTag)

// B2B Proposal
router.post('/b2b-proposal',           auth, proposalLimiter, validate(schemas.generateProposal),  proposal.create)
router.get ('/b2b-proposal/:id',       auth,                  proposal.getById)
router.get ('/b2b-proposals',          auth,                  proposal.list)

// Impact Report
router.post('/impact-report',          auth, aiLimiter,       validate(schemas.generateImpactReport), impact.create)
router.get ('/impact-report/:orderId', auth,                  impact.getByOrderId)

module.exports = router
