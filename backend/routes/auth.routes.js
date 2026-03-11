const router     = require('express').Router()
const ctrl       = require('../controllers/auth.controller')
const { validate, schemas } = require('../middleware/validateRequest')
const { authLimiter }       = require('../middleware/rateLimiter')
const { auth }              = require('../middleware/auth')

router.post('/register', authLimiter, validate(schemas.register), ctrl.register)
router.post('/login',    authLimiter, validate(schemas.login),    ctrl.login)
router.post('/refresh',               validate(schemas.refresh),  ctrl.refresh)
router.post('/logout',   auth,                                    ctrl.logout)
router.get ('/me',       auth,                                    ctrl.me)

module.exports = router
