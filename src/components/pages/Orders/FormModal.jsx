import { useState, useRef } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Box, Typography } from '@mui/material'
import SignatureCanvas from 'react-signature-canvas'
import { motion } from 'framer-motion'
import orderService from '../../../services/orderService'
import { useLanguage } from '../../../hooks/LanguageContext'
import CustomSnackbar from '../../ui/CustomSnackbar'
import Modal from '../../ui/Modal'
import Input from '../../ui/Input'
import Button from '../../ui/Button'
import PropTypes from 'prop-types'

const FormModal = ({ open, onClose, order, mode }) => {
  const { toggleLoader } = useOutletContext()
  const { dictionary } = useLanguage()
  const [typeSnack, setTypeSnack] = useState(null)
  const [messageSnack, setMessageSnack] = useState(null)
  const [openSnackBar, setOpenSnackBar] = useState(false)
  const [status, setStatus] = useState(mode)
  const [deliveryCosts, setDeliveryCosts] = useState('')
  const [agentResponse, setAgentResponse] = useState(null)
  const [file, setFile] = useState(null)
  const [errors, setErrors] = useState({})
  const signatureRef = useRef(null)

  const validate = () => {
    const newErrors = {}
    if(mode==="Refused"){
        if (!agentResponse) {
            newErrors.agentResponse = dictionary.ResponseRequired
        }
    }
    else if(mode==="InProgress"){
        const parsedDeliveryCosts = parseFloat((deliveryCosts + '').replace(',', '.'))
         if (!deliveryCosts) {
            newErrors.deliveryCosts = dictionary.DeliveryCostsIsRequired
        } else if(isNaN(parsedDeliveryCosts)){
               newErrors.deliveryCosts = dictionary.DeliveryCostsMustBeANumber 
        }
        if(!file){
             newErrors.file = dictionary.SignatureIsRequired 
        }
    }
     setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  const resetForm = () => {
    setStatus(null)
    setDeliveryCosts('')
    setAgentResponse(null)
    setFile(null)
    setErrors({})
  }
  const clearSignature = () => { 
    signatureRef.current.clear() 
    setFile(null)
    }

  const dataURLtoBlob = (dataUrl) => {
    const [header, base64] = dataUrl.split(',')
    const mime = header.match(/:(.*?);/)[1] 
    const binaryString = atob(base64) 
    const len = binaryString.length
    const bytes = new Uint8Array(len)

    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }

    return new Blob([bytes], { type: mime }) 
  }

  const saveSignature = () => {
    const dataUrl = signatureRef.current.toDataURL('image/png')  
    const blob = dataURLtoBlob(dataUrl)
    const NewFile = new File([blob], 'signature.png', { type: 'image/png' })
    setFile(NewFile)
  }

  const handleSubmit = async () => {
    if (!validate()) return
    try{
        toggleLoader(true)
        const formData = new FormData()
        if(mode==="Refused"){
            formData.append('id', order.id)
            formData.append('status', status)
            formData.append('agentResponse', agentResponse)
             const res = await orderService.updateOrder(formData)
              if (res) {
                toggleLoader(false)
                setTypeSnack('success')
                setMessageSnack(dictionary.OperationSeccesfull)
                setOpenSnackBar(true)
                resetForm()
                onClose()
            }
        }else if(mode==="InProgress"){
            formData.append('id', order.id)
            formData.append('status', status)
            formData.append('deliveryCosts', deliveryCosts)
            formData.append('file', file)
             const res = await orderService.updateOrder(formData)
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
            setMessageSnack(dictionary.ToggleOrderStatusFailed)
            setOpenSnackBar(true)
            }
     } else {
        setTypeSnack('error')
        setMessageSnack(dictionary.ToggleOrderStatusFailed)
        setOpenSnackBar(true)
     }
    }
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
        <Box sx={{ width: { xs: '350px', sm: '450px', md: '650px', lg: '950px' } }}>
            <Typography
                variant="h5"
                align="center"
                sx={{ fontWeight: 'bold' }}
            >
                {dictionary.ChangeOrderStatus}
            </Typography>
            {mode==="Refused" && 
                <motion.div
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 100 }}
                    transition={{ duration: 0.8 }}
                >
                    <label style={{ color: '#a3a3a3' }}>
                        {dictionary.Comment}
                    </label>
                    <Input
                        showlabel={false}
                        label={dictionary.Comment}
                        value={agentResponse}
                        placeholder={dictionary.Comment}
                        type="string"
                        onChange={(e) => setAgentResponse(e.target.value)}
                        iserror={errors.agentResponse}
                    />
                    {errors.agentResponse && (
                        <Typography color="error" variant="caption">
                            {errors.agentResponse}
                        </Typography>
                    )}
                </motion.div>
            }
            {mode==="InProgress" && 
                <motion.div
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 100 }}
                    transition={{ duration: 0.8 }}
                >
                    <label style={{ color: '#a3a3a3' }}>
                        {dictionary.DeliveryCosts}
                    </label>
                    <Input
                        showlabel={false}
                        label={dictionary.DeliveryCosts}
                        value={deliveryCosts}
                        placeholder={dictionary.DeliveryCosts}
                        type="string"
                        onChange={(e) => setDeliveryCosts(e.target.value)}
                        iserror={errors.deliveryCosts}
                    />
                    {errors.deliveryCosts && (
                        <>
                            <Typography color="error" variant="caption">
                                {errors.deliveryCosts}
                            </Typography>
                            <br />
                        </>
                    )}
                    <label style={{ color: '#a3a3a3' }}>
                        {dictionary.Signature}
                    </label><br />
                    <SignatureCanvas
                        ref={signatureRef}
                        penColor="black"
                        backgroundColor="white"
                        canvasProps={{
                              width: 500,
                              height: 200,
                              className: 'signature-canvas',
                               style: {
                                borderRadius: 10, 
                                border: '2px solid #000', 
                              },
                            }}
                    />
                    <br />
                    {errors.file && (
                        <Typography color="error" variant="caption">
                            {errors.file}
                        </Typography>
                    )}
                    <Box sx={{mt:10}}>
                        <Button variant="outlined primary" onClick={saveSignature}>{dictionary.SaveSignature}</Button>
                        <Button variant="outlined primary" onClick={clearSignature}>{dictionary.Clear}</Button>
                    </Box>
                </motion.div>
            }
        </Box>
    </Modal>
  </Box>
 )
}

FormModal.propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func,
    order: PropTypes.object,
    mode: PropTypes.string,
}

export default FormModal