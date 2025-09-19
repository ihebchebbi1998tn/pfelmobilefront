import { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Container,
  TextField,
  Link,
  Typography,
  useTheme,
} from '@mui/material'
import { WarningAmber, Done as DoneIcon } from '@mui/icons-material'
import HeaderFront from '../layout/HeaderFront'
import Loader from '../ui/Loader'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import animationData from '../../assets/animation/forgetPassword.lottie'
import authService from '../../services/authService'
import { useLanguage } from '../../hooks/LanguageContext'

const ForgetPassword = () => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const { dictionary } = useLanguage()
  const [loginError, setLoginError] = useState(null)
  const [restPasswordStatus, setRestPasswordStatus] = useState(false)
  const currentYear = new Date().getFullYear()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [showRetryMsg, setShowRetryMsg] = useState(false)
  const [buttonDisabled, setButtonDisabled] = useState(false)
  const [retryCountdown, setRetryCountdown] = useState(30)
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    let successTimer, retryTimer

    if (restPasswordStatus) {
      setShowSuccess(true)
      successTimer = setTimeout(() => {
        setShowSuccess(false)
        setShowRetryMsg(true)
        setButtonDisabled(true)
        setRetryCountdown(30)
      }, 4000)
    }

    return () => {
      clearTimeout(successTimer)
      clearTimeout(retryTimer)
    }
  }, [restPasswordStatus])

  useEffect(() => {
    let interval
    if (buttonDisabled) {
      interval = setInterval(() => {
        setRetryCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval)
            setButtonDisabled(false)
            setShowRetryMsg(false)
            return 30
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [buttonDisabled])

  const validate = () => {
    const newErrors = {}
    if (!email) {
      newErrors.email = dictionary.emailRequired
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = dictionary.invalidEmail
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (validate()) {
      try {
        setLoading(true)
        setLoginError(null)
        const data = await authService.generateResetToken(email)
        if (data) {
          setRestPasswordStatus(true)
          setLoading(false)
        }
      } catch (e) {
        setLoading(false)
        if (e?.response?.data?.message) {
          const message = e.response.data.message
          if (message === 'email not found') {
            setLoginError(dictionary.EmailNotFound)
          } else {
            setLoginError(dictionary.GenerateTokenFailed)
          }
        } else {
          setLoginError(dictionary.GenerateTokenFailed)
        }
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
      <Box sx={{ flex: 1, display: 'flex' }}>
        <Box
          sx={{
            flex: 1,
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: isDark ? '#1e1e2f' : '#f3f4f6',
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
            sx={{ mt: 4, textAlign: 'center', color: 'text.secondary' }}
          >
            © {currentYear} {dictionary.ClientPortal} .L-Mobile{' '}
            {dictionary.AllRightsReserved}{' '}
            <Link
              href="#"
              underline="hover"
              sx={{ color: isDark ? '#8a62ef' : 'primary' }}
            >
              {dictionary.TermsAndPrivacy}
            </Link>
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
              {dictionary.PasswordRecoveryTitle}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {dictionary.PasswordRecoveryDescription}
            </Typography>

            <TextField
              label={dictionary.email}
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              variant="outlined"
              type="email"
              error={Boolean(errors.email)}
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

            <Button
              variant="contained"
              fullWidth
              onClick={handleSubmit}
              disabled={buttonDisabled}
              sx={{
                mt: 3,
                py: 1.5,
                fontWeight: 'bold',
                backgroundColor: isDark ? '#8a62ef' : '#669fe2',
                '&:hover': {
                  backgroundColor: isDark ? '#7754d6' : '#4d8cd3',
                },
              }}
            >
              {buttonDisabled ? dictionary.TryAgain : dictionary.ResetPassword}
            </Button>

            {loginError && !restPasswordStatus && (
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

            {showSuccess && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '1px solid rgb(54, 244, 95)',
                  borderRadius: 2,
                  backgroundColor: 'transparent',
                  p: 2,
                  mt: 2,
                }}
              >
                <DoneIcon sx={{ color: 'rgb(54, 244, 95)', mr: 1 }} />
                <Typography
                  variant="body2"
                  sx={{
                    flex: 1,
                    textAlign: 'center',
                    color: 'rgb(54, 244, 95)',
                  }}
                >
                  {dictionary.EmailResetSented}
                </Typography>
              </Box>
            )}

            {showRetryMsg && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 2, textAlign: 'center' }}
              >
                {dictionary.EmailNotReceivedTryAgainLater} ({retryCountdown}s)
              </Typography>
            )}
          </Container>
        </Box>
      </Box>
    </Box>
  )
}

export default ForgetPassword
