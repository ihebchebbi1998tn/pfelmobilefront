import axiosInstance from '../utils/axiosInstance'

const serviceRequestService = {
    
  getAllServiceRequest: async (page, pageSize, companyId, searchTerm) => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      companyId: companyId.toString(),
    })

    if (searchTerm?.trim()) {
      params.append('searchTerm', searchTerm.trim())
    }

    const res = await axiosInstance.get(
      `/service/api/ServiceRequest?${params.toString()}`
    )
    return res.data
  },

  addServiceRequest: async (serviceRequest) => {
    const res = await axiosInstance.post(`/service/api/ServiceRequest`, serviceRequest)
    return res.data
  },

  updateServiceRequest: async (serviceRequest) => {
    const res = await axiosInstance.post(`/service/api/ServiceRequest/update`, serviceRequest)
    return res.data
  },

  toggleServiceRequestStatus: async (serviceRequest) => {
    const res = await axiosInstance.post(`/service/api/ServiceRequest/toggle`, serviceRequest)
    return res.data
  },

  DeleteServiceRequest: async (id) => {
    const res = await axiosInstance.delete(`/service/api/ServiceRequest/${id}`)
    return res.data
  },

   DownloadInvoiceServiceRequest: async (id, lang, city, streetName, zipCode, phone, email) => {
  const params = new URLSearchParams({
    lang: lang || '',
    city: city || '',
    streetName: streetName || '',
    zipCode: zipCode || '',
    phone: phone || '',
    email: email || '',
  });

  const res = await axiosInstance.get(
    `/service/api/ServiceRequest/${id}/download?${params.toString()}`,
    {
      responseType: 'blob', 
    }
  )

  return res.data
 }
}

export default serviceRequestService
