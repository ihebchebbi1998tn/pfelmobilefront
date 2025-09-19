import { Box, Typography } from '@mui/material'
import Modal from '../../ui/Modal'
import { useLanguage } from '../../../hooks/LanguageContext'
import PropTypes from 'prop-types'

const SparePartDetails = ({ open, onClose, sparePart }) => {
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
              {sparePart?.title}
            </Typography>
        </Box>
         <Box sx={{display:"flex", justifyContent:"center", alignItems:"center"}}>
            <img
            src={sparePart?.imageUrl}
            alt={sparePart?.imageName}
            style={{ maxWidth: 300, borderRadius: 8, marginBottom: 16, maxHeight:300 }}
          />
         </Box>
          <Typography variant="subtitle2">{dictionary.Quantity}: {sparePart?.quantity}</Typography>
          <br />
          <Typography  variant="subtitle2">
            {dictionary.Description} : 
          </Typography>
          <Typography variant="body1">
            {sparePart?.description}
          </Typography>
          <br />
          <Typography variant="subtitle2">{dictionary.OrganisationName}: {sparePart?.organizationName}</Typography>
          <br />
          <Typography variant="subtitle2">{dictionary.Price}: {sparePart?.tva==0 ? sparePart?.price : sparePart?.price+((sparePart?.price*sparePart?.tva)/100) }</Typography>
     </Box>
  </Modal>
 )
}
  SparePartDetails.propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func,
    sparePart: PropTypes.object,
  }
export default SparePartDetails