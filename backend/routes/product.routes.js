const router     = require('express').Router()
const product    = require('../controllers/product.controller')
const { auth }   = require('../middleware/auth')

router.get('/', auth, product.listProducts)

module.exports = router
