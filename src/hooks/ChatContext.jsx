import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from 'react'
import { startSignalRConnection } from '../services/signalRService'
import axiosInstance from '../utils/axiosInstance'
import PropTypes from 'prop-types'
import { useLanguage } from './LanguageContext'
import { useAuth } from './AuthContext'

const ChatContext = createContext()

export const ChatProvider = ({ children }) => {
  const [connection, setConnection] = useState(null)
  const { dictionary } = useLanguage()
  const { isAuthenticated, loading } = useAuth()
  const [messages, setMessages] = useState([])
  const [sessionId, setSessionId] = useState(null)
  const [chatSessions, setChatSessions] = useState([])
  const [chatError, setChatError] = useState(null)

  const handleNewSessionCreated = (sessionDto) => {
    setSessionId(sessionDto.id)
    setMessages((prev) => {
      const uniqueMessages = (sessionDto.messages || []).filter(
        (msg) => !prev.some((m) => m.id === msg.id)
      )
      return [...prev, ...uniqueMessages]
    })

    setChatSessions((prev) => [...prev, sessionDto])
  }

  useEffect(() => {
    if (loading || !isAuthenticated) return

    const connect = async () => {
      const conn = await startSignalRConnection()
      if (!conn) {
        setChatError(dictionary.FailedToConnectToServer)
        return
      }

      setConnection(conn)

      conn.on('ReceiveMessage', (message) => {
        setMessages((prev) => {
          const alreadyExists = prev.some((m) => m.id === message.id)
          if (alreadyExists) return prev
          return [...prev, message]
        })
      })

      conn.on('SessionEnded', (data) => {
        if (data) {
          fetchSessions()
        }
      })

      conn.on('NewSessionCreated', handleNewSessionCreated)

      conn.on('ReceiveError', (error) => {
        setChatError(error || dictionary.unknownErrorChat)
      })
    }

    connect()
    fetchSessions()
  }, [isAuthenticated, loading, dictionary])

  const sendMessage = async (content) => {
    if (!connection) {
      setChatError(dictionary.NoConnection)
      return
    }

    try {
      await connection.invoke('SendMessage', {
        content,
        sessionId: sessionId || null,
      })
    } catch (err) {
      setChatError(err || dictionary.FailedToSend)
    }
  }

  const fetchSessions = useCallback(async () => {
    try {
      setChatError(null)
      const response = await axiosInstance.get(`/chat/api/chat/sessions`)
      setChatSessions(response.data)
    } catch (error) {
      setChatError(error || dictionary.FailedToGetSessions)
    }
  }, [dictionary])

  const deleteSession = useCallback(
    async (id) => {
      try {
        setChatError(null)
        await axiosInstance.delete(`/chat/api/chat/${id}`)
        setChatSessions((prev) => prev.filter((s) => s.id !== id))
        if (sessionId === id) {
          setSessionId(null)
          setMessages([])
        }
      } catch (error) {
        setChatError(error || dictionary.FailedToDeleteSessions)
      }
    },
    [dictionary]
  )

  const updateSessionTitle = useCallback(
    async (id, title) => {
      try {
        setChatError(null)
        await axiosInstance.put(`/chat/api/chat/${id}`, { title })
        fetchSessions()
      } catch (error) {
        setChatError(error || dictionary.FailedToUpdateSessions)
      }
    },
    [dictionary]
  )

  const contextValue = useMemo(
    () => ({
      messages,
      setMessages,
      sendMessage,
      sessionId,
      setSessionId,
      chatSessions,
      fetchSessions,
      deleteSession,
      chatError,
      setChatError,
      updateSessionTitle,
    }),
    [
      messages,
      sendMessage,
      sessionId,
      chatSessions,
      chatError,
      updateSessionTitle,
    ]
  )

  return (
    <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>
  )
}

ChatProvider.propTypes = {
  children: PropTypes.node.isRequired,
}

export const useChat = () => useContext(ChatContext)
