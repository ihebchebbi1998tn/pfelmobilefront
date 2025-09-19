import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from 'react'
import { startSignalRConnection } from '../services/signalRNotifService'
import axiosInstance from '../utils/axiosInstance'
import PropTypes from 'prop-types'
import { useLanguage } from './LanguageContext'

const NotificationContext = createContext()

export const NotificationProvider = ({ children }) => {
  const { dictionary } = useLanguage()
  const [notifications, setNotifications] = useState([])
  const [notificationError, setNotificationError] = useState(null)

  const fetchNotifications = useCallback(async () => {
    try {
      setNotificationError(null)
      const response = await axiosInstance.get(
        `/notification/api/notification/notifications`
      )
      setNotifications(response.data)
    } catch (error) {
      setNotificationError(error || dictionary.FailedToGetNotifications)
    }
  }, [dictionary])

  const deleteNotification = useCallback(
    async (id) => {
      try {
        setNotificationError(null)
        await axiosInstance.delete(`/notification/api/notification/${id}`)
        setNotifications((prev) => prev.filter((s) => s.id !== id))
      } catch (error) {
        setNotificationError(error || dictionary.FailedToDeleteNotifications)
      }
    },
    [dictionary]
  )

  const markNotificationRead = useCallback(
    async (id) => {
      try {
        setNotificationError(null)
        await axiosInstance.put(`/notification/api/notification/${id}`, null)
        fetchNotifications()
      } catch (error) {
        setNotificationError(error || dictionary.OperationFailed)
      }
    },
    [dictionary]
  )
  useEffect(() => {
    const connect = async () => {
      const conn = await startSignalRConnection()
      if (!conn) {
        setNotificationError(dictionary.FailedToConnectToServer)
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
  }, [])

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
