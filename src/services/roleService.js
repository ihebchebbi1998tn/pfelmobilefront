import axiosInstance from '../utils/axiosInstance'

const roleService = {
  addRole: async (role) => {
    const res = await axiosInstance.post(`/user/api/role`, role)
    return res.data
  },

  GetRoleById: async (id) => {
    const res = await axiosInstance.get(`/user/api/role/${id}`)
    return res.data
  },

  getAllRoles: async (pageNumber, pageSize, searchTerm) => {
    const params = new URLSearchParams({
      pageNumber: pageNumber.toString(),
      pageSize: pageSize.toString(),
    })

    if (searchTerm?.trim()) {
      params.append('searchTerm', searchTerm.trim())
    }

    const res = await axiosInstance.get(`/user/api/role?${params.toString()}`)
    return res.data
  },

  GetRoleByUserId: async (userId) => {
    const res = await axiosInstance.get(`/user/api/role/ByUserId/${userId}`)
    return res.data
  },

  updateRole: async (id, roleData) => {
    const res = await axiosInstance.put(`/user/api/role/${id}`, roleData)
    return res.data
  },

  DeleteRole: async (id) => {
    const res = await axiosInstance.delete(`/user/api/role/${id}`)
    return res.data
  },
}

export default roleService
