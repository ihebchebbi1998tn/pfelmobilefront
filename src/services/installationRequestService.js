import { localStorageService } from './localStorageService'

const installationRequestService = {

  getAllInstallationRequest: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const result = localStorageService.getAll('mockInstallationRequests', {
      page: 1,
      pageSize: 100,
      companyId: id
    })
    
    return {
      items: result.items || [],
      totalCount: result.totalCount || 0
    }
  },

  addInstallationRequest: async (installationRequest) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    return localStorageService.create('mockInstallationRequests', installationRequest)
  },

  toggleInstallationRequest: async (installationRequest) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    const current = localStorageService.getById('mockInstallationRequests', installationRequest.id)
    if (current) {
      return localStorageService.update('mockInstallationRequests', installationRequest.id, {
        status: installationRequest.status
      })
    }
    return null
  },

  DeleteInstallationRequest: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    return localStorageService.delete('mockInstallationRequests', id)
  },

  DownloadInvoiceInstallationRequest: async (id, lang, city, streetName, zipCode, phone, email) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // Mock PDF blob data
    const pdfContent = new Blob(['Mock PDF content for installation request ' + id], { type: 'application/pdf' })
    return pdfContent
  }
}

export default installationRequestService
