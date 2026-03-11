const OpenAI = require('openai')
const { SARVAM_API_KEY, SARVAM_BASE_URL, MODEL_NAME } = require('../../config/gemini')
const logger  = require('../../utils/logger')
const { AI_MAX_RETRIES, AI_BASE_DELAY_MS } = require('../../utils/constants')

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const client = new OpenAI({
  apiKey:  SARVAM_API_KEY,
  baseURL: SARVAM_BASE_URL,
})

/**
 * Send a prompt to Sarvam AI (OpenAI-compatible) with exponential-backoff retry.
 *
 * @param {string} prompt
 * @param {{ temperature?: number, maxOutputTokens?: number, module?: string }} opts
 * @returns {{ text: string, promptTokens: number, candidateTokens: number, totalTokens: number }}
 */
const callSarvam = async (prompt, opts = {}) => {
  let lastErr = null

  for (let attempt = 1; attempt <= AI_MAX_RETRIES; attempt++) {
    try {
      logger.debug(`Sarvam [${opts.module || 'unknown'}] attempt ${attempt}`)

      const completion = await client.chat.completions.create({
        model:       MODEL_NAME,
        messages:    [{ role: 'user', content: prompt }],
        temperature: opts.temperature     ?? 0.4,
        max_tokens:  opts.maxOutputTokens ?? 4096,
      })

      const text  = completion.choices?.[0]?.message?.content || ''
      const usage = completion.usage || {}

      return {
        text,
        promptTokens:    usage.prompt_tokens     || 0,
        candidateTokens: usage.completion_tokens || 0,
        totalTokens:     usage.total_tokens      || 0,
      }
    } catch (err) {
      lastErr = err
      const status  = err.status || err.response?.status
      const message = err.message

      const retryable = status === 429 || status === 503 || err.code === 'ECONNRESET'

      if (!retryable || attempt === AI_MAX_RETRIES) break

      let delay = AI_BASE_DELAY_MS * Math.pow(2, attempt - 1)   // 2 s, 4 s, 8 s
      const retryHint = message?.match(/retry\s+in\s+([\d.]+)s/i)
      if (retryHint) delay = Math.ceil(parseFloat(retryHint[1]) * 1000) + 500

      logger.warn(`Sarvam attempt ${attempt} failed (${message}), retrying in ${delay} ms…`)
      await sleep(delay)
    }
  }

  logger.error(`Sarvam failed after ${AI_MAX_RETRIES} attempts: ${lastErr?.message}`)
  throw lastErr
}

// backward-compat alias so existing imports of callGemini keep working
const callGemini = callSarvam

module.exports = { callSarvam, callGemini }
