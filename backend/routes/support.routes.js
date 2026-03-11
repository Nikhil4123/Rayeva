const router   = require('express').Router()
const { chat } = require('../controllers/support.controller')
const { auth } = require('../middleware/auth')
const { aiLimiter } = require('../middleware/rateLimiter')

// POST /support/message — authenticated chat
router.post('/message', auth, aiLimiter, chat)

// POST /support/message/guest — unauthenticated (rate limited)
router.post('/message/guest', aiLimiter, chat)

module.exports = router
