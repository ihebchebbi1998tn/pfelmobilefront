import { forwardRef, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import {
  Drawer,
  Box,
  useTheme,
  IconButton,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  Slide,
  useMediaQuery
} from '@mui/material'
import QuizIcon from '@mui/icons-material/Quiz'
import CloseIcon from '@mui/icons-material/Close'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../../hooks/LanguageContext'
import { useOrganisation } from '../../hooks/OrganisationContext'
import UiPagesOrganisationDevicesForm from'../pages/UiPagesCustomizationForms/UiPagesOrganisationDevicesForm'
import UiPagesCustomerDevicesForm from'../pages/UiPagesCustomizationForms/UiPagesCustomerDevicesForm'
import UiPagesSparePartsForm from'../pages/UiPagesCustomizationForms/UiPagesSparePartsForm'
import { useAuth } from '../../hooks/AuthContext'
import Button  from '../ui/Button'


const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />
})

const RightDrawer = ({
  rightDrawerOpen = false,
  onCloseRightDrawer,
  toggleLoader
}) => {
const { user } = useAuth()
  const { dictionary } = useLanguage()
  const { pageReference } = useOrganisation()
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const drawerWidth = 260

  const isLargeScreen = useMediaQuery(theme.breakpoints.up('sm'))

  const [title, setTitle] = useState(dictionary?.CustomizeDevicesInterface || 'Customize Devices Interface') 
  const [formMode, setFormMode] = useState(0)
  const [openTutorial, setOpenTutorial] = useState(() => {
    const stored = localStorage.getItem('CustomizeTutorial')
      return stored === null || stored === 'true'
  })
  const handleCloseTutorial = () => {
    setOpenTutorial(false)
    localStorage.setItem('CustomizeTutorial', 'false')
  }
  useEffect(() => {
    if(pageReference!=null){
      if(pageReference=="organisation devices"){
          setFormMode(0)
          setTitle(dictionary?.CustomizeDevicesInterface || 'Customize Devices Interface')
      }
      else if(pageReference=="customer devices"){
          setFormMode(1)
          setTitle(dictionary?.CustomizeCustmoerDevicesInterface || 'Customize Customer Devices Interface')
      }
      else if(pageReference=="spare parts"){
          setFormMode(2)
          setTitle(dictionary?.CustomizeSparePartsInterface || 'Customize Spare Parts Interface')
      }
    }
  }, [pageReference])

  return (
    <Box>
      {isLargeScreen ? (
        <Drawer
          anchor="right"
          variant="permanent"
          onClose={onCloseRightDrawer}
          sx={{
            overflowY: 'auto',
            maxHeight: '90vh',
            scrollbarWidth: 'none',
            display: rightDrawerOpen ? 'block' : 'none',
            '&::-webkit-scrollbar': {
              width: '6px',
              opacity: 0,
              transition: 'opacity 0.3s ease-in-out',
            },
            '&:hover::-webkit-scrollbar': {
              opacity: 1,
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: isDark ? '#aaa' : '#888',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'transparent',
            },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              borderRadius:'10px',
              width: drawerWidth,
              backgroundColor: isDark
                ? "#18141c"
                : "#ffffff",
              borderColor: isDark
                ? "#18141c"
                : "#ffffff",
              overflow: 'hidden',
              transition: 'width 0.3s',
            },
          }}
        >
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.3 }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt:1 }}>
              <IconButton onClick={onCloseRightDrawer}>
                <CloseIcon />
              </IconButton>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb:2 }}>
              <Typography sx={{ fontWeight: 'bold' }}>{title}</Typography>
            </Box>
           
             <AnimatePresence mode="wait">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Box
                  sx={{
                    overflowY: 'auto',
                      maxHeight: '80vh',
                      width:'100%',
                      overflowX: 'hidden',
                      scrollbarWidth: 'thin',
                      '&::WebkitScrollbar': {
                        width: '8px',
                        borderRadius: '8px',
                      },
                      '&::WebkitScrollbarThumb': {
                        borderRadius: '8px'
                      },
                      scrollbarColor: isDark ? "white transparent" : "black transparent"
                  }}
                  >
                    {formMode === 0 && <UiPagesOrganisationDevicesForm onCloseRightDrawer={onCloseRightDrawer} toggleLoader={toggleLoader} />}
                    {formMode === 1 && <UiPagesCustomerDevicesForm onCloseRightDrawer={onCloseRightDrawer} toggleLoader={toggleLoader} />} 
                    {formMode === 2 && <UiPagesSparePartsForm onCloseRightDrawer={onCloseRightDrawer} toggleLoader={toggleLoader} />}  
                    <Box mt={3} display="flex" justifyContent="space-between">
                                      <Button variant="primary outlined" onClick={() => setOpenTutorial(true)}>
                                        <>
                                          <QuizIcon sx={{ mr: 0.5, mb: 0.2, color:user.organization.primaryColor }} />
                                          {dictionary?.ShowTutorial || 'Show Tutorial'}
                                        </>
                                      </Button>
                                    </Box> 
                  </Box>
                
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </Drawer>
      ) : (
        <Dialog
        TransitionComponent={Transition}
          open={rightDrawerOpen}
          onClose={onCloseRightDrawer}
          maxWidth={false}
          PaperProps={{
            sx: {
              display: rightDrawerOpen ? 'block' : 'none',
              width: 'fit-content',
              maxWidth: '90vw',
            },
          }}
        ><DialogTitle>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography sx={{ fontWeight: 'bold' }}>{title}</Typography>
                    <IconButton onClick={onCloseRightDrawer}>
                    <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>
              <Box
            sx={{
              backgroundColor: isDark ? "#18141c" : "#ffffff",
              overflowY: 'auto',
              '&::WebkitScrollbar': {
                width: '8px',
                borderRadius: '8px',
              },
              '&::WebkitScrollbarThumb': {
                borderRadius: '8px'
              },
              scrollbarWidth: 'thin',
              scrollbarColor: isDark ? "white transparent" : "black transparent"
            }}
          >
            <DialogContent>
              <AnimatePresence mode="wait">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {formMode === 0 && <UiPagesOrganisationDevicesForm onCloseRightDrawer={onCloseRightDrawer} toggleLoader={toggleLoader} />}
                  {formMode === 1 && <UiPagesCustomerDevicesForm onCloseRightDrawer={onCloseRightDrawer} toggleLoader={toggleLoader} />} 
                  {formMode === 2 && <UiPagesSparePartsForm onCloseRightDrawer={onCloseRightDrawer} toggleLoader={toggleLoader} />} 
                  <Box mt={3} display="flex" justifyContent="space-between">
                  <Button variant="primary outlined" onClick={() => setOpenTutorial(true)}>
                    <>
                      <QuizIcon sx={{ mr: 0.5, mb: 0.2, color:user.organization.primaryColor }} />
                      {dictionary?.ShowTutorial || 'Show Tutorial'}
                    </>
                  </Button>
                </Box>  
                </motion.div>
            </AnimatePresence>
            </DialogContent>
            </Box>
        </Dialog>
      )}
      <Dialog
       TransitionComponent={Transition}
          open={rightDrawerOpen && openTutorial}
          onClose={handleCloseTutorial}
          maxWidth="lg"
        >
            <DialogTitle>
                 {dictionary?.Tutorial || 'Tutorial'}
            </DialogTitle>
         
        
            <DialogContent
            sx={{
              width: { xs: '300px', sm: '400px', md: '500px', lg: '800px' },
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
            }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <video
                                 src={"https://dl.dropboxusercontent.com/scl/fi/783i2sio4wy2e6blny9lm/CustomizeUi.mp4?rlkey=olbdgo2fhkh66rint8m8vnzqu&st=gedflenq&dl=0"}
                                 autoPlay
                                 loop
                                 muted
                                 playsInline
                                 style={{ width: '100%' }}
                               />
                </motion.div>
            </AnimatePresence>
            </DialogContent>
        </Dialog>
    </Box>
  )
}

RightDrawer.propTypes = {
  rightDrawerOpen: PropTypes.bool.isRequired,
  onCloseRightDrawer: PropTypes.func.isRequired,
  toggleLoader: PropTypes.func.isRequired
}

export default RightDrawer
