import axiosInstance from '../utils/axiosInstance'

const geminiService = {
    
  uploadUsers: async (data) => {
    const res = await axiosInstance.post(`/user/api/gemini/upload`, data)
    return res.data
  },

   uploadDevices: async (data) => {
    const res = await axiosInstance.post(`/user/api/gemini/upload_devices`, data)
    return res.data
  },

  uploadSpareParts: async (data) => {
    const res = await axiosInstance.post(`/user/api/gemini/upload_spare_parts`, data)
    return res.data
  },
}

export default geminiService
