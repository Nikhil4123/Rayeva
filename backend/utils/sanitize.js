const sanitizeHtml = require('sanitize-html')

/**
 * Strip all HTML tags from a string.
 */
const stripHTML = (str) =>
  sanitizeHtml(String(str ?? ''), { allowedTags: [], allowedAttributes: {} }).trim()

/**
 * Sanitize a string intended to be interpolated into an AI prompt.
 * Removes HTML, collapses whitespace, and caps at maxLen characters.
 */
const sanitizeForPrompt = (str, maxLen = 2000) => {
  const clean = stripHTML(str)
    .replace(/[<>{}"';`\\]/g, '')    // remove chars that could break JSON/prompt structure
    .replace(/\s+/g, ' ')
    .trim()
  return clean.slice(0, maxLen)
}

/**
 * Sanitize every string value in a shallow object.
 */
const sanitizeObject = (obj, maxLen = 2000) => {
  const out = {}
  for (const [k, v] of Object.entries(obj)) {
    out[k] = typeof v === 'string' ? sanitizeForPrompt(v, maxLen) : v
  }
  return out
}

module.exports = { stripHTML, sanitizeForPrompt, sanitizeObject }
