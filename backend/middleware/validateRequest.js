const Joi = require('joi')

/**
 * Joi validation middleware factory.
 * Usage: router.post('/route', validate(schema), controller)
 *
 * @param {Joi.ObjectSchema} schema  - Joi schema for req.body
 */
const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly:   false,
    stripUnknown: true,
    convert:      true,
  })
  if (error) {
    const details = error.details.map((d) => ({
      field:   d.path.join('.'),
      message: d.message,
    }))
    return res.status(422).json({ success: false, error: 'VALIDATION_ERROR', details })
  }
  req.body = value  // replace with stripped/coerced value
  next()
}

// ─── Schemas ──────────────────────────────────────────────────────────────────

const schemas = {
  // Auth
  register: Joi.object({
    name:     Joi.string().min(2).max(80).required(),
    email:    Joi.string().email().lowercase().required(),
    password: Joi.string().min(8).max(128).required(),
    role:     Joi.string().valid('user', 'admin').default('user'),
  }),

  login: Joi.object({
    email:    Joi.string().email().lowercase().required(),
    password: Joi.string().required(),
  }),

  refresh: Joi.object({
    refreshToken: Joi.string().required(),
  }),

  // Product tagger
  categorizeProduct: Joi.object({
    name:        Joi.string().min(2).max(300).required(),
    description: Joi.string().min(5).max(2000).required(),
    brand:       Joi.string().max(100).allow('').optional(),
    price:       Joi.number().positive().optional(),
    imageUrl:    Joi.string().uri().allow('').optional(),
  }),

  // B2B Proposal
  generateProposal: Joi.object({
    companyName:         Joi.string().min(2).max(200).required(),
    companyType:         Joi.string().max(100).required(),
    monthlyRevenue:      Joi.number().positive().optional(),
    targetBudget:        Joi.number().positive().required(),
    focusCategories:     Joi.array().items(Joi.string()).optional(),
    sustainabilityGoals: Joi.array().items(Joi.string()).optional(),
    notes:               Joi.string().max(1000).allow('').optional(),
  }),

  // Impact report
  generateImpactReport: Joi.object({
    orderId:           Joi.string().min(1).max(100).required(),
    analysisDepth:     Joi.string().valid('basic', 'standard', 'deep').default('standard'),
  }),
}

module.exports = { validate, schemas }
