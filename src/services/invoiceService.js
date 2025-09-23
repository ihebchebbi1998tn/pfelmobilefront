import { localStorageService } from './localStorageService'

const invoiceService = {
    
  getdata: async () => {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // Get all data and return organized structure
    const serviceRequests = localStorageService.getAll('mockServiceRequests', { page: 1, pageSize: 100 })
    const serviceRequestAis = localStorageService.getAll('mockServiceRequestsAi', { page: 1, pageSize: 100 })
    const orders = localStorageService.getAll('mockOrders', { page: 1, pageSize: 100 })
    const installationRequests = localStorageService.getAll('mockInstallationRequests', { page: 1, pageSize: 100 })
    
    return {
      serviceRequests: serviceRequests.items || [],
      serviceRequestAis: serviceRequestAis.items || [],
      orders: orders.items || [],
      installationRequests: installationRequests.items || []
    }
  },
}

export default invoiceService
