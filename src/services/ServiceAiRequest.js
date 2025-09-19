import axiosInstance from '../utils/axiosInstance'

const ServiceAiRequest = {
    
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
      `/service/api/ServiceRequestAi?${params.toString()}`
    )
    return res.data
  },

  addPaymentMethode: async (id, methode) => {
    const res = await axiosInstance.put(`/service/api/ServiceRequestAi/payment/${id}/${methode}`, null)
    return res.data
  },

  toggleServiceRequestStatus: async (serviceRequest) => {
    const res = await axiosInstance.post(`/service/api/ServiceRequestAi/toggle`, serviceRequest)
    return res.data
  },

  DownloadInvoiceServiceRequestAi: async (id, lang, city, streetName, zipCode, phone, email) => {
  const params = new URLSearchParams({
    lang: lang || '',
    city: city || '',
    streetName: streetName || '',
    zipCode: zipCode || '',
    phone: phone || '',
    email: email || '',
  });

  const res = await axiosInstance.get(
    `/service/api/ServiceRequestAi/${id}/download?${params.toString()}`,
    {
      responseType: 'blob', 
    }
  )

  return res.data
 }
}

export default ServiceAiRequest
