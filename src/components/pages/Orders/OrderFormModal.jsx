import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { 
    Box, 
    Typography, 
    Stepper, 
    Step, 
    StepLabel, 
    IconButton, 
    TextField,
    FormControl,
    InputLabel,
    MenuItem,
    Chip,
    Select
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import { darken } from '@mui/material/styles'
import { motion } from 'framer-motion'
import orderService from '../../../services/orderService'
import sparePartService from '../../../services/sparePartService'
import { useLanguage } from '../../../hooks/LanguageContext'
import { useAuth } from '../../../hooks/AuthContext'
import CustomSnackbar from '../../ui/CustomSnackbar'
import Modal from '../../ui/Modal'
import Button from '../../ui/Button'
import Dropdown from '../../ui/Dropdown'
import PropTypes from 'prop-types'

const OrderFormModal = ({ open, onClose, order }) => {
    const { toggleLoader } = useOutletContext()
    const { dictionary, currency } = useLanguage()
    const { user } = useAuth()
    const isUpdate = Boolean(order)
    const [spareParts, setSpareParts] = useState(() => {
        if (!order?.sparePartOrders) return []
        return order.sparePartOrders.map(sparePartOrder => ({
            id: sparePartOrder.sparePart.id,
            title: sparePartOrder.sparePart.title,
            quantity: sparePartOrder.quantity,
        }))
    })
    const [listSpareParts, setListSpareParts] = useState([]) 
    const [paymentMethod, setPaymentMethod] = useState(order?.paymentMethod || '')
    const [typeSnack, setTypeSnack] = useState(null)
    const [messageSnack, setMessageSnack] = useState(null)
    const [openSnackBar, setOpenSnackBar] = useState(false)
    const [errors, setErrors] = useState({})
    const [activeStep, setActiveStep] = useState(0)
    const steps = (user.organization && user.organization.onlinePaymentSolutions) ? 
        isUpdate? [dictionary.ChooseSpareParts, dictionary.OrderInformations]:
        [dictionary.ChooseSpareParts, dictionary.OrderInformations, dictionary.HowDoYouWantToPay]
        : [dictionary.ChooseSpareParts, dictionary.OrderInformations]
    const isLastStep = activeStep === steps.length - 1
    let paymentMethodOptions = 
        (user.organization && user.organization.onlinePaymentSolutions) ? 
    [
            { value: 'Cash', label: dictionary.Cash },
            { value: user.organization.onlinePaymentSolutions, label: dictionary.EnLigne + ' (' + user.organization.onlinePaymentSolutions + ')' },
    ] : []
    let sparePartsOptions = (listSpareParts && listSpareParts.length>0) ? 
         listSpareParts.map((s) => ({ value: s.id, label: s.title }))
         : []
    const handleDropdownPaymentMethod = (event) => {
        setPaymentMethod(event.target.value)
    }
    const handleStepNext = () => {
        if (!validate()) return
        if (activeStep < steps.length - 1) {
        setActiveStep((prev) => prev + 1)
        }
    }
    const handleStepBack = () => {
        if (activeStep > 0) {
            setActiveStep((prev) => prev - 1)
        }
    }
    const returnSparePartInformations = (id) => {
        return listSpareParts.find(sp => sp.id === id) || null
    }
    const handleDropdownSparePart = (event) => {
        const selectedIds = event.target.value
        const selectedParts = selectedIds.map((id) => {
            const existing = spareParts.find((sp) => sp.id === id)
            if (existing) return existing

            const sparePart = returnSparePartInformations(id)
            return {
            id: sparePart.id,
            title: sparePart.title,
            quantity: 1,
            }
        })
        setSpareParts(selectedParts)
    }
    const resetForm = () => {
        setSpareParts([])
        setListSpareParts([])
        setPaymentMethod('')
        setActiveStep(0)
        setErrors({})
    }
    const validate = () => {
        const newErrors = {}
        if(activeStep===0){
            if (spareParts.length === 0) {
                newErrors.spareParts = { general: dictionary.ChooseSpareParts }
            }
        }else if (activeStep === 1) {
            newErrors.spareParts = {}

            spareParts.forEach((s, index) => {
            const parsedQuantity = parseInt(s.quantity, 10)

            if (isNaN(parsedQuantity)) {
                newErrors.spareParts[index] = { quantity: dictionary.QuantityMustBeANumber }
            } else if (parsedQuantity <= 0) {
                newErrors.spareParts[index] = { quantity: dictionary.QuantityMustBeGreaterThanZero }
            }
            })

            if (Object.keys(newErrors.spareParts).length === 0) {
                delete newErrors.spareParts
            }
        }else if(activeStep===2 && user.organization && user.organization.onlinePaymentSolutions){
            if (!paymentMethod) {
                newErrors.paymentMethod = dictionary.PaymentMethodeRequired
            }
        }
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }
    const handleQuantityChange = (index, value, mode) => {
    setSpareParts((prev) =>
        prev.map((part, i) => {
            if (i !== index) return part

            const partInfo = returnSparePartInformations(part.id)
            if (!partInfo) return part

            const maxAvailable = partInfo.quantity
            const currentQty = parseInt(part.quantity, 10) || 0

            if (mode === 'increment' && currentQty < maxAvailable) {
                return { ...part, quantity: currentQty + 1 }
            }

            if (mode === 'decrement' && currentQty >= 2) {
                return { ...part, quantity: currentQty - 1 }
            }

            if (value !== undefined) {
                const parsedValue = parseInt(value, 10)
                if (
                    !isNaN(parsedValue) &&
                    parsedValue > 0 &&
                    parsedValue <= maxAvailable
                ) {
                    return { ...part, quantity: parsedValue }
                }
            }

            return part
        })
    )
}


    const handleSubmit = async (e) => {
         e.preventDefault()
        if (!validate()) return
        try{
             toggleLoader(true)
            if(isUpdate){
                const formData = new FormData()
                formData.append('id', order.id)
                spareParts.forEach((sparePart, index) => {
                    formData.append(`spareParts[${index}].id`, sparePart.id)
                    formData.append(`spareParts[${index}].quantity`, sparePart.quantity)
                })
                const res = await orderService.updateOrder(formData)
                if (res) {
                    toggleLoader(false)
                    setTypeSnack('success')
                    setMessageSnack(dictionary.OperationSeccesfull)
                    setOpenSnackBar(true)
                    resetForm()
                    onClose()
                }
            }else{
                const data={
                    spareParts,
                    paymentMethod,
                    organizationId:user.organization.id,
                    organizationName:user.organization.name,
                    userName:user.firstName + ' ' + user.lastName
                }
                const res = await orderService.addOrder(data)
               
                if (res) {
                    toggleLoader(false)
                    setTypeSnack('success')
                    setMessageSnack(dictionary.OperationSeccesfull)
                    setOpenSnackBar(true)
                    resetForm()
                    onClose()
                }
            }
        }catch(e){
            toggleLoader(false)
            if (e?.response?.data?.message) {
                const message = e.response.data.message
                if (message === 'User not authenticated') {
                    setTypeSnack('error')
                    setMessageSnack(dictionary.UserNotAuthenticated)
                    setOpenSnackBar(true)
                }  else {
                    setTypeSnack('error')
                    setMessageSnack(dictionary.OrderOperationFailed)
                    setOpenSnackBar(true)
                }
            } else {
                setTypeSnack('error')
                setMessageSnack(dictionary.OrderOperationFailed)
                setOpenSnackBar(true)
            }
        }
    }
    useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await sparePartService.getAllSpareParts(
            1,
            500,
            user.organization.id,
            null
        )
        if (data) {
            setListSpareParts(data.items)
        }
        } catch (e) {
        if (e?.response?.data?.message) {
            const message = e.response.data.message
        
            if (message === 'User not authenticated') {
            setTypeSnack('error')
            setMessageSnack(dictionary.UserNotAuthenticated)
            setOpenSnackBar(true)
            } else {
            setTypeSnack('error')
            setMessageSnack(dictionary.GetSparePartsFailed)
            setOpenSnackBar(true)
            }
        } else {
            setTypeSnack('error')
            setMessageSnack(dictionary.GetSparePartsFailed)
            setOpenSnackBar(true)
        }
        }
    }
    fetchData()
  }, [])
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
      showConfirmButton={isLastStep}
      onConfirm={handleSubmit}
      labelConfirmButton={dictionary.confirm}
    >
        <Box sx={{ width: { xs: '300px', sm: '400px', md: '500px', lg: '800px' } }}>
            <Typography
              variant="h5"
              align="center"
              sx={{
                fontWeight: 'bold',
              }}
            >
                {isUpdate? dictionary.UpdateOrder : dictionary.AddOrder}
            </Typography>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel
                        StepIconProps={{
                            sx: {
                                 '&.Mui-active': {
                                    color: user.organization.primaryColor, 
                                 },
                                 '&.Mui-completed': {
                                    color: darken(user.organization.primaryColor, 0.2), 
                                 },
                                },
                        }}
                    >
                    {label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
            <Box mt={3}>
                {activeStep === 0 && (
                    <motion.div
                      initial={{ opacity: 0, x: 100 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 100 }}
                      transition={{ duration: 0.8 }}
                    >
                        <Box>
                            <FormControl fullWidth>
                                <InputLabel id="multi-select-label">{dictionary.ChooseSpareParts}</InputLabel>
                                <Select
                                    labelId="multi-select-label"
                                    multiple
                                    value={spareParts.map((sp) => sp.id)}
                                    onChange={handleDropdownSparePart}
                                    renderValue={(selected) => (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {selected.map((id) => {
                                            const part = returnSparePartInformations(id)
                                            return <Chip key={id} label={part?.title} />
                                            })}
                                        </Box>
                                    )}
                                     sx={{
                                        color: '#a3a3a3',
                                        '.MuiSvgIcon-root ': {
                                        fill: user.organization.primaryColor,
                                        },
                                        '.MuiOutlinedInput-notchedOutline': {
                                        borderColor: user.organization.primaryColor,
                                        },
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: user.organization.primaryColor,
                                        },
                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: user.organization.primaryColor,
                                        },
                                        '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                            borderColor: user.organization.primaryColor,
                                        },
                                        '&:hover fieldset': {
                                            borderColor: user.organization.primaryColor,
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: user.organization.primaryColor,
                                        },
                                        },
                                    }}
                                >
                                    {sparePartsOptions.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                         {errors.spareParts?.general && (
                            <Typography color="error" variant="caption">
                                {errors.spareParts?.general}
                            </Typography>
                         )}
                    </motion.div>
                )}
                {activeStep === 1 && (
                    <motion.div
                      initial={{ opacity: 0, x: 100 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 100 }}
                      transition={{ duration: 0.8 }}
                    >
                        {spareParts.length >0 ? (
                            <motion.div
                             initial={{ opacity: 0, x: 100 }}
                             animate={{ opacity: 1, x: 0 }}
                             exit={{ opacity: 0, x: 100 }}
                             transition={{ duration: 0.8 }}
                            >
                                {spareParts.map((s, index) => {
                                    const sparePart = returnSparePartInformations(s.id)
                                    const price = sparePart?.tva === 0 ?
                                        sparePart?.price
                                        :sparePart?.price +((sparePart?.price * sparePart?.tva) / 100)
                                    return (
                                        <Box
                                         key={index}
                                         display="flex"
                                         alignItems="center"
                                         gap={2} 
                                         mb={2}  
                                        >
                                           
                                            <Box
                                                component="img"
                                                src={sparePart.imageUrl}
                                                alt="logo-preview"
                                                sx={{
                                                    width: { xs: 150, sm: 200, md: 200 },
                                                    height: { xs: 60, sm: 80, md: 80 },
                                                    borderRadius: 1.5,
                                                    objectFit: 'cover',
                                                    border: '1px solid #ccc',
                                                }}
                                            />
                                            <Box display="flex" alignItems="center">
                                                <IconButton 
                                                    onClick={(e) => {
                                                        e.preventDefault()
                                                        handleQuantityChange(index, null, 'decrement')
                                                }}>
                                                    <RemoveIcon />
                                                </IconButton>
                                                <TextField
                                                    type="number"
                                                    value={s.quantity}
                                                    onChange={(e) => handleQuantityChange(index, e.target.value, null)}
                                                    size="small"
                                                    inputProps={{ min: 1, max: sparePart.quantity }}
                                                     sx={{
                                                        width: 80, mx: 1 ,
                                                        '& .MuiOutlinedInput-root': {
                                                            borderRadius:10,
                                                            '& fieldset': {
                                                            borderColor: user.organization.primaryColor,
                                                            },
                                                            '&:hover fieldset': {
                                                            borderColor: user.organization.primaryColor,
                                                            },
                                                            '&.Mui-focused fieldset': {
                                                            borderColor: user.organization.primaryColor,
                                                            },
                                                        },
                                                        '& .MuiInputLabel-root': {
                                                            color: user.organization.primaryColor,
                                                        },
                                                        '& .MuiInputLabel-root.Mui-focused': {
                                                            fontWeight: 'bold',
                                                        },
                                                        '& .MuiInputLabel-shrink': {
                                                            fontWeight: 'bold',
                                                        },
                                                        }}
                                                />
                                                <IconButton onClick={(e) => {
                                                    e.preventDefault()
                                                    handleQuantityChange(index, null, 'increment')
                                                 }}>
                                                    <AddIcon />
                                                </IconButton>
                                            </Box>
                                                <Box>
                                                    <Typography variant="subtitle2">
                                                        {price * s.quantity} {currency}
                                                    </Typography>
                                                </Box>
                                               {errors.spareParts?.[index]?.quantity && (
                                                    <Typography color="error" variant="caption">
                                                        {errors.spareParts?.[index]?.quantity}
                                                    </Typography>
                                                )} 
                                        </Box>
                                    )
                                })}
                            </motion.div>
                        ) : (
                           <Typography textAlign="center" sx={{ fontWeight: 'normal' }}>
                                {dictionary.NoDataFound}
                            </Typography> 
                        )}
                    </motion.div>
                )}
                {activeStep === 2 && (
                    <motion.div
                      initial={{ opacity: 0, x: 100 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 100 }}
                      transition={{ duration: 0.8 }}
                    >
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
                    </motion.div>
                )}
            </Box>
            <Box mt={3} display="flex" justifyContent="space-between">
                <Button variant="primary" disabled={activeStep === 0} onClick={handleStepBack}>
                    {dictionary.prev}
                </Button>
                {!isLastStep && (
                    <Button variant="primary" onClick={handleStepNext}>{dictionary.Next}</Button>
                )}
            </Box>
        </Box>
    </Modal>
  </Box>
 )
}
OrderFormModal.propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func,
    order: PropTypes.object,
}
 export default OrderFormModal