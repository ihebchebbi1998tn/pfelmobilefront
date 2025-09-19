import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr'

let connection = null
const API_URL = import.meta.env.VITE_APP_API_URL

export const startSignalRConnection = async () => {
  if (connection) return connection

  connection = new HubConnectionBuilder()
    .withUrl(`${API_URL}/chat/chat/UserToUser/hub`, {
      withCredentials: true,
    })
    .withAutomaticReconnect()
    .configureLogging(LogLevel.Information)
    .build()

  try {
    await connection.start()
    console.log('✅ SignalR User to User connected')
  } catch (err) {
    console.error('❌ SignalR connection failed:', err)
    connection = null
  }

  return connection
}

const waitForConnected = () => {
  return new Promise((resolve, reject) => {
    if (connection.state === 'Connected') {
      resolve()
      return
    }

    const interval = setInterval(() => {
      if (connection.state === 'Connected') {
        clearInterval(interval)
        resolve()
      }
    }, 100)

    setTimeout(() => {
      clearInterval(interval)
      reject(
        new Error('Timeout waiting for SignalR connection to be connected.')
      )
    }, 5000)
  })
}

export const getConnectedUserIds = async () => {
  if (!connection) return []

  try {
    await waitForConnected()
    const connectedUserIds = await connection.invoke('GetConnectedUserIds')
    return connectedUserIds
  } catch (err) {
    console.error('❌ Failed to get connected user IDs:', err)
    return []
  }
}

export const getSignalRConnection = () => connection
