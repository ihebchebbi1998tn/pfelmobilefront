import {
  Avatar,
  IconButton,
  Typography,
  Box,
  Menu,
  MenuItem,
  useTheme,
} from '@mui/material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import HandymanIcon from '@mui/icons-material/Handyman'
import HistoryIcon from '@mui/icons-material/History'
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen'
import OpenInFullIcon from '@mui/icons-material/OpenInFull'
import AddIcon from '@mui/icons-material/Add'
import ToggleOnIcon from '@mui/icons-material/ToggleOn'
import ToggleOffIcon from '@mui/icons-material/ToggleOff'
import { useLanguage } from '../../../hooks/LanguageContext'
import { useChat } from '../../../hooks/ChatContext'
import { useUserToUserChat } from '../../../hooks/ChatUserToUserContext'
import { useAuth } from '../../../hooks/AuthContext'
import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
const ChatHeader = ({
  title,
  avatarSrc,
  onExpandToggle,
  expendChat,
  handleClose,
  toggleChatDrawer,
  handleShowDeletePopup,
  isAI,
  setOtherUserId,
  otherUserImage
}) => {
  
  const theme = useTheme()
  const { user } = useAuth()
  const { dictionary } = useLanguage()
  const { setMessages, sessionId, setSessionId } = useChat()
  const { setUserToUserSessionId, setUserToUserMessages, userToUserSessionId, userToUserChatSessions, leaveSession, deleteUserToUserSession } =
    useUserToUserChat()
  const [anchorEl, setAnchorEl] = useState(null)
  const [currentUserToUserSession, setCurrentUserToUserSession]= useState(null)
  const [opendDrawer, setOpendDrawer] = useState(false)
  const isDark = theme.palette.mode === 'dark'
  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget)
  const handleMenuClose = () => setAnchorEl(null)
  const handeDrawer = () => {
    setOpendDrawer(!opendDrawer)
    toggleChatDrawer(!opendDrawer)
  }
  const handleNewSession = () => {
    setMessages([])
    setSessionId(null)
  }
  const handleNewDiscussions = () => {
    leaveSession()
    setUserToUserSessionId(null)
    setUserToUserMessages([])
    setOtherUserId(null)
  }

  const handleUnblock = async() => {
    await deleteUserToUserSession(userToUserSessionId)
    handleMenuClose()
  }

  const showDleteButton = currentUserToUserSession == null
    ? false
    : (!isAI && !currentUserToUserSession.isDeleted)

  const showUnblockButton = currentUserToUserSession == null
    ? false
    : (!isAI && currentUserToUserSession.isDeleted && currentUserToUserSession.userIdWhoDeleted==user.id)
  const backgroundColor = user.organization.primaryColor

  const textColor = isDark ? '#fff' : '#000'

 useEffect(() => {
  if( userToUserChatSessions.length > 0 && userToUserSessionId != null)
    setCurrentUserToUserSession(userToUserChatSessions.find((c) => c?.id == userToUserSessionId))
    
  else setCurrentUserToUserSession(null)
  }, [userToUserChatSessions, userToUserSessionId])
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      p={2}
      sx={{
        backgroundColor,
        color: textColor,
      }}
    >
      <Box display="flex" alignItems="center" gap={1}>
        <IconButton onClick={handleClose} sx={{ color: textColor }}>
          <ChevronLeftIcon />
        </IconButton>
        {otherUserImage!=null ? (
          <img
            src={otherUserImage}
            alt="Profile"
            style={{
              borderRadius:"20px",
              height: "60px", 
              width:"60px",
              objectFit: 'cover',
            }}
          />
          ) : (
            <Avatar sx={{ bgcolor: textColor, color: backgroundColor }}>
              {avatarSrc}
            </Avatar>
          )}
        
        <Typography fontWeight={600} sx={{ color: textColor }}>
          {title}
        </Typography>
      </Box>

      <Box display="flex" alignItems="center" gap={1}>
        {(sessionId != null || userToUserSessionId != null) && (
          <IconButton onClick={handleMenuOpen} sx={{ color: textColor }}>
            <HandymanIcon />
          </IconButton>
        )}
        <IconButton onClick={handeDrawer} sx={{ color: textColor }}>
          <HistoryIcon />
        </IconButton>
        <IconButton onClick={onExpandToggle} sx={{ color: textColor }}>
          {expendChat ? <CloseFullscreenIcon /> : <OpenInFullIcon />}
        </IconButton>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            isAI ? handleNewSession() : handleNewDiscussions()
            handleMenuClose()
          }}
        >
          <AddIcon sx={{ mr: 1 }} />
          {isAI ? dictionary.NewSession : dictionary.NewDiscussions}
        </MenuItem>
        {showDleteButton && (
          <MenuItem
            onClick={() => {
              handleShowDeletePopup()
              handleMenuClose()
            }}
          >
            <ToggleOffIcon sx={{ mr: 1 }} />
            {dictionary.BlockUser}
          </MenuItem>
        )}
        {showUnblockButton && (
          <MenuItem
            onClick={() => {
              handleUnblock()
            }}
          >
            <ToggleOnIcon sx={{ mr: 1 }} />
            {dictionary.UnblockUser}
          </MenuItem>
        )}
      </Menu>
    </Box>
  )
}

ChatHeader.propTypes = {
    title: PropTypes.string.isRequired,
    avatarSrc: PropTypes.string.isRequired,
    onExpandToggle: PropTypes.func.isRequired,
    expendChat: PropTypes.bool.isRequired,
    handleClose: PropTypes.func.isRequired,
    toggleChatDrawer: PropTypes.func,
    handleShowDeletePopup: PropTypes.func,
    isAI: PropTypes.bool,
    setOtherUserId: PropTypes.func,
    otherUserImage:PropTypes.string
  }

export default ChatHeader
