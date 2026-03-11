const { tagProduct, getTagById, getRecentProducts } = require('../services/productService')

// POST /ai/product-categorize
const categorize = async (req, res, next) => {
  try {
    const result = await tagProduct({ ...req.body, userId: req.user?.id || null })
    return res.status(201).json({ success: true, data: result })
  } catch (err) {
    if (err.isQuotaZero) {
      return res.status(503).json({ success: false, error: 'AI_QUOTA_EXCEEDED', message: err.message })
    }
    next(err)
  }
}

// GET /ai/product-categorize/:tagId
const getTag = async (req, res, next) => {
  try {
    const tag = await getTagById(req.params.tagId)
    if (!tag) return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Tag not found' })
    return res.json({ success: true, data: tag })
  } catch (err) {
    next(err)
  }
}

// GET /products
const listProducts = async (req, res, next) => {
  try {
    const limit    = Math.min(parseInt(req.query.limit) || 20, 100)
    const products = await getRecentProducts(req.user.id, limit)
    return res.json({ success: true, data: products })
  } catch (err) {
    next(err)
  }
}

module.exports = { categorize, getTag, listProducts }
