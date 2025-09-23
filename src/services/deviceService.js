import { localStorageService } from './localStorageService'

const deviceService = {
    
  getAllDevices: async (page, pageSize, companyId, searchTerm) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const result = localStorageService.getAll('mockDevices', {
      page,
      pageSize,
      companyId,
      searchTerm
    })

    // Map device data to match expected format
    const mappedItems = result.items.map(item => ({
      ...item,
      title: item.name || item.title,
      description: item.description,
      price: item.price || Math.floor(Math.random() * 500) + 100,
      tva: item.tva || 20,
      reference: item.reference || item.serialNumber || `REF-${item.id}`,
      organizationName: item.organizationName || 'L-Mobile',
      imageUrl: item.imageUrl || null
    }))

    return {
      ...result,
      items: mappedItems,
      companyNames: ['L-Mobile']
    }
  },

  addDevice: async (device) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    return localStorageService.create('mockDevices', device)
  },

  addListDevices: async (data) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    return localStorageService.createBulk('mockDevices', data)
  },

  updateDevice: async (device) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    return localStorageService.update('mockDevices', device.id, device)
  },

  DeleteDevice: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    return localStorageService.delete('mockDevices', id)
  },
}

export default deviceService
