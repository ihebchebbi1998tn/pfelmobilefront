import { useState, useEffect, useRef } from 'react'
import { Box, CardMedia } from '@mui/material'
import PropTypes from 'prop-types'

const ServiceImagePreview = ({ serviceRequest, handleOpenModalDetails }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const intervalRef = useRef(null)

  const images = serviceRequest?.images || []

  useEffect(() => {
    if (isHovered && images.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length)
      }, 700) 
    } else {
      clearInterval(intervalRef.current)
      setCurrentIndex(0)
    }

    return () => clearInterval(intervalRef.current)
  }, [isHovered, images.length])

  return (
    <Box
      position="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{ display: 'inline-block', cursor: 'pointer' }}
      onClick={(e) => {
        e.stopPropagation()
        handleOpenModalDetails(serviceRequest)
      }}
    >
      <CardMedia
    component="img"
    image={images[currentIndex]?.imageUrl}
    alt={images[currentIndex]?.imageName}
    sx={{
      borderRadius: '10px',
      transition: '0.8s ease-in-out',
      maxHeight: '150px',
      maxWidth: '60%',
      height: 'auto',
      display: 'block',
    }}
  />
    </Box>
  )
}
ServiceImagePreview.propTypes = {
  handleOpenModalDetails: PropTypes.func,
  serviceRequest: PropTypes.object,
}
export default ServiceImagePreview
