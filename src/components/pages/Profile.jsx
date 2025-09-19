import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { 
  Box, 
  Typography, 
  useTheme, 
  Paper, 
  IconButton,
  useMediaQuery } from '@mui/material'
import { motion } from 'framer-motion'
import { alpha, lighten } from '@mui/material/styles'
import Person4SharpIcon from '@mui/icons-material/Person4Sharp'
import LiveHelpIcon from '@mui/icons-material/LiveHelp'
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate'
import CenterFocusWeakIcon from '@mui/icons-material/CenterFocusWeak'
import CustomSnackbar from '../ui/CustomSnackbar'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Settings from './Settings'
import MapSelector from '../ui/MapSelector'
import AddressFormModal from './Address/AddressFormModal'
import userService from '../../services/userService'
import { useAuth } from '../../hooks/AuthContext'
import { useLanguage } from '../../hooks/LanguageContext'
import Tutorial from '../pages/Tutorial/Tutorial'

const Profile = () => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'))
  const { toggleLoader } = useOutletContext()
  const { dictionary } = useLanguage()
  const { user } = useAuth()
  const [image, setImage] = useState((user?.imageUrl !=null && user?.imageName !=null) ? user?.imageUrl : null )
  const [file, setFile] = useState(null)
  const [openConfimationModal, setOpenConfimationModal] = useState(false)
  const [openSnackBar, setOpenSnackBar] = useState(false)
  const [typeSnack, setTypeSnack] = useState(null)
  const [messageSnack, setMessageSnack] = useState(null)
  const [openTutorial, setOpenTutorial] = useState(() => {
  const stored = localStorage.getItem('profileTutorial')
    return stored === null || stored === 'true'
  })
  const userName = user.firstName + ' ' + user.lastName
  const hoverBg = isDark
    ? lighten(theme.palette.background.paper, 0.1) 
    : alpha(user.organization.primaryColor, 0.08)
  const lighterBg = alpha(user.organization.primaryColor, 0.15); 
  const [openModalFrom, setOpenModalFrom] = useState(false)
  const [stepNumber, setStepNumber] = useState(0)

   const handleUpload = (event) => {
    const fileEvent = event.target.files[0]
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
    const maxSize = 50 * 1024 * 1024
    if (!allowedTypes.includes(fileEvent.type)) {
      setTypeSnack('error')
      setMessageSnack(dictionary.invalidFileType + ' ' + fileEvent.name)
      setOpenSnackBar(true)
      return
    }

    if (fileEvent.size > maxSize) {
      setTypeSnack('error')
      setMessageSnack(dictionary.fileTooLarge + ' ' + fileEvent.name)
      setOpenSnackBar(true)
      return
    }
    setFile(fileEvent)
    setImage(URL.createObjectURL(fileEvent))
    setOpenConfimationModal(true)
  }

  const handleCloseSubmit = () => {
    setFile(null)
    setImage((user?.imageUrl !=null && user?.imageName !=null) ? user?.imageUrl : null)
    setOpenConfimationModal(false)
  }

  const submit = async () => {
     try {
        toggleLoader(true)
        const formData = new FormData()
        formData.append('file', file)
        const res = await userService.updateImage(formData)
        if (res) {
           window.location.reload()
        }
    }catch (e) {
      if (e?.response?.data?.message) {
        const message = e.response.data.message
         if (message === 'User not found.') {
            setTypeSnack('error')
            setMessageSnack(dictionary.UserNotFound)
            setOpenSnackBar(true)
          }else {
            setTypeSnack('error')
            setMessageSnack(dictionary.UpdateUserFailed)
            setOpenSnackBar(true)
          }
      }else {
            setTypeSnack('error')
            setMessageSnack(dictionary.UpdateUserFailed)
            setOpenSnackBar(true)
          }
    }finally{
    toggleLoader(false)
    }
  }
   const stepsTutorial = [
        { target: '.stepMyinformations', content: dictionary.ThisYourInformation },
        { target: '.stepBtnConfirm', content: dictionary.YouCanUpdateThem},
        { target: '.stepProfilePhoto', content: dictionary.HereYoucanChangeYourPhoto},
        { target: '.stepProfileAddress', content: dictionary.AndHereYoucanSwitchToYourAddressInformation},
      ]
  return (
    <Box sx={{ display: 'flex', flexDirection: isSmallScreen ? 'column' : 'row', gap: 3 }}>
      <Modal
        open={openConfimationModal}
        onClose={handleCloseSubmit}
        showConfirmButton={true}
        onConfirm={submit}
        variant={'primary'}
        labelConfirmButton={dictionary.confirm}
        title={
          <>
            {' '}
            <CenterFocusWeakIcon sx={{ color: user.organization.primaryColor }} /> {dictionary.ChangeMyImage}{' '}
          </>
        }
        className="custom-modal"
      >
        <Typography>{dictionary.AreYouSureYouWantToChangeTheImage}</Typography>
      </Modal>
       <CustomSnackbar
        open={openSnackBar}
        message={messageSnack}
        type={typeSnack}
        onClose={() => setOpenSnackBar(false)}
      />
      {openModalFrom && (
        <AddressFormModal
          open={true}
          onClose={() => {
            setOpenModalFrom(false)
          }}
          address={user?.address}
        />
      )}
     <Paper
        sx={{
          borderRadius: 3,
          width: isSmallScreen ? '100%' : '200px',
          backgroundColor: isDark ? "#18141c" : "#ffffff",
          height: '100%',
          flexShrink: 0
        }}
      >
        <Box display="flex" flexDirection="column"  gap={2}>
          <Box sx={{
            display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
          }}>
            <Box
            className='stepProfilePhoto'
            sx={{
              mt:1,
              width: 128,
              height: 128,
              borderRadius: '50%',
              overflow: 'hidden',
              background: image ? "" :`linear-gradient(to right, ${user.organization.primaryColor}, ${user.organization.primaryColor}, ${user.organization.secondaryColor})`,
              boxShadow: isDark
                ? '0 4px 12px rgba(255, 255, 255, 0.5)'
                : '0 4px 12px rgba(0, 0, 0, 0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'transparent',
              position: 'relative'
            }}
          >
            {image ? (
              <img
                src={image}
                alt="Profile"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <Person4SharpIcon sx={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            )}

            <IconButton
              sx={{
                position: 'absolute',
                bottom: 2,
                right: 44,
                backgroundColor: isDark ?'rgba(34, 33, 33, 0.7)' : 'rgba(255, 255, 255, 0.9)', 
                '&:hover': {
                  backgroundColor: isDark ?'rgba(255, 255, 255, 0.9)':'rgba(34, 33, 33, 0.7)',
                },
              }}
              onClick={() => document.getElementById('upload-input').click()} 
            >
             <AddPhotoAlternateIcon
              sx={{
                color: isDark ? 'white' : 'black',
                '&:hover': {
                  color: isDark ? 'black' : 'white', 
                },
              }}
            />
            </IconButton>

            <input
              id="upload-input"
              type="file"
              style={{ display: 'none' }} 
              accept="image/*"
              onChange={handleUpload}
            />
          </Box>
          </Box>
             <Typography
             textAlign="center"
             sx={{
              background: `linear-gradient(to right, ${user.organization.primaryColor},${user.organization.secondaryColor}, ${user.organization.secondaryColor} )`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 'bold',
              fontSize: '1.2rem',
            }} 
             >
               {userName}
            </Typography>
            <Box
            sx={{
              width:"100%",
              backgroundColor:stepNumber==0 ? lighterBg : 'transparent',
              borderRadius: '10px',
              alignItems:"center",
              justifyContent:"center",
              display:"flex",
              p: 2,
              '&:hover': {
                backgroundColor: hoverBg,
              },
            }}
            >
              <button 
                style={{
                  cursor:"pointer", fontWeight:"bold", 
                  backgroundColor:'transparent',
                  borderColor:"transparent",
                  fontSize: '1rem', color:isDark? "white":"Black",
                }}
                onClick={() => setStepNumber(0)}>
                  {dictionary.MyInformations}
              </button>
            </Box>
            <Box
            sx={{
              width:"100%",
              backgroundColor:stepNumber==1 ? lighterBg : 'transparent',
              borderRadius: '10px',
              alignItems:"center",
              justifyContent:"center",
              display:"flex",
              p: 2,
              mb:2,
              '&:hover': {
                backgroundColor: hoverBg,
              },
            }}
            >
              <button 
              className='stepProfileAddress'
                style={{
                  cursor:"pointer", fontWeight:"bold", 
                  backgroundColor:'transparent',
                  borderColor:"transparent",
                  fontSize: '1rem', color:isDark? "white":"Black",
                }}
                onClick={() => setStepNumber(1)}>
                  {dictionary.MyAddress}
              </button>
            </Box>
            
           
        </Box>
      </Paper>
      <Paper
      className='stepMyinformations'
        sx={{
          p: 3,
          borderRadius: 3,
          flexGrow: 1,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: isDark ? '#18141c' : '#ffffff',
        }}
      >
         <Box mt={2}>
              {stepNumber===0 &&
                <motion.div
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 100 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Typography textAlign="center" sx={{
                      mb:1,
                      background: `linear-gradient(to right, ${user.organization.primaryColor},${user.organization.secondaryColor}, ${user.organization.secondaryColor} )`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontWeight: 'bold',
                      fontSize: '1.2rem',
                      }}>
                      {dictionary.MyInformations}
                    </Typography>
                    <Box display={'flex'} justifyContent={'end'}>
                      <IconButton
                        onClick={() => setOpenTutorial(true)} 
                      >
                        <LiveHelpIcon sx={{color:user.organization.primaryColor}}/>
                      </IconButton>
                    </Box>
                    <Settings />
                  </motion.div>
              }

               {stepNumber===1 &&
                <motion.div
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 100 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Typography textAlign="center" sx={{
                      mb:1,
                      background: `linear-gradient(to right, ${user.organization.primaryColor},${user.organization.secondaryColor}, ${user.organization.secondaryColor} )`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontWeight: 'bold',
                      fontSize: '1.2rem',
                      }}>
                      {dictionary.MyAddress}
                    </Typography>
                    {user?.address ? (
                      <Box>
                        <Box
                          display="flex"
                          flexWrap="wrap"
                          justifyContent="space-between"
                          gap={3}
                          sx={{ paddingLeft: '15%' }}
                        >
                          <Box sx={{ flexBasis: { xs: '100%', sm: '48%' } }}>
                            <Typography
                              sx={{
                                fontWeight: 'bold',
                              }}
                            >
                              {dictionary.StreetName} :
                              <span style={{ color: '#9da7b7', fontWeight: 'normal' }}>
                                {user.address.streetName}
                              </span>
                            </Typography>
                            <Typography
                              sx={{
                                fontWeight: 'bold',
                              }}
                            >
                              {dictionary.City} :
                              <span style={{ color: '#9da7b7', fontWeight: 'normal' }}>
                                {user.address.city}
                              </span>
                            </Typography>
                          </Box>

                          <Box sx={{ flexBasis: { xs: '100%', sm: '48%' } }}>
                            <Typography
                              sx={{
                                fontWeight: 'bold',
                              }}
                            >
                              {dictionary.State} :
                              <span style={{ color: '#9da7b7', fontWeight: 'normal' }}>
                                {user.address.state}
                              </span>
                            </Typography>
                            <Typography
                              sx={{
                                fontWeight: 'bold',
                              }}
                            >
                              {dictionary.ZipCode} :
                              <span style={{ color: '#9da7b7', fontWeight: 'normal' }}>
                                {user.address.zipCode}
                              </span>
                            </Typography>
                          </Box>
                        </Box>
                        <Box>
                          <br />
                          <MapSelector
                            initialCoords={{
                              lat: user.address.latitude,
                              lng: user.address.longitude,
                            }}
                          />
                        </Box>
                      </Box>
                    ) : (
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <Typography sx={{ color: isDark ? '#747574' : '#bdbcbc' }}>
                          {dictionary.YouDontHaveAnAdressYet}
                        </Typography>
                      </Box>
                    )}
                    <Box
                      sx={{
                        mt:1,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Button
                        variant="primary"
                        onClick={() => setOpenModalFrom(true)}
                      >
                        {user?.address
                          ? dictionary.UpdateMyAddress
                          : dictionary.AddAnAddress}
                      </Button>
                    </Box>
                  </motion.div>
              }
            </Box>
      </Paper>
      <Tutorial
        open={openTutorial}
        steps={stepsTutorial}
        beaconSize={100}
        onClose={() => {
          localStorage.setItem('profileTutorial', 'false')
          setOpenTutorial(false)
        }}
      />
     </Box>
  )
}

export default Profile
