// Mock SignalR service for localStorage-only functionality
let mockConnection = {
  state: 'Connected',
  invoke: async (method, ...args) => {
    console.log(`Mock SignalR invoke: ${method}`, args)
    return { success: true }
  },
  on: (event, callback) => {
    console.log(`Mock SignalR listening to: ${event}`)
  },
  off: (event, callback) => {
    console.log(`Mock SignalR stopped listening to: ${event}`)
  },
  stop: async () => {
    console.log('Mock SignalR connection stopped')
    return { success: true }
  }
}

export const startSignalRConnection = async () => {
  console.log('✅ Mock SignalR connected')
  return mockConnection
}

export const getSignalRConnection = () => mockConnection
