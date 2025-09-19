import { useRef, useEffect } from 'react'
import { useChat } from '../../../hooks/ChatContext'
import { useAuth } from '../../../hooks/AuthContext'
import { useLanguage } from '../../../hooks/LanguageContext'
import { Typography, Box, Avatar, useTheme } from '@mui/material'
import { OrbitProgress } from 'react-loading-indicators'
import blackAvatarSrc from '../../../assets/img/ai-avatar-black.png'
import { motion } from 'framer-motion'
import PropTypes from 'prop-types'

const ChatBotContent = ({ isTyping }) => {
  const { messages, setMessages, fetchSessions, chatSessions, sessionId } =
    useChat()
  const messagesEndRef = useRef(null)
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const { user } = useAuth()
  const { dictionary } = useLanguage()

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
    if(isTyping && messagesEndRef.current)
    {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isTyping])
  useEffect(() => {
    const fetchData = async () => {
      await fetchSessions()

      if (sessionId && chatSessions.length > 0) {
        const session = chatSessions.find((s) => s.id === sessionId)
        if (session) {
          const sessionMessages = session.messages
          const isDifferent =
            messages.length !== sessionMessages.length ||
            JSON.stringify(messages) !== JSON.stringify(sessionMessages)

          if (isDifferent) {
            setMessages(sessionMessages)
          }
        }
      }
    }

    fetchData()
  }, [sessionId, chatSessions])

  const formatMessageDate = (dateStr) => {
    const date = new Date(dateStr)
    const now = new Date()

    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()

    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')

    if (isToday) {
      return `${hours}:${minutes}`
    } else {
      const dayNameEnglish = date.toLocaleDateString('en-US', {
        weekday: 'long',
      })
      const translatedDay = dictionary[dayNameEnglish]
      const translatedAt = dictionary.at
      const day = date.getDate().toString().padStart(2, '0')
      const month = (date.getMonth() + 1).toString().padStart(2, '0')

      return `${translatedDay} ${day}/${month} ${translatedAt} ${hours}:${minutes}`
    }
  }

  if (messages.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Box
          sx={{
            mt: '50%',
            border: '2px solid',
            borderRadius: '15px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
            p: 2,
            textAlign: 'center',
          }}
        >
          <Typography
            sx={{
              background: `linear-gradient(to right, ${user.organization.primaryColor},${user.organization.secondaryColor}, ${user.organization.secondaryColor} )`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 'bold',
              fontSize: '1.5rem',
            }}
          >
            {dictionary.Hi} {user.lastName} {user.firstName}
          </Typography>
          <Typography
            sx={{
              background: `linear-gradient(to right, ${user.organization.primaryColor},${user.organization.secondaryColor}, ${user.organization.secondaryColor} )`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 'bold',
              fontSize: '1.5rem',
            }}
          >
            {dictionary.HowCanWeHelpYou}
          </Typography>
        </Box>
      </motion.div>
    )
  }

  return (
    <Box display="flex" flexDirection="column" gap={1}>
      {messages.map((msg) => (
        <Box
          key={msg.id}
          alignSelf={msg.isFromUser ? 'flex-end' : 'flex-start'}
          bgcolor={
            msg.isFromUser
              ? isDark
                ? user.organization.primaryColor
                : user.organization.secondaryColor
              : '#FEFFFE'
          }
          sx={{
            padding: '0.5rem 1rem',
            borderRadius: '12px',
          }}
          maxWidth="80%"
        >
          <Typography
            fontSize="0.9rem"
            color={msg.isFromUser ? 'white' : 'black'}
          >
            {msg.content}
          </Typography>
          <Typography
            fontSize="0.7rem"
            color={msg.isFromUser ? 'black' : 'gray'}
            textAlign="right"
            style={{ marginTop: '0.25rem' }}
          >
            {formatMessageDate(msg.timestamp)}
          </Typography>
        </Box>
      ))}
      {isTyping && (
        <div
          style={{
            alignSelf: 'flex-start',
            display: 'flex',
            alignItems: 'center',
            paddingTop: '0.75rem',
            backgroundColor: '#FEFFFE',
            padding: '0.5rem',
            borderRadius: '12px',
            maxWidth: '90%',
          }}
        >
          <Avatar
            src={blackAvatarSrc}
            sx={{ width: 24, height: 24, marginRight: '0.5rem' }}
          />
          <OrbitProgress
            variant="disc"
            color={
              isDark
                ? user.organization.primaryColor
                : user.organization.secondaryColor
            }
            size="small"
            text=""
            textColor=""
          />
        </div>
      )}
      <div ref={messagesEndRef} />
    </Box>
  )
}

ChatBotContent.propTypes = {
    isTyping: PropTypes.bool,
  }

export default ChatBotContent
