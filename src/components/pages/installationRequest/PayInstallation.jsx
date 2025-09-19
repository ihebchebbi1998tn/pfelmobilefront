import PropTypes from 'prop-types'
import { Box, Typography } from '@mui/material'
import { motion } from 'framer-motion'
import { useLanguage } from '../../../hooks/LanguageContext'
import StripeCheckoutButton from '../StripeCheckoutButton'
import SquareCheckoutButton from '../SquareCheckoutButton'
import Modal from '../../ui/Modal'

const PayInstallation = ({ open, onClose, installation }) => {
  const { dictionary } = useLanguage()

  const price = Number(installation?.device?.price || 0)
  const tva = Number(installation?.device?.tva || 0)
  const charges = Number(installation?.installationCharges || 0)
  const tvaAmount = tva === 0 ? 0 : (price * tva) / 100
  const amount = Math.round((price + tvaAmount + charges) * 100)
  const amountSquare= (price + tvaAmount + charges)

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{ width: { xs: '350px', sm: '450px', md: '650px', lg: '950px' } }}>
        <Typography variant="h5" align="center" sx={{ fontWeight: 'bold' }}>
          {installation?.paymentMethod === 'stripe'
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
              {installation?.paymentMethod === 'stripe' ? (
                <StripeCheckoutButton
                  amount={amount}
                  name={`${dictionary.InstallationRequest} ${installation?.device?.name}`}
                  id={installation?.id}
                  type="Installation request"
                />
              ) : (
                <SquareCheckoutButton
                  amount={amountSquare}
                  name={`${dictionary.InstallationRequest} ${installation?.device?.name}`}
                  id={installation?.id}
                  type="Installation request"
                />
              )}
          </Box>
        </motion.div>
      </Box>
    </Modal>
  )
}

PayInstallation.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  installation: PropTypes.object,
}

export default PayInstallation
