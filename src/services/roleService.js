import { localStorageService } from './localStorageService'

const roleService = {
  addRole: async (role) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    return localStorageService.create('mockRoles', role)
  },

  GetRoleById: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    return localStorageService.getById('mockRoles', id)
  },

  getAllRoles: async (pageNumber, pageSize, searchTerm) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const result = localStorageService.getAll('mockRoles', {
      page: pageNumber,
      pageSize,
      searchTerm
    })

    return {
      items: result.items || [],
      totalCount: result.totalCount || 0,
      organizationNames: ['L-Mobile']
    }
  },

  GetRoleByUserId: async (userId) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    const users = localStorageService.getAll('mockUsers', { page: 1, pageSize: 1000 })
    const user = users.items.find(u => u.id === userId)
    return user ? user.roles || [] : []
  },

  updateRole: async (id, roleData) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    return localStorageService.update('mockRoles', id, roleData)
  },

  DeleteRole: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    return localStorageService.delete('mockRoles', id)
  },
}

export default roleService
