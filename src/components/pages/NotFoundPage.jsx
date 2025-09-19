import { useNavigate } from 'react-router-dom'
import { Box, Typography, Container, Button, useTheme } from '@mui/material'
import HeaderFront from '../layout/HeaderFront'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import notFoundAnimation from '../../assets/animation/404.lottie'
import { useLanguage } from '../../hooks/LanguageContext'

const NotFoundPage = () => {
  const theme = useTheme()
  const navigate = useNavigate()
  const { dictionary } = useLanguage()
  const isDark = theme.palette.mode === 'dark'
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

      <Container maxWidth="lg">
        <Box
          sx={{
            pt: 30,
            pl: 5,
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 4,
          }}
        >
          <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
            <Typography
              variant="h4"
              sx={{
                mb: 2,
                fontWeight: 'bold',
              }}
            >
              {dictionary.notFoundTitle}
            </Typography>
            <Typography
              variant="h6"
              sx={{
                mb: 3,
              }}
            >
              {dictionary.notFoundDescription}
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate(-1)}
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
              {' '}
              {dictionary.GoBack}
            </Button>
          </Box>
          <Box sx={{ flex: 1, maxWidth: 500 }}>
            <DotLottieReact
              src={notFoundAnimation}
              loop
              autoplay
              style={{ width: '100%', height: 'auto' }}
            />
          </Box>
        </Box>
      </Container>
    </Box>
  )
}

export default NotFoundPage
