import { Box, Typography } from '@mui/material'
import Modal from '../../ui/Modal'
import { useLanguage } from '../../../hooks/LanguageContext'
import PropTypes from 'prop-types'

const DeviceDetails = ({ open, onClose, device }) => {
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
              {device?.name}
            </Typography>
        </Box>
         <Box sx={{display:"flex", justifyContent:"center", alignItems:"center"}}>
            <img
            src={device?.imageUrl}
            alt={device?.imageName}
            style={{ maxWidth: 300, borderRadius: 8, marginBottom: 16, maxHeight:300 }}
          />
         </Box>
          <Typography variant="subtitle2">{dictionary.Reference}: {device?.reference}</Typography>
          <br />
          <Typography  variant="subtitle2">
            {dictionary.Description} : 
          </Typography>
          <Typography variant="body1">
            {device?.description}
          </Typography>
          <br />
          <Typography variant="subtitle2">{dictionary.OrganisationName}: {device?.organizationName}</Typography>
          <br />
          <Typography variant="subtitle2">{dictionary.Price}: {device?.tva==0 ? device?.price : device?.price+((device?.price*device?.tva)/100) }</Typography>
     </Box>
  </Modal>
 )
}
  DeviceDetails.propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func,
    device: PropTypes.object,
  }
export default DeviceDetails