import axiosInstance from '../utils/axiosInstance'

const sparePartService = {
    
  getAllSpareParts: async (page, pageSize, companyId, searchTerm) => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      companyId: companyId.toString(),
    })

    if (searchTerm?.trim()) {
      params.append('searchTerm', searchTerm.trim())
    }

    const res = await axiosInstance.get(
      `/service/api/SparePart?${params.toString()}`
    )
    return res.data
  },

  addSparePart: async (sparePart) => {
    const res = await axiosInstance.post(`/service/api/SparePart`, sparePart)
    return res.data
  },

  addListOfSparePart: async (data) => {
    const res = await axiosInstance.post(`/service/api/SparePart/add_list_of_spareParts`, data)
    return res.data
  },

  updateSparePart: async (sparePart) => {
    const res = await axiosInstance.post(`/service/api/SparePart/update`, sparePart)
    return res.data
  },

  DeleteSparePart: async (id) => {
    const res = await axiosInstance.delete(`/service/api/SparePart/${id}`)
    return res.data
  },
}

export default sparePartService
