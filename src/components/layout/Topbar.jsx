import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  InputBase,
  Menu,
  MenuItem,
  Select,
  Badge,
  Typography,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  Avatar,
  Button,
  useMediaQuery
} from '@mui/material'
import {
  Person,
  Logout,
  Search as SearchIcon,
  Menu as MenuIcon,
} from '@mui/icons-material'
import CustomSnackbar from '../ui/CustomSnackbar'
import NotificationsActiveSharpIcon from '@mui/icons-material/NotificationsActiveSharp'
import Person4SharpIcon from '@mui/icons-material/Person4Sharp'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import LiveHelpIcon from '@mui/icons-material/LiveHelp'
import CampaignIcon from '@mui/icons-material/Campaign'
import userService from '../../services/userService'
import authService from '../../services/authService'
import { useLanguage } from '../../hooks/LanguageContext'
import { useAuth } from '../../hooks/AuthContext'
import { useNotification } from '../../hooks/NotificationContext'
import ThemeToggleButton from '../ui/ThemeToggleButton'
import { useNavigate } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { fr, enUS, de } from 'date-fns/locale'
import Modal from '../ui/Modal'


const Topbar = ({ handleDrawerToggle, toggleLoader, toggleIsCollapsed, isCollapsed=false, rightDrawerOpen, className, handleShowTutorial }) => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const navigate = useNavigate()
  const [openSnackBar, setOpenSnackBar] = useState(false)
  const [typeSnack, setTypeSnack] = useState(null)
  const [messageSnack, setMessageSnack] = useState(null)
  const {
    notifications,
    notificationError,
    fetchNotifications,
    deleteNotification,
    markNotificationRead,
  } = useNotification()
  const { dictionary, defaultLang, changeLanguage } = useLanguage()
  const { user, fetchUser } = useAuth()
  const userImage = (user?.imageUrl !=null && user?.imageName !=null) ? user?.imageUrl : null
  const [anchorEl, setAnchorEl] = useState(null)
  const [notifAnchorEl, setNotifAnchorEl] = useState(null)
  const [language, setLanguage] = useState(defaultLang || 'en')
  const [showAllNotifications, setShowAllNotifications] = useState(false)
  const [selectedNotif, setSelectedNotif] = useState(null)
  const [notifDialogOpen, setNotifDialogOpen] = useState(false)
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('sm'))

  let paddingContentValue
  if (isLargeScreen) {
    paddingContentValue = rightDrawerOpen ? '270px' : '0px'
  } else {
    paddingContentValue = '0px'
  }
   let drawerWidth
   if (paddingContentValue==='270px') {
    drawerWidth = isCollapsed ? 330 : 500
  } else {
    drawerWidth = isCollapsed ? 72 : 240
  }

  let unreadCount =
    notifications && notifications.length > 0
      ? notifications.filter((n) => n.isRead === false).length
      : 0
  const userName = user.firstName + ' ' + user.lastName
  const userEmail = user.email
  const [open, setOpen] = useState(false)
  const widthAndHeighImageUser = userImage != null 
  ? (isCollapsed ? "50px" : "60px") 
  : (isCollapsed ? "30px" : "40px")

  const handletoggleModal = (lang) => {
    setLanguage(lang)
    changeLanguage(lang)
    setOpen(true)
  }
  const updateUserLang = async () => {
    setOpen(false)
    try {
      const data = await userService.changeUserLanguage(language)
      if (data) {
        await fetchUser()
      }
    } catch (e) {
      if (e?.response?.data?.message) {
        const message = e.response.data.message
        if (message === 'User not found.') {
          setTypeSnack('error')
          setMessageSnack(dictionary.UserNotFound)
          setOpenSnackBar(true)
        } else {
          setTypeSnack('error')
          setMessageSnack(dictionary.ChangeUserLangFailed)
          setOpenSnackBar(true)
        }
      } else {
        setTypeSnack('error')
        setMessageSnack(dictionary.ChangeUserLangFailed)
        setOpenSnackBar(true)
      }
    }
  }
  const initials = userName
    ? userName
        .trim()
        .split(' ')
        .map((word) => word.charAt(0))
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : ''
  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget)
  const handleNotifOpen = (event) => setNotifAnchorEl(event.currentTarget)
  const handleClose = () => {
    setAnchorEl(null)
    setNotifAnchorEl(null)
  }

  const handleLogout = async () => {
    try {
      const data = await authService.logout()
      if (data) window.location.reload()
    } catch (e) {
      setTypeSnack('error')
      setMessageSnack(e?.response?.data?.message || 'Logout failed')
      setOpenSnackBar(true)
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
  const handleCloseDialog = () => {
    setNotifDialogOpen(false)
    setSelectedNotif(null)
  }

  const handleNotificationClick = async (notif) => {
    setSelectedNotif(notif)
    setNotifDialogOpen(true)
    await markNotificationRead(notif.id)
  }

  const handleDeleteNotification = async (id) => {
    toggleLoader(true)
    await deleteNotification(id)
    toggleLoader(false)
  }

  const handleShowAllNotifications = () => {
    setShowAllNotifications(true)
  }

  useEffect(() => {
    const fetchData = async () => {
      await fetchNotifications()
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (notificationError !== null && notificationError !== '') {
      setTypeSnack('error')
      setMessageSnack(notificationError)
      setOpenSnackBar(true)
    }
  }, [notificationError])
  return (
    <div>
      <CustomSnackbar
        open={openSnackBar}
        message={messageSnack}
        type={typeSnack}
        onClose={() => setOpenSnackBar(false)}
      />
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={updateUserLang}
        showConfirmButton={true}
        labelConfirmButton={dictionary?.confirm || 'Confirm'}
        className="custom-modal"
      >
        <Box className="modal-content">
          <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
            {dictionary?.ConfirmLanguageUpdate || 'Confirm Language Update'}
          </Typography>
        </Box>
      </Modal>
      <Dialog open={notifDialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>{dictionary?.NotificationDetail || 'Notification Detail'}</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            {selectedNotif?.content}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {getTimeAgo(selectedNotif?.timestamp)}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>{dictionary?.Close || 'Close'}</Button>
        </DialogActions>
      </Dialog>

      <AppBar
        position="fixed"
        className={className}
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          height: isCollapsed?'47px':'61px',
          mr:paddingContentValue,
          borderRadius:paddingContentValue==='250px' ? '10px' : '0px' ,
          backgroundColor: isDark
            ? `#18141c !important`
            : `#ffffff !important`,
        }}
      >
        <Toolbar className="toolbar">
          <Box className="left-section">
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              
              <MenuIcon sx={{ color: isDark?'white':'black' }} />
            </IconButton>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={toggleIsCollapsed}
              sx={{ mr: 2, display: { xs: 'none', sm: 'block' } }}
              className="toggleSidebarStep"
            >
              <MenuIcon sx={{ color: isDark?'white':'black' }} />
            </IconButton>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                borderRadius: '10px',
                border: `1px solid ${isDark ? '#02060d' : '#b2b2b2'}`,
                padding: isCollapsed? '0px 7px':'5px 10px',
                backgroundColor: isDark ? '#02060d' : '#ffffff',
                width: '100%',
                mb:isCollapsed? 1.5 : 0
              }}
            >
              <InputBase placeholder={dictionary?.Search || 'Search'} />
               <SearchIcon
                sx={{ color: '#858584', cursor: 'pointer' }}
              />
            </Box>
          </Box>
          <Box className="right-section">
            <Select
              value={language}
              onChange={(e) => handletoggleModal(e.target.value)}
              className="language-select languagestep"
              MenuProps={{
                PaperProps: {
                  sx: {
                    mb:isCollapsed? 0.5 : 0,
                    borderRadius: '20px',
                    width: { xs: '100px', sm: '200px' },
                  },
                },
                MenuListProps: {
                  sx: {
                    padding: 0,
                  },
                },
              }}
              sx={{
                fontSize: 'small',
                '.MuiOutlinedInput-notchedOutline': {
                  borderColor: 'transparent',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: user?.organization?.primaryColor || '#015eb9',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: user?.organization?.primaryColor || '#015eb9',
                },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: user?.organization?.primaryColor || '#015eb9',
                  },
                  '&:hover fieldset': {
                    borderColor: user?.organization?.primaryColor || '#015eb9',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: user?.organization?.primaryColor || '#015eb9',
                  },
                },
              }}
            >
              <MenuItem value="fr" sx={{ fontSize: 'small' }}>
                <img
                  src="https://flagcdn.com/w40/fr.png"
                  alt="FR"
                  width="20"
                  style={{ borderRadius: '2px', marginRight: '3px' }}
                />{' '}
                {dictionary?.French || 'French'} (FR)
              </MenuItem>
              <MenuItem value="en" sx={{ fontSize: 'small' }}>
                <img
                  src="https://flagcdn.com/w40/gb.png"
                  alt="EN"
                  width="20"
                  style={{ borderRadius: '2px', marginRight: '3px' }}
                />{' '}
                {dictionary?.English || 'English'} (EN)
              </MenuItem>
              <MenuItem value="de" sx={{ fontSize: 'small' }}>
                <img
                  src="https://flagcdn.com/w40/de.png"
                  alt="DE"
                  width="20"
                  style={{ borderRadius: '2px', marginRight: '3px' }}
                />{' '}
                {dictionary?.German || 'German'} (DE)
              </MenuItem>
            </Select>
            <ThemeToggleButton marginBottom={isCollapsed? "5px" : "0"} className="themestep"/>
            <IconButton
              color="inherit"
              onClick={handleNotifOpen}
              className="notification-icon notificationStep"
              sx={{ color: isDark ? 'white' : '#242424', cursor: 'pointer', 
                 background: `linear-gradient(to right, ${user?.organization?.primaryColor || '#015eb9'},${user?.organization?.primaryColor || '#015eb9'}, ${user?.organization?.secondaryColor || '#4286f4'} )`,
                ml:0.5,
                height:isCollapsed?'30px':'38px', width:isCollapsed?'30px':'38px',mb:isCollapsed? 0.5 : 0 
               }}
            >
              <Badge
                color="error"
                badgeContent={unreadCount}
                invisible={unreadCount === 0}
              >
                <NotificationsActiveSharpIcon />
              </Badge>
            </IconButton>
            <Menu
              anchorEl={notifAnchorEl}
              open={Boolean(notifAnchorEl)}
              onClose={handleClose}
              PaperProps={{
                sx: {
                  borderRadius: '20px',
                  width: { xs: '260px', sm: '320px' },
                  maxHeight: '400px',
                  overflowY: 'auto',
                   '&::WebkitScrollbar': {
                  width: '8px',
                  borderRadius: '8px',
                },
                '&::WebkitScrollbarThumb': {
                  borderRadius: '8px'
                },
                scrollbarWidth: 'thin',
                scrollbarColor:isDark ? "white transparent" : "black transparent"
                },
              }}
            >
              <Box sx={{ width: '100%', padding: 1 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 'bold',
                      marginBottom: 1,
                    }}
                  >
                    {dictionary?.Notifications || 'Notifications'}
                  </Typography>
                </Box>

                {(notifications.length > 0
                  ? showAllNotifications
                    ? notifications
                    : notifications.slice(0, 4)
                  : []
                ).map((notif) => (
                  <Box key={notif.id}>
                    <MenuItem
                      onClick={() => handleNotificationClick(notif)}
                      sx={{
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: 0.5,
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          width: '100%',
                        }}
                      >
                        <CampaignIcon sx={{ mr: 1 }} />
                        <Typography
                          variant="body2"
                          sx={{
                            flex: 1,
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                            textOverflow: 'ellipsis',
                            maxWidth: '200px',
                          }}
                        >
                          {notif.content}
                        </Typography>
                        <Typography
                          sx={{
                            color: isDark ? 'lightgray' : '#b9bbbd',
                            fontSize: '0.75rem',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {getTimeAgo(notif.timestamp)}
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteNotification(notif.id)
                        }}
                        sx={{
                          alignSelf: 'flex-end',
                          marginTop: '2px',
                          color: 'gray',
                        }}
                      >
                        <DeleteForeverIcon
                          fontSize="small"
                          sx={{ color: '#f44336' }}
                        />
                      </IconButton>
                    </MenuItem>

                    <Divider
                      sx={{
                        width: '90%',
                        mx: 'auto',
                      }}
                    />
                  </Box>
                ))}

                {!showAllNotifications && notifications.length > 4 && (
                  <MenuItem
                    onClick={handleShowAllNotifications}
                    sx={{
                      justifyContent: 'center',
                      fontWeight: 'bold',
                    }}
                  >
                    {dictionary.ShowMore}
                  </MenuItem>
                )}

                {notifications.length === 0 && (
                  <MenuItem disabled>{dictionary.NoNotifications}</MenuItem>
                )}
              </Box>
            </Menu>
            <IconButton onClick={handleMenuOpen} className="profileSep" sx={{ fontSize: '15px', 
              height:widthAndHeighImageUser, 
              width:widthAndHeighImageUser,
              mb:isCollapsed? 0.5 : 0 ,
              ml:0.5,
              background: userImage!=null ? '': `linear-gradient(to right, ${user?.organization?.primaryColor || '#015eb9'},${user?.organization?.primaryColor || '#015eb9'}, ${user?.organization?.secondaryColor || '#4286f4'} )`
              }}>
                {userImage!=null ? (
                  <img
                    src={userImage}
                    alt="Profile"
                    style={{
                      borderRadius:"10px",
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                  ) : (
                    <Person4SharpIcon />
              )}
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              PaperProps={{
                sx: {
                  borderRadius: '20px',
                  width: { xs: '200px', sm: '300px' },
                },
              }}
            >
              <Box
                sx={{ padding: 2, display: 'flex', flexDirection: 'column' }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: 2,
                  }}
                >
                  <IconButton sx={{ marginRight: 1 }}>
                     {userImage!=null ? (
                      <img
                        src={userImage}
                        alt="Profile"
                        style={{
                          borderRadius:"10px",
                          width: '60px',
                          height: '60px',
                          objectFit: 'cover',
                        }}
                      />
                      ) : (
                        <Avatar>{initials}</Avatar>
                      )}
                    
                  </IconButton>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {userName}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: '#979797', fontSize: '0.85rem' }}
                    >
                      {userEmail}
                    </Typography>
                  </Box>
                </Box>
                
                <MenuItem onClick={() => navigate('/profile')}>
                  <Person sx={{ marginRight: 2 }} /> {dictionary.Profile}
                </MenuItem>
                <Divider
                  sx={{
                    width: '100%',
                    marginBottom: 1,
                  }}
                />
                <MenuItem onClick={handleShowTutorial}>
                  <LiveHelpIcon sx={{ marginRight: 2 }} /> {dictionary.ShowTutorial}
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <Logout sx={{ marginRight: 2 }} /> {dictionary.logout}
                </MenuItem>
              </Box>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
    </div>
  )
}

Topbar.propTypes = {
    handleDrawerToggle: PropTypes.func.isRequired,
    toggleLoader: PropTypes.func,
    toggleIsCollapsed: PropTypes.func,
    isCollapsed: PropTypes.bool,
    rightDrawerOpen: PropTypes.bool,
    className:PropTypes.string,
    handleShowTutorial: PropTypes.func
  }

export default Topbar
