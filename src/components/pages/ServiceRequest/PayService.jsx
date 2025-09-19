import PropTypes from 'prop-types'
import { Box, Typography } from '@mui/material'
import { motion } from 'framer-motion'
import { useLanguage } from '../../../hooks/LanguageContext'
import StripeCheckoutButton from '../StripeCheckoutButton'
import SquareCheckoutButton from '../SquareCheckoutButton'
import Modal from '../../ui/Modal'

const PayService = ({ open, onClose, service }) => {
  const { dictionary } = useLanguage()
  const amount = Math.round(Number(service?.charges || 0) * 100)
  const amountSquare= (service?.charges)

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{ width: { xs: '350px', sm: '450px', md: '650px', lg: '950px' } }}>
        <Typography variant="h5" align="center" sx={{ fontWeight: 'bold' }}>
          {service?.paymentMethod === 'stripe'
            ? dictionary.MakePaymentWithStripe
            : dictionary.MakePaymentWithSquare}
        </Typography>

        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          transition={{ duration: 0.8 }}
        >
          <Box sx={{display:'flex', justifyContent:'center', alignItems:'center', mt:5}}>
              {service?.paymentMethod === 'stripe' ? (
                <StripeCheckoutButton
                  amount={amount}
                  name={service?.title}
                  id={service?.id}
                  type="Service request"
                />
              ) : (
                <SquareCheckoutButton
                  amount={amountSquare}
                  name={service?.title}
                  id={service?.id}
                  type="Service request"
                />
              )}
          </Box>
        </motion.div>
      </Box>
    </Modal>
  )
}

PayService.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  service: PropTypes.object,
}

export default PayService
