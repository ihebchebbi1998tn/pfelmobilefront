import { Box, Typography, Tabs, Tab, IconButton, useTheme, CardMedia } from '@mui/material'
import { AnimatePresence, motion } from 'framer-motion'
import { useLanguage } from '../../hooks/LanguageContext'
import { useAuth } from '../../hooks/AuthContext'
import { InfoOutlined } from '@mui/icons-material'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import PropTypes from 'prop-types'
import { useState } from 'react'
import { format } from 'date-fns'
import MenuActions from './MenuActions'
import CustomBadge from './CustomBadge'

const TabContainer = ({
  data,
  fields,
  actions,
  userPermissions,
  backgroundColors,
  imagePositions,
  currentPage,
  totalPages,
  onNext,
  onPrevious,
  handleshowObject
}) => {
  const theme = useTheme()
  const { dictionary, currency } = useLanguage()
  const { user } = useAuth()
  const isDark = theme.palette.mode === 'dark'
  const [anchorEls, setAnchorEls] = useState({})

  const visibleFields =(fields!=null && Array.isArray(fields)) ? fields.filter(f => f.visible ) : []
  const uniqueField = (fields!=null && Array.isArray(fields)) ? fields.find(f => f.unique): null
  const imageField = (fields!=null && Array.isArray(fields)) ? fields.find(f => f.type === 'image') : null
  const fieldsToRender = (fields!=null && Array.isArray(fields)) ? visibleFields.filter(f => f !== imageField) : null

  const imagePosition = imagePositions

  const handleChange = (_, newValue) => {
    const targetPage = newValue + 1
    if (targetPage > currentPage) {
      onNext()
    } else if (targetPage < currentPage) {
      onPrevious()
    }
  }

  const handleOpenMenu = (e, id) => {
    setAnchorEls(prev => ({ ...prev, [id]: e.currentTarget }))
  }

  const handleCloseMenu = (id) => {
    setAnchorEls(prev => ({ ...prev, [id]: null }))
  }

    const getNestedValue = (obj, path) => {
  return path.split('.').reduce((acc, part) => acc?.[part], obj)
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

  const renderValueByType = (item,field, value) => {
    switch (field.type) {
      case 'date':
        return (
          <Box display="flex" alignItems="center" gap={1}>
            <AccessTimeIcon fontSize="small" />
            {value ? format(new Date(value), 'dd/MM/yyyy') : ''}
          </Box>
        )
      case 'image':
        return renderImageWithContent(value, imagePosition)
      default:
        return (
          <Typography variant="body1">
            {value}
          </Typography>
        )
    }
  }

  const getDisplayValue = (item, field) => {
    const val = getNestedValue(item,field?.value)

    if (field.unique) {
      return (
        <Box display="flex" justifyContent="space-between" alignItems="center">
          {field.visible && 
          <Typography variant="h6">{val}</Typography>
          }
          
          {(actions.length > 0 &&
            actions.some(
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

    if (field.isItSatus) {
      const badge = renderStatusBadge(val)
      if (badge) return badge
    }

    if (field.type === 'array' && Array.isArray(val)) {
      return (
        <>
          {val.length}
        </>
      )
    }

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
          {val}%
        </>
      )
      : null
    }

    if(field.value === 'quantity'){
          return item.quantity > 0 ? <CustomBadge label={dictionary.InStock} type="success" /> : <CustomBadge label={dictionary.OutOfStock} type="danger" />
     }

    return renderValueByType(item,field, val)
  }

  const renderImageWithContent = (item,imageUrl, position) => {
    if(!imageField?.visible) return null
    if (!imageUrl) return null
    const isVertical = position === 'top' || position === 'bottom'
    let flexDirection
    if (isVertical) {
      flexDirection = position === 'top' ? 'column' : 'column-reverse'
    } else {
      flexDirection = position === 'left' ? 'row' : 'row-reverse'
    }

    return (
      <Box
        display="flex"
        flexDirection={flexDirection}
        alignItems={isVertical ? 'center' : 'flex-start'}
        gap={2}
        sx={{ width: '100%' }}
      >
        <Box position="relative">
          <CardMedia
            component="img"
            image={imageUrl}
            alt={"photo"}
             sx={{
            width: { xs: '100%', sm: 150, md: 200, lg: 300 },
            maxHeight: { xs: 200, sm: 250, md: 300, lg: 400 },
            borderRadius: 2,
            objectFit: 'cover'
          }}
          />
          <IconButton
            sx={{
              position: 'absolute',
              top: 1,
              right: 1,
              background: 'rgba(0,0,0,0.5)',
              color: 'white',
              '&:hover': { background: 'rgba(0,0,0,0.7)' },
            }}
            onClick={(e) => {
              e.stopPropagation()
              handleshowObject(item)
            }}
          >
            <InfoOutlined />
          </IconButton>
        </Box>
      </Box>
    )
  }

  const renderTabContent = (items) => (
    <Box display="flex" flexDirection="column" gap={2}>
      {items.map(item => {
        const imageUrl = getNestedValue(item,imageField?.value)
        const unique = getDisplayValue(item, uniqueField)
        const fieldsContent = fieldsToRender
          .filter(f => f.value !== uniqueField?.value && f.value !== imageField?.value)
          .map(f => <Box key={f.value} >{getDisplayValue(item, f)}</Box>)

        const image = renderImageWithContent(item,imageUrl, imagePosition)

        return (
          <Box key={item.id} p={2} sx={{ border: '1px solid #ccc', borderRadius: 2 }}>
            {imagePosition === 'Top' && (
              <>
                {unique}
                {image}
                {fieldsContent}
              </>
            )}
            {imagePosition === 'Bottom' && (
              <>
                {unique}
                {fieldsContent}
                {image}
              </>
            )}
            {(imagePosition === 'Left' || imagePosition === 'Right') && (
              <>
                {unique}
                <Box display="flex" gap={2} mt={2}>
                  {imagePosition === 'Left' && image}
                  <Box display="flex" flexDirection="column" gap={1}>
                    {fieldsContent}
                  </Box>
                  {imagePosition === 'Right' && image}
                </Box>
              </>
            )}
          </Box>
        )
      })}
    </Box>
  )

  if (data!=null && data.length === 0) return <Typography>{dictionary.NoDataFound}</Typography>

  return (
    <Box>
      <Tabs
        value={currentPage - 1}
        onChange={handleChange}
        variant="scrollable"
        scrollButtons="auto"
        TabIndicatorProps={{
          style: {
            backgroundColor: user.organization.primaryColor, 
          },
        }}
        sx={{
          backgroundColor: isDark ? '#18141c' : '#eeefef',
          borderRadius: 4,
          mb: 2,
          p: 1
        }}
      >
        {Array.from({ length: totalPages }, (_, i) => (
          <Tab 
          key={i} 
          label={`${dictionary.Page} ${i + 1}`} 
           sx={{
            '&.Mui-selected': {
              color: user.organization.primaryColor, 
            }
           }}
          />
        ))}
      </Tabs>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {backgroundColors!=null && 
            <Box
            sx={{
              p: 2,
              backgroundColor: isDark ? backgroundColors.dark : backgroundColors.light,
              borderRadius: 4
            }}
          >
            {renderTabContent(data)}
          </Box>
          }
        </motion.div>
      </AnimatePresence>

    </Box>
  )
}

TabContainer.propTypes = {
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

TabContainer.defaultProps = {
  actions: [],
  userPermissions: [],
  currentPage: 1,
  totalPages: 1,
  onNext: () => {},
  onPrevious: () => {}
}

export default TabContainer
