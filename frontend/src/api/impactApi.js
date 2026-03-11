import axiosClient, { isOfflineError, isQuotaError } from './axiosClient'
import { MOCK_IMPACT_REPORT } from '../data/mockData'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

export async function generateImpactReport(orderId) {
  if (import.meta.env.VITE_DEMO_MODE === 'true') {
    await sleep(1600)
    return { success: true, data: { ...MOCK_IMPACT_REPORT, order_id: orderId }, _demo: true }
  }

  try {
    const { data } = await axiosClient.post('/ai/impact-report', { orderId })
    return data
  } catch (err) {
    if (isOfflineError(err) || isQuotaError(err) || err.response?.status === 404) {
      await sleep(1600)
      return { success: true, data: { ...MOCK_IMPACT_REPORT, order_id: orderId }, _demo: true }
    }
    throw err
  }
}

export async function getImpactReport(orderId) {
  try {
    const { data } = await axiosClient.get(`/ai/impact-report/${orderId}`)
    return data
  } catch (err) {
    if (isOfflineError(err)) {
      await sleep(1000)
      return { success: true, data: { ...MOCK_IMPACT_REPORT, order_id: orderId }, _demo: true }
    }
    throw err
  }
}
