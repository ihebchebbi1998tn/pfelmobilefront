import axiosInstance from '../utils/axiosInstance'

const userService = {
  getAllUsers: async (pageNumber, pageSize, searchTerm) => {
    const params = new URLSearchParams({
      pageNumber: pageNumber.toString(),
      pageSize: pageSize.toString(),
    })

    if (searchTerm?.trim()) {
      params.append('searchTerm', searchTerm.trim())
    }

    const res = await axiosInstance.get(
      `/user/api/user/all?${params.toString()}`
    )
    return res.data
  },

  getUserById: async (id) => {
    const res = await axiosInstance.get(`/user/api/user/${id}`)
    return res.data
  },

  addUser: async (user) => {
    const res = await axiosInstance.post(`/user/api/user`, user)
    return res.data
  },

  addListOfUsers: async (data) => {
    const res = await axiosInstance.post(`/user/api/user/add_list_of_users`, data)
    return res.data
  },

  updateImage: async (image) => {
    const res = await axiosInstance.post(`/user/api/user/update_image`, image)
    return res.data
  },

  updateUser: async (userId, userData) => {
    const res = await axiosInstance.put(`/user/api/user/${userId}`, userData)
    return res.data
  },

  updateUserRoles: async (userId, userData) => {
    const res = await axiosInstance.put(
      `/user/api/user/roles/${userId}`,
      userData
    )
    return res.data
  },

  toggleUserIsActive: async (userId) => {
    const res = await axiosInstance.put(
      `/user/api/user/${userId}/toggle-active`,
      null
    )
    return res.data
  },

  toggleUserIsDeleted: async (userId) => {
    const res = await axiosInstance.put(
      `/user/api/user/${userId}/toggle-delete`,
      null
    )
    return res.data
  },

  getAllDeletedUsers: async (pageNumber, pageSize) => {
    const res = await axiosInstance.get(
      `/user/api/user/deleted?pageNumber=${pageNumber}&pageSize=${pageSize}`
    )
    return res.data
  },

  getUsersInfos: async () => {
    const res = await axiosInstance.get(`/user/api/user/info`)
    return res.data
  },

  changeUserLanguage: async (lang) => {
    const res = await axiosInstance.post(`/user/api/user/language`, { lang })
    return res.data
  },
}

export default userService
