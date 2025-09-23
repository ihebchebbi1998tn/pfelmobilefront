import { getMockData } from '../utils/mockData'

const authService = {
  login: async (email, password, rememberMe) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Check hardcoded admin credentials
    if (email === 'admin@lmobile.com' && password === 'admin123') {
      const mockToken = 'mock-jwt-token-' + Date.now()
      
      // Persist token depending on rememberMe preference
      if (rememberMe) {
        localStorage.setItem('access_token', mockToken)
      } else {
        sessionStorage.setItem('access_token', mockToken)
      }
      
      return {
        accessToken: mockToken,
        success: true
      }
    } else {
      throw new Error('Invalid credentials')
    }
  },

  logout: async () => {
    // Clear any stored access token on logout
    try {
      localStorage.removeItem('access_token')
      sessionStorage.removeItem('access_token')
    } catch {}
    return { success: true }
  },

  ConfirmDevice: async (token) => {
    // Mock device confirmation
    return { success: true }
  },

  revokeDevice: async (deviceId) => {
    // Mock device revocation
    return { success: true }
  },

  generateResetToken: async (email) => {
    // Mock reset token generation
    return { success: true, message: 'Reset token sent to email' }
  },

  VerifyEmail: async (email) => {
    // Mock email verification
    return { success: true, message: 'Email verified' }
  },

  resetPassword: async (email, token, newPassword) => {
    // Mock password reset
    return { success: true, message: 'Password reset successful' }
  },
}

export default authService
