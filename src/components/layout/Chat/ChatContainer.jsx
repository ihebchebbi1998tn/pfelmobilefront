import { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { Box, IconButton, Typography, Button, useTheme, Badge } from '@mui/material'
import ChatBubbleIcon from '@mui/icons-material/ChatBubble'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import SendIcon from '@mui/icons-material/Send'
import ChatBotContent from './ChatBotContent'
import ChatAgentContent from './ChatAgentContent'
import ChatHeader from './ChatHeader'
import ChatInput from './ChatInput'
import userService from '../../../services/userService'
import { useLanguage } from '../../../hooks/LanguageContext'
import { useAuth } from '../../../hooks/AuthContext'
import { useUserToUserChat } from '../../../hooks/ChatUserToUserContext'
import PersonIcon from '@mui/icons-material/Person'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import { darken } from '@mui/material/styles'


const ChatContainer = ({
  toggleChatDrawer,
  setIsAI,
  handleShowDeletePopup,
  handleOppenAddressModal
}) => {
  const {
    setUserToUserMessages,
    setUserToUserSessionId,
    userToUserChatSessions,
    connectedUserIds,
    unreadMessages,
    leaveSession,
    enterSession
  } = useUserToUserChat()
  const buttonOpenRef = useRef(null)
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const [open, setOpen] = useState(false)
  
  const [mode, setMode] = useState('welcome')
  const [expendChat, setExpendChat] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [otherUserId, setOtherUserId] = useState(null)
  const [otherUserData, setOtherUserData] = useState(null)
  const [connectedUsers, setConnectedUsers] = useState([])
  const { dictionary } = useLanguage()
  const { user } = useAuth()
  const otherUserImage = (otherUserData?.imageUrl !=null && otherUserData?.imageName !=null) ? otherUserData?.imageUrl : null
  const getInitialHeaderTitle = () => {
    if (user?.permissions?.length > 0) {
      if (user.permissions.includes('Permissions.AllowAll')) {
        return dictionary.AdminAndAgents
      }
      if (user.permissions.includes('Permissions.Messages.Clients')) {
        return dictionary.Client
      }
      if (user.permissions.includes('Permissions.Messages.Users')) {
        return dictionary.SupportAgent
      }
    }
    return null
}
const [headerTitle, setHeaderTitle] = useState(getInitialHeaderTitle)
  
 
  const userName = user.firstName + ' ' + user.lastName
  const showButtonChatBot =
    user?.permissions?.some(
      (perm) =>
        perm === 'Permissions.AllowAll' ||
        perm === 'Permissions.Messages.ChatBot'
    ) || false

  const showButtonChatUsers =
    user?.permissions?.some(
      (perm) =>
        perm === 'Permissions.AllowAll' ||
        perm === 'Permissions.Messages.Users' ||
        perm === 'Permissions.Messages.Clients'
    ) || false
  const handledelete = () => {
    setOtherUserId(null)
    handleShowDeletePopup()
  }
  const handleExpandToggle = () => setExpendChat(!expendChat)
  const handleModeChange = (newMode) => {
     if(user?.address!=null || newMode!='ai'){
        setMode(newMode)
    }else{
      toggleOpen()
        handleOppenAddressModal()
    }
  }
  const handleClose = async() => {
    if(mode === 'agent'){
      setHeaderTitle(getInitialHeaderTitle)
      setOtherUserData(null)
      setUserToUserSessionId(null)
      setUserToUserMessages([])
      setOtherUserId(null)
      await leaveSession()
    }
    setMode('welcome')
    
  }

  const handleconectedUsersClick = async (id) => {
    if (otherUserId == id) {
      setOtherUserId(null)
    } else {
      setOtherUserId(id)
      if (userToUserChatSessions.length > 0) {
        const session = userToUserChatSessions.find(
          (s) => s.user1Id === id || s.user2Id === id
        )
        if (session) {
          setUserToUserSessionId(session.id)
          await enterSession(session.id)
          const sessionMessages = session.messages
          setUserToUserMessages(sessionMessages)
          const u =connectedUsers.length>0 ? connectedUsers.find((c) => c?.id === id) : null
          setOtherUserData(u)
          if(u){
            setHeaderTitle(`${u.firstName} ${u.lastName}`)
          }
        }
      }
    }
  }
  useEffect(() => {
    const fetchConnectedUserData = async () => {
      try {
        const data = await userService.getUsersInfos()
        if (data) {
          if (data.users.length > 0) {
            const array = data.users
              .filter((u) => u.id !== user?.id)
              .map((u) => {
                const isConnected =
                  connectedUserIds.length > 0
                    ? connectedUserIds.includes(u.id)
                    : false
                return {
                  id: u.id,
                  firstName: u.firstName,
                  lastName: u.lastName,
                  isConnected: isConnected,
                  imageName:u.imageName,
                  imageUrl:u.imageUrl,
                }
              })

            setConnectedUsers(array)
          }
        }
      } catch (e) {
        console.log(e?.response?.data?.message || 'Get users info failed')
      }
    }
    fetchConnectedUserData()
  }, [connectedUserIds])

  const toggleOpen = async() => {
    const newState = !open
    setOpen(newState)

    if (!newState) {
      await leaveSession()
    }
  }
  return (
    <>
      {(showButtonChatBot || showButtonChatUsers) && (
        <IconButton
          onClick={() => toggleOpen() }
          ref={buttonOpenRef}
          className="messageContainerStep" 
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1500,
            border: `2px solid ${isDark ? '#FEFFFE' : '#242424'}`,
            backgroundColor: user.organization.primaryColor,
            color: isDark ? '#FEFFFE' : '#242424',
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              backgroundColor: darken(user.organization.primaryColor, 0.2),
              transform: 'scale(1.2)',
            },
          }}
        >
          <Badge
            color="error"
            badgeContent={unreadMessages.total}
            invisible={unreadMessages.total === 0}
          >
             {open ? <ArrowDropDownIcon /> : <ChatBubbleIcon />}           
          </Badge>
        </IconButton>
      )}

      <Box
        sx={{
          position: 'fixed',
          bottom: 90,
          right: 24,
          width: expendChat
            ? { xs: '90%', sm: '360px', md: '420px', lg: '550px' }
            : { xs: '85%', sm: '340px', md: '400px', lg: '450px' },
          height: { xs: '70%', sm: '450px', md: '490px', lg: '540px' },
          bgcolor: 'white',
          boxShadow: 6,
          borderRadius: 3,
          display: open ? 'flex' : 'none',
          flexDirection: 'column',
          zIndex: 1400,
          overflow: 'hidden',
        }}
      >
        {mode === 'welcome' && (
          <>
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                height: '70%',
                background: `linear-gradient(to bottom,#373b44, ${user.organization.secondaryColor}, rgba(255,255,255,0.6) 85%, white 100%)`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 3,
                pb: { xs: '100%', sm: '90%', md: '80%', lg: '70%' },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <img
                  src={user.organization.logoUrl}
                  alt="Logo"
                  style={{ width: '48px' }}
                />
              </Box>
              <Typography
                sx={{
                  color: 'white',
                  fontWeight: 700,
                  textAlign: 'right',
                  fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' },
                }}
              >
                {user.organization.name}
              </Typography>
            </Box>
            <Box
              sx={{
                position: 'absolute',
                width: '100%',
                top: '17%',
                px: { xs: 2, sm: 3 },
              }}
            >
              <Typography
                sx={{
                  color: '#d0d6de',
                  fontWeight: 600,
                  fontSize: { xs: '1.1rem', sm: '1.4rem', md: '1.6rem' },
                }}
              >
                {dictionary.Hi} {userName} 👋
              </Typography>
            </Box>
            <Box
              sx={{
                position: 'absolute',
                width: '100%',
                top: '25%',
                px: { xs: 2, sm: 3 },
              }}
            >
              <Typography
                sx={{
                  color: 'white',
                  fontWeight: 600,
                  fontSize: { xs: '1.1rem', sm: '1.4rem', md: '1.6rem' },
                }}
              >
                {dictionary.HowCanWeHelp}
              </Typography>
            </Box>
            {showButtonChatUsers && (
              <Box
                sx={{
                  position: 'absolute',
                  width: '100%',
                  top: '40%',
                  px: { xs: 2, sm: 3 },
                }}
              >
                <Button
                  sx={{
                    width: '100%',
                    py: { xs: 1.25, sm: 1.5 },
                    px: 3,
                    borderRadius: '15px',
                    background: 'white',
                    color: 'black',
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                    boxShadow: 3,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    '&:hover': {
                      color: user.organization.secondaryColor,
                    },
                  }}
                  onClick={() => {
                    handleModeChange('agent')
                    setIsAI(false)
                  }}
                >
                  <span>{dictionary.TalkToAgent}</span>
                  <Badge
                    color="error"
                    badgeContent={unreadMessages.total}
                    invisible={unreadMessages.total === 0}
                  >
                     <SendIcon
                    sx={{
                      fontSize: 20,
                      color: user.organization.secondaryColor,
                    }}
                  />
                  </Badge>
                </Button>
              </Box>
            )}
            {showButtonChatBot && (
              <Box
                sx={{
                  position: 'absolute',
                  width: '100%',
                  top: '55%',
                  px: { xs: 2, sm: 3 },
                  zIndex: 1000,
                }}
              >
                <Button
                  sx={{
                    width: '100%',
                    py: { xs: 1.25, sm: 1.5 },
                    px: 3,
                    borderRadius: '15px',
                    background: `linear-gradient(to bottom, #373b44, ${user.organization.secondaryColor})`,
                    color: 'white',
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                    boxShadow: 3,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    '&:hover': {
                      color: 'black',
                    },
                  }}
                  onClick={() => {
                    handleModeChange('ai')
                    setIsAI(true)
                  }}
                >
                  <span>{dictionary.TalkToChatbot}</span>
                  <SendIcon sx={{ fontSize: 20, color: 'black' }} />
                </Button>
              </Box>
            )}
          </>
        )}
        {mode !== 'welcome' && (
          <>
            <ChatHeader
              title={
                mode === 'ai' ? dictionary.AiAssitant : headerTitle
              }
              otherUserImage={otherUserImage}
              setOtherUserId={setOtherUserId}
              avatarSrc={mode === 'ai' ? <SmartToyIcon /> : <PersonIcon />}
              onExpandToggle={handleExpandToggle}
              expendChat={expendChat}
              handleClose={handleClose}
              toggleChatDrawer={toggleChatDrawer}
              handleShowDeletePopup={handledelete}
              isAI={mode === 'ai'}
            />
            <Box
              flex={1}
              px={2}
              py={1}
              overflow="auto"
              sx={{
                backgroundColor: isDark ? '#242424' : '#f4f5f5',
                flex: 1,
                padding: '1rem',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                '&::WebkitScrollbar': {
                  width: '8px',
                  borderRadius: '8px',
                },
                '&::WebkitScrollbarThumb': {
                  borderRadius: '8px'
                },
                scrollbarWidth: 'thin',
                scrollbarColor:isDark ? "white transparent" : "black transparent"
              }}
            >
              {mode === 'ai' ? (
                <ChatBotContent isTyping={isTyping} />
              ) : (
                <ChatAgentContent
                  handleconectedUsersClick={handleconectedUsersClick}
                  connectedUsers={connectedUsers}
                  otherUserId={otherUserId}
                />
              )}
            </Box>
            <ChatInput
              isAI={mode === 'ai'}
              otherUserData={otherUserData}
              setIsTyping={setIsTyping}
              otherUserId={otherUserId}
            />
          </>
        )}
        
      </Box>
    </>
  )
}

ChatContainer.propTypes = {
  toggleChatDrawer: PropTypes.func,
  setIsAI: PropTypes.func,
  handleShowDeletePopup: PropTypes.func,
  handleOppenAddressModal: PropTypes.func
}

export default ChatContainer
