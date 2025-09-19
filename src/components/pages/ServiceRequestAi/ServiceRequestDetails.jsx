import {
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  Box
} from '@mui/material'
import { useLanguage } from '../../../hooks/LanguageContext'
import PropTypes from 'prop-types'
import CustomBadge from '../../ui/CustomBadge'

const ServiceRequestDetails = ({ open, onClose, service }) => {
  const { dictionary } = useLanguage()

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
   <Box>
     <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{service?.label}</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3}>
          <Box flex={1}>
            {service?.recap && (
              <Box mt={2}>
                <Typography variant="subtitle2" gutterBottom>
                  {dictionary.ConversationRecap}
                </Typography>
                <Typography variant="body1">{service.recap}</Typography>
              </Box>
            )}
          </Box>

          <Box flex={1} mt={4}>
            <Typography variant="subtitle2" gutterBottom>
               <strong>{service?.label}</strong>
            </Typography>
            <Typography variant="subtitle2" gutterBottom>
              {dictionary.PredictedOperation}: <strong>{service?.operation}</strong>
            </Typography>
            <Typography variant="subtitle2" gutterBottom>
              {dictionary.EstimationInMinutes}: <strong>{service?.listTechnician.durationInMinutes}</strong>
            </Typography>
            <Typography variant="subtitle2" gutterBottom>
              {dictionary.OrganisationName}: <strong>{service?.organizationName}</strong>
            </Typography>
            <Typography variant="subtitle2" gutterBottom>
              {dictionary.UserName}: <strong>{service?.userName}</strong>
            </Typography>
            {service?.agentName!=null  &&
                <Typography variant="subtitle2" gutterBottom>{dictionary.AgentName}: {service?.agentName}</Typography>
            }
            {(service?.charges!=undefined && service?.charges!=0)&&
             <Typography variant="subtitle2" gutterBottom>
              {dictionary.ServiceRequestChargesFees}: <strong>{service?.charges}</strong>
            </Typography>
            }
            {service?.agentResponse!=null  &&
                <Typography variant="subtitle2" gutterBottom>{dictionary.Comment}: {service?.agentResponse}</Typography>
            }
            {(service?.listTechnician!=null && service?.listTechnician.suggestions.length>0)  &&
              <Box>
                  <Typography variant="subtitle2" gutterBottom>{dictionary.TechnicianSuggestions}:</Typography>
                  {service?.listTechnician.suggestions.map((suggestion, index) => (
                    <Box key={index} mb={1}>
                      <Typography variant="body1" sx={{ml:3}}>
                        {dictionary.TechnicianName}: <strong>{suggestion.technician}</strong>
                      </Typography>
                      <Typography variant="body1" sx={{ml:3}}>
                        {dictionary.TechnicianScore}: <strong>{suggestion.score}</strong>
                      </Typography>
                    </Box>
                  ))}
              </Box>
            }
             <Box
                sx={{
                    mb: 1,
                    mt:3,
                    display: 'flex',
                    width:'100%',
                    justifyContent:  'space-between'
                }}
            >
                <Box>
                    {getPaidBadge(service?.isPaid)}
                </Box>
                <Box>
                    {getStatusBadge(service?.status)}
                </Box>
            </Box>
            
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
   </Box>
  )
}

ServiceRequestDetails.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  service: PropTypes.object,
}

export default ServiceRequestDetails
