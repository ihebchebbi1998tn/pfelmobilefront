import axiosInstance from '../utils/axiosInstance'

const authService = {
  login: async (email, password, rememberMe, deviceType, operatingSystem, browser) => {
    const res = await axiosInstance.post(`/user/api/auth/login`, {
      email,
      password,
      rememberMe,
      deviceType,
      operatingSystem,
      browser
    })
    return res.data
  },

  logout: async () => {
    const res = await axiosInstance.post(`/gateway/logout`)
    return res.data
  },

  ConfirmDevice: async (token) => {
    const params = new URLSearchParams({
      token: token.toString()
    })

    const res = await axiosInstance.get(
      `/user/api/auth/device-confirm?${params.toString()}`
    )
    return res.data
  },

  revokeDevice: async (deviceId) => {
    const res = await axiosInstance.put(
      `/user/api/auth/revoke-device/${deviceId}`,
      null
    )
    return res.data
  },

  generateResetToken: async (email) => {
    const res = await axiosInstance.post(
      `/user/api/auth/generate-reset-token`,
      { email }
    )
    return res.data
  },

  VerifyEmail: async (email) => {
    const res = await axiosInstance.post(`/user/api/auth/verify-email`, {
      email,
    })
    return res.data
  },

  resetPassword: async (email, token, newPassword) => {
    const res = await axiosInstance.post(`/user/api/auth/reset-password`, {
      email,
      token,
      newPassword,
    })
    return res.data
  },
}

export default authService
