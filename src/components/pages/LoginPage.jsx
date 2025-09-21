import { useState } from 'react'
import {
  Box,
  Button,
  Checkbox,
  Container,
  FormControlLabel,
  TextField,
  Link,
  InputAdornment,
  IconButton,
  Typography,
  useTheme,
} from '@mui/material'
import { Visibility, VisibilityOff, WarningAmber } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import HeaderFront from '../layout/HeaderFront'
import Loader from '../ui/Loader'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import animationData from '../../assets/animation/login.lottie'
import authService from '../../services/authService'
import { useLanguage } from '../../hooks/LanguageContext'
import { useAuth } from '../../hooks/AuthContext'
import { getDeviceInfo } from '../../utils/getDeviceInfo'
import { motion } from 'framer-motion'

const LoginPage = () => {
  const theme = useTheme()
  const navigate = useNavigate()
  const isDark = theme.palette.mode === 'dark'
  const { dictionary } = useLanguage()
  const { fetchUser } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const currentYear = new Date().getFullYear()
  const [loginError, setLoginError] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [openTermsAndPrivacy, setOpenTermsAndPrivacy] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const validate = () => {
    const newErrors = {}

    if (!email) {
      newErrors.email = dictionary.emailRequired
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = dictionary.invalidEmail
    }

    if (!password) {
      newErrors.password = dictionary.passwordRequired
    } else if (password.length < 6) {
      newErrors.password = dictionary.invalidpassword
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
const handleSubmitPrev =  () => {
  setAcceptTerms(true)
  setOpenTermsAndPrivacy(false)
  handleSubmit()
}
  const handleSubmit = async () => {
    if (!validate()) {
      setAcceptTerms(false)
      setOpenTermsAndPrivacy(false)
      return
    }
      try {
        setLoading(true)
        setLoginError(null)
        
        const { deviceType, operatingSystem, browser } = await getDeviceInfo()

        const data = await authService.login(email, password, remember, deviceType, operatingSystem, browser)
        if (data) {
          setLoading(false)
          await fetchUser()
          navigate('/')
          window.location.reload()
        }
      } catch (e) {
        setLoading(false)
        if (e?.response?.data?.message) {
          const message = e.response.data.message
          if (message === 'User not found') {
            setLoginError(dictionary.IncorrectCredentials)
          } else if (message === 'sorry you are banned') {
            setLoginError(dictionary.SorryYouAreBanned)
          } else if (message === 'Account deleted') {
            setLoginError(dictionary.AccountDeleted)
          } else if (message === 'Unconfirmed email') {
            setLoginError(dictionary.UnconfirmedEmail)
          } else if (message === 'Organization deleted') {
            setLoginError(dictionary.OrganizationDeleted)
          } else if (message === 'User has no assigned roles') {
            setLoginError(dictionary.RoleDeleted)
          }else if (message === 'Incorrect password') {
            setLoginError(dictionary.IncorrectCredentials)
          } else if (
            message ===
            'Your account is locked due to too many failed login attempts'
          ) {
            setLoginError(dictionary.TooManyAttempts)
          }else if (message === 'New device detected. Please confirm via your email.') {
            setLoginError(dictionary.NewUserDeviceDetected)
          } else {
            setLoginError(dictionary.LoginFailed)
          }
        } else {
          setLoginError(dictionary.LoginFailed)
        }
      }
    
  }
  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: theme.palette.background.default,
        transition: 'all 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <HeaderFront />
      <Loader loading={loading} />
      <Box
        sx={{
          flex: 1,
          display: 'flex',
        }}
      >
        <Box
          sx={{
            flex: 1,
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: theme.palette.mode === 'dark' ? '#1e1e2f' : '#f3f4f6',
            py: 4,
            px: 2,
          }}
        >
          <Box
            sx={{
              width: '100%',
              maxWidth: 500,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexGrow: 1,
            }}
          >
            <DotLottieReact
              src={animationData}
              loop
              autoplay
              style={{ width: '100%', height: 'auto' }}
            />
          </Box>
          <Typography
            variant="body2"
            sx={{
              mt: 4,
              textAlign: 'center',
              color: 'text.secondary',
            }}
          >
            © {currentYear} {dictionary?.ClientPortal || 'Client Portal'} .L-Mobile{' '}
            {dictionary?.AllRightsReserved || 'All rights reserved'}{' '}
            <Button
              onClick={() => setOpenTermsAndPrivacy(true)}
              sx={{ color: isDark ? '#8a62ef' : 'primary' }}
            >
              {dictionary?.TermsAndPrivacy || 'Terms & Privacy'}
            </Button>
          </Typography>
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
          <Container maxWidth="xs">
            <Typography variant="h5" gutterBottom fontWeight="bold">
              {dictionary?.WelcomeBack || 'Welcome back'} 👋
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {dictionary?.LoginToContinue || 'Please log in to continue'}
            </Typography>

            <TextField
              label={dictionary?.email || 'Email'}
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              variant="outlined"
              type="email"
              error={errors.email}
               sx={{
                '& .MuiOutlinedInput-root': {
                  color:  isDark ? '#8a62ef' : 'primary',
                  '& fieldset': {
                    borderColor: isDark ? '#8a62ef' : 'primary',
                  },
                  '&:hover fieldset': {
                    borderColor: isDark ? '#8a62ef' : 'primary',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: isDark ? '#8a62ef' : 'primary',
                    color:  isDark ? '#8a62ef' : 'primary',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: isDark ? '#8a62ef' : 'primary',
                }
              }}
            />
            {errors.email && (
              <Typography color="error" variant="caption">
                {errors.email}
              </Typography>
            )}
            <TextField
              label={dictionary?.password || 'Password'}
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              margin="normal"
              variant="outlined"
              type={showPassword ? 'text' : 'password'}
               sx={{
                '& .MuiOutlinedInput-root': {
                  color:  isDark ? '#8a62ef' : 'primary',
                  '& fieldset': {
                    borderColor: isDark ? '#8a62ef' : 'primary',
                  },
                  '&:hover fieldset': {
                    borderColor: isDark ? '#8a62ef' : 'primary',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: isDark ? '#8a62ef' : 'primary',
                    color:  isDark ? '#8a62ef' : 'primary',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: isDark ? '#8a62ef' : 'primary',
                }
              }}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword((prev) => !prev)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff sx={{color:isDark ? '#8a62ef' : ''}}/> : <Visibility sx={{color:isDark ? '#8a62ef' : ''}}/>}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            {errors.password && (
              <Typography color="error" variant="caption">
                {errors.password}
              </Typography>
            )}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mt: 1,
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={remember}
                    sx={{
                      '&.Mui-checked': {
                        color: isDark ? '#8a62ef' : '', 
                      },
                    }}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                }
                label={dictionary?.RememberMe || 'Remember me'}
                sx={{ color: 'text.secondary' }}
              />
              <Button
                variant="text"
                size="small"
                sx={{ color: isDark ? '#8a62ef' : 'primary' }}
                onClick={() => navigate('/forgetPassword')}
              >
                {dictionary?.ForgotPassword || 'Forgot password?'}
              </Button>
            </Box>

            <Button
              variant="contained"
              fullWidth
              onClick={() =>setOpenTermsAndPrivacy(true)}
              sx={{
                mt: 3,
                py: 1.5,
                fontWeight: 'bold',
                backgroundColor: isDark ? '#8a62ef' : 'primary',
                '&:hover': {
                  backgroundColor: isDark ? '#7754d6' : '#4d8cd3',
                },
              }}
            >
              {dictionary?.login || 'Login'}
            </Button>
            {loginError && (
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
                <Typography
                  color="error"
                  variant="body2"
                  sx={{ flex: 1, textAlign: 'center' }}
                >
                  {loginError}
                </Typography>
              </Box>
            )}
          </Container>
        </Box>
      </Box>
      {openTermsAndPrivacy &&
      <Box>
          <motion.div
            initial={{ y: '100%' }}  
            animate={{ y: openTermsAndPrivacy ? 0 : '100%' }} 
            transition={{ type: 'spring', stiffness: 300 }}  
            style={{
              position: 'fixed',
              bottom: 20,
              left: 0,
              right: 0,
              backgroundColor: theme.palette.background.default,
              boxShadow: '0 -4px 10px rgba(0, 0, 0, 0.1)',
              padding: '20px',
              zIndex: 9999,
            }}
          >
        <Box>
          <Typography variant="h5" gutterBottom fontWeight="bold">
              {dictionary?.AcceptanceOfTermsAndPrivacyPolicy || 'Accept Terms & Privacy Policy'} 
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {dictionary?.AcceptanceOfTermsAndPrivacyPolicyDesc || 'To continue, please accept our Terms & Privacy Policy.'}
            </Typography>
            <Box>
                <FormControlLabel
                control={
                  <Checkbox
                    checked={acceptTerms}
                    sx={{
                      '&.Mui-checked': {
                        color: isDark ? '#8a62ef' : '', 
                      },
                    }}
                    onChange={handleSubmitPrev}
                  />
                }
                label={dictionary?.Accept || 'Accept'}
                sx={{ color: 'text.secondary' }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={!openTermsAndPrivacy}
                    sx={{
                      '&.Mui-checked': {
                        color: isDark ? '#8a62ef' : '', 
                      },
                    }}
                    onChange={() => setOpenTermsAndPrivacy(false)}
                  />
                }
                label={dictionary?.close || 'Close'}
                sx={{ color: 'text.secondary' }}
              />
            </Box>
        </Box>
      </motion.div>
      </Box>
      }
    </Box>
  )
}

export default LoginPage
