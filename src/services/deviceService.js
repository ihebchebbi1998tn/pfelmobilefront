import axiosInstance from '../utils/axiosInstance'

const deviceService = {
    
  getAllDevices: async (page, pageSize, companyId, searchTerm) => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      companyId: companyId.toString(),
    })

    if (searchTerm?.trim()) {
      params.append('searchTerm', searchTerm.trim())
    }

    const res = await axiosInstance.get(
      `/service/api/Devices?${params.toString()}`
    )
    return res.data
  },

  addDevice: async (device) => {
    const res = await axiosInstance.post(`/service/api/Devices`, device)
    return res.data
  },

  addListDevices: async (data) => {
    const res = await axiosInstance.post(`/service/api/Devices/add_list_of_devices`, data)
    return res.data
  },


  updateDevice: async (device) => {
    const res = await axiosInstance.post(`/service/api/Devices/update`, device)
    return res.data
  },

  DeleteDevice: async (id) => {
    const res = await axiosInstance.delete(`/service/api/Devices/${id}`)
    return res.data
  },
}

export default deviceService
