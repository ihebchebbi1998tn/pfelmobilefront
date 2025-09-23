import { useUserToUserChat } from '../../../hooks/ChatUserToUserContext'
import { useLanguage } from '../../../hooks/LanguageContext'
import { useAuth } from '../../../hooks/AuthContext'
import { Typography, Box, Dialog, Badge, Avatar, useTheme } from '@mui/material'
import { useState, useRef, useEffect } from 'react'
import exelSrc from '../../../assets/img/excel-icon.png'
import pdfSrc from '../../../assets/img/pdf-icon.png'
import { ThreeDot } from 'react-loading-indicators'
import SupportAgentIcon from '@mui/icons-material/SupportAgent'
import PersonIcon from '@mui/icons-material/Person'
import { motion } from 'framer-motion'
import PropTypes from 'prop-types'

const ChatAgentContent = ({ handleconectedUsersClick, connectedUsers, otherUserId }) => {
  const messagesEndRef = useRef(null)
  const { dictionary } = useLanguage()
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const {
    userToUserMessages,
    sessionTypingId,
    typingUserId,
    userToUserSessionId,
    unreadMessages
  } = useUserToUserChat()
  const { user } = useAuth()
  const [openImage, setOpenImage] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const isAgent =
    user?.permissions?.some(
      (perm) => perm === 'Permissions.Messages.Clients'
    ) || false
  const backgroundColor = user?.organization?.primaryColor || '#015eb9'

  const textColor = isDark ? '#fff' : '#000'

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

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
    if(typingUserId!=null && typingUserId !== user?.id && messagesEndRef.current)
    {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [userToUserMessages, typingUserId])

  const renderContent = (msg, isUser) => {
    switch (msg.type) {
      case 'text':
        return (
          <Typography sx={{ color: isUser ? textColor : 'black' }}>
            {msg.content}
          </Typography>
        )
      case 'image':
        return (
          <>
            <img
              src={msg.content}
              alt="chat-image"
              style={{
                maxWidth: '100%',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
              onClick={() => {
                setImageUrl(msg.content)
                setOpenImage(true)
              }}
            />
            <Dialog
              open={openImage}
              onClose={() => setOpenImage(false)}
              maxWidth="md"
            >
              <img src={imageUrl} alt="preview" style={{ width: '100%' }} />
            </Dialog>
          </>
        )
      case 'audio':
      case 'webm':
        return (
          <audio controls style={{ width: '150px', paddingTop: '5px' }}>
            <source src={msg.content} type="audio/mpeg" />
          </audio>
        )
      case 'video':
        return (
          <video controls style={{ width: '100%', borderRadius: '8px' }}>
            <source src={msg.content} type="video/mp4" />
          </video>
        )
      case 'pdf':
      case 'xlsx':
        return (
          <Box
            display="flex"
            alignItems="center"
            gap={1}
            onClick={() => {
              const link = document.createElement('a')
              link.href = msg.content
              link.download = `fichier.${msg.type}`
              document.body.appendChild(link)
              link.click()
              document.body.removeChild(link)
            }}
            sx={{ cursor: 'pointer' }}
          >
            <img
              src={msg.type === 'pdf' ? pdfSrc : exelSrc}
              alt={msg.type}
              width={30}
              height={30}
            />
            <Typography
              fontSize="0.9rem"
              sx={{ textDecoration: 'underline', color: 'black' }}
            >
              {`Fichier ${msg.type.toUpperCase()}`}
            </Typography>
          </Box>
        )
      default:
        return <Typography color="red">Unknown message type</Typography>
    }
  }

  if (otherUserId == null) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: 'easeOut' }}
      >
        <Box
          sx={{
            marginTop: '10%',
            border: `2px solid`,
            borderRadius: '15px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
            padding: 2,
          }}
        >
          <Box>
            {connectedUsers.length > 0 ? (
              connectedUsers.map((u) => (
              <Box
                key={u.id}
                onClick={() => handleconectedUsersClick(u.id)}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.25rem 0.5rem',
                  borderRadius: 1,
                  cursor: 'pointer',
                  transition: 'background-color 0.3s ease',
                }}
              >
           
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Badge
                    variant="dot"
                    overlap="circular"
                    sx={{
                      '& .MuiBadge-badge': {
                        backgroundColor: u.isConnected ? '#66bb6a' : '#a3a3a3',
                        color: u.isConnected ? '#66bb6a' : '#a3a3a3',
                      },
                    }}
                  >
                  
                    <Box sx={{ width: 10, height: 10 }} /> 
                  </Badge>
                  <Typography
                    sx={{
                      color: u.isConnected ? textColor : '#a3a3a3',
                      fontWeight: 500,
                    }}
                  >
                    {u.lastName} {u.firstName}
                  </Typography>
                </Box>

               
                 <Badge
                  color="error"
                   badgeContent={
                      (unreadMessages?.sessions && Array.isArray(unreadMessages.sessions)) 
                        ? (unreadMessages.sessions.find(s => s.otherUserId === u.id)?.unreadCount || 0)
                        : 0
                    }
                    invisible={
                      (unreadMessages?.sessions && Array.isArray(unreadMessages.sessions))
                        ? (unreadMessages.sessions.find(s => s.otherUserId === u.id)?.unreadCount === 0 ||
                           !unreadMessages.sessions.find(s => s.otherUserId === u.id))
                        : true
                    }
                  sx={{
                    '& .MuiBadge-badge': {
                      right: 0,
                    },
                  }}
                />
              </Box>

              ))
            ) : (
              <Typography>{dictionary.noAvailableUsers}</Typography>
            )}
          </Box>
        </Box>
      </motion.div>
    )
  }

  if (otherUserId != null && userToUserMessages.length === 0) {
  const otherUser = (connectedUsers && Array.isArray(connectedUsers)) 
    ? connectedUsers.find(u => u.id === otherUserId) 
    : null;

  if (otherUser) {
    const userImage = (otherUser?.imageUrl !=null && otherUser?.imageName !=null) ? otherUser?.imageUrl : null
    const userName = `${otherUser.firstName} ${otherUser.lastName}`
    const initials = userName
      .trim()
      .split(' ')
      .map(word => word.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase();

    return (
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: 'easeOut' }}
      >
        <Box
          sx={{
            marginTop: '10%',
            border: '2px solid',
            borderRadius: '15px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
            padding: 3,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            variant="dot"
            sx={{
              '& .MuiBadge-dot': {
                height: 12,
                minWidth: 12,
                borderRadius: '50%',
                backgroundColor: otherUser.isConnected ? '#4caf50' : '#9e9e9e', 
              },
            }}
          >
             {userImage!=null ? (
                  <img
                    src={userImage}
                    alt="Profile"
                    style={{
                      borderRadius:"20px",
                      height: "60px", 
                      width:"60px",
                      objectFit: 'cover',
                    }}
                  />
                  ) : (
                    <Avatar
                      sx={{
                        fontSize: '15px',
                        width: 56,
                        height: 56,
                        bgcolor: isDark ? '#747574' : '#bdbcbc',
                        color: isDark ? '#000' : '#fff',
                      }}
                    >
                      {initials}
                    </Avatar>
                  )}
          </Badge>

          <Typography
            sx={{
              marginTop: 1,
              color: otherUser.isConnected ? textColor : '#a3a3a3',
              fontWeight: 500,
              fontSize: '1rem',
            }}
          >
            {userName}
          </Typography>
        </Box>
      </motion.div>
    );
  }
}


  return (
    <Box>
     <Box display="flex" 
     flexDirection="column" 
     gap={1}
     >
        {userToUserMessages.map((msg, index) => {
          const isUser = msg.userId === user?.id;
          const lastMessage = userToUserMessages[userToUserMessages.length - 1] || null;
          const isLastUserMessage = lastMessage?.id === msg.id;

          return (
            <Box
              key={msg.id}
              alignSelf={isUser ? 'flex-end' : 'flex-start'}
              bgcolor={
                isUser
                  ? user?.organization?.primaryColor || '#015eb9'
                  : '#FEFFFE'
              }
              p={1}
              borderRadius={2}
              maxWidth="80%"
            >
              {renderContent(msg, isUser)}
              <Typography
                fontSize="0.7rem"
                color={isUser ? 'white' : 'gray'}
                textAlign="right"
                style={{ marginTop: '0.25rem' }}
              >
                {formatMessageDate(msg.timestamp)}
                {isUser && isLastUserMessage && (
                  <>
                    <br />
                    <em>{msg.status ? dictionary.Seen : dictionary.Sent}</em>
                  </>
                )}
              </Typography>
            </Box>
          );
        })}
        <div ref={messagesEndRef} />
      </Box>

      {sessionTypingId &&
        typingUserId &&
        typingUserId !== user?.id &&
        userToUserSessionId &&
        userToUserSessionId == sessionTypingId && (
          <div
            style={{
              alignSelf: 'flex-start',
              display: 'flex',
              alignItems: 'center',
              paddingTop: '0.5rem',
              backgroundColor: 'transparent',
              padding: '0.5rem',
              borderRadius: '12px',
              maxWidth: '90%',
            }}
          >
            <Avatar
              src={isAgent ? <SupportAgentIcon /> : <PersonIcon />}
              sx={{
                width: 24,
                height: 24,
                marginRight: '0.5rem',
                color: backgroundColor,
              }}
            />
            <ThreeDot
              variant="bounce"
              color={
                user?.organization?.primaryColor || '#015eb9'
              }
              size="small"
              text=""
              textColor=""
            />
          </div>
        )}
    </Box>
  )
}
 ChatAgentContent.propTypes = {
    handleconectedUsersClick: PropTypes.func,
    connectedUsers: PropTypes.array,
    otherUserId: PropTypes.string,
  }
export default ChatAgentContent
