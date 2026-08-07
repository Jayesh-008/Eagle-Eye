import axios from 'axios'

const defaultUrl = import.meta.env.DEV ? 'http://localhost:5000/api' : '/api'
const rawUrl = import.meta.env.VITE_API_URL || defaultUrl
const baseWithProtocol = (rawUrl.startsWith('http') || rawUrl.startsWith('/')) ? rawUrl : `https://${rawUrl}`
const API_BASE_URL = baseWithProtocol.endsWith('/api') ? baseWithProtocol : `${baseWithProtocol.replace(/\/$/, '')}/api`

const api = axios.create({
  baseURL: API_BASE_URL,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('eagle-eye-token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('eagle-eye-token')
      localStorage.removeItem('eagle-eye-user')
      window.dispatchEvent(new Event('auth:expired'))
    }
    return Promise.reject(error)
  }
)

export default api
