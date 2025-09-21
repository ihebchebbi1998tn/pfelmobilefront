import { useState, useEffect } from 'react'
import { Box, CssBaseline, Toolbar, Typography, useMediaQuery, useTheme } from '@mui/material'
import Topbar from './Topbar'
import Sidebar from './Sidebar'
import RightDrawer from './RightDrawer'
import ChatDrawer from './Chat/ChatDrawer'
import ChatContainer from './Chat/ChatContainer'
import { Outlet } from 'react-router-dom'
import Loader from '../ui/Loader'
import { useUserToUserChat } from '../../hooks/ChatUserToUserContext'
import { useLanguage } from '../../hooks/LanguageContext'
import WarningIcon from '@mui/icons-material/Warning'
import Modal from '../ui/Modal'
import Tutorial from '../pages/Tutorial/Tutorial'
import AddressFormModal from '../pages/Address/AddressFormModal'

const MainLayout = () => {
  const theme = useTheme()
  const { dictionary } = useLanguage()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [rightDrawerOpen, setRightDrawerOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [opendChatDrawer, setOpendChatDrawer] = useState(false)
  const [tutorialOpen, setTutorialOpen] = useState(false)
  const [layoutReady, setLayoutReady] = useState(false)
  const [openModalAddress, setOpenModalAddress] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isAI, setIsAI] = useState(false)
  const [openModalDelete, setOpenModalDelete] = useState(false)
  const {
    setUserToUserMessages,
    deleteUserToUserSession,
    setUserToUserSessionId,
    userToUserSessionId,
    leaveSession
  } = useUserToUserChat()
   const toggleIsCollapsed = () => {
    setIsCollapsed(!isCollapsed)
  }
  const handleShowTutorial = () => {
    setLayoutReady(true)
    setTutorialOpen(true)
  }
  const handleShowDeletePopup = () => {
    setOpenModalDelete(true)
  }
  const handleCloseDeletePopup = () => {
    setOpenModalDelete(false)
  }
  const handleDrawerClose = () => {
    setMobileOpen(false)
  }
  const toggleLoader = (status) => {
    setLoading(status)
  }

  const Delete = async () => {
    if (userToUserSessionId) {
      toggleLoader(true)
      await deleteUserToUserSession(userToUserSessionId)
      toggleLoader(false)
      setUserToUserMessages([])
      setUserToUserSessionId(null)
      leaveSession()
      setOpenModalDelete(false)
    }
  }
  const toggleChatDrawer = (status) => {
    setOpendChatDrawer(status)
  }

  const handleOppenAddressModal = () => {
    setOpenModalAddress(true)
  }

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleRightDrawerOpen = () => {
    setRightDrawerOpen(true)
    setIsCollapsed(true)
  }

  const onCloseRightDrawer = () => {
    setRightDrawerOpen(false)
  }

  const isLargeScreen = useMediaQuery(theme.breakpoints.up('sm'))
  const paddingContent = isLargeScreen ? (rightDrawerOpen ? '270px' : '0px' ) : '0px'

useEffect(() => {
    setTimeout(() => {
      setLayoutReady(true)
    }, 2000)
  }, [])

  useEffect(() => {
    if (layoutReady) {
      const first = localStorage.getItem('firstTutorial')
      if (first === null || first === 'true') {
        setTutorialOpen(true)
      }
    }
  }, [layoutReady])
  
  const stepsTutorial = dictionary ? [
      { target: '.stepSideBar', content: dictionary?.StepSideBar || 'Step Sidebar' },
      { target: '.stepTopbar', content: dictionary?.StepTopbar || 'Step Topbar'},
      { target: '.toggleSidebarStep', content:
        (
         <div>
            <p>{dictionary?.ToggleSidebarStep || 'Toggle Sidebar Step'}</p>
            <video
             src={"https://dl.dropboxusercontent.com/scl/fi/7j6zq77zgvrbywi748if9/toggleSideBar.mp4?rlkey=7a6xbjrbb7iql1di66to90erc&st=j3dpaoju"}
             autoPlay
             loop
             muted
             playsInline
             style={{ width: '100%' }}
            />
         </div>
        )  
      },
      { target: '.languagestep', content: dictionary?.Languagestep || 'Language step' },
      { target: '.themestep', content: dictionary?.Themestep || 'Theme step' },
      { target: '.notificationStep', content: dictionary?.NotificationStep || 'Notification step' },
      { target: '.profileSep', content: dictionary?.ProfileSep || 'Profile step' },
      { target: '.messageContainerStep', content: 
        (
         <div>
            <p>{dictionary?.MessageContainerStep || 'Message Container Step'}</p>
            <video
             src={"https://dl.dropboxusercontent.com/scl/fi/y973vuwwqvwhd4qazclvv/openChatContainer.mp4?rlkey=pnp71p0obj94wvdntyn4b93tl&st=zkak5j1k&dl=0"}
             autoPlay
             loop
             muted
             playsInline
             style={{ width: '100%' }}
            />
         </div>
        )  
      },
    ] : []
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
      <Loader loading={loading} />
      <CssBaseline />
      <Topbar
        isCollapsed={isCollapsed}
        toggleIsCollapsed={toggleIsCollapsed}
        handleDrawerToggle={handleDrawerToggle}
        toggleLoader={toggleLoader}
        rightDrawerOpen={rightDrawerOpen}
        handleShowTutorial={handleShowTutorial}
        className="stepTopbar"
      />
      <Sidebar
        isCollapsed={isCollapsed}
        mobileOpen={mobileOpen}
        handleDrawerClose={handleDrawerClose}
        className="stepSideBar"
      />
      <RightDrawer
        rightDrawerOpen={rightDrawerOpen}
        onCloseRightDrawer={onCloseRightDrawer}
        toggleLoader={toggleLoader}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: isCollapsed? 1:3 ,
          pr:paddingContent,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Toolbar />
      
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            p: 1,
            borderRadius: 2,
          }}
        >
          <Modal
            open={openModalDelete}
            onClose={handleCloseDeletePopup}
            showConfirmButton={true}
            onConfirm={Delete}
            variant={'warning'}
            labelConfirmButton={dictionary?.Block || 'Block'}
            title={
              <>
                {' '}
                <WarningIcon sx={{ color: 'yellow' }} />{' '}
                {dictionary?.BlockConversation || 'Block Conversation'}{' '}
              </>
            }
            className="custom-modal"
          >
            <Typography>{dictionary?.AreYouSureYouWantToBlockThisConversation || 'Are you sure you want to block this conversation?'}</Typography>
          </Modal>
          <ChatContainer
            toggleChatDrawer={toggleChatDrawer}
            setIsAI={setIsAI}
            handleShowDeletePopup={handleShowDeletePopup}
            handleOppenAddressModal={handleOppenAddressModal}
          />
          <ChatDrawer
            open={opendChatDrawer}
            onClose={() => toggleChatDrawer(false)}
            anchor={'left'}
            toggleLoader={toggleLoader}
            isAI={isAI}
          />
          <Outlet context={{ toggleLoader, toggleChatDrawer, handleRightDrawerOpen }} />
          {layoutReady && (
        <Tutorial
          open={tutorialOpen}
          steps={stepsTutorial}
          beaconSize={200}
          onClose={() => {
            localStorage.setItem('firstTutorial', 'false')
            setTutorialOpen(false)
          }}
        />
      )}
      {openModalAddress && (
        <AddressFormModal
          open={true}
          onClose={() => {
            setOpenModalAddress(false)
          }}
          address={null}
        />
      )}
        </Box>
      </Box>
    </Box>
  )
}

export default MainLayout
