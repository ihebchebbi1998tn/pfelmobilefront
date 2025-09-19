import axiosInstance from '../utils/axiosInstance'

const feedbackService = {
    
  addFeedback: async (feedback) => {
    const res = await axiosInstance.post(`/service/api/Feedback`, feedback)
    return res.data
  },

  updateFeedback: async (feedback) => {
    const res = await axiosInstance.post(`/service/api/Feedback/update`, feedback)
    return res.data
  },

}

export default feedbackService
