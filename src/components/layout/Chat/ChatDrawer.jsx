import { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import Typography from '@mui/material/Typography'
import List from '@mui/material/List'
import Divider from '@mui/material/Divider'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import EditIcon from '@mui/icons-material/Edit'
import CustomSnackbar from '../../ui/CustomSnackbar'
import PropTypes from 'prop-types'
import userService from '../../../services/userService'
import { useLanguage } from '../../../hooks/LanguageContext'
import { useChat } from '../../../hooks/ChatContext'
import { useUserToUserChat } from '../../../hooks/ChatUserToUserContext'
import { useAuth } from '../../../hooks/AuthContext'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { InputBase, useTheme } from '@mui/material'
import { formatDistanceToNow } from 'date-fns'
import { fr, enUS, de } from 'date-fns/locale'
import Avatar from '@mui/material/Avatar'

const ChatDrawer = ({ open, onClose, anchor, toggleLoader, isAI }) => {
  const { dictionary, defaultLang } = useLanguage()
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const {
    fetchSessions,
    deleteSession,
    setSessionId,
    chatSessions,
    chatError,
    updateSessionTitle,
    setMessages,
    sessionId,
  } = useChat()
  const {
    setUserToUserSessionId,
    setUserToUserMessages,
    userToUserSessionId,
    userToUserChatSessions,
    userToUserChatError,
  } = useUserToUserChat()
  const { user } = useAuth()
  const [selectedRow, setSelectedRow] = useState(null)
  const [anchorEl, setAnchorEl] = useState(null)
  const [openSnackBar, setOpenSnackBar] = useState(false)
  const [messageSnack, setMessageSnack] = useState(null)
  const [typeSnack, setTypeSnack] = useState(null)
  const [editingSessionId, setEditingSessionId] = useState(null)
  const [users, setUsers] = useState([])
  const [editTitle, setEditTitle] = useState('')
  const backgroundColor = user?.organization?.primaryColor || '#015eb9'

  const textColor = isDark ? '#fff' : '#000'
  const handleMenuClick = (event, row) => {
    setAnchorEl(event.currentTarget)
    setSelectedRow(row)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedRow(null)
  }

  const handleTitleClick = (session) => {
    if (sessionId == session.id) {
      setSessionId(null)
      setMessages([])
    } else setSessionId(session.id)
    onClose()
  }

  const handleRenameClick = () => {
    setEditingSessionId(selectedRow.id)
    setEditTitle(selectedRow.title)
    handleMenuClose()
  }

  const handleDeleteClick = async () => {
    if (selectedRow) {
      toggleLoader(true)
      await deleteSession(selectedRow.id)
      toggleLoader(false)
      setTypeSnack('success')
      setMessageSnack(dictionary.OperationSeccesfull)
      setOpenSnackBar(true)
    }
    handleMenuClose()
  }

  const handleRenameKeyPress = async (e, sessionId) => {
    if (e.key === 'Enter') {
      if (editTitle.trim()) {
        toggleLoader(true)
        await updateSessionTitle(sessionId, editTitle.trim())
        toggleLoader(false)
        setEditingSessionId(null)
        setTypeSnack('success')
        setMessageSnack(dictionary.OperationSeccesfull)
        setOpenSnackBar(true)
      } else {
        setTypeSnack('warning')
        setMessageSnack(dictionary.TitleCannotBeEmpty)
        setOpenSnackBar(true)
      }
    }
  }

  useEffect(() => {
    fetchSessions()
  }, [])

  useEffect(() => {
    if (chatError) {
      setTypeSnack('error')
      setMessageSnack(chatError)
      setOpenSnackBar(true)
    }
  }, [chatError])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await userService.getUsersInfos()
        if (data) {
          setUsers(data.users)
        }
      } catch (e) {
        setTypeSnack('error')
        setMessageSnack(e?.response?.data?.message || 'Get all users failed')
        setOpenSnackBar(true)
      }
    }
    fetchData()
  }, [])



  useEffect(() => {
    if (userToUserChatError) {
      setTypeSnack('error')
      setMessageSnack(userToUserChatError)
      setOpenSnackBar(true)
    }
  }, [userToUserChatError])

  const getOtherUser = (session) => {
    const currentUserId = user?.id
    const otherUserId =
      session.user1Id === currentUserId ? session.user2Id : session.user1Id
    return users.find((u) => u.id === otherUserId)
  }

  const getLastMessageDisplay = (message) => {
    if (!message) return ''
    const isCurrentUserSender = message.userId === user?.id
    const prefix = isCurrentUserSender ? `${dictionary.You}: ` : ''
    switch (message.type) {
      case 'text':
        return prefix + message.content
      case 'image':
        return isCurrentUserSender
          ? dictionary.YouSentAnImage
          : dictionary.OtherUserSentAnImage
      case 'pdf':
        return isCurrentUserSender
          ? dictionary.YouSentAPdf
          : dictionary.OtherUserSentAPdf
      case 'xlsx':
        return isCurrentUserSender
          ? dictionary.YouSentAXlsx
          : dictionary.OtherUserSentAXlsx
      case 'audio':
      case 'webm':
        return isCurrentUserSender
          ? dictionary.YouSentAnAudio
          : dictionary.OtherUserSentAnAudio
      case 'video':
        return isCurrentUserSender
          ? dictionary.YouSentAVideo
          : dictionary.OtherUserSentAVideo
      default:
        return prefix + dictionary.UnknownMessageType
    }
  }

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return ''

    let locale
    switch (defaultLang) {
      case 'fr':
        locale = fr
        break
      case 'de':
        locale = de
        break
      default:
        locale = enUS
    }

    return formatDistanceToNow(new Date(timestamp), {
      addSuffix: false,
      locale,
    })
  }

  const renderUserToUserSessionList = (sessions) => {
    const sortedSessions = [...sessions].sort((a, b) => {
      const aTime = new Date(
        a.messages?.[a.messages.length - 1]?.timestamp || 0
      ).getTime()
      const bTime = new Date(
        b.messages?.[b.messages.length - 1]?.timestamp || 0
      ).getTime()
      return bTime - aTime
    })

    if (sessions.length === 0) {
      return (
        <Typography sx={{ textAlign: 'center' }}>
          {dictionary.NoSessionsAvailable}
        </Typography>
      )
    }

    return (
      <Box>
        <List>
          {sortedSessions.map((session) => {
            const otherUser = getOtherUser(session)
            const fullName = otherUser
              ? `${otherUser.firstName} ${otherUser.lastName}`
              : dictionary.UnknownUser
            const initials = otherUser
              ? `${otherUser.firstName?.[0] || ''}${otherUser.lastName?.[0] || ''}`.toUpperCase()
              : '?'
            const userImage = (otherUser?.imageUrl !=null && otherUser?.imageName !=null) ? otherUser?.imageUrl : null
            const lastMessage = session.messages?.[session.messages.length - 1]
            const messageText = getLastMessageDisplay(lastMessage)
            const timeAgo = getTimeAgo(lastMessage?.timestamp)
            

            return (
              <ListItem key={session.id} disablePadding>
                <ListItemButton
                  onClick={() => {
                    if (userToUserSessionId === session.id) {
                      setUserToUserSessionId(null)
                      setUserToUserMessages([])
                    } else {
                      setUserToUserSessionId(session.id)
                      setUserToUserMessages(session.messages) 
                    }
                    onClose()
                  }}
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 2,
                    padding: '12px',
                    width: '100%',
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
                    <Avatar sx={{ bgcolor: backgroundColor }}>{initials}</Avatar>
                  )}
                  

                  <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Typography sx={{ color: textColor, fontWeight: 'bold' }}>
                        {fullName}
                      </Typography>
                      <Typography
                        sx={{ color: 'lightgray', fontSize: '0.75rem', ml: 1 }}
                      >
                        {timeAgo}
                      </Typography>
                    </Box>

                    <Typography
                      sx={{
                        fontSize: '0.875rem',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '100%',
                        color: textColor,
                      }}
                    >
                      {messageText}
                    </Typography>
                  </Box>
                </ListItemButton>
              </ListItem>
            )
          })}
        </List>
      </Box>
    )
  }

  const groupSessionsByDate = (sessions) => {
    const grouped = {
      today: [],
      yesterday: [],
      last30Days: [],
      thisMonth: [],
      older: [],
    }

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)

    sessions.forEach((session) => {
      const createdAtDate = new Date(session.createdAt)
      const sessionDate = new Date(
        createdAtDate.getFullYear(),
        createdAtDate.getMonth(),
        createdAtDate.getDate()
      )
      const diffInDays = (today - sessionDate) / (1000 * 60 * 60 * 24)

      if (sessionDate.getTime() === today.getTime()) {
        grouped.today.push(session)
      } else if (sessionDate.getTime() === yesterday.getTime()) {
        grouped.yesterday.push(session)
      } else if (diffInDays <= 30) {
        grouped.last30Days.push(session)
      } else if (
        sessionDate.getMonth() === today.getMonth() &&
        sessionDate.getFullYear() === today.getFullYear()
      ) {
        grouped.thisMonth.push(session)
      } else {
        grouped.older.push(session)
      }
    })

    return grouped
  }

  const renderSessionList = (sessions, label) => {
    if (sessions.length === 0) return null

    return (
      <Box>
        <Typography
          sx={{
            color: isDark ? 'white' : 'black',
            px: 2,
            py: 1,
            fontWeight: 'bold',
          }}
        >
          {label}
        </Typography>
        <List>
          {sessions.map((session) => (
            <ListItem key={session.id} disablePadding>
              <ListItemButton
                onClick={() => handleTitleClick(session)}
                sx={{
                  color: isDark ? 'white' : 'black',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: '100%',
                }}
              >
                {editingSessionId === session.id ? (
                  <InputBase
                    autoFocus
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => handleRenameKeyPress(e, session.id)}
                    sx={{
                      backgroundColor: '#444',
                      px: 1,
                      borderRadius: 1,
                      width: '100%',
                    }}
                  />
                ) : (
                  <ListItemText
                    primary={
                      session.title.length > 20
                        ? `${session.title.substring(0, 20)}...`
                        : session.title
                    }
                  />
                )}

                {editingSessionId !== session.id && (
                  <ListItemIcon
                    sx={{ minWidth: 0 }}
                    onClick={(event) => {
                      event.stopPropagation()
                      handleMenuClick(event, session)
                    }}
                  >
                    <MoreHorizIcon
                      sx={{
                        color: isDark
                          ? 'white'
                          : user?.organization?.primaryColor || '#015eb9',
                      }}
                    />
                  </ListItemIcon>
                )}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    )
  }

  const groupedSessions = groupSessionsByDate(chatSessions)

  return (
    <Drawer
      anchor={anchor}
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          backgroundColor: isDark ? '#242424' : '#FEFFFE',
          borderColor: isDark ? '#242424' : '#FEFFFE',
        },
      }}
    >
      <Box sx={{ padding: 2 }}>
        <Typography
          variant="h6"
          sx={{ textAlign: 'center', fontWeight: 'bold' }}
        >
          {isAI ? dictionary.RecentDiscussions : dictionary.Discussions}
        </Typography>
        <Divider
          sx={{
            margin: '10px 0',
          }}
        />
        <div>
          {isAI ? (
            chatSessions.length === 0 ? (
              <Typography sx={{ textAlign: 'center' }}>
                {dictionary.NoSessionsAvailable}
              </Typography>
            ) : (
              <>
                {renderSessionList(groupedSessions.today, dictionary.Today)}
                {renderSessionList(
                  groupedSessions.yesterday,
                  dictionary.Yesterday
                )}
                {renderSessionList(
                  groupedSessions.last30Days,
                  dictionary.Last30Days
                )}
                {renderSessionList(
                  groupedSessions.thisMonth,
                  dictionary.ThisMonth
                )}
                {renderSessionList(groupedSessions.older, dictionary.Older)}
              </>
            )
          ) : (
            renderUserToUserSessionList(userToUserChatSessions)
          )}
        </div>
      </Box>

      <CustomSnackbar
        open={openSnackBar}
        message={messageSnack}
        type={typeSnack}
        onClose={() => setOpenSnackBar(false)}
      />

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleRenameClick}>
          <EditIcon />
          &nbsp; {dictionary.Rename}
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'red' }}>
          <DeleteForeverIcon /> &nbsp;&nbsp;{dictionary.Delete}
        </MenuItem>
      </Menu>
    </Drawer>
  )
}

ChatDrawer.propTypes = {
  isAI: PropTypes.bool,
  toggleLoader: PropTypes.func,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  anchor: PropTypes.oneOf(['left', 'right', 'top', 'bottom']).isRequired,
}

export default ChatDrawer
