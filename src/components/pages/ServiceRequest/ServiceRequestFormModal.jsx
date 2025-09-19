import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Box, Typography, IconButton, InputLabel, FormHelperText } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import AddIcon from '@mui/icons-material/Add'
import customerDevicesService from '../../../services/customerDevicesService'
import serviceRequestService from '../../../services/serviceRequestService'
import { useLanguage } from '../../../hooks/LanguageContext'
import { useAuth } from '../../../hooks/AuthContext'
import CustomSnackbar from '../../ui/CustomSnackbar'
import Dropdown from '../../ui/Dropdown'
import Input from '../../ui/Input'
import Modal from '../../ui/Modal'
import FileUpload from '../../ui/FileUpload'
import PropTypes from 'prop-types'

const ServiceRequestFormModal = ({ open, onClose, service }) => {
  const isUpdate = Boolean(service)
  const { toggleLoader } = useOutletContext()
  const { dictionary } = useLanguage()
  const { user } = useAuth()
  const [title, setTitle] = useState(service?.title || '')
  const [description, setDescription] = useState(service?.description || '')
  const [files, setFiles] = useState([])
  const [allDevices, setAllDevices] = useState([])
  const [selectedDevice, setSelectedDevice] = useState("")
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

  const [ids, setIds] = useState([])
  const [previews, setPreviews] = useState(() => {
    if (service?.images && service?.images.length > 0) {
      return service?.images.map((i) => ({
        id: i.id,
        src: i.imageUrl,
        name:i.imageName
      }))
    }
    return []
  })
  let devicesOptions =
    allDevices.length > 0
      ? allDevices.map((d) => ({ value: d.id, label: d.serialNumber }))
      : []
  
  const [fileResetKey, setFileResetKey] = useState(0)
  const [fileError, setFileError] = useState('')
  const resetForm = () => {
    setTitle('')
    setDescription('')
    setPaymentMethod('')
    setFiles([])
    setAllDevices([])
    setIds([])
    setPreviews([])
    setSelectedDevice("")
    setFileResetKey(0)
    setFileError('')
    setErrors({})
    }

 const handleSubmit = async () => {
  if (!validate()) return
  toggleLoader(true)
  try {
    const formData = new FormData()

    formData.append('title', title)
    formData.append('description', description)

    if (isUpdate) {
      formData.append('id', service.id)
      if(files.length > 0) {
        files.forEach((file) => {
        formData.append('files', file)
      })
      }
      
      if(ids.length > 0) {
        ids.forEach((id) => {
          formData.append('ids', id)
        })
      }
      

      await serviceRequestService.updateServiceRequest(formData)
    } else {
      files.forEach((file) => {
        formData.append('files', file)
      })

      formData.append('userName', `${user.firstName} ${user.lastName}`)
      formData.append('customerDeviceId', selectedDevice)
      formData.append('organizationName', user.organization.name)
      formData.append('OrganizationId', user.organization.id)
      formData.append('paymentMethod', paymentMethod || 'Cash')

      await serviceRequestService.addServiceRequest(formData)
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
      (isUpdate ? dictionary.UpdateServiceRequestFailed : dictionary.AddServiceRequestFailed)
    )
    setOpenSnackBar(true)
  } finally {
    toggleLoader(false)
  }
}

 const validate = () => {
    const newErrors = {}
    if (!title) {
      newErrors.title = dictionary.TitleRequired
    }
    if (!description) {
      newErrors.description = dictionary.DescriptionRequired
    }

    if (!isUpdate && !files) newErrors.files = dictionary.ImageRequired
    if (!isUpdate && selectedDevice=="") newErrors.selectedDevice = dictionary.deviceRequired
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleDropdownDevices = (event) => {
    setSelectedDevice(event.target.value)
    }

  const handleRemovePreview = (p) => {
  if (isUpdate && service?.images?.length > 0) {
    const idPreview = service.images.find((i) => i.imageName === p.name)?.id
    if (idPreview) {
      if(ids.length>0){
         setIds((prev) => ({
        ...prev,
        idPreview,
      }))
      }
     else{
        setIds([idPreview])
     }
    }
  }

  setFiles((prev) => prev.filter((i) => i.name !== p.name))
  setPreviews((prev) => prev.filter((i) => i.name !== p.name))
  setFileResetKey((prev) => prev + 1)
}


  const handleFileDrop = (acceptedFiles) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
  const maxSize = 50 * 1024 * 1024

  for (const file of acceptedFiles) {
    if (!allowedTypes.includes(file.type)) {
      setFileError(dictionary.invalidFileType + ' ' + file.name)
      return
    }

    if (file.size > maxSize) {
      setFileError(dictionary.fileTooLarge + ' ' + file.name)
      return
    }

    setPreviews(prev => [...prev, {
      id: 0,
      src: URL.createObjectURL(file),
      name: file.name
    }])
  }

  setFileError('')
  if(files.length>0){
setFiles(prev => [...prev, ...acceptedFiles])
  }else{
setFiles(acceptedFiles)
  }
  
}


  const fetchDevicesData = async () => {
    try {
      const data = await customerDevicesService.getAllCustomerDevices(user.organization.id)
      if (data) {
        setAllDevices(data)
      }
    } catch (e) {
      const message = e.response.data.message
      setTypeSnack('error')
      setMessageSnack(dictionary.GetDevicesFailed || message)
      setOpenSnackBar(true)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      await fetchDevicesData()
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
        showConfirmButton={true}
        onConfirm={handleSubmit}
        labelConfirmButton={dictionary.confirm}
        >
        <Box sx={{ width: { xs: '90vw', sm: '650px', md: '900px' } }}>
            <Typography variant="h5" align="center" sx={{ fontWeight: 'bold' }}>
            {isUpdate ? dictionary.UpdateServiceRequest : dictionary.AddServiceRequest}
            </Typography>

            <Box mt={3}>
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

                {!isUpdate && (
                <Box>
                    <label style={{ color: '#a3a3a3' }}>{dictionary.devices}</label>
                    <Dropdown
                    options={devicesOptions}
                    value={selectedDevice}
                    label={dictionary.ChoseADevice}
                    onChange={handleDropdownDevices}
                    />
                    {errors.selectedDevice && (
                    <Typography color="error" variant="caption">{errors.selectedDevice}</Typography>
                    )}

                    <label style={{ color: '#a3a3a3' }}>{dictionary.HowDoYouWantToPay}</label>
                    <Dropdown
                      options={paymentMethodOptions}
                      value={paymentMethod}
                      label={dictionary.HowDoYouWantToPay}
                      onChange={handleDropdownPaymentMethod}
                      iserror={false}
                    />
                </Box>
                )}
                <InputLabel>{dictionary.Image}</InputLabel>
                <FileUpload
                    onDrop={handleFileDrop}
                    resetTrigger={fileResetKey}
                    errorMessage={fileError}
                />
                {errors.files && (
                    <FormHelperText error>{errors.files}</FormHelperText>
                )}

                <Box mt={2} display="flex" alignItems="center" gap={2} flexWrap="wrap">
                     <IconButton
                    component="label"
                    sx={{
                        width: { xs: 48, sm: 56, md: 64 },
                        height: { xs: 48, sm: 56, md: 64 },
                        border: '1px dashed #ccc',
                        borderRadius: 1.5,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        color: 'primary.main',
                        cursor: 'pointer',
                    }}
                    >
                    <AddIcon />
                    <input
                        type="file"
                        accept="image/*"
                        hidden
                        multiple
                        onChange={(e) => {
                        if (e.target.files.length > 0) {
                            handleFileDrop(Array.from(e.target.files))
                        }
                        }}
                    />
                    </IconButton>
                    {previews?.map((preview) => (
                    <Box key={preview.id || preview.name} display="flex" alignItems="center" gap={1}>
                        <Box
                        component="img"
                        src={preview.src}
                        alt="preview"
                        sx={{
                            width: { xs: 48, sm: 56, md: 64 },
                            height: { xs: 48, sm: 56, md: 64 },
                            borderRadius: 1.5,
                            objectFit: 'cover',
                            border: '1px solid #ccc',
                        }}
                        />
                        <IconButton
                        onClick={() => handleRemovePreview(preview)}
                        sx={{ color: 'error.main' }}
                        >
                        <CloseIcon />
                        </IconButton>
                    </Box>
                    ))}
                </Box>
            </Box>
        </Box>
    </Modal>
 </Box>
 )
}
 ServiceRequestFormModal.propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func,
    service: PropTypes.object,
  }
export default ServiceRequestFormModal