import axiosInstance from '../utils/axiosInstance'

const orderService = {
    
  getAllOrders: async (page, pageSize, companyId, searchTerm) => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      companyId: companyId.toString(),
    })

    if (searchTerm?.trim()) {
      params.append('searchTerm', searchTerm.trim())
    }

    const res = await axiosInstance.get(
      `/service/api/Order?${params.toString()}`
    )
    return res.data
  },

  addOrder: async (order) => {
    const res = await axiosInstance.post(`/service/api/Order`, order)
    return res.data
  },

  updateOrder: async (order) => {
    const res = await axiosInstance.post(`/service/api/Order/update`, order)
    return res.data
  },

  DeleteOrder: async (id) => {
    const res = await axiosInstance.delete(`/service/api/Order/${id}`)
    return res.data
  },

  DownloadInvoiceOrder: async (id, lang, city, streetName, zipCode, phone, email) => {
  const params = new URLSearchParams({
    lang: lang || '',
    city: city || '',
    streetName: streetName || '',
    zipCode: zipCode || '',
    phone: phone || '',
    email: email || '',
  });

  const res = await axiosInstance.get(
    `/service/api/Order/${id}/download?${params.toString()}`,
    {
      responseType: 'blob', 
    }
  )

  return res.data
 }
}

export default orderService
