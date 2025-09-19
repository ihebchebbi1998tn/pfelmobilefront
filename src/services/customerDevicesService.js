import axiosInstance from '../utils/axiosInstance'

const customerDevicesService = {
    
  getAllCustomerDevices: async (id) => {
     const res = await axiosInstance.get(`/service/api/CustomerDevices/${id}`)
    return res.data
  },

  addCustomerDevices: async (customerDevice) => {
    const res = await axiosInstance.post(`/service/api/CustomerDevices`, customerDevice)
    return res.data
  },

  DeleteCustomerDevices: async (id) => {
    const res = await axiosInstance.delete(`/service/api/CustomerDevices/${id}`)
    return res.data
  },
}

export default customerDevicesService
