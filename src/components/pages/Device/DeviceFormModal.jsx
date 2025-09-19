import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Box, Typography, Stepper, Step, StepLabel, IconButton, InputLabel, FormHelperText } from '@mui/material'
import { darken } from '@mui/material/styles'
import { motion } from 'framer-motion'
import CloseIcon from '@mui/icons-material/Close'
import OrganisationService from '../../../services/OrganisationService'
import deviceService from '../../../services/deviceService'
import { useLanguage } from '../../../hooks/LanguageContext'
import { useAuth } from '../../../hooks/AuthContext'
import CustomSnackbar from '../../ui/CustomSnackbar'
import Dropdown from '../../ui/Dropdown'
import Input from '../../ui/Input'
import Modal from '../../ui/Modal'
import Button from '../../ui/Button'
import FileUpload from '../../ui/FileUpload'
import PropTypes from 'prop-types'

const DeviceFormModal = ({ open, onClose, device }) => {

  const isUpdate = Boolean(device)
  const { toggleLoader } = useOutletContext()
  const { dictionary } = useLanguage()
  const { user } = useAuth()
  const hasAllAcess = user?.permissions?.some((perm) => perm === 'Permissions.AllowAll') || false
  const [name, setName] = useState(device?.name || '')
  const [description, setDescription] = useState(device?.description || '')
  const [preview, setPreview] = useState(device?.imageUrl || '')
  const [selectedOrganisation, setSelectedOrganisation] = useState( device?.organizationId || user?.organization.id || 0 )
  const [organisationName, setOrganisationName] = useState( device?.organizationName || user?.organization.name || "" )
  const [reference, setReference] = useState( device?.reference || '' )
  const [price, setPrice] = useState( device?.price || '' )
  const [tva, setTva] = useState( device?.tva || '' )
  const [file, setFile] = useState(null)
  const [fileResetKey, setFileResetKey] = useState(0)
  const [fileError, setFileError] = useState('')
  const [allOrganisations, setAllOrganisations] = useState([])
  const [typeSnack, setTypeSnack] = useState(null)
  const [messageSnack, setMessageSnack] = useState(null)
  const [openSnackBar, setOpenSnackBar] = useState(false)
  const [errors, setErrors] = useState({})
   const [activeStep, setActiveStep] = useState(hasAllAcess ? 0 : 1)
  const steps = [dictionary.StepOrganisations, dictionary.DeviceInforamations]
  const isLastStep = activeStep === steps.length - 1
   let OrganisationsOptions =
    allOrganisations.length > 0
      ? allOrganisations.map((c) => ({ value: c.id, label: c.name }))
      : []

    const resetForm = () => {
        setName('')
        setDescription('')
        setPreview('')
        setReference('')
        setSelectedOrganisation(0)
        setPrice('')
        setTva('')
        setOrganisationName('')
        setFile(null)
        setFileResetKey(0)
        setFileError('')
        setActiveStep(0)
        setErrors({})
    }
      const handleSubmit = async () => {
    if (!validate()) return
    toggleLoader(true)
    try {
      if (isUpdate) {
        const formData = new FormData()
        formData.append('name', name)
        formData.append('description', description)
        formData.append('reference', reference)
        formData.append('tva', tva)
        formData.append('price', price)
        formData.append('id', device.id)
        if (file) formData.append('file', file)

        await deviceService.updateDevice(formData)
      } else {
        const formData = new FormData()
        formData.append('name', name)
        formData.append('description', description)
        formData.append('reference', reference)
        formData.append('tva', tva)
        formData.append('price', price)
        formData.append('organizationName', organisationName)
        formData.append('organizationId', selectedOrganisation)
        if (file) formData.append('file', file)
        await deviceService.addDevice(formData)
      }
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
          (isUpdate
            ? dictionary.UpdateDeviceFailed
            : dictionary.CreateDeviceFailed)
      )
      setOpenSnackBar(true)
    } finally {
      toggleLoader(false)
    }
  }
 const validate = () => {
    const newErrors = {}
    const parsedPrice = parseFloat((price + '').replace(',', '.'))
    const parsedTva = parseInt(tva, 10)
    if (!name) {
      newErrors.name = dictionary.NameRequired
    }
    if (!description) {
      newErrors.description = dictionary.DescriptionRequired
    }

    if (isNaN(parsedPrice)) {
      newErrors.price = dictionary.PriceMustBeANumber
    } else if (parsedPrice <= 0) {
      newErrors.price = dictionary.PriceMustBeGreaterThanZero
    }
    
    if (isNaN(parsedTva)) {
      newErrors.tva = dictionary.TvaMustBeANumber
    } else if (parsedTva < 0) {
      newErrors.tva = dictionary.TvaMustNotBeLessThanZero
    }

    if (!reference) {
      newErrors.reference = dictionary.ReferenceRequired
    } else if (!/^[a-zA-Z0-9-_]+$/.test(reference)) {
      newErrors.reference = dictionary.ReferenceInvalidFormat
    } else if (reference.length < 3) {
      newErrors.reference = dictionary.ReferenceTooShort
    } else if (reference.length > 30) {
      newErrors.reference = dictionary.ReferenceTooLong
    }

    if (!isUpdate && !file) newErrors.file = dictionary.ImageRequired
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleRemovePreview = () => {
    setFile(null)
    setFileError('')
    setPreview('')
    setFileResetKey((prev) => prev + 1)
  }

  const handleDropdownOrganisation = (event) => {
    const selectedId = Number(event.target.value);
    setSelectedOrganisation(selectedId);

    const selected = allOrganisations.find((organisation) => organisation.id === selectedId);
    if (selected) {
        setOrganisationName(selected.name)
    }
    }
  const handleStepNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep((prev) => prev + 1)
    }
  }
  const handleStepBack = () => {
    if (activeStep > 0) {
      setActiveStep((prev) => prev - 1)
    }
  }


  const handleFileDrop = (acceptedFiles) => {
    const file = acceptedFiles[0]
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
    const maxSize = 50 * 1024 * 1024

    if (!allowedTypes.includes(file.type)) {
      setFileError(dictionary.invalidFileType + ' ' + file.name)
      return
    }

    if (file.size > maxSize) {
      setFileError(dictionary.fileTooLarge + ' ' + file.name)
      return
    }
    setFileError('')
    setFile(file)
    setPreview(URL.createObjectURL(file))
  }

  const fetchOrganisationData = async () => {
    try {
      const data = await OrganisationService.getAllOrganizations()
      if (data) {
        setAllOrganisations(data)
      }
    } catch (e) {
      const message = e.response.data.message
      setTypeSnack('error')
      setMessageSnack(dictionary.GetOrganisationFailed || message)
      setOpenSnackBar(true)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      await fetchOrganisationData()
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
  <Box sx={{ width: { xs: '350px', sm: '450px', md: '650px', lg: '950px' } }}>
    <Typography
      variant="h5"
      align="center"
      sx={{ fontWeight: 'bold' }}
    >
      {isUpdate ? dictionary.UpdateDevice : dictionary.AddDevice}
    </Typography>

    {hasAllAcess && (
      <Stepper activeStep={activeStep} alternativeLabel>
        {(hasAllAcess ? steps : steps.slice(1)).map((label) => (
          <Step key={label}>
            <StepLabel
              StepIconProps={{
                sx: {
                  '&.Mui-active': { color: user.organization.primaryColor},
                  '&.Mui-completed': { color: darken(user.organization.primaryColor, 0.2) },
                },
              }}
            >
              {label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    )}

    <Box mt={3} >
      {activeStep === 0 && (
         <motion.div
           initial={{ opacity: 0, x: 100 }}
           animate={{ opacity: 1, x: 0 }}
           exit={{ opacity: 0, x: 100 }}
           transition={{ duration: 0.8 }}
         >
          <label style={{ color: '#a3a3a3' }}>{dictionary.Organisation}</label>
          <Dropdown
            options={OrganisationsOptions}
            value={selectedOrganisation}
            label={dictionary.ChoseOrganisation}
            onChange={handleDropdownOrganisation}
          />
        </motion.div>
      )}

      {activeStep === 1 && (
        <motion.div
           initial={{ opacity: 0, x: 100 }}
           animate={{ opacity: 1, x: 0 }}
           exit={{ opacity: 0, x: 100 }}
           transition={{ duration: 0.8 }}
         >
          <Box
            display="flex"
            flexWrap="wrap"
            justifyContent="space-between"
            gap={1}
          >
            <Box sx={{ flexBasis: { xs: '100%', sm: '48%' } }}>
              <label style={{ color: '#a3a3a3' }}>{dictionary.Name}</label>
              <Input
                showlabel={false}
                label={dictionary.Name}
                value={name}
                placeholder={dictionary.Name}
                type="string"
                onChange={(e) => setName(e.target.value)}
                iserror={errors.name}
              />
              {errors.name && <Typography color="error" variant="caption">{errors.name}</Typography>}
            </Box>
            <Box sx={{ flexBasis: { xs: '100%', sm: '48%' } }}>
              <label style={{ color: '#a3a3a3' }}>{dictionary.Reference}</label>
              <Input
                showlabel={false}
                label={dictionary.Reference}
                value={reference}
                placeholder={dictionary.Reference}
                type="string"
                onChange={(e) => setReference(e.target.value)}
                iserror={errors.reference}
              />
              {errors.reference && <Typography color="error" variant="caption">{errors.reference}</Typography>}
            </Box>
             <Box sx={{ flexBasis: { xs: '100%', sm: '48%' } }}>
              <label style={{ color: '#a3a3a3' }}>{dictionary.Price}</label>
              <Input
                showlabel={false}
                label={dictionary.Price}
                value={price}
                placeholder={dictionary.Price}
                type="string"
                onChange={(e) => setPrice(e.target.value)}
                iserror={errors.price}
              />
              {errors.price && <Typography color="error" variant="caption">{errors.price}</Typography>}
            </Box>
            <Box sx={{ flexBasis: { xs: '100%', sm: '48%' } }}>
               <label style={{ color: '#a3a3a3' }}>{dictionary.Tva}</label>
              <Input
                showlabel={false}
                label={dictionary.Tva}
                value={tva}
                placeholder={dictionary.TvaInPercentage}
                type="string"
                onChange={(e) => setTva(e.target.value)}
                iserror={errors.tva}
              />
              {errors.tva && <Typography color="error" variant="caption">{errors.tva}</Typography>}
            </Box>
             <Box sx={{ flexBasis: '100%' }}>
               <label style={{ color: '#a3a3a3' }}>{dictionary.Description}</label>
              <Input
                showlabel={false}
                label={dictionary.Description}
                value={description}
                minRows={3}
                placeholder={dictionary.Description}
                type="string"
                onChange={(e) => setDescription(e.target.value)}
                iserror={errors.description}
              />
              {errors.description && <Typography color="error" variant="caption">{errors.description}</Typography>}
            </Box>
            <Box sx={{ flexBasis: '100%' }}>
             <InputLabel>{dictionary.Image}</InputLabel>
              <FileUpload
                onDrop={handleFileDrop}
                resetTrigger={fileResetKey}
                errorMessage={fileError}
              />
              {errors.file && (
                <FormHelperText error>{errors.file}</FormHelperText>
              )}
              {preview && (
                <Box mt={2} display="flex" alignItems="center" justifyContent={"center"} gap={2}>
                  <Box
                    component="img"
                    src={preview}
                    alt="logo-preview"
                    sx={{
                      width: { xs: 250, sm: 350, md: 400},
                      height: { xs: 150, sm: 200, md: 200 },
                      borderRadius: 1.5,
                      objectFit: 'cover',
                      border: '1px solid #ccc',
                    }}
                  />
                  <IconButton onClick={handleRemovePreview} sx={{ color: 'error.main' }}>
                    <CloseIcon />
                  </IconButton>
                </Box>
              )}
            </Box>
          </Box>
        </motion.div>
      )}
    </Box>

    {hasAllAcess && (
      <Box mt={3} display="flex" justifyContent="space-between">
        <Button variant="primary" disabled={activeStep === 0} onClick={handleStepBack}>
          {dictionary.prev}
        </Button>
        {!isLastStep && (
          <Button variant="primary" onClick={handleStepNext}>{dictionary.Next}</Button>
        )}
      </Box>
    )}
  </Box>
</Modal>
    </Box>
 )
}
 DeviceFormModal.propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func,
    device: PropTypes.object,
  }
export default DeviceFormModal