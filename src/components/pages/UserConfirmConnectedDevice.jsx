import { useEffect, useState, useRef  } from 'react'
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

const UserConfirmConnectedDevice = () => {
  const { dictionary } = useLanguage()
  const navigate = useNavigate()
  const theme = useTheme()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [typeSnack, setTypeSnack] = useState(null)
  const [messageSnack, setMessageSnack] = useState(null)
  const [openSnackBar, setOpenSnackBar] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [sucess, setSucess] = useState(false)
  const [message, setMessage] = useState(null)

  const hasVerified = useRef(false)

 useEffect(() => {
  const verify = async () => {
    if (!token || hasVerified.current) return
    hasVerified.current = true

    try {
      setError(false)
      setLoading(true)

      const data = await authService.ConfirmDevice(token)
      if (data) {
        setSucess(true)
        setMessage(dictionary.OperationSeccesfull)
        setTimeout(() => {
          navigate('/login')
        }, 3000)
      }
    } catch (e) {
      setError(true)
      if (e?.response?.data?.message) {
        const msg = e.response.data.message
        if (msg === 'Invalid or expired confirmation token.') {
          setTypeSnack('error')
          setMessageSnack(dictionary.InvalidConfirmationToken)
        } else {
          setTypeSnack('error')
          setMessageSnack(dictionary.UnknownError)
        }
      } else {
        setTypeSnack('error')
        setMessageSnack(dictionary.UnknownError)
      }
      setOpenSnackBar(true)
    } finally {
      setLoading(false)
    }
  }

  verify()
}, [token])

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
                    {messageSnack}
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

export default UserConfirmConnectedDevice
