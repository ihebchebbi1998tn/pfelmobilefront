import { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Container,
  TextField,
  Link,
  InputAdornment,
  IconButton,
  Typography,
  useTheme,
} from '@mui/material'
import {
  Visibility,
  VisibilityOff,
  WarningAmber,
  Done as DoneIcon,
} from '@mui/icons-material'
import { useSearchParams, useNavigate } from 'react-router-dom'
import HeaderFront from '../layout/HeaderFront'
import Loader from '../ui/Loader'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import animationData from '../../assets/animation/forgetPassword.lottie'
import authService from '../../services/authService'
import { useLanguage } from '../../hooks/LanguageContext'

const Resetpassword = () => {
  const theme = useTheme()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const isDark = theme.palette.mode === 'dark'
  const { dictionary } = useLanguage()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const currentYear = new Date().getFullYear()
  const [authError, setAuthError] = useState(null)
  const [restPasswordStatus, setRestPasswordStatus] = useState(false)
  const [email, setEmail] = useState(null)
  const [token, setToken] = useState(null)
  const [password, setPassword] = useState(null)
  const [confirmPassword, setConfirmPassword] = useState(null)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    setErrors({})
    const newErrors = {}
    const Email = searchParams.get('email')
    const Token = searchParams.get('token')
    if (Email == null) {
      newErrors.general = dictionary.MissingEmail
      setErrors(newErrors)
      return
    } else if (!/\S+@\S+\.\S+/.test(Email)) {
      newErrors.general = dictionary.EmailFormatInvalid
      setErrors(newErrors)
      return
    } else if (Token == null) {
      newErrors.general = dictionary.CodeVerificationRequired
      setErrors(newErrors)
      return
    }
    setErrors({})
    setEmail(Email)
    setToken(Token)
  }, [searchParams])
  const validate = () => {
    const newErrors = {}
    if (!password) {
      newErrors.password = dictionary.passwordRequired
    } else if (password.length < 6) {
      newErrors.password = dictionary.invalidpassword
    } else if (!/[!@#$%^&*(),.?":{}|<>_\-+=/\\[\]]/.test(password)) {
      newErrors.password = dictionary.passwordRequiresNonAlphanumeric
    } else if (!/[a-z]/.test(password)) {
      newErrors.password = dictionary.passwordRequiresLower
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password = dictionary.passwordRequiresUpper
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = dictionary.confirmPasswordRequired
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = dictionary.passwordsDoNotMatch
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (validate()) {
      try {
        setLoading(true)
        setAuthError(null)
        const data = await authService.resetPassword(email, token, password)
        if (data) {
          setLoading(false)
          setRestPasswordStatus(true)
        }
      } catch (e) {
        setLoading(false)
        if (e?.response?.data?.message) {
          const message = e.response.data.message
          if (message === 'email not found') {
            setAuthError(dictionary.EmailNotFound)
          } else if (message === 'Invalid token.') {
            setAuthError(dictionary.InvalidToken)
          } else {
            setAuthError(dictionary.GenerateTokenFailed)
          }
        } else {
          setAuthError(dictionary.GenerateTokenFailed)
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
              {dictionary.ChangePaassword}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {dictionary.ChangePasswordDescription}
            </Typography>
            <TextField
              label={dictionary.password}
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
            <TextField
              label={dictionary.confirmPassword}
              fullWidth
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={errors.confirmPassword}
              margin="normal"
              variant="outlined"
              type={showConfirmPassword ? 'text' : 'password'}
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
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        edge="end"
                      >
                        {showConfirmPassword ? (
                          <VisibilityOff sx={{color:isDark ? '#8a62ef' : ''}}/>
                        ) : (
                          <Visibility sx={{color:isDark ? '#8a62ef' : ''}}/>
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            {errors.confirmPassword && (
              <Typography color="error" variant="caption">
                {errors.confirmPassword}
              </Typography>
            )}
            <Button
              variant="contained"
              fullWidth
              onClick={handleSubmit}
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
              {dictionary.ResetPassword}
            </Button>
            {errors.general && (
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
                  {errors.general}
                </Typography>
              </Box>
            )}
            {authError && !restPasswordStatus && (
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
                  {authError}
                </Typography>
              </Box>
            )}
            {restPasswordStatus && (
              <>
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
                    {dictionary.PasswordChangedSuccessfully}
                  </Typography>
                </Box>

                <Button
                  variant="contained"
                  color="success"
                  sx={{ mt: 2 }}
                  onClick={() => navigate('/login')}
                >
                  {dictionary.GotoLoginPage}
                </Button>
              </>
            )}
          </Container>
        </Box>
      </Box>
    </Box>
  )
}

export default Resetpassword
