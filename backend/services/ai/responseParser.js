const { AIParseError, AISchemaError } = require('../../middleware/errorHandler')
const { PRIMARY_CATEGORIES, SUSTAINABILITY_FILTERS } = require('../../utils/constants')
const { rebalance } = require('../../utils/budgetAllocator')

/**
 * Strip markdown code fences and extract raw JSON string.
 */
const extractJSON = (raw) => {
  const trimmed = raw.trim()
  // Remove ```json ... ``` or ``` ... ``` wrappers
  const fenced = trimmed.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
  // Find first { to last } in case there's leading text
  const start = fenced.indexOf('{')
  const end   = fenced.lastIndexOf('}')
  if (start === -1 || end === -1) throw new AIParseError('No JSON object found in AI response', raw)
  return fenced.slice(start, end + 1)
}

const parseJSON = (raw) => {
  const jsonStr = extractJSON(raw)
  try {
    return JSON.parse(jsonStr)
  } catch {
    throw new AIParseError('AI returned malformed JSON', raw)
  }
}

// ─── Tagger ──────────────────────────────────────────────────────────────────

const parseTaggerResponse = (raw) => {
  const data = parseJSON(raw)

  // Validate required fields
  const required = ['primaryCategory', 'subCategory', 'confidenceScore', 'sustainabilityTags', 'keywords']
  const missing  = required.filter((k) => data[k] === undefined)
  if (missing.length) throw new AISchemaError(`Tagger response missing fields: ${missing.join(', ')}`, missing)

  // Normalise category against whitelist (case-insensitive match)
  const matchedCat = PRIMARY_CATEGORIES.find(
    (c) => c.toLowerCase() === String(data.primaryCategory).toLowerCase(),
  )
  data.primaryCategory = matchedCat || data.primaryCategory

  // Clamp confidence score
  data.confidenceScore = Math.min(100, Math.max(0, Number(data.confidenceScore) || 0))

  // Filter sustainability tags to known values
  data.sustainabilityTags = (data.sustainabilityTags || []).filter((t) =>
    SUSTAINABILITY_FILTERS.some((f) => f.toLowerCase() === String(t).toLowerCase()),
  )

  // Ensure suggestedAttributes exists
  data.suggestedAttributes = data.suggestedAttributes || {}
  if (data.suggestedAttributes.ecoScore) {
    data.suggestedAttributes.ecoScore = Math.min(10, Math.max(1, Number(data.suggestedAttributes.ecoScore) || 5))
  }

  return data
}

// ─── Proposal ────────────────────────────────────────────────────────────────

const parseProposalResponse = (raw) => {
  const data = parseJSON(raw)

  const required = ['executiveSummary', 'recommendedProductMix', 'budgetAllocation', 'sustainabilityImpact']
  const missing  = required.filter((k) => data[k] === undefined)
  if (missing.length) throw new AISchemaError(`Proposal response missing fields: ${missing.join(', ')}`, missing)

  // Rebalance budgetAllocation to sum exactly to 100
  if (data.budgetAllocation) {
    data.budgetAllocation = rebalance(data.budgetAllocation)
  }

  // Normalise productMix percentages
  if (Array.isArray(data.recommendedProductMix)) {
    const totalMix = data.recommendedProductMix.reduce((s, i) => s + (Number(i.percentage) || 0), 0)
    if (totalMix > 0) {
      data.recommendedProductMix = data.recommendedProductMix.map((item) => ({
        ...item,
        percentage: Math.round((Number(item.percentage) / totalMix) * 100),
      }))
    }
  }

  return data
}

// ─── Impact Report ────────────────────────────────────────────────────────────

const parseImpactResponse = (raw) => {
  const data = parseJSON(raw)

  const required = ['overallScore', 'grade', 'carbonFootprint', 'sustainabilityBreakdown']
  const missing  = required.filter((k) => data[k] === undefined)
  if (missing.length) throw new AISchemaError(`Impact response missing fields: ${missing.join(', ')}`, missing)

  data.overallScore = Math.min(100, Math.max(0, Number(data.overallScore) || 0))

  const validGrades = ['A', 'B', 'C', 'D', 'F']
  if (!validGrades.includes(data.grade)) data.grade = 'C'

  return data
}

// ─── Support ─────────────────────────────────────────────────────────────────

const parseSupportResponse = (raw) => {
  const data = parseJSON(raw)

  if (!data.response) throw new AISchemaError('Support response missing "response" field', ['response'])

  data.confidence = Math.min(100, Math.max(0, Number(data.confidence) || 80))
  data.escalate   = Boolean(data.escalate)
  data.language   = data.language || 'en'

  return data
}

module.exports = { parseTaggerResponse, parseProposalResponse, parseImpactResponse, parseSupportResponse }
