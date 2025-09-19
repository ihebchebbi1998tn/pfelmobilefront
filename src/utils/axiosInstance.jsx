import axios from 'axios'

const API_URL = import.meta.env.VITE_APP_API_URL

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
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

      if (!isRefreshing) {
        isRefreshing = true
        console.log('Token expired, refreshing token...')

        try {
          const res= await refreshToken()
          if(res)
          {
            processQueue(null)
            window.location.reload()
          }
        } catch (err) {
          processQueue(err, null)
          throw err
        } finally {
          isRefreshing = false
        }
      }

      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: () => resolve(axiosInstance(originalRequest)),
          reject: (err) => reject(err instanceof Error ? err : new Error(err)),
        })
      })
    }

    return Promise.reject(error instanceof Error ? error : new Error(error))
  }
)

export default axiosInstance
