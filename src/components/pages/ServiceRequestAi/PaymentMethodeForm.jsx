import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Box, Typography } from '@mui/material'
import ServiceAiRequest from '../../../services/ServiceAiRequest'
import { useLanguage } from '../../../hooks/LanguageContext'
import { useAuth } from '../../../hooks/AuthContext'
import CustomSnackbar from '../../ui/CustomSnackbar'
import Dropdown from '../../ui/Dropdown'
import Modal from '../../ui/Modal'
import PropTypes from 'prop-types'

const PaymentMethodeForm = ({ open, onClose, service }) => {
  const { toggleLoader } = useOutletContext()
  const { dictionary } = useLanguage()
  const { user } = useAuth()
  const [paymentMethod, setPaymentMethod] = useState('')
  const [typeSnack, setTypeSnack] = useState(null)
  const [messageSnack, setMessageSnack] = useState(null)
  const [openSnackBar, setOpenSnackBar] = useState(false)
  const [errors, setErrors] = useState({})

  let paymentMethodOptions = 
  (user.organization && user.organization.onlinePaymentSolutions) ? 
  [
    { value: 'Cash', label: dictionary.Cash },
    { value: user.organization.onlinePaymentSolutions, label: dictionary.EnLigne + ' (' + user.organization.onlinePaymentSolutions + ')' },
  ] : []

  const handleDropdownPaymentMethod = (event) => {
    setPaymentMethod(event.target.value)
  }
  const resetForm = () => {
    setPaymentMethod('')
    setErrors({})
    }

 const handleSubmit = async () => {
  if (!validate()) return
  toggleLoader(true)
  try {
      await ServiceAiRequest.addPaymentMethode(service.id, paymentMethod)
    setTypeSnack('success')
    setMessageSnack(dictionary.OperationSeccesfull)
    setOpenSnackBar(true)
    resetForm()
    onClose()
  } catch (e) {
    const message = e?.response?.data?.message
    setTypeSnack('error')
    setMessageSnack(
      message ||
      dictionary.UpdateServiceRequestFailed 
    )
    setOpenSnackBar(true)
  } finally {
    toggleLoader(false)
  }
}

 const validate = () => {
    const newErrors = {}
    if (!paymentMethod) {
      newErrors.paymentMethod = dictionary.PaymentMethodeRequired
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

 return (
    <Box>
        <CustomSnackbar
        open={openSnackBar}
        message={messageSnack}
        type={typeSnack}
        onClose={() => setOpenSnackBar(false)}
      />
     <Modal
        open={open}
        onClose={onClose}
        showConfirmButton={true}
        onConfirm={handleSubmit}
        labelConfirmButton={dictionary.confirm}
        >
        <Box sx={{ width: { xs: '90vw', sm: '650px', md: '900px' } }}>
            <Typography variant="h5" align="center" sx={{ fontWeight: 'bold' }}>
            {dictionary.AddMethodePayment}
            </Typography>

            <Box mt={3}>
                <label style={{ color: '#a3a3a3' }}>{dictionary.HowDoYouWantToPay}</label>
                    <Dropdown
                      options={paymentMethodOptions}
                      value={paymentMethod}
                      label={dictionary.HowDoYouWantToPay}
                      onChange={handleDropdownPaymentMethod}
                      iserror={errors.paymentMethod}
                    />
                {errors.paymentMethod && (
                        <Typography color="error" variant="caption">
                            {errors.paymentMethod}
                        </Typography>
                    )}
            </Box>
        </Box>
    </Modal>
 </Box>
 )
}
 PaymentMethodeForm.propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func,
    service: PropTypes.object,
  }
export default PaymentMethodeForm