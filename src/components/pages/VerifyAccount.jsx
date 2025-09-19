import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import authService from '../../services/authService'
import { useLanguage } from '../../hooks/LanguageContext'
import HeaderFront from '../layout/HeaderFront'
import { Box, Typography, Container, useTheme } from '@mui/material'
import CustomSnackbar from '../ui/CustomSnackbar'
import Loader from '../ui/Loader'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import errorAnimation from '../../assets/animation/error.lottie'
import successAnimation from '../../assets/animation/success.lottie'

const VerifyAccount = () => {
  const { dictionary } = useLanguage()
  const navigate = useNavigate()
  const theme = useTheme()
  const [searchParams] = useSearchParams()
  const [typeSnack, setTypeSnack] = useState(null)
  const [messageSnack, setMessageSnack] = useState(null)
  const [openSnackBar, setOpenSnackBar] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [sucess, setSucess] = useState(false)
  const [message, setMessage] = useState(null)
  const [hasVerified, setHasVerified] = useState(false)

  useEffect(() => {
    setError(false)
    if (hasVerified) return
    const email = searchParams.get('email')
    if (email == null) {
      setError(true)
      setMessage(dictionary.MissingEmail)
      return
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setError(true)
      setMessage(dictionary.EmailFormatInvalid)
      return
    }
    const verify = async () => {
      setError(false)
      try {
        setLoading(true)
        const data = await authService.VerifyEmail(email)
        if (data) {
          setMessage(dictionary.OperationSeccesfull)
          setSucess(true)
          setHasVerified(true)
          setTimeout(() => {
            navigate('/login')
          }, 3000)
        }
      } catch (e) {
        setLoading(false)
        if (e?.response?.data?.message) {
          const message = e.response.data.message
          if (message === 'email not found') {
            setTypeSnack('error')
            setMessageSnack(dictionary.EmailNotFound)
            setOpenSnackBar(true)
          } else {
            setTypeSnack('error')
            setMessageSnack(dictionary.VerifyEmailFailed)
            setOpenSnackBar(true)
          }
        } else {
          setTypeSnack('error')
          setMessageSnack(dictionary.VerifyEmailFailed)
          setOpenSnackBar(true)
        }
      }
    }
    verify()
  }, [searchParams])
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
      <Box
        sx={{
          minHeight: '100vh',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 2,
        }}
      >
        <CustomSnackbar
          open={openSnackBar}
          message={messageSnack}
          type={typeSnack}
          onClose={() => setOpenSnackBar(false)}
        />
        <Loader loading={loading} />
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 4,
            }}
          >
            {error && (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                }}
              >
                <Box sx={{ flex: 1, maxWidth: 500 }}>
                  <DotLottieReact
                    src={errorAnimation}
                    loop
                    autoplay
                    style={{ width: '100%', height: 'auto' }}
                  />
                </Box>
                <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
                  <Typography
                    variant="h4"
                    sx={{
                      mb: 2,
                      fontWeight: 'bold',
                    }}
                  >
                    {message}
                  </Typography>
                </Box>
              </Box>
            )}
            {sucess && (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                }}
              >
                <Box sx={{ flex: 1, maxWidth: 500 }}>
                  <DotLottieReact
                    src={successAnimation}
                    loop
                    autoplay
                    style={{ width: '100%', height: 'auto' }}
                  />
                </Box>
                <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
                  <Typography
                    variant="h4"
                    sx={{
                      mb: 2,
                      fontWeight: 'bold',
                    }}
                  >
                    {message}
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        </Container>
      </Box>
    </Box>
  )
}

export default VerifyAccount
