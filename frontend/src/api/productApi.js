import axiosClient, { isOfflineError, isQuotaError } from './axiosClient'
import { MOCK_TAG_RESULT } from '../data/mockData'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

export async function categorizeProduct({ title, description }) {
  // Demo-mode override
  if (import.meta.env.VITE_DEMO_MODE === 'true') {
    await sleep(1800)
    return { success: true, data: { ...MOCK_TAG_RESULT }, _demo: true }
  }

  try {
    const { data } = await axiosClient.post('/ai/product-categorize', { name: title, description })
    return data
  } catch (err) {
    if (isOfflineError(err) || isQuotaError(err)) {
      await sleep(1800)
      return { success: true, data: { ...MOCK_TAG_RESULT }, _demo: true }
    }
    throw err
  }
}

export async function getProductTags(productId) {
  const { data } = await axiosClient.get(`/ai/product-categorize/${productId}`)
  return data
}

export async function getRecentProducts({ page = 1, limit = 10 } = {}) {
  try {
    const { data } = await axiosClient.get(`/products?page=${page}&limit=${limit}`)
    return data
  } catch (err) {
    if (isOfflineError(err)) return { success: true, data: [], _demo: true }
    throw err
  }
}
