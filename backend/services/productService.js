const { callSarvam: callGemini } = require('./ai/geminiService')
const { buildTaggerPrompt }   = require('./ai/promptBuilder')
const { parseTaggerResponse } = require('./ai/responseParser')
const { logAICall }           = require('./ai/aiLogger')
const Product                 = require('../models/Product')
const AITag                   = require('../models/AITag')
const { getRedis }            = require('../config/redis')
const logger                  = require('../utils/logger')
const { CACHE_TTL_PRODUCT_TAG } = require('../utils/constants')

/**
 * Tag & categorise a product using Gemini.
 * Results are cached in Redis by a hash of name+description.
 */
const tagProduct = async ({ name, description, brand, price, imageUrl, userId = null }) => {
  const redisKey = `product_tag:${Buffer.from(`${name}|${description}`).toString('base64').slice(0, 64)}`

  // ── Cache check ────────────────────────────────────────────────────────────
  try {
    const redis  = getRedis()
    const cached = await redis.get(redisKey)
    if (cached) {
      logger.debug(`tagProduct: cache hit for key ${redisKey}`)
      return { ...JSON.parse(cached), _cached: true }
    }
  } catch { /* Redis unavailable — proceed without cache */ }

  // ── Build prompt & call AI ─────────────────────────────────────────────────
  const prompt = buildTaggerPrompt({ name, description, brand, price, imageUrl })
  const start  = Date.now()
  let   aiResult, parsed

  try {
    aiResult = await callGemini(prompt, { temperature: 0.2, module: 'product_tagger' })
    parsed   = parseTaggerResponse(aiResult.text)
  } catch (err) {
    await logAICall({
      module:         'product_tagger',
      userId,
      requestPayload: { name, brand },
      latencyMs:      Date.now() - start,
      success:        false,
      errorMessage:   err.message,
    })
    throw err
  }

  const latencyMs = Date.now() - start

  // ── Persist to DB ──────────────────────────────────────────────────────────
  let productId, tagId
  try {
    const product = await Product.create({
      name,
      description,
      brand:    brand    || undefined,
      price:    price    || undefined,
      imageUrl: imageUrl || undefined,
      userId:   userId   || undefined,
    })
    productId = product._id.toString()

    const tag = await AITag.create({
      productId:           product._id,
      primaryCategory:     parsed.primaryCategory,
      subCategory:         parsed.subCategory,
      confidenceScore:     parsed.confidenceScore,
      sustainabilityTags:  parsed.sustainabilityTags,
      keywords:            parsed.keywords,
      suggestedAttributes: parsed.suggestedAttributes,
      reasoning:           parsed.reasoning,
    })
    tagId = tag._id.toString()
  } catch (dbErr) {
    logger.error(`tagProduct: DB insert failed — ${dbErr.message}`)
  }

  // ── Log AI call ────────────────────────────────────────────────────────────
  await logAICall({
    module:          'product_tagger',
    userId,
    requestPayload:  { name, brand },
    responsePayload: parsed,
    promptTokens:    aiResult.promptTokens,
    candidateTokens: aiResult.candidateTokens,
    latencyMs,
    success:         true,
  })

  const result = { ...parsed, productId, tagId, _cached: false }

  // ── Store in cache ─────────────────────────────────────────────────────────
  try {
    const redis = getRedis()
    await redis.setex(redisKey, CACHE_TTL_PRODUCT_TAG, JSON.stringify(result))
  } catch { /* Redis unavailable */ }

  return result
}

/**
 * Fetch a single product tag record by its tag ID.
 */
const getTagById = async (tagId) => {
  const tag = await AITag.findById(tagId).populate('productId').lean()
  if (!tag) return null
  const product = tag.productId
  return {
    ...tag,
    _id:         tag._id.toString(),
    productId:   product?._id?.toString(),
    name:        product?.name,
    description: product?.description,
    brand:       product?.brand,
    price:       product?.price,
    image_url:   product?.imageUrl,
  }
}

/**
 * List recent products for the current user.
 */
const getRecentProducts = async (userId, limit = 20) => {
  const products   = await Product.find({ userId }).sort({ createdAt: -1 }).limit(limit).lean()
  const productIds = products.map((p) => p._id)
  const tags       = await AITag.find({ productId: { $in: productIds } }).lean()

  const tagMap = {}
  for (const t of tags) tagMap[t.productId.toString()] = t

  return products.map((p) => ({
    ...p,
    _id:                p._id.toString(),
    primaryCategory:    tagMap[p._id.toString()]?.primaryCategory,
    confidenceScore:    tagMap[p._id.toString()]?.confidenceScore,
    sustainabilityTags: tagMap[p._id.toString()]?.sustainabilityTags,
  }))
}

module.exports = { tagProduct, getTagById, getRecentProducts }
