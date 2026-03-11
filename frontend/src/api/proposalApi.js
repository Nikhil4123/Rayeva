import axiosClient, { isOfflineError, isQuotaError } from './axiosClient'
import { MOCK_PROPOSAL_RESULT } from '../data/mockData'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

export async function generateProposal(payload) {
  if (import.meta.env.VITE_DEMO_MODE === 'true') {
    await sleep(2200)
    return { success: true, data: { ...MOCK_PROPOSAL_RESULT }, _demo: true }
  }

  // Map frontend snake_case form fields to backend camelCase schema
  const body = {
    companyName:         payload.company_name,
    companyType:         payload.company_type,
    targetBudget:        Number(payload.total_budget),
    sustainabilityGoals: payload.sustainability_goal
      ? [payload.sustainability_goal]
      : [],
    notes:               payload.notes || '',
  }

  try {
    const { data } = await axiosClient.post('/ai/b2b-proposal', body)
    return data
  } catch (err) {
    if (isOfflineError(err) || isQuotaError(err)) {
      await sleep(2200)
      return { success: true, data: { ...MOCK_PROPOSAL_RESULT }, _demo: true }
    }
    throw err
  }
}

export async function getProposal(proposalId) {
  const { data } = await axiosClient.get(`/ai/b2b-proposal/${proposalId}`)
  return data
}

export async function listProposals({ page = 1, company_type } = {}) {
  try {
    const params = new URLSearchParams({ page })
    if (company_type) params.append('company_type', company_type)
    const { data } = await axiosClient.get(`/ai/b2b-proposals?${params}`)
    return data
  } catch (err) {
    if (isOfflineError(err)) return { success: true, data: [], _demo: true }
    throw err
  }
}
