import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr'

let connection = null
const API_URL = import.meta.env.VITE_APP_API_URL

export const startSignalRConnection = async () => {
  if (connection) return connection

  const token =
    (typeof window !== 'undefined' &&
      (localStorage.getItem('access_token') ||
        sessionStorage.getItem('access_token'))) || ''

  if (!token) {
    console.warn('Skipping SignalR start: no access token')
    return null
  }

  connection = new HubConnectionBuilder()
    .withUrl(`${API_URL}/notificationhub`, {
      withCredentials: true,
      accessTokenFactory: () => token,
    })
    .withAutomaticReconnect()
    .configureLogging(LogLevel.Information)
    .build()

  try {
    await connection.start()
    console.log('✅ SignalR Notif connected')
  } catch (err) {
    console.error('❌ SignalR Notif connection failed:', err)
    connection = null
  }

  return connection
}

export const getSignalRConnection = () => connection
