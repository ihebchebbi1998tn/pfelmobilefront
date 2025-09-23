// Mock axios instance for localStorage-only functionality
const axiosInstance = {
  get: async (url, config = {}) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // Mock responses based on URL patterns
    if (url.includes('/user/api/auth/me')) {
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token')
      if (!token) {
        throw new Error('User not authenticated')
      }
      
      return {
        data: {
          id: '1',
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@lmobile.com',
          phoneNumber: '+1234567890',
          address: null,
          permissions: ['Permissions.AllowAll'],
          defaultLanguage: 'en',
          imageUrl: null,
          imageName: null,
          clientOrganization: {
            id: '1',
            name: 'L-Mobile',
            description: 'Main organization',
            isActive: true
          }
        }
      }
    }
    
    // Return empty data for other endpoints
    return { data: [] }
  },
  
  post: async (url, data, config = {}) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // Return success for all POST requests
    return { data: { success: true } }
  },
  
  put: async (url, data, config = {}) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // Return success for all PUT requests
    return { data: { success: true } }
  },
  
  delete: async (url, config = {}) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // Return success for all DELETE requests
    return { data: { success: true } }
  }
}

export default axiosInstance
