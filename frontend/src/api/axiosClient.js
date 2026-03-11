import axios from 'axios'

export const isQuotaError = (err) => err.response?.data?.error === 'AI_QUOTA_EXCEEDED'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const axiosClient = axios.create({
  baseURL: BASE_URL,
  timeout: 45000,
  headers: { 'Content-Type': 'application/json' },
})

// ── Request interceptor: attach bearer token ──────────────────────────────────
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error),
)

// ── Response interceptor: handle 401 / token refresh ─────────────────────────
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      const refresh = localStorage.getItem('refresh_token')
      if (!refresh) {
        localStorage.clear()
        window.location.href = '/login'
        return Promise.reject(error)
      }
      try {
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken: refresh })
        const newAccess  = data.data.tokens.access
        const newRefresh = data.data.tokens.refresh
        localStorage.setItem('access_token',  newAccess)
        if (newRefresh) localStorage.setItem('refresh_token', newRefresh)
        original.headers.Authorization = `Bearer ${newAccess}`
        return axiosClient(original)
      } catch {
        localStorage.clear()
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

export default axiosClient

// Helper to detect if error is a network/connection error (backend offline)
export const isOfflineError = (err) =>
  err.code === 'ERR_NETWORK' ||
  err.code === 'ECONNREFUSED' ||
  err.message === 'Network Error'
