import PropTypes from 'prop-types'
import { Box, Typography } from '@mui/material'
import { motion } from 'framer-motion'
import { useLanguage } from '../../../hooks/LanguageContext'
import StripeCheckoutButton from '../StripeCheckoutButton'
import SquareCheckoutButton from '../SquareCheckoutButton'
import Modal from '../../ui/Modal'

const PayOrder = ({ open, onClose, order }) => {
  const { dictionary } = useLanguage()
  const deliveryCosts = Number(order?.deliveryCosts || 0)

const amountStripe = (order?.sparePartOrders != null && order?.sparePartOrders.length > 0)
  ? (() => {
      let total = 0
      let totalTvaAmount = 0

      for (const sparePartOrder of order.sparePartOrders) {
        const price = Number(sparePartOrder?.sparePart?.price || 0)
        const tva = Number(sparePartOrder?.sparePart?.tva || 0)
        const quantity = Number(sparePartOrder?.quantity || 1)
        const tvaAmount = tva === 0 ? 0 : ((price * tva) / 100) * quantity

        total += price * quantity
        totalTvaAmount += tvaAmount
      }

      return Math.round((total + totalTvaAmount + deliveryCosts) * 100)
    })()
  : 0
const amountSquare=(order?.sparePartOrders != null && order?.sparePartOrders.length > 0)
  ? (() => {
      let total = 0
      let totalTvaAmount = 0

      for (const sparePartOrder of order.sparePartOrders) {
        const price = Number(sparePartOrder?.sparePart?.price || 0)
        const tva = Number(sparePartOrder?.sparePart?.tva || 0)
        const quantity = Number(sparePartOrder?.quantity || 1)
        const tvaAmount = tva === 0 ? 0 : ((price * tva) / 100) * quantity

        total += price * quantity
        totalTvaAmount += tvaAmount
      }

      return (total + totalTvaAmount + deliveryCosts)
    })()
  : 0

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{ width: { xs: '350px', sm: '450px', md: '650px', lg: '950px' } }}>
        <Typography variant="h5" align="center" sx={{ fontWeight: 'bold' }}>
          {order?.paymentMethod === 'stripe'
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
              {order?.paymentMethod === 'stripe' ? (
                <div>
                     <StripeCheckoutButton
                  amount={amountStripe}
                  name={`${dictionary.Order} ${order?.id}`}
                  id={order?.id}
                  type="Order"
                />
                </div>
               
              ) : (
                <div>
                   <SquareCheckoutButton
                  amount={amountSquare}
                  name={`${dictionary.Order} ${order?.id}`}
                  id={order?.id}
                  type="Order"
                />
                </div>
               
              )}
          </Box>
        </motion.div>
      </Box>
    </Modal>
  )
}

PayOrder.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  order: PropTypes.object,
}

export default PayOrder
