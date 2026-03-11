/**
 * Budget Allocator Utility
 * ─────────────────────────
 * Gemini may return budget percentages that don't sum to exactly 100.
 * This utility rebalances the allocation so it always totals 100 %.
 *
 * Input/output shape:
 *   { premium: 30, sustainable_premium: 25, mid_range: 20, eco_friendly: 15, budget: 10 }
 */

const BUDGET_KEYS = ['premium', 'sustainable_premium', 'mid_range', 'eco_friendly', 'budget']

/**
 * Rebalance a budget object so percentages sum to exactly 100.
 * Uses largest-remainder method to avoid floating-point drift.
 *
 * @param {Record<string,number>} raw   - raw % values from AI (may not sum to 100)
 * @param {number}               [total=100]
 * @returns {Record<string,number>}  integer percentages summing to `total`
 */
const rebalance = (raw, total = 100) => {
  // Clamp negatives to 0
  const clamped = {}
  let sum = 0
  for (const k of BUDGET_KEYS) {
    clamped[k] = Math.max(0, Number(raw[k]) || 0)
    sum += clamped[k]
  }

  // If all zero, distribute evenly
  if (sum === 0) {
    const even = Math.floor(total / BUDGET_KEYS.length)
    const result = {}
    BUDGET_KEYS.forEach((k) => (result[k] = even))
    // add remainder to first key
    result[BUDGET_KEYS[0]] += total - even * BUDGET_KEYS.length
    return result
  }

  // Scale to target total and floor
  const scaled  = BUDGET_KEYS.map((k) => ({ k, exact: (clamped[k] / sum) * total }))
  const floored = scaled.map(({ k, exact }) => ({ k, floored: Math.floor(exact), remainder: exact - Math.floor(exact) }))
  let assigned  = floored.reduce((acc, { floored: f }) => acc + f, 0)
  const deficit = total - assigned

  // Distribute remainder to keys with largest fractional parts
  floored
    .sort((a, b) => b.remainder - a.remainder)
    .slice(0, deficit)
    .forEach(({ k }) => {
      const entry = floored.find((f) => f.k === k)
      if (entry) entry.floored += 1
    })

  const result = {}
  floored.forEach(({ k, floored: v }) => (result[k] = v))
  return result
}

/**
 * Validate that all required budget keys are present in an object.
 */
const isValidBudget = (obj) =>
  BUDGET_KEYS.every((k) => typeof obj[k] === 'number' && obj[k] >= 0)

module.exports = { rebalance, isValidBudget, BUDGET_KEYS }
