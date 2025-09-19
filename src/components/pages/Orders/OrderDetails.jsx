import { useState } from 'react'
import {
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  IconButton 
} from '@mui/material'
import { useLanguage } from '../../../hooks/LanguageContext'
import { useAuth } from '../../../hooks/AuthContext'
import PropTypes from 'prop-types'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import CustomBadge from '../../ui/CustomBadge'

const OrderDetails = ({ open, onClose, order }) => {
  const { dictionary, currency } = useLanguage()
  const { user } = useAuth()
  const images = order?.sparePartOrders || []
  const [currentIndex, setCurrentIndex] = useState(0)


  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const handleThumbnailClick = (index) => {
    setCurrentIndex(index)
  }

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
             case "Delivered": 
                 return <CustomBadge label={dictionary.Delivered} type="success" />
             default:
                 return <CustomBadge label={dictionary.Pending} type="gray" />
       }
     }

  return (
   <Box>
     <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle></DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3}>
          <Box flex={1}>
            {images.length > 0 && (
              <Box position="relative">
                <img
                  src={images[currentIndex]?.sparePart?.imageUrl}
                  alt={images[currentIndex]?.sparePart?.imageName}
                  style={{
                    width: '100%',
                    borderRadius: 8,
                    marginBottom: 8,
                    objectFit: 'cover',
                    height: 250,
                  }}
                />
                {images.length > 1 && (
                  <>
                    <IconButton
                      onClick={handlePrev}
                      sx={{
                        position: 'absolute',
                        top: '50%',
                        left: 0,
                        transform: 'translateY(-50%)',
                       
                        '&:hover': { backgroundColor: '#f0f0f0' },
                      }}
                    >
                      <ArrowBackIosNewIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      onClick={handleNext}
                      sx={{
                        position: 'absolute',
                        top: '50%',
                        right: 0,
                        transform: 'translateY(-50%)',
                        
                        '&:hover': { backgroundColor: '#f0f0f0' },
                      }}
                    >
                      <ArrowForwardIosIcon fontSize="small" />
                    </IconButton>
                  </>
                )}
              </Box>
            )}

            {images.length > 1 && (
              <Box display="flex" mt={1} gap={1} flexWrap="wrap">
                {images.map((img, index) => (
                  <Box
                    key={img.sparePart.id}
                    component="img"
                    src={img.sparePart.imageUrl}
                    alt={img.sparePart.imageName}
                    onClick={() => handleThumbnailClick(index)}
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 1,
                      objectFit: 'cover',
                      border: currentIndex === index ? `2px solid ${user.organization.primaryColor}` : '1px solid #ccc',
                      cursor: 'pointer',
                    }}
                  />
                ))}
              </Box>
            )}

             {(order?.sparePartOrders!=null && order?.sparePartOrders.length>0)  &&
                <Box mt={2}>
                    <Typography variant="subtitle2" gutterBottom>{dictionary.SpareParts}:</Typography>
                    {order?.sparePartOrders.map((sparePartOrder) => (
                        <Box
                            key={sparePartOrder.id}
                            display="flex"
                            gap={1} 
                            mb={1}
                        >
                            <Typography variant="subtitle2" sx={{ml:3}}>
                                {sparePartOrder.sparePart.title}
                            </Typography>
                            <Typography variant="subtitle2">
                                {dictionary.Quantity}: {sparePartOrder.quantity}
                            </Typography>
                            <Typography variant="subtitle2">
                                {dictionary.TotalPrice} : 
                                 {(
                                    sparePartOrder.sparePart?.tva === 0
                                    ?  sparePartOrder.sparePart?.price * sparePartOrder.quantity
                                    :  (sparePartOrder.sparePart?.price+((sparePartOrder.sparePart?.price *  sparePartOrder.sparePart?.tva) / 100)) * sparePartOrder.quantity
                                ).toFixed(2)} {currency}
                            </Typography>
                        </Box>
                    ))}
              </Box>
             }
          </Box>
          <Box flex={1} mt={4}>
            <Typography variant="subtitle2" gutterBottom>
              {dictionary.OrganisationName}: <strong>{order?.organizationName}</strong>
            </Typography>
            <Typography variant="subtitle2" gutterBottom>
              {dictionary.UserName}: <strong>{order?.userName}</strong>
            </Typography>
            {order?.agentName!=null  &&
                <Typography variant="subtitle2" gutterBottom>{dictionary.AgentName}: {order?.agentName}</Typography>
            }
            {(order?.deliveryCosts!=undefined && order?.deliveryCosts!=0)&&
             <Typography variant="subtitle2" gutterBottom>
              {dictionary.DeliveryCosts}: <strong>{order?.deliveryCosts}</strong>
            </Typography>
            }
            {order?.agentResponse!=null  &&
                <Typography variant="subtitle2" gutterBottom>{dictionary.Comment}: {order?.agentResponse}</Typography>
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
                    {getPaidBadge(order?.isPaid)}
                </Box>
                <Box>
                    {getStatusBadge(order?.status)}
                </Box>
            </Box>
            
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
   </Box>
  )
}

OrderDetails.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  order: PropTypes.object,
}

export default OrderDetails
