import { localStorageService } from './localStorageService'

const userToUserChatService = {
  
  getAllSessions: async (userId) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const result = localStorageService.getAll('mockUserToUserSessions', {
      page: 1,
      pageSize: 100
    })
    
    // Filter sessions where the user is a participant
    const userSessions = result.items.filter(session => 
      session.participants && session.participants.includes(userId)
    )
    
    return {
      ...result,
      items: userSessions
    }
  },

  createSession: async (participants) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const session = {
      participants,
      lastMessage: '',
      lastMessageTime: new Date().toISOString(),
      unreadCount: 0,
      status: 'Active',
      messages: []
    }
    
    return localStorageService.create('mockUserToUserSessions', session)
  },

  getSessionMessages: async (sessionId) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const session = localStorageService.getById('mockUserToUserSessions', sessionId)
    return session?.messages || []
  },

  sendMessage: async (sessionId, userId, content) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const session = localStorageService.getById('mockUserToUserSessions', sessionId)
    if (!session) return null
    
    const newMessage = {
      id: `msg-${Date.now()}`,
      userId,
      content,
      timestamp: new Date().toISOString(),
      status: true,
      sessionId
    }
    
    session.messages = session.messages || []
    session.messages.push(newMessage)
    session.lastMessage = content
    session.lastMessageTime = newMessage.timestamp
    
    return localStorageService.update('mockUserToUserSessions', sessionId, session)
  },

  markAsRead: async (sessionId) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    return localStorageService.update('mockUserToUserSessions', sessionId, {
      unreadCount: 0
    })
  },

  deleteSession: async (sessionId) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    return localStorageService.delete('mockUserToUserSessions', sessionId)
  }
}

export default userToUserChatService