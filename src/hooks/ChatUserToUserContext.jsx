import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from 'react'
import {
  startSignalRConnection,
  getConnectedUserIds,
} from '../services/signalRUserToUserService'
import { localStorageService } from '../services/localStorageService'
import PropTypes from 'prop-types'
import { useLanguage } from './LanguageContext'
import { useAuth } from './AuthContext'

const ChatUserToUserContext = createContext()

export const ChatUserToUserProvider = ({ children }) => {
  const [connection, setConnection] = useState(null)
  const { dictionary } = useLanguage()
  const { user, isAuthenticated, loading } = useAuth()
  const [connectedUserIds, setConnectedUserIds] = useState([])
  const [userToUserMessages, setUserToUserMessages] = useState([])
  const [unreadMessages, setUnreadMessages] = useState({ total: 0, sessions: [] })
  const [userToUserSessionId, setUserToUserSessionId] = useState(null)
  const [userToUserChatSessions, setUserToUserChatSessions] = useState([])
  const [userToUserChatError, setUserToUserChatError] = useState(null)
  const [typingUserId, setTypingUserId] = useState(null)
  const [sessionTypingId, setSessionTypingId] = useState(null)
  
  const handleNewSessionCreated = async(sessionDto) => {
    fetchUserToUserSessions()
    const firstMessage = sessionDto?.messages?.[0]
    
    // Mock user check for offline mode
    if (user?.id && firstMessage && firstMessage.userId === user.id) {
      setUserToUserSessionId(sessionDto.id)
      setUserToUserMessages((prev) => {
        const uniqueMessages = (sessionDto.messages || []).filter(
          (msg) => !prev.some((m) => m.id === msg.id)
        )
        return [...prev, ...uniqueMessages]
      })
    }
  }

  const sendUserToUserMessage = async (content, type, userId, fileName) => {
    if (!connection) {
      setUserToUserChatError('No connection available')
      return
    }

    try {
      // Mock message sending - add to local state
      const mockMessage = {
        id: Date.now().toString(),
        content,
        type: type || 'text',
        fileName,
        userId: user?.id,
        sessionId: userToUserSessionId || 'default',
        timestamp: new Date().toISOString(),
        status: true
      }
      
      setUserToUserMessages(prev => [...prev, mockMessage])
      
      await connection.invoke('SendMessage', {
        content,
        type,
        fileName,
        sessionId: userToUserSessionId || null,
        userId,
      })
    } catch (err) {
      setUserToUserChatError('Failed to send message')
    }
  }

  const enterSession = useCallback(
    async (sessionId) => {
      if (!connection) return
      try {
        setUserToUserSessionId(sessionId)
        await connection.invoke('EnterSession', sessionId)
      } catch (err) {
        console.error('❌ Failed to enter session:', err)
      }
    },
    [connection]
  )

  const leaveSession = useCallback(async () => {
    if (!connection) return
    try {
      setUserToUserSessionId(null)
      await connection.invoke('LeaveSession')
    } catch (err) {
      console.error('❌ Failed to leave session:', err)
    }
  }, [connection])

  useEffect(() => {
    if (!userToUserChatSessions || userToUserChatSessions.length === 0) return;

    let totalUnread = 0;
    const sessionsData = [];

    userToUserChatSessions.forEach(session => {
      let unreadCount = 0;
      let otherUserId = null;

      session?.messages?.forEach(m => {
        if (m.userId !== user?.id && m.status === false) {
          unreadCount++;
          otherUserId = m.userId;
        }
      });

      if (unreadCount > 0 && otherUserId) {
        sessionsData.push({
          sessionId: session.id,
          otherUserId: otherUserId,
          unreadCount: unreadCount
        });
        totalUnread += unreadCount;
      }
    });

    setUnreadMessages({
      total: totalUnread,
      sessions: sessionsData
    });

  }, [userToUserChatSessions, user?.id]);

  const fetchUserToUserSessions = useCallback(async () => {
    try {
      setUserToUserChatError(null)
      // Mock user-to-user chat sessions from localStorage
      const mockSessions = localStorageService.getAll('mockUserToUserSessions', { page: 1, pageSize: 100 })
      setUserToUserChatSessions(mockSessions.items || [])
    } catch (error) {
      setUserToUserChatError('Failed to get user-to-user sessions')
    }
  }, [])

  const deleteUserToUserSession = async (sessionId) => {
    if (!connection) {
      setUserToUserChatError('No connection available')
      return
    }

    try {
      localStorageService.delete('mockUserToUserSessions', sessionId)
      setUserToUserChatSessions(prev => prev.filter(s => s.id !== sessionId))
      await connection.invoke('ToggleSessionStatus', sessionId)
    } catch (err) {
      setUserToUserChatError('Failed to delete session')
    }
  }

  useEffect(() => {
    if (loading || !isAuthenticated) return

    let isMounted = true
    let conn = null

    const connect = async () => {
      conn = await startSignalRConnection()
      if (!conn) {
        if (isMounted)
          setUserToUserChatError('Failed to connect to user-to-user chat service')
        return
      }

      if (isMounted) {
        setConnection(conn)

        conn.on('ReceiveUserToUserMessage', (data) => {
          const message = data.message
          const inSession = data.inSession
          
          if (inSession) {
            setUserToUserMessages((prev) => {
              const alreadyExists = prev.some((m) => m.id === message.id)
              return alreadyExists ? prev : [...prev, message]
            })
          }
          fetchUserToUserSessions()
        })

        conn.on('SessionBlocked', (data) => {
          if (data) fetchUserToUserSessions()
        })

        conn.on('SessionUnBlocked', (data) => {
          if (data) fetchUserToUserSessions()
        })

        conn.on('NewUserToUserSessionCreated', handleNewSessionCreated)

        conn.on('MessagesSeen', (sessionId) => {
          setUserToUserMessages((prev) =>
            prev.map((msg) =>
              msg.sessionId === sessionId && msg.status === false
                ? { ...msg, status: true }
                : msg
            )
          )

          setUnreadMessages((prev) => {
            const sessionToRemove = prev.sessions.find(
              (s) => s.sessionId === sessionId
            )

            if (!sessionToRemove) return prev

            const updatedSessions = prev.sessions.filter(
              (s) => s.sessionId !== sessionId
            )

            const updatedTotal = prev.total - sessionToRemove.unreadCount
            return {
              total: updatedTotal >= 0 ? updatedTotal : 0,
              sessions: updatedSessions,
            }
          })
        })

        conn.on('UserTyping', (senderUserId, usersSessionId) => {
          setTypingUserId(senderUserId)
          setSessionTypingId(usersSessionId)
          setTimeout(() => {
            setTypingUserId((prev) => (prev === senderUserId ? null : prev))
            setSessionTypingId((prev) =>
              prev === usersSessionId ? null : prev
            )
          }, 1000)
        })
      }
    }

    connect()
    fetchUserToUserSessions()

    const intervalId = setInterval(async () => {
      try {
        const ids = await getConnectedUserIds()
        if (isMounted) setConnectedUserIds(ids)
      } catch (err) {
        console.error('❌ Failed to fetch connected users', err)
      }
    }, 10000)

    return () => {
      isMounted = false
      if (conn) conn.stop()
      clearInterval(intervalId)
    }
  }, [isAuthenticated, loading, fetchUserToUserSessions])

  const handleTyping = async(recipientUserId) => {
    if (!connection) return
    try {
      await connection.invoke('SendTypingSignal', recipientUserId)
    } catch (err) {
      console.error('Failed to send typing signal:', err)
    }
  }

  const contextValue = useMemo(
    () => ({
      userToUserMessages,
      userToUserSessionId,
      userToUserChatSessions,
      userToUserChatError,
      connectedUserIds,
      typingUserId,
      sessionTypingId,
      unreadMessages,
      enterSession,
      leaveSession,
      setUserToUserMessages,
      setUserToUserSessionId,
      setUserToUserChatSessions,
      sendUserToUserMessage,
      fetchUserToUserSessions,
      deleteUserToUserSession,
      handleTyping,
    }),
    [
      userToUserMessages,
      userToUserSessionId,
      userToUserChatSessions,
      userToUserChatError,
      connectedUserIds,
      typingUserId,
      sessionTypingId,
      unreadMessages,
      enterSession,
      leaveSession,
      sendUserToUserMessage,
      fetchUserToUserSessions,
      deleteUserToUserSession,
      handleTyping,
    ]
  )

  return (
    <ChatUserToUserContext.Provider value={contextValue}>
      {children}
    </ChatUserToUserContext.Provider>
  )
}

ChatUserToUserProvider.propTypes = {
  children: PropTypes.node.isRequired,
}

export const useUserToUserChat = () => {
  const context = useContext(ChatUserToUserContext)
  if (!context) {
    throw new Error('useUserToUserChat must be used within a ChatUserToUserProvider')
  }
  return context
}
