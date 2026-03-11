import axiosClient, { isOfflineError } from './axiosClient'
import { MOCK_AI_LOGS, MOCK_DASHBOARD_STATS, MOCK_RECENT_ACTIVITY } from '../data/mockData'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

export async function getLogs({ module, status, from, page = 1, limit = 20 } = {}) {
  if (import.meta.env.VITE_DEMO_MODE === 'true') {
    await sleep(600)
    return { success: true, data: MOCK_AI_LOGS, total: MOCK_AI_LOGS.length, _demo: true }
  }

  try {
    const params = new URLSearchParams({ page, limit })
    if (module) params.append('module', module)
    if (status) params.append('status', status)
    if (from) params.append('from', from)
    const { data } = await axiosClient.get(`/admin/ai-logs?${params}`)
    return data
  } catch (err) {
    if (isOfflineError(err) || err.response?.status === 403) {
      await sleep(600)
      return { success: true, data: MOCK_AI_LOGS, total: MOCK_AI_LOGS.length, _demo: true }
    }
    throw err
  }
}

export async function getLogById(logId) {
  const { data } = await axiosClient.get(`/admin/ai-logs/${logId}`)
  return data
}

export async function getDashboardStats() {
  if (import.meta.env.VITE_DEMO_MODE === 'true') {
    await sleep(400)
    return { success: true, data: MOCK_DASHBOARD_STATS, _demo: true }
  }

  try {
    const { data } = await axiosClient.get('/admin/dashboard-stats')
    return data
  } catch (err) {
    if (isOfflineError(err) || err.response?.status === 403) {
      await sleep(400)
      return { success: true, data: MOCK_DASHBOARD_STATS, _demo: true }
    }
    throw err
  }
}

export async function getRecentActivity() {
  if (import.meta.env.VITE_DEMO_MODE === 'true') {
    await sleep(400)
    return { success: true, data: MOCK_RECENT_ACTIVITY, _demo: true }
  }

  try {
    const { data } = await axiosClient.get('/admin/ai-logs?limit=5')
    return data
  } catch (err) {
    if (isOfflineError(err) || err.response?.status === 403) {
      await sleep(400)
      return { success: true, data: MOCK_RECENT_ACTIVITY, _demo: true }
    }
    throw err
  }
}
