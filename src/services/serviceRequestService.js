import { localStorageService } from './localStorageService'

const serviceRequestService = {
    
  getAllServiceRequest: async (page, pageSize, companyId, searchTerm) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    return localStorageService.getAll('mockServiceRequests', {
      page,
      pageSize,
      companyId,
      searchTerm
    })
  },

  addServiceRequest: async (serviceRequest) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    return localStorageService.create('mockServiceRequests', serviceRequest)
  },

  updateServiceRequest: async (serviceRequest) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    return localStorageService.update('mockServiceRequests', serviceRequest.id, serviceRequest)
  },

  toggleServiceRequestStatus: async (serviceRequest) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    const current = localStorageService.getById('mockServiceRequests', serviceRequest.id)
    if (current) {
      return localStorageService.update('mockServiceRequests', serviceRequest.id, {
        status: serviceRequest.status
      })
    }
    return null
  },

  DeleteServiceRequest: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    return localStorageService.delete('mockServiceRequests', id)
  },

   DownloadInvoiceServiceRequest: async (id, lang, city, streetName, zipCode, phone, email) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // Mock PDF blob data
    const pdfContent = new Blob(['Mock PDF content for service request ' + id], { type: 'application/pdf' })
    return pdfContent
   }
}

export default serviceRequestService
