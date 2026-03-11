const router     = require('express').Router()
const ctrl       = require('../controllers/admin.controller')
const { auth }   = require('../middleware/auth')
const { apiLimiter } = require('../middleware/rateLimiter')

// All admin routes require authentication
router.use(auth, apiLimiter)

router.get('/ai-logs',        ctrl.getLogs)
router.get('/ai-logs/:id',    ctrl.getLogById)
router.get('/dashboard-stats', ctrl.getDashboardStats)

module.exports = router
