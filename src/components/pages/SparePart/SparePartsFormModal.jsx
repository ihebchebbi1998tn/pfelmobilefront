import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Box, Typography, Stepper, Step, StepLabel, IconButton, InputLabel, FormHelperText } from '@mui/material'
import { darken } from '@mui/material/styles'
import { motion } from 'framer-motion'
import CloseIcon from '@mui/icons-material/Close'
import OrganisationService from '../../../services/OrganisationService'
import sparePartService from '../../../services/sparePartService'
import { useLanguage } from '../../../hooks/LanguageContext'
import { useAuth } from '../../../hooks/AuthContext'
import CustomSnackbar from '../../ui/CustomSnackbar'
import Dropdown from '../../ui/Dropdown'
import Input from '../../ui/Input'
import Modal from '../../ui/Modal'
import Button from '../../ui/Button'
import FileUpload from '../../ui/FileUpload'
import PropTypes from 'prop-types'

const SparePartsFormModal = ({ open, onClose, sparePart }) => {

  const isUpdate = Boolean(sparePart)
  const { toggleLoader } = useOutletContext()
  const { dictionary } = useLanguage()
  const { user } = useAuth()
  const hasAllAcess = user?.permissions?.some((perm) => perm === 'Permissions.AllowAll') || false
  const [title, setTitle] = useState(sparePart?.title || '')
  const [description, setDescription] = useState(sparePart?.description || '')
  const [preview, setPreview] = useState(sparePart?.imageUrl || '')
  const [selectedOrganisation, setSelectedOrganisation] = useState( sparePart?.organizationId || user?.organization.id || 0 )
  const [organisationName, setOrganisationName] = useState( sparePart?.organizationName || user?.organization.name || "" )
  const [quantity, setQuantity] = useState( sparePart?.quantity || '' )
  const [price, setPrice] = useState( sparePart?.price || '' )
  const [tva, setTva] = useState( sparePart?.tva || '' )
  const [file, setFile] = useState(null)
  const [fileResetKey, setFileResetKey] = useState(0)
  const [fileError, setFileError] = useState('')
  const [allOrganisations, setAllOrganisations] = useState([])
  const [typeSnack, setTypeSnack] = useState(null)
  const [messageSnack, setMessageSnack] = useState(null)
  const [openSnackBar, setOpenSnackBar] = useState(false)
  const [errors, setErrors] = useState({})
   const [activeStep, setActiveStep] = useState(hasAllAcess ? 0 : 1)
  const steps = [dictionary.StepOrganisations, dictionary.SparePartsinformations]
  const isLastStep = activeStep === steps.length - 1
   let OrganisationsOptions =
    allOrganisations.length > 0
      ? allOrganisations.map((c) => ({ value: c.id, label: c.name }))
      : []

    const resetForm = () => {
        setTitle('')
        setDescription('')
        setPreview('')
        setQuantity('')
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
        formData.append('title', title)
        formData.append('description', description)
        formData.append('quantity', quantity)
        formData.append('tva', tva)
        formData.append('price', price)
        formData.append('id', sparePart.id)
        if (file) formData.append('file', file)

        await sparePartService.updateSparePart(formData)
      } else {
        const formData = new FormData()
        formData.append('title', title)
        formData.append('description', description)
        formData.append('quantity', quantity)
        formData.append('tva', tva)
        formData.append('price', price)
        formData.append('organizationName', organisationName)
        formData.append('organizationId', selectedOrganisation)
        if (file) formData.append('file', file)
        await sparePartService.addSparePart(formData)
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
            ? dictionary.UpdateSparePartFailed
            : dictionary.AddSparePartFailed)
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
    const parsedQuantity = parseInt(quantity, 10)
    if (!title) {
      newErrors.title = dictionary.TitleRequired
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

    if (isNaN(parsedQuantity)) {
      newErrors.quantity = dictionary.QuantityMustBeANumber
    } else if (parsedQuantity < 0) {
      newErrors.quantity = dictionary.QuantityMustBeGreaterThanZero
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
      {isUpdate ? dictionary.UpdateSparePart : dictionary.AddSparePart}
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
              <label style={{ color: '#a3a3a3' }}>{dictionary.Title}</label>
              <Input
                showlabel={false}
                label={dictionary.Title}
                value={title}
                placeholder={dictionary.Title}
                type="string"
                onChange={(e) => setTitle(e.target.value)}
                iserror={errors.title}
              />
              {errors.title && <Typography color="error" variant="caption">{errors.title}</Typography>}
            </Box>
            <Box sx={{ flexBasis: { xs: '100%', sm: '48%' } }}>
              <label style={{ color: '#a3a3a3' }}>{dictionary.Quantity}</label>
              <Input
                showlabel={false}
                label={dictionary.Quantity}
                value={quantity}
                placeholder={dictionary.Quantity}
                type="string"
                onChange={(e) => setQuantity(e.target.value)}
                iserror={errors.quantity}
              />
              {errors.quantity && <Typography color="error" variant="caption">{errors.quantity}</Typography>}
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
 SparePartsFormModal.propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func,
    sparePart: PropTypes.object,
  }
export default SparePartsFormModal