// Mock SignalR notification service for localStorage-only functionality
let mockNotifConnection = {
  state: 'Connected',
  invoke: async (method, ...args) => {
    console.log(`Mock SignalR Notif invoke: ${method}`, args)
    return { success: true }
  },
  on: (event, callback) => {
    console.log(`Mock SignalR Notif listening to: ${event}`)
  },
  off: (event, callback) => {
    console.log(`Mock SignalR Notif stopped listening to: ${event}`)
  },
  stop: async () => {
    console.log('Mock SignalR Notif connection stopped')
    return { success: true }
  }
}

export const startSignalRConnection = async () => {
  console.log('✅ Mock SignalR Notif connected')
  return mockNotifConnection
}

export const getSignalRConnection = () => mockNotifConnection
