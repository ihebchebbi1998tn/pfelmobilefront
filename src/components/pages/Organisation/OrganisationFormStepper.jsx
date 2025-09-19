import React, { useState, useRef, useEffect , forwardRef} from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Stepper,
  Step,
  StepLabel,
  TextField,
  Button as MUIButton,
  Box,
  Popover,
  Grid,
  InputLabel,
  FormHelperText,
  Typography,
  InputBase,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  Slide,
  Radio,
  FormControl,
  FormControlLabel,
  IconButton,
} from '@mui/material'
import { darken, lighten } from '@mui/material/styles'
import { motion } from 'framer-motion'
import ColorThief from 'colorthief'
import NotificationsActiveSharpIcon from '@mui/icons-material/NotificationsActiveSharp'
import Person4SharpIcon from '@mui/icons-material/Person4Sharp'
import QuizIcon from '@mui/icons-material/Quiz'
import SendIcon from '@mui/icons-material/Send'
import LayersIcon from '@mui/icons-material/Layers'
import { Search as SearchIcon, WarningAmber } from '@mui/icons-material'
import CloseIcon from '@mui/icons-material/Close'
import { useOutletContext } from 'react-router-dom'
import OrganisationService from '../../../services/OrganisationService'
import { useAuth } from '../../../hooks/AuthContext'
import { useLanguage } from '../../../hooks/LanguageContext'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import hiAnimation from '../../../assets/animation/hi.lottie'
import squareSrc from '../../../assets/img/square.png'
import stripeSrc from '../../../assets/img/stripe.png'
import { ChromePicker } from 'react-color'
import CustomSnackbar from '../../ui/CustomSnackbar'
import Button  from '../../ui/Button'
import MapSelector  from '../../ui/MapSelector'
import FileUpload from '../../ui/FileUpload'
import PropTypes from 'prop-types'

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />
})
const OrganisationFormStepper = ({ open, onClose, organisation }) => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const { toggleLoader } = useOutletContext()
  const { dictionary } = useLanguage()
  const { user } = useAuth()
  const isUpdate = Boolean(organisation)
  const [anchorEl, setAnchorEl] = useState(null)
  const [colorChoiceAnchor, setColorChoiceAnchor] = useState(null)
  const [isPrimaryMode, setIsPrimaryMode] = useState(true)
  const [currentColor, setCurrentColor] = useState('') 
  const [activeStep, setActiveStep] = useState(0)
  const [typeSnack, setTypeSnack] = useState(null)
  const [messageSnack, setMessageSnack] = useState(null)
  const [openSnackBar, setOpenSnackBar] = useState(false)
  const [dots, setDots] = useState('')
  const [errors, setErrors] = useState({})
  const [name, setName] = useState(organisation?.name || '')
  const [onlinePaymentSolutions, setOnlinePaymentSolutions] = useState(organisation?.onlinePaymentSolutions || null)
  const [emailOrganisation, setEmailOrganisation] = useState(organisation?.emailOrganisation || '')
  const [primaryColor, setPrimaryColor] = useState(organisation?.primaryColor || '#1e1e2f')
  const [secondaryColor, setSecondaryColor] = useState(organisation?.secondaryColor || '#5c6bc0')
  const [preview, setPreview] = useState(organisation?.logoUrl || '')
  const [description, setDescription] = useState(organisation?.description || null)
  const [streetName, setStreetName] = useState(organisation?.streetName || null)
  const [city, setCity] = useState(organisation?.city || null)
  const [country, setCountry] = useState(organisation?.country || null)
  const [state, setState] = useState(organisation?.state || null)
  const [zipCode, setZipCode] = useState(organisation?.zipCode || null)
  const [location, setLocation] = useState((organisation?.latitude && organisation?.longitude)?{lat: organisation?.latitude,lng: organisation?.longitude}:null)
  const [file, setFile] = useState(null)
  const [fileResetKey, setFileResetKey] = useState(0)
  const [fileError, setFileError] = useState('')
  const [isBgRemoved, setIsBgRemoved] = useState(organisation?.isBgRemoved || false)
  const [loading, setLoading] = useState(false)
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 })
  const [showZoom, setShowZoom] = useState(false)
  const canvasRef = useRef(null)
  const imgRef = useRef(null)
  const [openTutorial, setOpenTutorial] = useState(() => {
    const stored = localStorage.getItem('organisationFormTutorial')
      return stored === null || stored === 'true'
  })
  const steps = [dictionary.Organisation, dictionary.OnlinePaymentSolutions, dictionary.OrganisationAddress, dictionary.Summary]
  const menuItems = []
  for (let i = 0; i < 4; i++) {
    menuItems.push({
      text: `${dictionary.page} ${i}`,
      icon: <LayersIcon />,
      index: i,
    })
  }
  
  const resetForm = () => {
    setActiveStep(0)
    setEmailOrganisation('')
    setName('')
    setPrimaryColor('#1e1e2f')
    setSecondaryColor('#5c6bc0')
    setDescription(null)
    setLocation(null)
    setOnlinePaymentSolutions(null)
    setStreetName(null)
    setCity(null)
    setCountry(null)
    setState(null)
    setZipCode(null)
    setFile(null)
    setPreview('')
    setCurrentColor('')
    setIsBgRemoved(false)
    setLoading(false)
    setZoomPosition({ x: 0, y: 0 })
    setShowZoom(false)
    setAnchorEl(null)
    setIsPrimaryMode(true)
    setColorChoiceAnchor(null)
    setErrors({})
  }
  const validateStep = () => {
    const newErrors = {}
    if (activeStep === 0) {
      if (!name.trim())
        newErrors.name = dictionary.OrganisationNameRequired
      if (!emailOrganisation.trim())
        newErrors.emailOrganisation = dictionary.EmailComapnyRequired
      else if (!/\S+@\S+\.\S+/.test(emailOrganisation)) {
      newErrors.emailOrganisation = dictionary.invalidEmail
    }
      if (!isUpdate && !file) newErrors.file = dictionary.LogoRequired
    } else if (activeStep === 2 ) {
        if (!streetName) {
        newErrors.streetName = dictionary.streetNameRequired
        }

        if (!city) {
        newErrors.city = dictionary.cityRequired
        }
        if (!country) {
        newErrors.country = dictionary.countryKeyRequired
        }

        if (!state) {
        newErrors.state = dictionary.StateRequired
        }

        if (!zipCode) {
        newErrors.zipCode = dictionary.zipCodeRequired
        }
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  const handlechange = (data) => {
    setLocation(data)
    if(data.street) setStreetName(data.street)
    if(data.city) setCity(data.city)
    if(data.state) setState(data.state)
    if(data.zipCode) setZipCode(data.zipCode)
    if(data.country) setCountry(data.country)
  }
  const handleNext = () => {
    if (validateStep()) setActiveStep((prev) => prev + 1)
  }

 const rgbToHex = (r, g, b) =>
    `#${((1 << 24) + (r << 16) + (g << 8) + b)
      .toString(16)
      .slice(1)
      .toUpperCase()}`

    const extractPrimaryAndSecondaryColors = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = reader.result;

        img.onload = () => {
        const colorThief = new ColorThief();
        try {
            const palette = colorThief.getPalette(img, 2)
            const [primaryRgb, secondaryRgb] = palette
            setPrimaryColor(rgbToHex(primaryRgb[0], primaryRgb[1], primaryRgb[2]))
            setSecondaryColor(rgbToHex(secondaryRgb[0], secondaryRgb[1], secondaryRgb[2]))
        } catch (err) {
            console.error("Color extraction failed:", err);
        }
        };
    };
    reader.readAsDataURL(file);
    }

  const handleFileDrop = (acceptedFiles) => {
    const file = acceptedFiles[0]
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
    const maxSize = 50 * 1024 * 1024
    if (!allowedTypes.includes(file.type)) {
      setFileError(dictionary.invalidFileType + ' ' + file.name)
      return
    }

    if (file.size > maxSize) {
      setFileError(dictionary.fileTooLarge + ' ' + file.name)
      return
    }
    setFileError('')
    setFile(file)
    setPreview(URL.createObjectURL(file))
    extractPrimaryAndSecondaryColors(file)
    setIsBgRemoved(false)
  }
  const handleMouseMove = (e) => {
    const img = imgRef.current
    if (!img) return

    const rect = img.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setZoomPosition({ x, y })
    setShowZoom(true)
  }

  const handleChoseMethodePayment = (value) => {
    setOnlinePaymentSolutions((prevValue) =>
      prevValue === value ? null : value
    )
  }
const handleCloseTutorial = () => {
    setOpenTutorial(false)
    localStorage.setItem('organisationFormTutorial', 'false')
  }

  const handleMouseLeave = () => {
    setShowZoom(false)
  }
  const handleRemovePreview = () => {
    setFile(null)
    setFileError('')
    setPreview('')
    setIsBgRemoved(false)
    setFileResetKey((prev) => prev + 1)
    setPrimaryColor('#1e1e2f')
    setSecondaryColor( '#5c6bc0')
  }
   const handleImageClick = (e) => {
    const img = imgRef.current
    const canvas = canvasRef.current
    if (!img || !canvas) return

    const rect = img.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    canvas.width = img.width
    canvas.height = img.height
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0, img.width, img.height)

    const pixel = ctx.getImageData(x, y, 1, 1).data
    const hex = rgbToHex(pixel[0], pixel[1], pixel[2])
    setCurrentColor(hex)
    setColorChoiceAnchor(e.currentTarget)
  }
  const handleRemoveBackground = async () => {
  if (!file) return;
  setLoading(true);

  const formData = new FormData()
  formData.append('image', file)

  try {
    const response = await OrganisationService.RemoveBackground(formData)
    const imageUrl = response.imageUrl

    setPreview(imageUrl)
    setIsBgRemoved(true)
    const imageResponse = await fetch(imageUrl)
    const blob = await imageResponse.blob()

    const newFile = new File([blob], file.name, { type: file.type })

    setFile(newFile)
    const img = new Image()
    img.crossOrigin = 'Anonymous'
    img.src = imageUrl

    img.onload = () => {
      try {
        const colorThief = new ColorThief()
        const palette = colorThief.getPalette(img, 2)

        const [primaryRgb, secondaryRgb] = palette
        const primaryHex = rgbToHex(primaryRgb[0], primaryRgb[1], primaryRgb[2])
        const secondaryHex = rgbToHex(secondaryRgb[0], secondaryRgb[1], secondaryRgb[2])

        setPrimaryColor(primaryHex)
        setSecondaryColor(secondaryHex)
      } catch (err) {
        console.error('Color extraction failed after background removal:', err);
      }
      setLoading(false);
    };

    img.onerror = (e) => {
      console.error('Failed to load image for color extraction:', e);
      setLoading(false);
    };
  } catch (error) {
    console.error('Error removing background:', error);
    setLoading(false);
  }
}
 const handleClosePopover = () => {
    setAnchorEl(null)  
  }
  const handleColorClick = (event, mode) => {
    setAnchorEl(event.currentTarget)
    setIsPrimaryMode(mode)
    if(mode)
      setCurrentColor(primaryColor)
    else 
      setCurrentColor(secondaryColor)
  }
  const handleColorChange = (color) => {
    if(isPrimaryMode)
        setPrimaryColor(color.hex)
    else
        setSecondaryColor(color.hex)
    setCurrentColor(color.hex)
    }
 const handleSubmit = async () => {
    if (!validateStep()) return
    toggleLoader(true)
    try {
      if (isUpdate) {
        const formData = new FormData()
        formData.append('name', name)
        formData.append('emailOrganisation', emailOrganisation)
        formData.append('primaryColor', primaryColor)
        formData.append('isBgRemoved', isBgRemoved)
        formData.append('secondaryColor', secondaryColor)
        formData.append('description', description)
        formData.append('streetName', streetName)
        formData.append('city', city)
        formData.append('country', country)
        formData.append('state', state)
        formData.append('zipCode', zipCode)
        formData.append('longitude', location.lng)
        formData.append('latitude', location.lat)
        formData.append('id', organisation.id)
        if (file) formData.append('file', file)
        if (onlinePaymentSolutions!=null) formData.append('onlinePaymentSolutions', onlinePaymentSolutions)
        await OrganisationService.UpdateOrganization(formData)
      } else {
        const formData = new FormData()
        formData.append('name', name)
        formData.append('emailOrganisation', emailOrganisation)
        formData.append('primaryColor', primaryColor)
        formData.append('secondaryColor', secondaryColor)
        formData.append('isBgRemoved', isBgRemoved)
        formData.append('description', description)
        formData.append('streetName', streetName)
        formData.append('city', city)
        formData.append('country', country)
        formData.append('state', state)
        formData.append('zipCode', zipCode)
        formData.append('longitude', location.lng)
        formData.append('latitude', location.lat)
        if (file) formData.append('file', file)
        await OrganisationService.addOrganization(formData)
      }
      setTypeSnack('success')
      setMessageSnack(dictionary.OperationSeccesfull)
      setOpenSnackBar(true)
      resetForm()
      onClose()
    } catch (e) {
      const message = e?.response?.data?.message
      setTypeSnack('error')
      setMessageSnack(
        message ||
          (isUpdate
            ? dictionary.UpdateOrganisationFailed
            : dictionary.CreateOrganisationFailed)
      )
      setOpenSnackBar(true)
    } finally {
      toggleLoader(false)
    }
  }

  useEffect(() => {
  if (loading) {
    const interval = setInterval(() => {
      setDots(prev => (prev.length < 3 ? prev + '.' : ''))
    }, 500)
    return () => clearInterval(interval)
  } else {
    setDots('')
  }
}, [loading])

 return (
  <Box>
    <CustomSnackbar
      open={openSnackBar}
      message={messageSnack}
      type={typeSnack}
      onClose={() => setOpenSnackBar(false)}
    />
       <Dialog open={open} onClose={onClose}
        TransitionComponent={Transition}  
       maxWidth="lg">
            <DialogTitle>
                {isUpdate ? dictionary.UpdateOrganisation : dictionary.AddOrganisation}
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
                <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
                    {steps.map((label) => (
                     <Step key={label}>
                        <StepLabel
                         StepIconProps={{
                          sx: {
                            '&.Mui-active': {
                              color: user.organization.primaryColor, 
                             },
                             '&.Mui-completed': {
                              color:  darken(user.organization.primaryColor, 0.2), 
                              },
                           },
                          }}
                        >
                            {label}
                        </StepLabel>
                     </Step>
                    ))}
                </Stepper>
                 {activeStep === 0 && (
                  <motion.div
                      initial={{ opacity: 0, x: 100 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 100 }}
                      transition={{ duration: 0.8 }}
                    >
                    <Box>
                    <TextField
                        label={dictionary.OrganisationName}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        fullWidth
                        margin="normal"
                        error={Boolean(errors.name)}
                        helperText={errors.name}
                    />

                    <TextField
                        label={dictionary.email}
                        value={emailOrganisation}
                        onChange={(e) => setEmailOrganisation(e.target.value)}
                        fullWidth
                        margin="normal"
                        error={Boolean(errors.emailOrganisation)}
                        helperText={errors.emailOrganisation}
                    />
                     <TextField
                        label={dictionary.OransiationInfosDescription}
                        multiline
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        fullWidth
                     />

                   <Box>
                     <InputLabel>{dictionary.Logo}</InputLabel>
                        <FileUpload
                            onDrop={handleFileDrop}
                            resetTrigger={fileResetKey }
                            errorMessage={fileError || errors.file}
                        />
                        {errors.file && (
                            <FormHelperText error>{errors.file}</FormHelperText>
                        )}
                        {preview && (
                            <motion.div
                            key={preview}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.7 }}
                            style={{ position: 'relative', marginTop: 30 }}
                            >
                            <Box
                                sx={{
                                position: 'relative',
                                width: '100%',
                                maxWidth: 200,
                                mx: 'auto',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                boxShadow: isBgRemoved
                                    ? `0 0 25px ${user.organization.primaryColor}, 0 0 10px ${lighten(user.organization.primaryColor, 0.2)}`
                                    : '0 10px 30px rgba(0,0,0,0.2)',
                                }}
                            >
                                <Box
                                    sx={{
                                        position: 'relative',
                                        width: '100%',
                                        maxWidth: 200,
                                        mx: 'auto',
                                        borderRadius: '12px',
                                        overflow: 'hidden',
                                        boxShadow: isBgRemoved
                                        ? `0 0 25px ${user.organization.primaryColor}, 0 0 10px ${lighten(user.organization.primaryColor, 0.2)}`
                                        : '0 10px 30px rgba(0,0,0,0.2)',
                                    }}
                                    >
                                        {!isBgRemoved && (
                                        <Button variant="outlined primary" onClick={handleRemoveBackground}>
                                            {loading ? `${dictionary.Removing} ${dots}` : dictionary.RemoveBg}
                                        </Button>
                                        )}
                                </Box>
                                <button
                                type="button"
                                onClick={handleImageClick}
                                onMouseMove={handleMouseMove}
                                onMouseLeave={handleMouseLeave}
                                style={{
                                    padding: 0,
                                    border: 'none',
                                    background: 'none',
                                    cursor: 'crosshair',
                                    width: '100%',
                                    display: 'block',
                                }}
                                aria-label="Select color from image"
                                >
                                <img
                                    src={preview}
                                    ref={imgRef}
                                    alt="Preview"
                                    crossOrigin="anonymous"
                                    style={{
                                    width: '100%',
                                    height: 'auto',
                                    borderRadius: '12px',
                                    filter: isBgRemoved ? `drop-shadow(0 0 10px ${user.organization.primaryColor})` : 'none',
                                    }}
                                />
                                </button>

                                {showZoom && imgRef.current && (
                                <Box
                                    sx={{
                                    position: 'absolute',
                                    top: `${zoomPosition.y - 50}px`,
                                    left: `${zoomPosition.x - 50}px`,
                                    width: 100,
                                    height: 100,
                                    borderRadius: '50%',
                                    border: `2px solid ${user.organization.primaryColor}`,
                                    backgroundImage: `url(${preview})`,
                                    backgroundRepeat: 'no-repeat',
                                    backgroundSize: `${imgRef.current.width * 3}px auto`,
                                    backgroundPosition: `-${zoomPosition.x * 3 - 50}px -${zoomPosition.y * 3 - 50}px`,
                                    pointerEvents: 'none',
                                    zIndex: 10,
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                                    backgroundColor: '#fff',
                                    }}
                                />
                                )}

                                {isBgRemoved && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5, duration: 0.6 }}
                                    style={{
                                    position: 'absolute',
                                    top: '10px',
                                    left: '10px',
                                    background: `linear-gradient(to right,${user.organization.secondaryColor}, ${user.organization.primaryColor})`,
                                    color: 'white',
                                    padding: '6px 12px',
                                    borderRadius: '8px',
                                    fontWeight: 'bold',
                                    fontSize: '14px',
                                    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                                    }}
                                >
                                    ✨ {dictionary.MagicApplied}!
                                </motion.div>
                                )}
                                 <Box sx={{alignItems:"center", justifyContent:"center", display: 'flex'}}>
                                    <IconButton
                                      onClick={handleRemovePreview}
                                      sx={{
                                        color: 'error.main',
                                        backgroundColor: '#fff',
                                        border: '1px solid #ddd',
                                        '&:hover': {
                                          backgroundColor: '#fce4ec',
                                          borderColor: 'error.main',
                                        },
                                      }}
                                    >
                                        <CloseIcon />
                                    </IconButton>
                                 </Box>
                            </Box>
                            </motion.div>
                        )}
                        {(primaryColor && secondaryColor) && (
                            <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                                <Typography variant="h6">{dictionary.PrimaryColor}</Typography>
                                <IconButton
                                disableRipple
                                sx={{
                                    backgroundColor: primaryColor,
                                    borderRadius: '50%',
                                    width: 30,
                                    height: 30,
                                    '&:hover': {
                                    backgroundColor: primaryColor,
                                    },
                                }}
                                onClick={(e) => handleColorClick(e, true)}
                                />
                                <Typography variant="h6">{dictionary.SecondaryColor}</Typography>
                                <IconButton
                                disableRipple
                                sx={{
                                    backgroundColor: secondaryColor,
                                    borderRadius: '50%',
                                    width: 30,
                                    height: 30,
                                    '&:hover': {
                                    backgroundColor: secondaryColor,
                                    },
                                }}
                                onClick={(e) => handleColorClick(e, false)}
                                />
                            </Box>
                            )}
                            
                        <Popover
                            open={Boolean(anchorEl)}
                            anchorEl={anchorEl}
                            onClose={handleClosePopover}
                            anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'center',
                            }}
                            transformOrigin={{
                            vertical: 'top',
                            horizontal: 'center',
                            }}
                        >
                            <Box sx={{ padding: 2 }}>
                            <ChromePicker
                                color={currentColor}
                                onChangeComplete={handleColorChange}
                            />
                            </Box>
                        </Popover>
                        <Popover
                        open={Boolean(colorChoiceAnchor)}
                        anchorEl={colorChoiceAnchor}
                        onClose={() => setColorChoiceAnchor(null)}
                        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                        transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                        >
                        <Box sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="subtitle1" gutterBottom>
                            {dictionary.ApplyColorTo}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                            <Button
                                variant="primary"
                                onClick={() => {
                                setPrimaryColor(currentColor)
                                setColorChoiceAnchor(null)
                                }}
                            >
                                {dictionary.PrimaryColor}
                            </Button>
                            <Button
                                variant="primary"
                                onClick={() => {
                                setSecondaryColor(currentColor)
                                setColorChoiceAnchor(null)
                                }}
                            >
                                {dictionary.SecondaryColor}
                            </Button>
                            </Box>
                        </Box>
                        </Popover>

                        <canvas ref={canvasRef} style={{ display: 'none' }} />
                   </Box>
                 </Box>
                 </motion.div>
                )}
                {activeStep === 1 && (
                  <motion.div
                      initial={{ opacity: 0, x: 100 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 100 }}
                      transition={{ duration: 0.8 }}
                    >
                  <Box >
                    <Typography sx={{mb:1, mt:0.5}}>{dictionary.PaymentProviderQuestion}</Typography>
                   <FormControl sx={{ display: 'flex', justifyContent: 'center' }}>
                    <FormControlLabel
                      value="stripe"
                      control={
                        <Radio
                          checked={onlinePaymentSolutions === 'stripe'}
                          onClick={() => handleChoseMethodePayment('stripe')}
                          sx={{
                            '&.Mui-checked': {
                              color: user.organization.primaryColor,
                            },
                          }}
                        />
                      }
                      label={
                        <img
                          src={stripeSrc}
                          alt="Stripe"
                          style={{ width: 100, height: 'auto', objectFit: 'contain' }}
                        />
                      }
                    />
                    <FormControlLabel
                      value="square"
                      control={
                        <Radio
                          checked={onlinePaymentSolutions === 'square'}
                          onClick={() => handleChoseMethodePayment('square')}
                          sx={{
                            '&.Mui-checked': {
                              color: user.organization.primaryColor,
                            },
                          }}
                        />
                      }
                      label={
                        <img
                          src={squareSrc}
                          alt="Square"
                          style={{ width: 100, height: 'auto', objectFit: 'contain' }}
                        />
                      }
                    />
                  </FormControl>


                  </Box>
                  </motion.div>
                )}
                {activeStep === 2 && (
                  <motion.div
                      initial={{ opacity: 0, x: 100 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 100 }}
                      transition={{ duration: 0.8 }}
                    >
                    <Box sx={{ flex: 1, display: 'flex' }}>
                        <Box
                            sx={{
                                flex: 1,
                                display: { xs: 'none', md: 'flex' },
                                flexDirection: 'column',
                                marginTop:{ xs: 0, md: 18 },
                                alignItems: 'center'
                            }}
                        >
                            {streetName && 
                                <Typography sx={{ fontWeight: 'bold' }}>
                                    {dictionary.StreetName}:{' '}
                                    <span style={{ fontWeight: 'normal' }}>
                                    {streetName}
                                    </span>
                                </Typography>
                            }
                            {city && 
                                <Typography sx={{ fontWeight: 'bold' }}>
                                    {dictionary.City}:{' '}
                                    <span style={{ fontWeight: 'normal' }}>{city}</span>
                                </Typography>
                            }
                            {country &&
                                <Typography sx={{ fontWeight: 'bold' }}>
                                    {dictionary.country}:{' '}
                                    <span style={{ fontWeight: 'normal' }}>
                                    {country}
                                    </span>
                                </Typography>
                            }
                            {state && 
                                <Typography sx={{ fontWeight: 'bold' }}>
                                    {dictionary.State}:{' '}
                                    <span style={{ fontWeight: 'normal' }}>{state}</span>
                                </Typography>
                            }
                            {zipCode &&
                                <Typography sx={{ fontWeight: 'bold' }}>
                                    {dictionary.ZipCode}:{' '}
                                    <span style={{ fontWeight: 'normal' }}>
                                    {zipCode}
                                    </span>
                                </Typography>
                            }

                             {(errors.streetName || errors.city || errors.state || errors.zipCode || errors.country)&&
                             <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    border: '1px solid #f44336',
                                    borderRadius: 2,
                                    backgroundColor: 'transparent',
                                    p: 2,
                                    mt: 2,
                                }}
                              >
                                <WarningAmber sx={{ color: '#f44336', mr: 1 }} />
                                <Box>
                                  {errors.streetName && 
                                    <Typography
                                        color="error"
                                        variant="body2"
                                        sx={{ flex: 1, textAlign: 'center' }}
                                    >
                                      {errors.streetName}
                                  </Typography>
                                  }
                                  {errors.city && 
                                    <Typography
                                        color="error"
                                        variant="body2"
                                        sx={{ flex: 1, textAlign: 'center' }}
                                    >
                                      {errors.city}
                                  </Typography>
                                  }
                                  {errors.state && 
                                    <Typography
                                        color="error"
                                        variant="body2"
                                        sx={{ flex: 1, textAlign: 'center' }}
                                    >
                                      {errors.state}
                                  </Typography>
                                  }
                                  {errors.zipCode && 
                                    <Typography
                                        color="error"
                                        variant="body2"
                                        sx={{ flex: 1, textAlign: 'center' }}
                                    >
                                      {errors.zipCode}
                                  </Typography>
                                  }
                                  {errors.country && 
                                    <Typography
                                        color="error"
                                        variant="body2"
                                        sx={{ flex: 1, textAlign: 'center' }}
                                    >
                                      {errors.country}
                                  </Typography>
                                  }
                                </Box>
                                            
                              </Box>
                             }
                           
                        </Box>
                         <Box
                            sx={{
                                flex: 1,
                                px: 4,
                                py: 6,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                            }}
                            >
                             <MapSelector
                                initialCoords={location}
                                onLocationChange={handlechange} 
                             />
                        </Box>
                    </Box>
                    </motion.div>
                )}
                {activeStep === 3 && (
                  <motion.div
                      initial={{ opacity: 0, x: 100 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 100 }}
                      transition={{ duration: 0.8 }}
                    >
                    <Box>
                        <InputLabel>{dictionary.Summary}</InputLabel>
                        <Box mt={2} mb={2}>
                            <strong>{dictionary.OrganisationName}:</strong> {name}
                            <br />
                            <strong>{dictionary.email}:</strong> {emailOrganisation}
                            <br />
                            <strong>{dictionary.OransiationInfosDescription}:</strong> {description ?? dictionary.NoInfo}
                            {onlinePaymentSolutions!=null &&
                            <>
                              <br />
                              <strong>{dictionary.OnlinePaymentSolutions}:</strong> {onlinePaymentSolutions}
                            </>
                            }
                        </Box>
                        <Grid container spacing={2}>
                            {['light', 'dark'].map((mode) => {
                            const bgColor = mode === 'light' ? '#e1e0e1' : '#08040c'
                            const textColor = mode === 'light' ? '#000' : '#FFF'
                            return (
                                <Grid item xs={12} sm={6} key={mode} width={'250px'}>
                                <Typography>
                                    {mode === 'light'
                                    ? dictionary.LightMode
                                    : dictionary.DarkMode}
                                </Typography>
                                <Box borderRadius={2} overflow="hidden" boxShadow={3}>
                                    <Box
                                    height={26}
                                    bgcolor={mode === 'light'? "#ffffff" : "#18141c"}
                                    display="flex"
                                    color={textColor}
                                    >
                                    {preview && (
                                        <img
                                        src={preview}
                                        alt="logo"
                                        style={{ width: 18, height: 18, marginTop: 5 }}
                                        />
                                    )}
                                    <Box mt={1} ml={0.3} sx={{ fontSize: '8px' }}>
                                        {name}
                                    </Box>
                                    <Box
                                        sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        borderRadius: '4px',
                                        padding: '1px 3px',
                                         border: `1px solid ${mode === 'dark'? '#02060d' : '#858584'}`,
                                        backgroundColor:
                                            mode === 'dark'? '#02060d' : '#ffffff',
                                        width: '25%',
                                        height: '10px',
                                        mt: '8px',
                                        ml: '8px',
                                        }}
                                    >
                                        <InputBase
                                        sx={{ fontSize: '8px', color:"#858584" }}
                                        placeholder={dictionary.Search}
                                        />
                                        <SearchIcon
                                            sx={{ color: '#858584', cursor: 'pointer', width: '11px' }}
                                        />
                                    </Box>
                                    <IconButton
                                        color="inherit"
                                        sx={{
                                           background: `linear-gradient(to right, ${primaryColor},${primaryColor}, ${secondaryColor} )`,
                                           width:'17px',
                                           height:'17px',
                                           mt:0.5,
                                        color: mode === 'dark' ? 'white' : '#242424',
                                        cursor: 'pointer',
                                        ml: '90px',
                                        }}
                                    >
                                        <NotificationsActiveSharpIcon sx={{ width: '13px' }} />
                                    </IconButton>
                                    <IconButton 
                                    sx={{
                                           background: `linear-gradient(to right, ${primaryColor},${primaryColor}, ${secondaryColor} )`,
                                           width:'17px',
                                           height:'17px',
                                           mt:0.5,
                                        color: mode === 'dark' ? 'white' : '#242424',
                                        cursor: 'pointer',
                                      ml:0.25,
                                      mr:0.5
                                        }}
                                    >
                                        <Person4SharpIcon sx={{ width: '13px' }}/>
                                    </IconButton>
                                    </Box>
                                    <Box display="flex" height={160} bgcolor={bgColor}>
                                    <Box
                                        width="17%"
                                        bgcolor={mode === 'light'? "#ffffff" : "#18141c"}
                                        color={textColor}
                                    >
                                        <Divider />
                                        <List dense>
                                        {menuItems.map((item) => (
                                            <ListItem
                                            key={item.text}
                                            className={item.index === 0 ? 'active' : ''}
                                            sx={{ px: 1 }}
                                            >
                                            <ListItemIcon sx={{ minWidth: 10 }}>
                                                {React.cloneElement(item.icon, {
                                                sx: { fontSize: 5 },
                                                })}
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={item.text}
                                                primaryTypographyProps={{ fontSize: '5px' }}
                                            />
                                            </ListItem>
                                        ))}
                                        </List>
                                    </Box>

                                    <Box flex={1} p={2} color={textColor}>
                                        <Box>
                                        <Box
                                            sx={{ display: 'flex', alignItems: 'center' }}
                                        >
                                            <Typography
                                            sx={{
                                                mr: 2,
                                                fontSize: '8px',
                                            }}
                                            >
                                            {dictionary.WelcomeBack} {user?.firstName}{' '}
                                            {user?.lastName}
                                            </Typography>
                                            <DotLottieReact
                                            src={hiAnimation}
                                            loop
                                            autoplay
                                            style={{ width: 20, height: 20 }}
                                            />
                                        </Box>
                                        <Box
                                            sx={{ display: 'flex', alignItems: 'center' }}
                                        >
                                            <MUIButton
                                            variant="contained"
                                            sx={{
                                                fontWeight: 500,
                                                fontSize: '6px',
                                                minWidth: 'auto',
                                                height: 15,
                                                px: 1,
                                                borderRadius: '10px',
                                                backgroundColor: primaryColor,
                                                color: textColor,
                                                '&:hover': {
                                                backgroundColor: darken(primaryColor, 0.2)
                                                },
                                            }}
                                            >
                                            {dictionary.PrimaryColor}
                                            </MUIButton>
                                            <MUIButton
                                            variant="contained"
                                            sx={{
                                                ml: 1,
                                                fontWeight: 500,
                                                fontSize: '6px',
                                                minWidth: 'auto',
                                                height: 15,
                                                px: 1,
                                                borderRadius: '10px',
                                                backgroundColor: 'transparent',
                                                border: `2px solid ${primaryColor}`,
                                                color: primaryColor,
                                                '&:hover': {
                                                backgroundColor: primaryColor,
                                                color: 'white',
                                                },
                                            }}
                                            >
                                            {dictionary.PrimaryColor}
                                            </MUIButton>
                                        </Box>
                                        <Box
                                            sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            mt: 0.5,
                                            }}
                                        >
                                            <MUIButton
                                            variant="contained"
                                            sx={{
                                                fontWeight: 500,
                                                fontSize: '6px',
                                                minWidth: 'auto',
                                                height: 15,
                                                px: 1,
                                                borderRadius: '10px',
                                                backgroundColor: secondaryColor,
                                                color: textColor,
                                                '&:hover': {
                                                backgroundColor: darken(secondaryColor, 0.2)
                                                },
                                            }}
                                            >
                                            {dictionary.SecondaryColor}
                                            </MUIButton>
                                            <MUIButton
                                            variant="contained"
                                            sx={{
                                                ml: 1,
                                                fontWeight: 500,
                                                fontSize: '6px',
                                                minWidth: 'auto',
                                                height: 15,
                                                px: 1,
                                                borderRadius: '10px',
                                                backgroundColor: 'transparent',
                                                border: `2px solid ${secondaryColor}`,
                                                color: secondaryColor,
                                                '&:hover': {
                                                backgroundColor: secondaryColor,
                                                color: 'white',
                                                },
                                            }}
                                            >
                                            {dictionary.SecondaryColor}
                                            </MUIButton>
                                        </Box>
                                        <Box
                                            sx={{
                                            width: '50%',
                                            maxWidth: 220,
                                            ml: '100px',
                                            height: 'auto',
                                            bgcolor: 'white',
                                            boxShadow: 6,
                                            borderRadius: 3,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            overflow: 'hidden',
                                            }}
                                        >
                                            <Box
                                            sx={{
                                                position: 'relative',
                                                width: '100%',
                                                height: '70%',
                                                background: `linear-gradient(to bottom,#373b44, ${primaryColor}, rgba(255,255,255,0.6) 85%, white 100%)`,
                                                p: 1,
                                                pb: '90%',
                                            }}
                                            >
                                            <Box
                                                sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                }}
                                            >
                                                <Box sx={{ display: 'flex' }}>
                                                <img
                                                    src={preview}
                                                    alt="Logo"
                                                    style={{ width: '18px' }}
                                                />
                                                </Box>
                                                <Typography
                                                sx={{
                                                    color: 'white',
                                                    textAlign: 'right',
                                                    fontSize: '8px',
                                                }}
                                                >
                                                {name}
                                                </Typography>
                                            </Box>
                                            <Typography
                                                sx={{
                                                color: '#d0d6de',
                                                fontWeight: 600,
                                                fontSize: '6px',
                                                ml: '5px',
                                                mt: '3px',
                                                }}
                                            >
                                                {dictionary.Hi} {user?.firstName} {' '} {user?.lastName} 👋
                                            </Typography>
                                            <MUIButton
                                                sx={{
                                                width: '10%',
                                                mt: 0.5,
                                                py: 0.5,
                                                px: 0.5,
                                                borderRadius: '10px',
                                                background: 'white',
                                                color: 'black',
                                                fontWeight: 600,
                                                textTransform: 'none',
                                                fontSize: '3px',
                                                boxShadow: 3,
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                '&:hover': {
                                                    color: primaryColor,
                                                },
                                                }}
                                            >
                                                <span>{dictionary.TalkToAgent}</span>
                                                <SendIcon
                                                sx={{ fontSize: 7, color: primaryColor }}
                                                />
                                            </MUIButton>
                                            <MUIButton
                                                sx={{
                                                width: '10%',
                                                mt: 0.5,
                                                py: 0.5,
                                                px: 0.5,
                                                borderRadius: '10px',
                                                background: `linear-gradient(to bottom, #373b44, ${primaryColor})`,
                                                color: 'white',
                                                fontWeight: 600,
                                                textTransform: 'none',
                                                fontSize: '3px',
                                                boxShadow: 3,
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                '&:hover': {
                                                    color: 'black',
                                                },
                                                }}
                                            >
                                                <span>{dictionary.TalkToChatbot}</span>
                                                <SendIcon
                                                sx={{ fontSize: 7, color: 'black' }}
                                                />
                                            </MUIButton>
                                            </Box>
                                        </Box>
                                        </Box>
                                    </Box>
                                    </Box>
                                </Box>
                                </Grid>
                            )
                            })}
                        </Grid>
                    </Box>
                    </motion.div>
                )} 
                  <Box mt={3} display="flex" justifyContent="space-between">
                    <Box>
                      <Button variant="primary outlined" onClick={() => setOpenTutorial(true)}>
                        <>
                          <QuizIcon sx={{ mr: 0.5, mb: 0.2, color:user.organization.primaryColor }} />
                          {dictionary.ShowTutorial}
                        </>
                      </Button>
                      <Button
                        variant="primary"
                        dis={activeStep === 0}
                        onClick={() => setActiveStep((prev) => prev - 1)}
                      >
                        {dictionary.prev}
                      </Button>
                    </Box>
                    {activeStep === steps.length - 1 ? (
                    <Button variant="primary" onClick={handleSubmit}>
                        {dictionary.confirm}
                    </Button>
                    ) : (
                    <Button variant="primary" onClick={handleNext}>
                        {dictionary.Next}
                    </Button>
                    )}
                </Box> 
            </DialogContent>
       </Dialog>
       <Dialog open={openTutorial} onClose={handleCloseTutorial}
        TransitionComponent={Transition}  
        maxWidth="lg">
          <DialogTitle>
                { dictionary.Tutorial}
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
              <video
                src={"https://dl.dropboxusercontent.com/scl/fi/wcwfi92xftzba78xu0ar1/organisationForm.mp4?rlkey=tgxfsplx1749uytk6rcqkdhxd&st=idhy9fwg&dl=0"}
                autoPlay
                loop
                muted
                playsInline
                style={{ width: '100%' }}
              />
            </DialogContent>
        </Dialog>
  </Box>
 )
}
 OrganisationFormStepper.propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func,
    organisation: PropTypes.object,
  }

export default OrganisationFormStepper
