import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from 'react'
import { startSignalRConnection } from '../services/signalRNotifService'
import { localStorageService } from '../services/localStorageService'
import PropTypes from 'prop-types'
import { useLanguage } from './LanguageContext'
import { useAuth } from './AuthContext'

const NotificationContext = createContext()

export const NotificationProvider = ({ children }) => {
  const { dictionary } = useLanguage()
  const { isAuthenticated, loading } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [notificationError, setNotificationError] = useState(null)

  const fetchNotifications = useCallback(async () => {
    try {
      setNotificationError(null)
      // Mock notifications from localStorage
      const mockNotifications = localStorageService.getAll('mockNotifications', { page: 1, pageSize: 100 })
      setNotifications(mockNotifications.items || [])
    } catch (error) {
      setNotificationError('Failed to get notifications')
    }
  }, [])

  const deleteNotification = useCallback(
    async (id) => {
      try {
        setNotificationError(null)
        localStorageService.delete('mockNotifications', id)
        setNotifications((prev) => prev.filter((s) => s.id !== id))
      } catch (error) {
        setNotificationError('Failed to delete notification')
      }
    },
    []
  )

  const markNotificationRead = useCallback(
    async (id) => {
      try {
        setNotificationError(null)
        localStorageService.update('mockNotifications', id, { isRead: true })
        fetchNotifications()
      } catch (error) {
        setNotificationError('Operation failed')
      }
    },
    [fetchNotifications]
  )
  
  useEffect(() => {
    if (loading || !isAuthenticated) return

    const connect = async () => {
      const conn = await startSignalRConnection()
      if (!conn) {
        setNotificationError('Failed to connect to notification service')
        return
      }
      
      conn.on('ReceiveNotification', (notif) => {
        setNotifications((prev) => {
          const alreadyExists = prev.some((n) => n.id === notif.id)
          if (alreadyExists) return prev
          return [...prev, notif]
        })
      })
    }
    
    connect()
    fetchNotifications()
  }, [isAuthenticated, loading, fetchNotifications])

  const contextValue = useMemo(
    () => ({
      notifications,
      notificationError,
      fetchNotifications,
      deleteNotification,
      markNotificationRead,
    }),
    [
      notifications,
      notificationError,
      fetchNotifications,
      deleteNotification,
      markNotificationRead,
    ]
  )

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  )
}

NotificationProvider.propTypes = {
  children: PropTypes.node.isRequired,
}

export const useNotification = () => useContext(NotificationContext)
