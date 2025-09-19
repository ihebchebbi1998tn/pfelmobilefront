import { useState } from 'react'
import { Box, Typography, IconButton, useTheme, CardMedia } from '@mui/material'
import { AnimatePresence, motion } from 'framer-motion'
import { useLanguage } from '../../hooks/LanguageContext'
import { InfoOutlined } from '@mui/icons-material'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import MenuActions from './MenuActions'
import CustomBadge from './CustomBadge'
import Pagination from './Pagination'
import { format } from 'date-fns'
import PropTypes from 'prop-types'

const ColumnContainer = ({ data, fields, actions, userPermissions, backgroundColors, imagePositions, currentPage, totalPages, onNext, onPrevious, handleshowObject }) => {
  const theme = useTheme()
  const { dictionary, currency } = useLanguage()
  const isDark = theme.palette.mode === 'dark'
  const [anchorEls, setAnchorEls] = useState({})
  const imagePosition = imagePositions
  const imageField = (fields!=null && Array.isArray(fields)) ? fields.find(f => f.type === 'image') : null
  const uniqueField = (fields!=null && Array.isArray(fields)) ? fields.find(f => f.unique): null
  const visibleFields =(fields!=null && Array.isArray(fields)) ? fields.filter(f => f.visible && f !== imageField) : []

  const handleOpenMenu = (e, id) => {
    setAnchorEls(prev => ({ ...prev, [id]: e.currentTarget }))
  }

  const handleCloseMenu = (id) => {
    setAnchorEls(prev => ({ ...prev, [id]: null }))
  }

  const renderStatusBadge = (value) => {
    switch (value) {
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
            case "Delivered": 
              return <CustomBadge label={dictionary.Delivered} type="success" />
            case "Completed": 
              return <CustomBadge label={dictionary.Completed} type="success" />
            default:
              return <CustomBadge label={dictionary.Pending} type="gray" />
          }
  }

  const renderValueByType = (field, value) => {
    switch (field.type) {
      case 'date':
        return (
          <Box display="flex" alignItems="center" gap={1} sx={{mb:1}}>
            <AccessTimeIcon fontSize="small" />
            {value ? format(new Date(value), 'dd/MM/yyyy') : ''}
          </Box>
        )
      default:
        return (
           <Typography variant="body1">
                {value}
            </Typography>
        )
    }
  }

  const renderField = (item, field) => {
    const value =getNestedValue(item,field.value) 

    if (field.isItSatus) return <Box sx={{mb:1}}>{renderStatusBadge(value)}</Box>
    if (field.type === "array" && Array.isArray(value)) return <><span style={{marginBottom:1}}>{field.label}</span> : {value.length}</>
    if(field.value === 'price'){
      const price = parseFloat(item.price)
      const tva = parseFloat(item.tva)
      const ttc = tva === 0 ? price : price + (price * tva) / 100
      return (
        <>
           {ttc.toFixed(2)} {currency}
        </>
      )
    }
    if(field.value === 'tva'){
      return item.tva !== 0 ? 
      (
        <>
           {value}%
        </>
      )
      : null
    }
    if(field.value === 'quantity'){
              return item.quantity > 0 ? <CustomBadge label={dictionary.InStock} type="success" /> : <CustomBadge label={dictionary.OutOfStock} type="danger" />
         }
    return renderValueByType(field, value)
  }

  const getNestedValue = (obj, path) => {
  return path.split('.').reduce((acc, part) => acc?.[part], obj)
}


  const renderUniqueField = (item) => {
    const value =getNestedValue(item,uniqueField?.value)
    return (
      <Box display="flex" justifyContent="space-between" alignItems="center">
        {uniqueField?.visible&&
          <Typography variant="h6">{value}</Typography>
        }
        
        {(actions.length > 0 && actions.some(
          action =>
              !action.permissions || 
              action.permissions.length === 0 ||
              action.permissions.some(p => userPermissions.includes(p))
        )) && (
          <>
            <IconButton onClick={(e) => handleOpenMenu(e, item.id)}>
              <MoreVertIcon />
            </IconButton>
            <MenuActions
              item={item}
              anchorEls={anchorEls}
              actions={actions}
              userPermissions={userPermissions}
              onClose={handleCloseMenu}
            />
          </>
        )}
      </Box>
    )
  }

  const renderImage = (item) => {
    if (!imageField?.visible) return null
    const imageUrl = getNestedValue(item,imageField?.value) 
    if (!imageUrl) return null

    return (
      <Box position="relative" display="inline-block">
      <CardMedia
        component="img"
        image={imageUrl}
        alt="photo"
        sx={{
          width: { xs: '100%', sm: 150, md: 200, lg: 300 },
          maxHeight: { xs: 200, sm: 250, md: 300, lg: 400 },
          borderRadius: 2,
          objectFit: 'cover',
        }}
      />
      <IconButton
        sx={{
          position: 'absolute',
          top: 1,
          right: 1,
          zIndex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          color: 'white',
          '&:hover': {
            backgroundColor: 'rgba(0,0,0,0.7)',
          },
        }}
        onClick={(e) => {
          e.stopPropagation()
          handleshowObject(item)
        }}
      >
        <InfoOutlined />
      </IconButton>
    </Box>
    )
  }

  const renderContent = (item) => {
    const fieldsToRender = visibleFields.filter(f => f.value !== uniqueField?.value && f.value !== imageField?.value)

    if (imagePosition === 'Top') {
      return (
        <>
          {renderUniqueField(item)}
          {renderImage(item)}
          {fieldsToRender.map(field => <Box key={field.value}>{renderField(item, field)}</Box>)}
        </>
      )
    }

    if (imagePosition === 'Bottom') {
      return (
        <>
          {renderUniqueField(item)}
          {fieldsToRender.map(field => <Box key={field.value}>{renderField(item, field)}</Box>)}
          {renderImage(item)}
        </>
      )
    }

    if (imagePosition === 'Left' || imagePosition === 'Right') {
      return (
        <>
          {renderUniqueField(item)}
          <Box display="flex" gap={2} mt={2}>
            {imagePosition === 'Left' && renderImage(item)}
            <Box display="flex" flexDirection="column" gap={1}>
              {fieldsToRender.map(field => <Box key={field.value}>{renderField(item, field)}</Box>)}
            </Box>
            {imagePosition === 'Right' && renderImage(item)}
          </Box>
        </>
      )
    }

    return null
  }

  return (
  <Box>
    <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
      <Box display="flex" flexDirection="column" gap={2}>
      {(data!=null &&  Array.isArray(data)) && data.map((item) => (
        <Box
          key={item.id}
          sx={{
            p: 2,
            borderRadius: 2,
            boxShadow: 2,
            minHeight: 320,
            backgroundColor: isDark ? backgroundColors.dark : backgroundColors.light
          }}
        >
          {renderContent(item)}
        </Box>
      ))}
    </Box>
     </motion.div>
      </AnimatePresence>
    <Pagination currentPage={currentPage} totalPages={totalPages} onNext={onNext} onPrevious={onPrevious}/>
  </Box>
  )
}

ColumnContainer.propTypes = {
  data: PropTypes.array.isRequired,
  fields: PropTypes.array.isRequired,
  actions: PropTypes.array,
  userPermissions: PropTypes.array,
  backgroundColors: PropTypes.object,
  imagePositions: PropTypes.object,
  currentPage: PropTypes.number, 
  totalPages: PropTypes.number, 
  onNext: PropTypes.func, 
  onPrevious: PropTypes.func,
  handleshowObject: PropTypes.func
}

ColumnContainer.defaultProps = {
  actions: [],
  userPermissions: []
}

export default ColumnContainer
