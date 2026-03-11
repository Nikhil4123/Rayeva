const { sanitizeForPrompt } = require('../../utils/sanitize')
const { PRIMARY_CATEGORIES, SUSTAINABILITY_FILTERS } = require('../../utils/constants')

/**
 * Module 1: Product Tagger + Categoriser
 */
const buildTaggerPrompt = ({ name, description, brand = '', price = null, imageUrl = '' }) => {
  const safeName  = sanitizeForPrompt(name)
  const safeDesc  = sanitizeForPrompt(description, 1500)
  const safeBrand = sanitizeForPrompt(brand, 100)
  const priceStr  = price != null ? `Price: $${Number(price).toFixed(2)}` : ''
  const imgStr    = imageUrl ? `Image URL: ${imageUrl.slice(0, 500)}` : ''

  return `You are a product classification AI for a sustainable e-commerce platform.
Analyse the following product and return ONLY a valid JSON object — no markdown, no extra text.

PRODUCT DETAILS:
Name: ${safeName}
Brand: ${safeBrand}
Description: ${safeDesc}
${priceStr}
${imgStr}

TASK: Return JSON matching this exact schema:
{
  "primaryCategory": "<one of: ${PRIMARY_CATEGORIES.join(' | ')}>",
  "subCategory": "<specific sub-category string>",
  "confidenceScore": <number 0-100>,
  "sustainabilityTags": ["<tag>"],
  "keywords": ["<keyword>"],
  "suggestedAttributes": {
    "material": "<string or null>",
    "certifications": ["<cert>"],
    "ecoScore": <number 1-10>,
    "carbonFootprint": "<low|medium|high>",
    "packagingType": "<string or null>"
  },
  "reasoning": "<1-2 sentence explanation>"
}

Allowed sustainability tags: ${SUSTAINABILITY_FILTERS.join(', ')}.
Only include tags that genuinely apply based on the product information.
Respond with ONLY the JSON object.`
}

/**
 * Module 2: B2B Proposal Generator
 */
const buildProposalPrompt = ({
  companyName,
  companyType,
  monthlyRevenue,
  targetBudget,
  focusCategories,
  sustainabilityGoals = [],
  notes = '',
}) => {
  const safeCompany  = sanitizeForPrompt(companyName, 200)
  const safeType     = sanitizeForPrompt(companyType, 100)
  const safeNotes    = sanitizeForPrompt(notes, 800)
  const cats         = (focusCategories || []).map((c) => sanitizeForPrompt(c, 100)).join(', ') || 'General sustainable products'
  const goals        = sustainabilityGoals.map((g) => sanitizeForPrompt(g, 100)).join(', ')

  return `You are a B2B sustainable commerce consultant AI.
Create a detailed product sourcing proposal for the following business.
Return ONLY a valid JSON object — no markdown, no extra text.

BUSINESS PROFILE:
Company: ${safeCompany}
Type: ${safeType}
Monthly Revenue: $${Number(monthlyRevenue).toLocaleString()}
Target Sourcing Budget: $${Number(targetBudget).toLocaleString()}
Focus Categories: ${cats}
Sustainability Goals: ${goals || 'Not specified'}
Additional Notes: ${safeNotes || 'None'}

TASK: Return JSON matching this exact schema:
{
  "executiveSummary": "<2-3 sentence tailored summary>",
  "recommendedProductMix": [
    {
      "category": "<category name>",
      "percentage": <number 0-100>,
      "estimatedSkus": <integer>,
      "rationale": "<sentence>"
    }
  ],
  "budgetAllocation": {
    "premium": <integer 0-100>,
    "sustainable_premium": <integer 0-100>,
    "mid_range": <integer 0-100>,
    "eco_friendly": <integer 0-100>,
    "budget": <integer 0-100>
  },
  "sustainabilityImpact": {
    "carbonReductionEstimate": "<string e.g. '12% reduction'>",
    "ecoFriendlyPercentage": <number 0-100>,
    "certificationTargets": ["<cert>"],
    "estimatedWasteReduction": "<string>"
  },
  "keyRecommendations": ["<recommendation>"],
  "riskFactors": ["<risk>"],
  "implementationTimeline": "<string e.g. '3-6 months'>",
  "expectedROI": "<string e.g. '18-24% within 12 months'>"
}

budgetAllocation percentages MUST sum to exactly 100.
Respond with ONLY the JSON object.`
}

/**
 * Module 3: Impact Report Analyser
 */
const buildImpactPrompt = ({ orderId, items, totalValue, analysisDepth = 'standard' }) => {
  const itemsStr = JSON.stringify(items).slice(0, 2000)

  return `You are a sustainability impact analyst AI.
Analyse the following order and generate a comprehensive environmental impact report.
Return ONLY a valid JSON object — no markdown, no extra text.

ORDER DATA:
Order ID: ${orderId}
Total Value: $${Number(totalValue).toFixed(2)}
Analysis Depth: ${analysisDepth}
Items: ${itemsStr}

TASK: Return JSON matching this exact schema:
{
  "overallScore": <number 0-100>,
  "grade": "<A|B|C|D|F>",
  "carbonFootprint": {
    "total": "<kg CO2e string>",
    "perItem": <number>,
    "benchmark": "<vs industry average string>"
  },
  "wasteAnalysis": {
    "packagingWaste": "<kg string>",
    "recyclablePercentage": <number 0-100>,
    "biodegradablePercentage": <number 0-100>
  },
  "waterUsage": {
    "total": "<litres string>",
    "perItem": <number>
  },
  "sustainabilityBreakdown": [
    {
      "itemName": "<string>",
      "score": <number 0-100>,
      "positives": ["<string>"],
      "concerns": ["<string>"]
    }
  ],
  "improvements": ["<actionable improvement>"],
  "certificationOpportunities": ["<cert>"],
  "reportSummary": "<2-3 sentence summary>"
}

Respond with ONLY the JSON object.`
}

/**
 * Module 4: Support Bot
 */
const buildSupportPrompt = ({ message, conversationHistory = [], context = {} }) => {
  const safeMsg = sanitizeForPrompt(message, 1000)
  const historyStr = conversationHistory
    .slice(-6)    // keep last 3 turns
    .map((t) => `${t.role}: ${sanitizeForPrompt(t.content, 200)}`)
    .join('\n')

  return `You are Rayeva, a friendly B2B customer support AI for a sustainable commerce platform.
Help the customer with their query about products, orders, sustainability, or proposals.
Return ONLY a valid JSON object — no markdown, no extra text.

CONVERSATION HISTORY:
${historyStr || 'No previous messages'}

CURRENT MESSAGE: ${safeMsg}

CONTEXT: ${JSON.stringify(context).slice(0, 500)}

TASK: Return JSON matching this exact schema:
{
  "response": "<helpful, friendly response>",
  "intent": "<query_type e.g. order_status|product_info|sustainability|proposal|other>",
  "confidence": <number 0-100>,
  "suggestedActions": ["<action>"],
  "escalate": <boolean>,
  "language": "<ISO 639-1 language code>"
}

Respond with ONLY the JSON object.`
}

module.exports = { buildTaggerPrompt, buildProposalPrompt, buildImpactPrompt, buildSupportPrompt }
