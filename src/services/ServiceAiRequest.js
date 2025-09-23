import { localStorageService } from './localStorageService'

const ServiceAiRequest = {
    
  getAllServiceRequest: async (page, pageSize, companyId, searchTerm) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    return localStorageService.getAll('mockServiceRequestsAi', {
      page,
      pageSize,
      companyId,
      searchTerm
    })
  },

  addPaymentMethode: async (id, methode) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    return localStorageService.update('mockServiceRequestsAi', id, { paymentMethod: methode })
  },

  toggleServiceRequestStatus: async (serviceRequest) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    const current = localStorageService.getById('mockServiceRequestsAi', serviceRequest.id)
    if (current) {
      return localStorageService.update('mockServiceRequestsAi', serviceRequest.id, {
        status: serviceRequest.status
      })
    }
    return null
  },

  DownloadInvoiceServiceRequestAi: async (id, lang, city, streetName, zipCode, phone, email) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // Mock PDF blob data
    const pdfContent = new Blob(['Mock PDF content for AI service request ' + id], { type: 'application/pdf' })
    return pdfContent
  }
}

export default ServiceAiRequest
