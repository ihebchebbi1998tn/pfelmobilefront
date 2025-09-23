import { localStorageService } from './localStorageService'

const sparePartService = {
    
  getAllSpareParts: async (page, pageSize, companyId, searchTerm) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const result = localStorageService.getAll('mockSpareParts', {
      page,
      pageSize,
      companyId,
      searchTerm
    })

    console.log('Spare parts service result:', result)

    // Map spare parts data to match expected format
    const mappedItems = result.items.map(item => ({
      ...item,
      title: item.name || item.title,
      description: item.description,
      price: item.sellingPrice || item.unitCost || 0,
      tva: 10, // Default tax rate
      quantity: item.stockQuantity || 0,
      organizationName: 'L-Mobile',
      imageUrl: null
    }))

    return {
      ...result,
      items: mappedItems,
      companyNames: ['L-Mobile']
    }
  },

  addSparePart: async (sparePart) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    return localStorageService.create('mockSpareParts', sparePart)
  },

  addListOfSparePart: async (data) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    return localStorageService.createBulk('mockSpareParts', data)
  },

  updateSparePart: async (sparePart) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    return localStorageService.update('mockSpareParts', sparePart.id, sparePart)
  },

  DeleteSparePart: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    return localStorageService.delete('mockSpareParts', id)
  },
}

export default sparePartService
