import { useAuth } from '../../../hooks/AuthContext'
import { useLanguage } from '../../../hooks/LanguageContext'
import { Box, Typography, useTheme } from '@mui/material'
import Modal from '../../ui/Modal'
import MapSelector from '../../ui/MapSelector'
import PropTypes from 'prop-types'

const AddressDetails = ({ open, onClose, address }) => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const { dictionary } = useLanguage()
  const { user } = useAuth()

  const colorModal = `linear-gradient(
    to bottom,
    #373b44,
    ${user.organization.primaryColor},
    rgba(255, 255, 255, 0.6),
    white
  ) !important`

  return (
    <Modal
      open={open}
      onClose={onClose}
      showConfirmButton={false}
      className="custom-modal"
      colorModal={colorModal}
    >
      <Box
        sx={{
          width: { xs: '95vw', sm: '90vw', md: '80vw' },
          maxWidth: '1000px',
        }}
      >
        {address && (
          <Box
            display="flex"
            flexDirection={{ xs: 'column', md: 'row' }}
            gap={3}
          >
            <Box sx={{ flex: 1 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Typography
                  variant="h5"
                  sx={{fontWeight: 'bold'}}
                >
                  {dictionary.Addresses}
                </Typography>
              </Box>

              <Typography sx={{ fontWeight: 'bold' }}>
                {dictionary.StreetName}:{' '}
                <span style={{ fontWeight: 'normal' }}>
                  {address.streetName}
                </span>
              </Typography>
              <Typography sx={{ fontWeight: 'bold' }}>
                {dictionary.City}:{' '}
                <span style={{ fontWeight: 'normal' }}>{address.city}</span>
              </Typography>
              <Typography sx={{ fontWeight: 'bold' }}>
                {dictionary.country}:{' '}
                <span style={{ fontWeight: 'normal' }}>
                  {address.countryKey}
                </span>
              </Typography>
              <Typography sx={{ fontWeight: 'bold' }}>
                {dictionary.State}:{' '}
                <span style={{ fontWeight: 'normal' }}>{address.state}</span>
              </Typography>
              <Typography sx={{ fontWeight: 'bold' }}>
                {dictionary.ZipCode}:{' '}
                <span style={{ fontWeight: 'normal' }}>
                  {address.zipCode}
                </span>
              </Typography>
            </Box>

            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontWeight: 'bold', mb: 1 }}>
                {dictionary.location}
              </Typography>
              <MapSelector
                initialCoords={{
                  lat: address.latitude,
                  lng: address.longitude,
                }}
              />
            </Box>
          </Box>
        )}
      </Box>
    </Modal>
  )
}

AddressDetails.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  address: PropTypes.object,
}

export default AddressDetails
