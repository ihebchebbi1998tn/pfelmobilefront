import axiosInstance from '../utils/axiosInstance'

const addressService = {
  addAddress: async (address) => {
    const res = await axiosInstance.post(`/user/api/address`, address)
    return res.data
  },

  GetAddressById: async (id) => {
    const res = await axiosInstance.get(`/user/api/address/${id}`)
    return res.data
  },

  GetAddressByUserId: async (id) => {
    const res = await axiosInstance.get(`/user/api/address/ByUser/${id}`)
    return res.data
  },

  getAllAddresses: async (page, pageSize, searchTerm) => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    })

    if (searchTerm?.trim()) {
      params.append('searchTerm', searchTerm.trim())
    }

    const res = await axiosInstance.get(
      `/user/api/address/all?${params.toString()}`
    )
    return res.data
  },

  GetAllNotAffectedToUser: async () => {
    const res = await axiosInstance.get(
      `/user/api/address/all?page=${1}&pageSize=${20}`
    )
    return res.data
  },

  updateAddress: async (addressData) => {
    const res = await axiosInstance.put(`/user/api/address`, addressData)
    return res.data
  },

  DeleteAddress: async (id) => {
    const res = await axiosInstance.delete(`/user/api/address/${id}`)
    return res.data
  },
}

export default addressService
