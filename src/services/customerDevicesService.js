import { localStorageService } from './localStorageService'

const customerDevicesService = {
    
  getAllCustomerDevices: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    console.log('Getting mock data for mockCustomerDevices with org ID:', id)
    
    const result = localStorageService.getAll('mockCustomerDevices', {
      page: 1,
      pageSize: 100,
      companyId: id
    })
    
    console.log('Customer devices service result:', result)
    console.log('Raw localStorage data:', localStorage.getItem('mockCustomerDevices'))
    
    return result
  },

  addCustomerDevices: async (customerDevice) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    return localStorageService.create('mockCustomerDevices', customerDevice)
  },

  DeleteCustomerDevices: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    return localStorageService.delete('mockCustomerDevices', id)
  },
}

export default customerDevicesService
