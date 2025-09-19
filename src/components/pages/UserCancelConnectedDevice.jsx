import { Box, Typography, Container, useTheme } from '@mui/material'
import HeaderFront from '../layout/HeaderFront'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import successAnimation from '../../assets/animation/success.lottie'
import { useLanguage } from '../../hooks/LanguageContext'

const UserCancelConnectedDevice = () => {
  const theme = useTheme()
  const { dictionary } = useLanguage()

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
        <Container maxWidth="lg">
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
                {dictionary.DeviceBlockedSuccessfully}
              </Typography>
              <Typography variant="body1" color="text.secondary">
               {dictionary.YoucanClosethisPage}
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  )
}

export default UserCancelConnectedDevice
