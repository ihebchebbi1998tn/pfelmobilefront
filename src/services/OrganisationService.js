import { localStorageService } from './localStorageService'

const OrganisationService = {
  addOrganization: async (organization) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    return localStorageService.create('mockOrganizations', organization)
  },

  GetOrganizationById: async () => {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // Get user count for the organization
    const users = localStorageService.getAll('mockUsers', { page: 1, pageSize: 1000 })
    const activeUsers = users.items?.filter(u => u.isActive && !u.isDeleted && u.clientOrganization?.id === '1').length || 0
    
    // Return the default L-Mobile organization with user count
    return {
      organization: {
        id: '1',
        name: 'L-Mobile',
        description: 'Main organization',
        isActive: true,
        address: null,
        phoneNumber: '+1234567890',
        email: 'contact@lmobile.com',
        primaryColor: '#1976d2'
      },
      totalUsers: activeUsers
    }
  },

  getAllOrganizations: async () => {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const orgs = localStorageService.getAll('mockOrganizations', { page: 1, pageSize: 100 })
    const users = localStorageService.getAll('mockUsers', { page: 1, pageSize: 1000 })
    
    // Add user counts to each organization
    const orgsWithUserCounts = orgs.items.map(org => ({
      ...org,
      totalUsers: users.items?.filter(u => u.isActive && !u.isDeleted && u.clientOrganization?.id === org.id).length || 0
    }))
    
    return {
      ...orgs,
      items: orgsWithUserCounts
    }
  },

  getAllDeltedOrganizations: async () => {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    try {
      const orgs = localStorageService.getAll('mockOrganizations', { page: 1, pageSize: 100 })
      const deletedOrgs = orgs.items.filter(org => org.isDeleted)
      return { items: deletedOrgs, totalCount: deletedOrgs.length }
    } catch (error) {
      console.error('Error fetching deleted organizations:', error)
      return { items: [], totalCount: 0 }
    }
  },

  UpdateOrganization: async (organization) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    return localStorageService.update('mockOrganizations', organization.id, organization)
  },

  ToggleOrganizationStatus: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    const org = localStorageService.getById('mockOrganizations', id)
    if (org) {
      return localStorageService.update('mockOrganizations', id, { isActive: !org.isActive })
    }
    return null
  },

  UpdateUiPage: async (uiPage) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    return { success: true, uiPage }
  },

  RemoveBackground: async (image) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    return { success: true, processedImage: 'mock-processed-image.jpg' }
  },

  paymentStripe: async (data) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    return { success: true, sessionUrl: 'mock-stripe-session-url' }
  },

  paymentSquare: async (data) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    return { data: { success: true, paymentId: 'mock-square-payment-id' } }
  },

   SendEvent: async (id, type) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    return { success: true }
  },
}

export default OrganisationService
