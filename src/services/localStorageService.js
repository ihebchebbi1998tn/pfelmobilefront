import { getMockData, setMockData, generateId } from '../utils/mockData'

// Generic localStorage service for all entities
export const localStorageService = {
  // Generic CRUD operations
  getAll: (entityType, filters = {}) => {
    const data = getMockData(entityType)
    
    // Apply filters if provided
    let filteredData = data
    
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase()
      filteredData = data.filter(item => 
        Object.values(item).some(value => 
          value && value.toString().toLowerCase().includes(searchLower)
        )
      )
    }
    
    if (filters.companyId) {
      filteredData = filteredData.filter(item => 
        item.companyId === filters.companyId || item.organizationId === filters.companyId
      )
    }
    
    // Pagination
    const page = filters.page || 1
    const pageSize = filters.pageSize || 10
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    
    return {
      items: filteredData.slice(startIndex, endIndex),
      totalCount: filteredData.length,
      pageNumber: page,
      pageSize: pageSize,
      totalPages: Math.ceil(filteredData.length / pageSize)
    }
  },
  
  getById: (entityType, id) => {
    const data = getMockData(entityType)
    return data.find(item => item.id === id) || null
  },
  
  create: (entityType, item) => {
    const data = getMockData(entityType)
    const newItem = {
      ...item,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    data.push(newItem)
    setMockData(entityType, data)
    return newItem
  },
  
  update: (entityType, id, updates) => {
    const data = getMockData(entityType)
    const index = data.findIndex(item => item.id === id)
    
    if (index !== -1) {
      data[index] = {
        ...data[index],
        ...updates,
        updatedAt: new Date().toISOString()
      }
      setMockData(entityType, data)
      return data[index]
    }
    return null
  },
  
  delete: (entityType, id) => {
    const data = getMockData(entityType)
    const filteredData = data.filter(item => item.id !== id)
    setMockData(entityType, filteredData)
    return true
  },
  
  // Bulk operations
  createBulk: (entityType, items) => {
    const data = getMockData(entityType)
    const newItems = items.map(item => ({
      ...item,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }))
    data.push(...newItems)
    setMockData(entityType, data)
    return newItems
  }
}

export default localStorageService