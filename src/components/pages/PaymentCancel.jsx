import { Box, Typography, Container, useTheme } from '@mui/material'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import errorAnimation from '../../assets/animation/error.lottie'
import { useLanguage } from '../../hooks/LanguageContext'

const PaymentCancel = () => {
  const { dictionary, } = useLanguage()
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  return (
    <Container
      maxWidth="sm"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
         border: `1px solid ${isDark ? '#555' : 'ccc'}`,
        borderRadius: 2,
        backgroundColor: isDark ? '#1e1e1e' : '#f9f9f9',
      }}
    >
      <Box textAlign="center" width="100%">
        <Box sx={{ maxWidth: 300, mx: 'auto', mb: 3 }}>
          <DotLottieReact
            src={errorAnimation}
            loop
            autoplay
            style={{ width: '100%', height: 'auto' }}
          />
        </Box>

        <Typography variant="h6" fontWeight="bold" gutterBottom>
          {dictionary.PaymentCanceled}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {dictionary.PaymentCanceledTryAgain}
        </Typography>
      </Box>
    </Container>
  )
}

export default PaymentCancel

