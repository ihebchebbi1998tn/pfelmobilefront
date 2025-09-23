// Mock SignalR user-to-user service for localStorage-only functionality
let mockUserConnection = {
  state: 'Connected',
  invoke: async (method, ...args) => {
    console.log(`Mock SignalR User-to-User invoke: ${method}`, args)
    if (method === 'GetConnectedUserIds') {
      return ['1'] // Return mock admin user ID
    }
    return { success: true }
  },
  on: (event, callback) => {
    console.log(`Mock SignalR User-to-User listening to: ${event}`)
  },
  off: (event, callback) => {
    console.log(`Mock SignalR User-to-User stopped listening to: ${event}`)
  },
  stop: async () => {
    console.log('Mock SignalR User-to-User connection stopped')
    return { success: true }
  }
}

export const startSignalRConnection = async () => {
  console.log('✅ Mock SignalR User to User connected')
  return mockUserConnection
}

export const getConnectedUserIds = async () => {
  return ['1'] // Return mock admin user ID
}

export const getSignalRConnection = () => mockUserConnection
