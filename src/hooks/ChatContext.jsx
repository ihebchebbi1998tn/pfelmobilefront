import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from 'react'
import { startSignalRConnection } from '../services/signalRService'
import { localStorageService } from '../services/localStorageService'
import PropTypes from 'prop-types'
import { useLanguage } from './LanguageContext'
import { useAuth } from './AuthContext'

const ChatContext = createContext()

export const ChatProvider = ({ children }) => {
  const [connection, setConnection] = useState(null)
  const { dictionary } = useLanguage()
  const authContext = useAuth()
  const { isAuthenticated, loading } = authContext || { isAuthenticated: false, loading: true }
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
        setChatError('Failed to connect to chat service')
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
        setChatError(error || 'Unknown chat error')
      })
    }

    connect()
    fetchSessions()
  }, [isAuthenticated, loading, dictionary])

  const sendMessage = async (content) => {
    if (!connection) {
      setChatError('No connection available')
      return
    }

    try {
      // Mock message sending - add message to local state
      const mockMessage = {
        id: Date.now().toString(),
        content,
        timestamp: new Date().toISOString(),
        isFromUser: true,
        sessionId: sessionId || 'default'
      }
      
      setMessages(prev => [...prev, mockMessage])
      
      // Mock AI response after delay
      setTimeout(() => {
        const aiResponse = {
          id: (Date.now() + 1).toString(),
          content: `Mock AI response to: "${content}"`,
          timestamp: new Date().toISOString(),
          isFromUser: false,
          sessionId: sessionId || 'default'
        }
        setMessages(prev => [...prev, aiResponse])
      }, 1000)
      
      await connection.invoke('SendMessage', {
        content,
        sessionId: sessionId || null,
      })
    } catch (err) {
      setChatError('Failed to send message')
    }
  }

  const fetchSessions = useCallback(async () => {
    try {
      setChatError(null)
      // Mock chat sessions from localStorage
      const mockSessions = localStorageService.getAll('mockChatSessions', { page: 1, pageSize: 100 })
      setChatSessions(mockSessions.items || [])
    } catch (error) {
      setChatError('Failed to get chat sessions')
    }
  }, [dictionary])

  const deleteSession = useCallback(
    async (id) => {
      try {
        setChatError(null)
        localStorageService.delete('mockChatSessions', id)
        setChatSessions((prev) => prev.filter((s) => s.id !== id))
        if (sessionId === id) {
          setSessionId(null)
          setMessages([])
        }
      } catch (error) {
        setChatError('Failed to delete session')
      }
    },
    [sessionId]
  )

  const updateSessionTitle = useCallback(
    async (id, title) => {
      try {
        setChatError(null)
        localStorageService.update('mockChatSessions', id, { title })
        fetchSessions()
      } catch (error) {
        setChatError('Failed to update session')
      }
    },
    [fetchSessions]
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
      deleteSession,
      fetchSessions
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
