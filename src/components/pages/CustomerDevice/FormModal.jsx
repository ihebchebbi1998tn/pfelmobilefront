import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Box, Typography } from '@mui/material'
import WarningIcon from '@mui/icons-material/Warning'
import customerDevicesService from '../../../services/customerDevicesService'
import installationRequestService from '../../../services/installationRequestService'
import deviceService from '../../../services/deviceService'
import { useLanguage } from '../../../hooks/LanguageContext'
import { useAuth } from '../../../hooks/AuthContext'
import CustomSnackbar from '../../ui/CustomSnackbar'
import Dropdown from '../../ui/Dropdown'
import Input from '../../ui/Input'
import Modal from '../../ui/Modal'
import Button from '../../ui/Button'
import AddressFormModal from '../Address/AddressFormModal'
import PropTypes from 'prop-types'

const FormModal = ({ open, onClose }) => {

  const { toggleLoader } = useOutletContext()
  const { dictionary } = useLanguage()
  const { user } = useAuth()
  const [typeSnack, setTypeSnack] = useState(null)
  const [messageSnack, setMessageSnack] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('')
  const [openSnackBar, setOpenSnackBar] = useState(false)
  const [errors, setErrors] = useState({})
  const [allDevices, setAllDevices] = useState([])
  const [allMyDevices, setAllMyDevices] = useState([])
  const [mode, setMode] = useState("device")
  const [didHeChose, setDidHeChose] = useState(false)
  const [openModalFrom, setOpenModalFrom] = useState(false)
  const [serialNumber, setSerialNumber] = useState("")
  const [chosenDevice, setChosenDevice] = useState("")
  const [showWarningDevice, setShowWarningDevice] = useState(false)
  let devicesOptions = allDevices.length > 0 ? allDevices.map((d) => ({ value: d.id, label: d.name })) : []

  let paymentMethodOptions = 
  (user.organization && user.organization.onlinePaymentSolutions) ? 
  [
    { value: 'Cash', label: dictionary.Cash },
    { value: user.organization.onlinePaymentSolutions, label: dictionary.EnLigne + ' (' + user.organization.onlinePaymentSolutions + ')' },
  ] : []

  const handleDropdownPaymentMethod = (event) => {
    setPaymentMethod(event.target.value)
  }

  const handleDropdown = (event) => {
    setShowWarningDevice(false)
    const selectedValue = event.target.value
    setChosenDevice(selectedValue)
    let found = false
    if ( allMyDevices != null && allMyDevices.length > 0) {
      found = allMyDevices.some(r => selectedValue === r.deviceId)
    }
    setShowWarningDevice(found)
  }

  const validate = () => {
    const newErrors = {};
    const allowedPattern = /^[A-Za-z0-9-_]+$/;

    if(mode=="device"){
        if (!serialNumber) {
        newErrors.serialNumber = dictionary.serialNumberRequired;
    } else if (serialNumber.length < 5 || serialNumber.length > 50) {
        newErrors.serialNumber = dictionary.serialNumberLengthError;
    } else if (!allowedPattern.test(serialNumber)) {
        newErrors.serialNumber = dictionary.serialNumberFormatError;
    }
    }

    if (!chosenDevice || chosenDevice === "") {
        newErrors.chosenDevice = dictionary.deviceRequired;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }
  const resetForm = () => {
    setDidHeChose(false)
    setPaymentMethod('')
    setShowWarningDevice(false)
    setSerialNumber("")
    setChosenDevice("")
    setMode("device")
    setErrors({})
  }

  const handleError = (error, messagesMap) => {
    const message = error?.response?.data?.message
    const translated =
      message && messagesMap[message]
        ? messagesMap[message]
        : messagesMap.default

    setTypeSnack('error')
    setMessageSnack(translated)
    setOpenSnackBar(true)
  }
  
  const handleSubmit = async () => {
    if (!validate()) return
    toggleLoader(true)
 try {
    setShowWarningDevice(false)
      if (mode=="device") {
        const data = {
            serialNumber,
            userName:user.firstName + ' ' + user.lastName,
            deviceId:chosenDevice
            }
        await customerDevicesService.addCustomerDevices(data)
      } else {
        const data = {
            organizationId:user.organization.id,
            userName:user.firstName + ' ' + user.lastName,
            deviceId:chosenDevice,
            paymentMethod: paymentMethod || 'Cash'
            }
        await installationRequestService.addInstallationRequest(data)
      }
      setTypeSnack('success')
      setMessageSnack(dictionary.OperationSeccesfull)
      setOpenSnackBar(true)
      resetForm()
      onClose()
    } catch (e) {
      handleError(e, {
        'User not authenticated': dictionary.UserNotAuthenticated,
        'Devise not found or customer device already exists': dictionary.deviceNotFoundOrCustomerdeviceexists,
        'Devise not found': dictionary.DeviceNotFound,
        default: mode=="device"
          ? dictionary.CreateDeviceFailed
          : dictionary.AddInstallationRequestFailed,
      })
    } finally {
      toggleLoader(false)
    }
  }
  
    const fetchMyDevicesData = async () => {
      try {
        const data = await customerDevicesService.getAllCustomerDevices(user.organization.id)
        if (data) {
          setAllMyDevices(data)
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
            setMessageSnack(dictionary.GetDevicesFailed)
            setOpenSnackBar(true)
          }
        } else {
          setTypeSnack('error')
          setMessageSnack(dictionary.GetDevicesFailed)
          setOpenSnackBar(true)
        }
      }
    }

   const fetchDevicesData = async () => {
      try {
        const data = await deviceService.getAllDevices(
          1,
          500,
          user.organization.id,
          null
        )
        if (data) {
          setAllDevices(data.items)
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
            setMessageSnack(dictionary.GetDevicesFailed)
            setOpenSnackBar(true)
          }
        } else {
          setTypeSnack('error')
          setMessageSnack(dictionary.GetDevicesFailed)
          setOpenSnackBar(true)
        }
      }
    }
    useEffect(() => {
      const fetchData = async () => {
        await Promise.all([fetchDevicesData(), fetchMyDevicesData()])
      }
      fetchData()
    }, [])
  const naviagatTo = (to) => {
      if(user?.address!=null){
          setDidHeChose(true)
          setMode(to)
      }
      else{
        setOpenModalFrom(true)
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
        {openModalFrom && (
          <AddressFormModal
            open={true}
            onClose={() => {
            setOpenModalFrom(false)
            onClose()
              }}
            address={user?.address}
          />
          )}
        <Modal
        open={open}
        onClose={onClose}
        showConfirmButton={didHeChose}
        onConfirm={handleSubmit}
        labelConfirmButton={dictionary.confirm}
        >
            <Box sx={{ width: { xs: '300px', sm: '550px' } }}>
                {!didHeChose ? (
                    <Box>
                        <Typography variant="h5" align="center" sx={{fontWeight: 'bold'}}>
                                {dictionary.Chose}
                        </Typography>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mt={3}>
                            <Button variant="primary" onClick={() => naviagatTo("device")}>
                            {dictionary.AddMyOwnDevices}
                            </Button>
                            <Button variant="primary" onClick={() => naviagatTo("request")}>
                            {dictionary.MakeRequestInsatllation}
                            </Button>
                        </Box>
                    </Box>
                ) : (
                    <Box>
                        <Typography variant="h5" align="center" sx={{fontWeight: 'bold'}}>
                                {mode=="device" ? dictionary.AddMyDevices : dictionary.request}
                        </Typography>
                        <Box  mt={3}>
                            {mode=="device" &&
                            <Box>
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
                            </Box>
                            }
                            <Box>
                                <label style={{ color: '#a3a3a3' }}>
                                    {dictionary.ChoseADevice}
                                </label>
                               <Dropdown
                                    options={devicesOptions}
                                    value={chosenDevice}
                                    label={dictionary.ChoseADevice}
                                    onChange={handleDropdown}
                                    iserror={errors.chosenDevice}
                                />
                                {errors.chosenDevice && (
                                    <Typography color="error" variant="caption">
                                        {errors.chosenDevice}
                                    </Typography>
                                )}
                                {(user.organization.onlinePaymentSolutions!=null && mode=="request") &&
                                <Dropdown
                                    options={paymentMethodOptions}
                                    value={paymentMethod}
                                    label={dictionary.HowDoYouWantToPay}
                                    onChange={handleDropdownPaymentMethod}
                                    iserror={false}
                                />
                                }
                                {showWarningDevice && (
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        backgroundColor: 'transparent'
                                    }}
                                >
                                    <WarningIcon sx={{ color: '#ffc107' }} />
                                    <Typography
                                        color="warning"
                                        variant="body2"
                                        sx={{ flex: 1, textAlign: 'center' }}
                                    >
                                        {dictionary.DevieAlreadyOwned}
                                    </Typography>
                                </Box>
                                )}
                            </Box>
                        </Box>
                    </Box>
                )}
            </Box>
      </Modal>
    </Box>
  )
}
FormModal.propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func
}

export default FormModal