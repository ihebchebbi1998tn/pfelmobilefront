import { useState, useEffect } from 'react'
import {
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  IconButton,
  Rating, 
  TextField 
} from '@mui/material'
import feedbackService from '../../../services/feedbackService'
import { useLanguage } from '../../../hooks/LanguageContext'
import { useAuth } from '../../../hooks/AuthContext'
import PropTypes from 'prop-types'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import animationData from '../../../assets/animation/feedback.lottie'
import Button from '../../ui/Button'
import CustomBadge from '../../ui/CustomBadge'

const ServiceRequestDetails = ({ open, onClose, service }) => {
  const { dictionary } = useLanguage()
  const { user } = useAuth()
  const images = service?.images || []
  const [currentIndex, setCurrentIndex] = useState(0)
  const [openFeedbackDialog, setOpenFeedbackDialog] = useState(false)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')

  const submitFeedback = async () => {
    try {
      await feedbackService.addFeedback({
        serviceRequestId: service.id,
        rating,
        comment,
      })
      onClose()
    } catch (e) {
      console.error('Failed to submit feedback:', e)
    }
  }

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
             case "Dispatched": 
                 return <CustomBadge label={dictionary.Dispatched} type="warning" />
             case "Completed": 
                 return <CustomBadge label={dictionary.Completed} type="success" />
             default:
                 return <CustomBadge label={dictionary.Pending} type="gray" />
       }
     }
  const handleOpenFeedBackModal=()=>{
    setOpenFeedbackDialog(true)
  }
  useEffect(() => {
    if (open && service?.status === "Completed" && !service?.feedback && service?.userId==user.id) {
      setOpenFeedbackDialog(true)
    }
  }, [open, service])

  return (
   <Box>
     <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{service?.customerDevice.device.name}</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3}>
          <Box flex={1}>
            {images.length > 0 && (
              <Box position="relative">
                <img
                  src={images[currentIndex]?.imageUrl}
                  alt={images[currentIndex]?.imageName}
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
                    key={img.id}
                    component="img"
                    src={img.imageUrl}
                    alt={img.imageName}
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

            {service?.description && (
              <Box mt={2}>
                <Typography variant="subtitle2" gutterBottom>
                  {dictionary.Description}
                </Typography>
                <Typography variant="body1">{service.description}</Typography>
                {(service?.status === "Completed" && !service?.feedback && service?.userId==user.id)&&
                 <Button
                    variant="primary"
                    onClick={() => handleOpenFeedBackModal()}
                  >
                    {dictionary.FeedBack}
                  </Button>
                }
              </Box>
            )}
          </Box>

          <Box flex={1} mt={4}>
            <Typography variant="subtitle2" gutterBottom>
               <strong>{service?.title}</strong>
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
            {(service?.status=="Completed"&&service?.feedback)&&
              <Box>
                {service?.feedback?.comment&&
                  <Typography variant="subtitle2" gutterBottom>
                    {dictionary.Comment}: <strong>{service?.feedback?.comment}</strong>
                  </Typography>
                }
                {service?.feedback?.responseComment&&
                  <Typography variant="subtitle2" gutterBottom>
                    {dictionary.ResponseComment}: <strong>{service?.feedback?.responseComment}</strong>
                  </Typography>
                }
                <Rating
                  value={service?.feedback.rating}
                  readOnly
                />
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
    <Dialog open={openFeedbackDialog} onClose={() => setOpenFeedbackDialog(false)}>
      <DialogTitle>{dictionary.LetUsAFeedback}</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3}>
          <Box flex={1} display="flex" >
            <DotLottieReact
              src={animationData}
              loop
              autoplay
              style={{ width: '100%', maxWidth: 600, height: '130px',marginTop:50 }}
            />
          </Box>
          <Box flex={2} display="flex" flexDirection="column" gap={2}>
            <Typography>{dictionary.RatingLabel}</Typography>
            <Rating
              value={rating}
              onChange={(e, newValue) => setRating(newValue)}
            />
            <TextField
              label={dictionary.Comment}
              multiline
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              fullWidth
            />
          </Box>
        </Box>
        <Box display="flex" justifyContent="flex-end" gap={2} mt={4}>
          <Button
            variant="primary"
            onClick={async () => {
              await submitFeedback()
              setOpenFeedbackDialog(false)
            }}
            disabled={rating === 0}
          >
            {dictionary.confirm}
          </Button>
          <Button
            variant="primary"
            onClick={() => setOpenFeedbackDialog(false)}
          >
            {dictionary.close}
          </Button>
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
