import { localStorageService } from './localStorageService'

const feedbackService = {
  addFeedback: async (feedback) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    return localStorageService.create('mockFeedback', feedback)
  },

  getAllFeedback: async (page = 1, pageSize = 100) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    return localStorageService.getAll('mockFeedback', { page, pageSize })
  },

  updateFeedback: async (feedback) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    return localStorageService.update('mockFeedback', feedback.id, feedback)
  },

  deleteFeedback: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    return localStorageService.delete('mockFeedback', id)
  },

}

export default feedbackService
