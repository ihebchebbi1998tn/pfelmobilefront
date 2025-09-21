import axios from 'axios'

const API_URL = import.meta.env.VITE_APP_API_URL

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
})

// Attach Authorization header from storage when available (fallback to cookies)
axiosInstance.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token')
    if (token) {
      config.headers = config.headers || {}
      if (!config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
  } catch {}
  return config
})

let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else if (token) {
      prom.resolve(token)
    } else {
      prom.reject(new Error('No token received'))
    }
  })

  failedQueue = []
}

const refreshToken = async () =>{
    const res = await axiosInstance.post(`/user/api/auth/refresh`)
    return res.data
} 

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (
      error.response?.status === 401 &&
      error?.response?.data?.message === 'Token expired' &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true

      // Avoid refresh attempts if we don't have any stored token (e.g., on login page)
      let storedToken = null
      try {
        storedToken =
          localStorage.getItem('access_token') ||
          sessionStorage.getItem('access_token') ||
          null
      } catch {}

      if (!storedToken) {
        return Promise.reject(error)
      }

      if (!isRefreshing) {
        isRefreshing = true
        console.log('Token expired, refreshing token...')

        try {
          const res = await refreshToken()
          // Try to persist any returned access token
          const newToken =
            res?.accessToken || res?.token || res?.jwt || res?.access_token
          if (newToken) {
            try {
              if (localStorage.getItem('access_token'))
                localStorage.setItem('access_token', newToken)
              else sessionStorage.setItem('access_token', newToken)
            } catch {}
          }
          processQueue(null, newToken || undefined)
        } catch (err) {
          processQueue(err, null)
          throw err
        } finally {
          isRefreshing = false
        }
      }

      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token) => {
            if (token) {
              originalRequest.headers = originalRequest.headers || {}
              originalRequest.headers.Authorization = `Bearer ${token}`
            }
            resolve(axiosInstance(originalRequest))
          },
          reject: (err) => reject(err instanceof Error ? err : new Error(err)),
        })
      })
    }

    return Promise.reject(error instanceof Error ? error : new Error(error))
  }
)

export default axiosInstance
