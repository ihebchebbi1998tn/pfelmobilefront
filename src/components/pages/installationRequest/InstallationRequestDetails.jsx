import { Box, Typography } from '@mui/material'
import { useLanguage } from '../../../hooks/LanguageContext'
import CustomBadge from '../../ui/CustomBadge'
import Modal from '../../ui/Modal'
import PropTypes from 'prop-types'

const InstallationRequestDetails = ({ open, onClose, installation }) => {
  const { dictionary, currency } = useLanguage()

  const getPaidBadge = (s) =>{
      switch (s) {
          case true:
              return <CustomBadge label={dictionary.Payed} type="success" />
          case false:
              return <CustomBadge label={dictionary.NotPaid} type="danger" />
          default:
              return <CustomBadge label={dictionary.NotPaid} type="danger" />
      }
    }

    const getStatusBadge = (s) =>{
      switch (s) {
           case "Pending": 
                return <CustomBadge label={dictionary.Pending} type="gray" />
            case "Cancelled": 
                return <CustomBadge label={dictionary.Cancelled} type="danger" />
            case "Refused": 
                return <CustomBadge label={dictionary.Refused} type="danger" />
            case "InProgress": 
                return <CustomBadge label={dictionary.InProgress} type="info" />
            case "Dispatched": 
                return <CustomBadge label={dictionary.Dispatched} type="warning" />
            case "Completed": 
                return <CustomBadge label={dictionary.Completed} type="success" />
            default:
                return <CustomBadge label={dictionary.Pending} type="gray" />
      }
    }
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
              {installation?.device?.name}
            </Typography>
        </Box>
        <Box
          sx={{
            mb: 1,
            display: 'flex',
            justifyContent:  'space-between'
          }}
        >
            <Box>
                <Typography variant="subtitle2">{dictionary.Reference}: {installation?.device?.reference}</Typography>
                <br />
                <Typography  variant="subtitle2">
                    {dictionary.Description} : 
                </Typography>
                <Typography variant="body1" sx={{mb:1}}>
                    {installation?.device?.description}
                </Typography>
                <Typography variant="subtitle2" sx={{mb:1}}>{dictionary.OrganisationName}: {installation?.device?.organizationName}</Typography>
                <Typography variant="subtitle2">{dictionary.Price}: {installation?.device?.tva==0 ? installation?.device?.price.toFixed(2) : installation?.device?.price.toFixed(2)+((installation?.device?.price.toFixed(2)*installation?.device?.tva)/100) } {currency}</Typography>
            </Box>
            <Box>
                <img
                    src={installation?.device?.imageUrl}
                    alt={installation?.device?.imageName}
                    style={{ maxWidth: 300, borderRadius: 8, marginBottom: 16, maxHeight:300 }}
                />
            </Box>
        </Box>
        <Box>
            <Typography variant="subtitle2" sx={{mb:1}}>{dictionary.ClientName}: {installation?.userName}</Typography>
            {installation?.agentName!=null  &&
                <Typography variant="subtitle2" sx={{mb:1}}>{dictionary.AgentName}: {installation?.agentName}</Typography>     
            }
            
            <Typography variant="subtitle2" sx={{mb:1}}>{dictionary.PaymentMethod}: {installation?.paymentMethod}</Typography>
            {(installation?.installationCharges!=null && installation?.installationCharges!=0) &&
                <Typography variant="subtitle2" sx={{mb:1}}>{dictionary.InstallationCharges}: {installation?.installationCharges.toFixed(2)} {currency}</Typography>  
            }
            {installation?.agentResponse!=null  &&
                <Typography variant="subtitle2" sx={{mb:1}}>{dictionary.Comment}: {installation?.agentResponse}</Typography>
            }
            <Box
                sx={{
                    mb: 1,
                    display: 'flex',
                    width:'30%',
                    justifyContent:  'space-between'
                }}
            >
                <Box>
                    {getPaidBadge(installation?.isPaid)}
                </Box>
                <Box>
                    {getStatusBadge(installation?.status)}
                </Box>
            </Box>
        </Box>
    </Box>
   </Modal>
 )
}
InstallationRequestDetails.propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func,
    installation: PropTypes.object,
}
 export default InstallationRequestDetails