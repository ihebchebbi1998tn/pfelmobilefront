import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr'

let connection = null
const API_URL = import.meta.env.VITE_APP_API_URL

export const startSignalRConnection = async () => {
  if (connection) return connection

  connection = new HubConnectionBuilder()
    .withUrl(`${API_URL}/chathub`, {
      withCredentials: true,
      accessTokenFactory: () =>
        localStorage.getItem('access_token') || sessionStorage.getItem('access_token') || '',
    })
    .withAutomaticReconnect()
    .configureLogging(LogLevel.Information)
    .build()

  try {
    await connection.start()
    console.log('✅ SignalR connected')
  } catch (err) {
    console.error('❌ SignalR connection failed:', err)
    connection = null
  }

  return connection
}

export const getSignalRConnection = () => connection
