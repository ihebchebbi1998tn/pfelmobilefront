import { useState } from 'react'
import addressService from '../../../services/addressService'
import { useLanguage } from '../../../hooks/LanguageContext'
import { useAuth } from '../../../hooks/AuthContext'
import Input from '../../ui/Input'
import Modal from '../../ui/Modal'
import CustomSnackbar from '../../ui/CustomSnackbar'
import MapSelector from '../../ui/MapSelector'
import { Box, Typography, IconButton } from '@mui/material'
import LiveHelpIcon from '@mui/icons-material/LiveHelp'
import Tutorial from '../Tutorial/Tutorial'
import PropTypes from 'prop-types'

const AddressFormModal = ({ open, onClose, address }) => {
  
  const { user, fetchUser } = useAuth()
  const { dictionary } = useLanguage()
  const [typeSnack, setTypeSnack] = useState(null)
  const [messageSnack, setMessageSnack] = useState(null)
  const [openSnackBar, setOpenSnackBar] = useState(false)
  const [streetName, setStreetName] = useState(address?.streetName || null)
  const [city, setCity] = useState(address?.city || null)
  const [countryKey, setCountryKey] = useState(address?.countryKey || null)
  const [state, setState] = useState(address?.state || null)
  const [zipCode, setZipCode] = useState(address?.zipCode || null)
  const [location, setLocation] = useState((address?.latitude && address?.longitude)?{lat: address?.latitude,lng: address?.longitude}:null)
  const [errors, setErrors] = useState({})
  const [openTutorial, setOpenTutorial] = useState(() => {
  const stored = localStorage.getItem('addressFormTutorial')
    return stored === null || stored === 'true'
  })
 const handlechange = (data) => {
  setLocation(data)
  if(data.street) setStreetName(data.street)
  if(data.city) setCity(data.city)
  if(data.state) setState(data.state)
  if(data.zipCode) setZipCode(data.zipCode)
  if(data.country) setCountryKey(data.country)
  }
  const resetForm = () => {
    setStreetName(null)
    setCity(null)
    setCountryKey(null)
    setState(null)
    setZipCode(null)
    setErrors({})
  }

  const validate = () => {
    const newErrors = {}
    if (!streetName) {
      newErrors.streetName = dictionary.streetNameRequired
    }

    if (!city) {
      newErrors.city = dictionary.cityRequired
    }
    if (!countryKey) {
      newErrors.countryKey = dictionary.countryKeyRequired
    }

    if (!state) {
      newErrors.state = dictionary.StateRequired
    }

    if (!zipCode) {
      newErrors.zipCode = dictionary.zipCodeRequired
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    const data = {
      streetName,
      city,
      countryKey,
      state,
      zipCode,
      longitude: location.lng,
      latitude: location.lat,
    }

    const handleError = (error, fallbackMessage) => {
      const message = error?.response?.data?.message
      if (message === 'Address not found') {
        setMessageSnack(dictionary.AddressNotFound)
      } else {
        setMessageSnack(fallbackMessage)
      }
      setTypeSnack('error')
      setOpenSnackBar(true)
    }
    try {
      let response
      if (address?.id) {
        response = await addressService.updateAddress({
          ...data,
          id: address.id,
        })
      } else {
        response = await addressService.addAddress(data)
      }

      if (response) {
        await fetchUser()
        setTypeSnack('success')
        setMessageSnack(dictionary.OperationSeccesfull)
        setOpenSnackBar(true)
        resetForm()
        onClose()
      }
    } catch (error) {
      const fallback = address?.id
        ? dictionary.UpdateAddressFailed
        : dictionary.CreateAddressFailed
      handleError(error, fallback)
    } 
  }

  const stepsTutorial = [
    { target: '.stepFormAddress', content: dictionary.HereYouCanEnterYourAddressInformation },
    { target: '.stepMapAddress', content: dictionary.hereIstheMapSelector},
  ]
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
          labelConfirmButton={dictionary?.confirm || 'Confirm'}
        >
          <Box
            sx={{
              width: '100%',
              maxWidth: '1000px',
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              gap: 2,
            }}
          >
            <Box
              sx={{
                flex: 1,
                padding: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
              }}
            >
              <Typography variant="h5" align="center" fontWeight="bold" className={'stepFormAddress'}>
                {address == null ? dictionary.AddAddress : dictionary.UpdateAddress}
              </Typography>

              <form onSubmit={handleSubmit} >
                <Box
                
                  display="flex"
                  flexWrap="wrap"
                  justifyContent="space-between"
                  gap={1}
                >
                  {[
                    { label: dictionary.StreetName, value: streetName, onChange: setStreetName, error: errors.streetName },
                    { label: dictionary.City, value: city, onChange: setCity, error: errors.city },
                    { label: dictionary.State, value: state, onChange: setState, error: errors.state },
                    { label: dictionary.ZipCode, value: zipCode, onChange: setZipCode, error: errors.zipCode },
                    { label: dictionary.country, value: countryKey, onChange: setCountryKey, error: errors.countryKey },
                  ].map((field, index) => (
                    <Box key={index} sx={{ flexBasis: { xs: '100%', sm: '48%' } }}>
                      <label style={{ color: '#a3a3a3' }}>{field.label}</label>
                      <Input
                        showlabel={false}
                        label={field.label}
                        placeholder={field.label}
                        type="string"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        iserror={field.error}
                      />
                      {field.error && (
                        <Typography color="error" variant="caption">
                          {field.error}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Box>
              </form>
              <Box display={'flex'}>
                <IconButton
                  onClick={() => setOpenTutorial(true)} 
                >
                  <LiveHelpIcon/>
                </IconButton>
              </Box>
            </Box>
            <Box
              sx={{
                flex: 1,
                minHeight: 400,
                padding: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <Typography sx={{ color: '#a3a3a3', mb: 1 }}>{dictionary.location}</Typography>
              <MapSelector
              initialCoords={location}
               onLocationChange={handlechange} 
               className={'stepMapAddress'}
               />
            </Box>
          </Box>
        </Modal>
        <Tutorial
          open={openTutorial}
          steps={stepsTutorial}
          beaconSize={50}
          onClose={() => {
            localStorage.setItem('addressFormTutorial', 'false')
            setOpenTutorial(false)
          }}
        />
    </Box>
  )
}
AddressFormModal.propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func,
    address: PropTypes.object,
  }
export default AddressFormModal
