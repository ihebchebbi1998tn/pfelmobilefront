import axiosInstance from '../utils/axiosInstance'

const statsService = {

  getStatsUser: async () => {
    const res = await axiosInstance.get(
      `/user/api/stats`
    )
    return res.data
  },

  getStatsService: async () => {
    const res = await axiosInstance.get(
      `/service/api/stats`
    )
    return res.data
  },
 
}

export default statsService
