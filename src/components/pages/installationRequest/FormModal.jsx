import { useState, useRef } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Box, Typography } from '@mui/material'
import SignatureCanvas from 'react-signature-canvas'
import { motion } from 'framer-motion'
import installationRequestService from '../../../services/installationRequestService'
import { useLanguage } from '../../../hooks/LanguageContext'
import CustomSnackbar from '../../ui/CustomSnackbar'
import Modal from '../../ui/Modal'
import Input from '../../ui/Input'
import Button from '../../ui/Button'
import PropTypes from 'prop-types'

const FormModal = ({ open, onClose, installation, mode }) => {
  const { toggleLoader } = useOutletContext()
  const { dictionary } = useLanguage()
  const [typeSnack, setTypeSnack] = useState(null)
  const [messageSnack, setMessageSnack] = useState(null)
  const [openSnackBar, setOpenSnackBar] = useState(false)
  const [status, setStatus] = useState(mode)
  const [installationCharges, setInstallationCharges] = useState('')
  const [serialNumber, setSerialNumber] = useState(null)
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
        const parsedInstallationCharges = parseFloat((installationCharges + '').replace(',', '.'))
         if (!installationCharges) {
            newErrors.installationCharges = dictionary.ChargesIsRequired
        } else{
            if(isNaN(parsedInstallationCharges)){
               newErrors.installationCharges = dictionary.ChargesMustBeANumber 
            }else if(parsedInstallationCharges <= 0){
                newErrors.installationCharges = dictionary.ChargesMustBeGreaterThanZero 
            }
        }
        if(!file){
             newErrors.file = dictionary.SignatureIsRequired 
        }
    }
    else if(mode==="Completed"){
        const allowedPattern = /^[A-Za-z0-9-_]+$/
          if (!serialNumber) {
            newErrors.serialNumber = dictionary.serialNumberRequired
        } else if (serialNumber.length < 5 || serialNumber.length > 50) {
            newErrors.serialNumber = dictionary.serialNumberLengthError
        } else if (!allowedPattern.test(serialNumber)) {
            newErrors.serialNumber = dictionary.serialNumberFormatError
        }
    }
     setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  const resetForm = () => {
    setStatus(null)
    setInstallationCharges('')
    setSerialNumber(null)
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
            formData.append('id', installation.id)
            formData.append('status', status)
            formData.append('agentResponse', agentResponse)
            console.log(formData)
             const res = await installationRequestService.toggleInstallationRequest(formData)
              if (res) {
                toggleLoader(false)
                setTypeSnack('success')
                setMessageSnack(dictionary.OperationSeccesfull)
                setOpenSnackBar(true)
                resetForm()
                onClose()
            }
        }else if(mode==="InProgress"){
            formData.append('id', installation.id)
            formData.append('status', status)
            formData.append('installationCharges', installationCharges)
            formData.append('file', file)
             const res = await installationRequestService.toggleInstallationRequest(formData)
              if (res) {
                toggleLoader(false)
                setTypeSnack('success')
                setMessageSnack(dictionary.OperationSeccesfull)
                setOpenSnackBar(true)
                resetForm()
                onClose()
            }
        }else if(mode==="Completed"){
            formData.append('id', installation.id)
            formData.append('status', status)
            formData.append('serialNumber', serialNumber)
             const res = await installationRequestService.toggleInstallationRequest(formData)
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
            setMessageSnack(dictionary.ToggleInstallationStatusFailed)
            setOpenSnackBar(true)
            }
     } else {
        setTypeSnack('error')
        setMessageSnack(dictionary.ToggleInstallationStatusFailed)
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
                {dictionary.ChangeInstallationRequestStatus}
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
                        {dictionary.InstallationCharges}
                    </label>
                    <Input
                        showlabel={false}
                        label={dictionary.InstallationCharges}
                        value={installationCharges}
                        placeholder={dictionary.InstallationCharges}
                        type="string"
                        onChange={(e) => setInstallationCharges(e.target.value)}
                        iserror={errors.installationCharges}
                    />
                    {errors.installationCharges && (
                        <>
                            <Typography color="error" variant="caption">
                                {errors.installationCharges}
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

            {mode==="Completed" && 
                <motion.div
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 100 }}
                    transition={{ duration: 0.8 }}
                >
                    <label style={{ color: '#a3a3a3' }}>
                        {dictionary.SerialNumber}
                    </label>
                    <Input
                        showlabel={false}
                        label={dictionary.SerialNumber}
                        value={serialNumber}
                        placeholder={dictionary.SerialNumber}
                        type="string"
                        onChange={(e) => setSerialNumber(e.target.value)}
                        iserror={errors.serialNumber}
                    />
                    {errors.serialNumber && (
                        <Typography color="error" variant="caption">
                            {errors.serialNumber}
                        </Typography>
                    )}
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
    installation: PropTypes.object,
    mode: PropTypes.string,
}

export default FormModal