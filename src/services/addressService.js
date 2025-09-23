import { localStorageService } from './localStorageService'

const addressService = {
  addAddress: async (address) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    return localStorageService.create('mockAddresses', address)
  },

  GetAddressById: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    return localStorageService.getById('mockAddresses', id)
  },

  GetAddressByUserId: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    const addresses = localStorageService.getAll('mockAddresses', { page: 1, pageSize: 1000 })
    return addresses.items.filter(addr => addr.userId === id)
  },

  getAllAddresses: async (page, pageSize, searchTerm) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const result = localStorageService.getAll('mockAddresses', {
      page,
      pageSize,
      searchTerm
    })
    
    console.log('Address service result:', result)
    return result
  },

  GetAllNotAffectedToUser: async () => {
    await new Promise(resolve => setTimeout(resolve, 200))
    const addresses = localStorageService.getAll('mockAddresses', { page: 1, pageSize: 20 })
    return addresses.items.filter(addr => !addr.userId)
  },

  updateAddress: async (addressData) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    return localStorageService.update('mockAddresses', addressData.id, addressData)
  },

  DeleteAddress: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    return localStorageService.delete('mockAddresses', id)
  },
}

export default addressService
