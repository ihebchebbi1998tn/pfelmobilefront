import { localStorageService } from './localStorageService'

const userService = {
  getAllUsers: async (pageNumber, pageSize, searchTerm) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const result = localStorageService.getAll('mockUsers', {
      page: pageNumber,
      pageSize,
      searchTerm
    })
    
    console.log('User service result:', result)
    return result
  },

  getUserById: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    return localStorageService.getById('mockUsers', id)
  },

  addUser: async (user) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    return localStorageService.create('mockUsers', user)
  },

  addListOfUsers: async (data) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    return localStorageService.createBulk('mockUsers', data)
  },

  updateImage: async (image) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    // Mock image update - just return success
    return { success: true, imageUrl: 'mock-image-url.jpg' }
  },

  updateUser: async (userId, userData) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    return localStorageService.update('mockUsers', userId, userData)
  },

  updateUserRoles: async (userId, userData) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    return localStorageService.update('mockUsers', userId, { roles: userData.roles })
  },

  toggleUserIsActive: async (userId) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    const user = localStorageService.getById('mockUsers', userId)
    if (user) {
      return localStorageService.update('mockUsers', userId, { isActive: !user.isActive })
    }
    return null
  },

  toggleUserIsDeleted: async (userId) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    const user = localStorageService.getById('mockUsers', userId)
    if (user) {
      return localStorageService.update('mockUsers', userId, { isDeleted: !user.isDeleted })
    }
    return null
  },

  getAllDeletedUsers: async (pageNumber, pageSize) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    const allUsers = localStorageService.getAll('mockUsers', { page: 1, pageSize: 1000 })
    const deletedUsers = allUsers.items.filter(user => user.isDeleted)
    
    const startIndex = (pageNumber - 1) * pageSize
    const endIndex = startIndex + pageSize
    
    return {
      items: deletedUsers.slice(startIndex, endIndex),
      totalCount: deletedUsers.length,
      pageNumber,
      pageSize,
      totalPages: Math.ceil(deletedUsers.length / pageSize)
    }
  },

  getUsersInfos: async () => {
    await new Promise(resolve => setTimeout(resolve, 200))
    return {
      id: '1',
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@lmobile.com',
      phoneNumber: '+1234567890',
      defaultLanguage: 'en'
    }
  },

  changeUserLanguage: async (lang) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    localStorage.setItem('lang', lang)
    return { success: true }
  },
}

export default userService
