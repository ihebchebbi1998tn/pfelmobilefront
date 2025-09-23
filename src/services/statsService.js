import { localStorageService } from './localStorageService'

const statsService = {

  getStatsUser: async () => {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // Get real counts from mock data
    const users = localStorageService.getAll('mockUsers', { page: 1, pageSize: 1000 })
    const organizations = localStorageService.getAll('mockOrganizations', { page: 1, pageSize: 1000 })
    const roles = localStorageService.getAll('mockRoles', { page: 1, pageSize: 1000 })
    
    return {
      totalUsers: users.totalCount || 0,
      activeUsers: users.items?.filter(u => u.isActive && !u.isDeleted).length || 0,
      totalOrganizations: organizations.totalCount || 0,
      totalRoles: roles.totalCount || 0
    }
  },

  getStatsService: async () => {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // Get real counts from mock data
    const devices = localStorageService.getAll('mockDevices', { page: 1, pageSize: 1000 })
    const orders = localStorageService.getAll('mockOrders', { page: 1, pageSize: 1000 })
    const serviceRequests = localStorageService.getAll('mockServiceRequests', { page: 1, pageSize: 1000 })
    const installations = localStorageService.getAll('mockInstallationRequests', { page: 1, pageSize: 1000 })
    const spareParts = localStorageService.getAll('mockSpareParts', { page: 1, pageSize: 1000 })
    
    return {
      totalDevices: devices.totalCount || 0,
      totalOrders: orders.totalCount || 0,
      totalServiceRequests: serviceRequests.totalCount || 0,
      totalInstallations: installations.totalCount || 0,
      totalSpareParts: spareParts.totalCount || 0
    }
  },
 
}

export default statsService
