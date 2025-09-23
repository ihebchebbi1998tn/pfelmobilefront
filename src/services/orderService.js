import { localStorageService } from './localStorageService'

const orderService = {
    
  getAllOrders: async (page, pageSize, companyId, searchTerm) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const result = localStorageService.getAll('mockOrders', {
      page,
      pageSize,
      companyId,
      searchTerm
    })

    console.log('Order service result:', result)
    return {
      ...result,
      companyNames: ['L-Mobile']
    }
  },

  addOrder: async (order) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    return localStorageService.create('mockOrders', order)
  },

  updateOrder: async (order) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    return localStorageService.update('mockOrders', order.id, order)
  },

  DeleteOrder: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    return localStorageService.delete('mockOrders', id)
  },

  DownloadInvoiceOrder: async (id, lang, city, streetName, zipCode, phone, email) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // Mock PDF blob data
    const pdfContent = new Blob(['Mock PDF content for order ' + id], { type: 'application/pdf' })
    return pdfContent
  }
}

export default orderService
