import { Box, Typography } from '@mui/material'
import Modal from '../../ui/Modal'
import { useLanguage } from '../../../hooks/LanguageContext'
import PropTypes from 'prop-types'

const CustomerDeviceDetails = ({ open, onClose, device }) => {
  const { dictionary } = useLanguage()

 return (
  <Modal
      open={open}
      onClose={onClose}
      showConfirmButton={false}
      className="custom-modal"
  >
     <Box sx={{ width: { xs: '300px', sm: '400px', md: '500px', lg: '800px' } }}>
        <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
        >
            <Typography
              variant="h3"
              sx={{fontWeight: 'bold'}}
            >
              {device?.device.name}
            </Typography>
        </Box>
         <Box sx={{display:"flex", justifyContent:"center", alignItems:"center"}}>
            <img
            src={device?.device.imageUrl}
            alt={device?.device.imageName}
            style={{ maxWidth: 300, borderRadius: 8, marginBottom: 16, maxHeight:300 }}
          />
         </Box>
          <Typography variant="subtitle2">{dictionary.SerialNumber}: {device?.serialNumber}</Typography>
          <br />
          <Typography  variant="subtitle2">
            {dictionary.Description} : 
          </Typography>
          <Typography variant="body1">
            {device?.device.description}
          </Typography>
          <br />
          <Typography variant="subtitle2">{dictionary.OrganisationName}: {device?.device.organizationName}</Typography>
          <br />
          <Typography variant="subtitle2">{dictionary.UserName}: {device?.userName}</Typography>
     </Box>
  </Modal>
 )
}
  CustomerDeviceDetails.propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func,
    device: PropTypes.object,
  }
export default CustomerDeviceDetails