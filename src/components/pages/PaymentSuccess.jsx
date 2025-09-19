import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Box, Typography, Container, useTheme } from '@mui/material'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import successAnimation from '../../assets/animation/success.lottie'
import OrganisationService from '../../services/OrganisationService'
import { useLanguage } from '../../hooks/LanguageContext'

const PaymentSuccess = () => {
  const { dictionary, currency } = useLanguage()
  const [searchParams] = useSearchParams()
  const theme = useTheme()
  const solution = searchParams.get('solution')
  const isDark = theme.palette.mode === 'dark'
  const amount =(solution!=null && solution==='stripe') ? (Number(searchParams.get('amount'))/100) : searchParams.get('amount')
  const date = searchParams.get('date')
  const id = searchParams.get('id')
  const type = searchParams.get('type')

  useEffect(() => {
    const sendEvent = async () => {
      if (id != null && type!= null) {
        await OrganisationService.SendEvent(id, type)
      }
    }
    sendEvent()
  }, [id, type])

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
            src={successAnimation}
            loop
            autoplay
            style={{ width: '100%', height: 'auto' }}
          />
        </Box>

        <Typography variant="h6" fontWeight="bold" gutterBottom>
          {dictionary.PaymentSuccessful}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {dictionary.ThankYou}
        </Typography>

        <Box
          sx={{
            border: `1px solid ${isDark ? '#555' : '#ccc'}`,
            borderRadius: 2,
            p: 2,
            mt: 4,
            display: 'flex',
            justifyContent: 'space-between',
            gap: 3,
            maxWidth: 400,
            mx: 'auto',
            backgroundColor: isDark ? '#1e1e1e' : '#f9f9f9',
          }}
        >
          <Box textAlign="left" flex={1}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {dictionary.AmountPaid}:
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {dictionary.DateTime}:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {dictionary.TransactionType}:
            </Typography>
          </Box>

          <Box textAlign="right" flex={1}>
            <Typography variant="body2" fontWeight="bold" gutterBottom>
              {currency}{amount}
            </Typography>
            <Typography variant="body2" fontWeight="bold" gutterBottom>
              {date}
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              {type}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Container>
  )
}

export default PaymentSuccess
