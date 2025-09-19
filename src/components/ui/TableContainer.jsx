import {
  Table, TableHead, TableRow, TableCell, TableBody, Paper, TableContainer,
  IconButton, Typography, useTheme, 
  Box} from '@mui/material'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import { AnimatePresence, motion } from 'framer-motion'
import { useLanguage } from '../../hooks/LanguageContext'
import MenuActions from './MenuActions'
import CustomBadge from './CustomBadge'
import Pagination from './Pagination'
import { useState } from 'react'
import { format } from 'date-fns'
import PropTypes from 'prop-types'

const TableContainerComponent = ({ data, fields, actions, userPermissions, backgroundColors, currentPage, totalPages, onNext, onPrevious }) => {
  const theme = useTheme()
  const { dictionary, currency } = useLanguage()
  const visibleFields =(fields!=null && Array.isArray(fields)) ? fields.filter(f => f.visible ) : []
  const [anchorEls, setAnchorEls] = useState({})

  const handleOpenMenu = (e, id) => {
    setAnchorEls(prev => ({ ...prev, [id]: e.currentTarget }))
  }
  const handleCloseMenu = (id) => {
    setAnchorEls(prev => ({ ...prev, [id]: null }))
  }
 const getNestedValue = (obj, path) => {
  return path.split('.').reduce((acc, part) => acc?.[part], obj)
}
  const getDisplayValue = (item, field) => {
    const value = getNestedValue(item,field?.value)
    if(field.isItSatus){
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
    else if(field.type==="array"&&Array.isArray(value)){
     return value.length
    }
    else if(field.value === 'price'){
      const price = parseFloat(item.price)
      const tva = parseFloat(item.tva)
      const ttc = tva === 0 ? price : price + (price * tva) / 100
      return <Typography>{ttc.toFixed(2)} {currency}</Typography>
    }
    else if(field.value === 'tva'){
      return item.tva !== 0 ? <Typography>{value}%</Typography> : null
    }
    else if(field.value === 'quantity'){
      return item.quantity > 0 ? <CustomBadge label={dictionary.InStock} type="success" /> : <CustomBadge label={dictionary.OutOfStock} type="danger" />
    }
    else{
    switch (field.type) {
      case 'date': 
        return format(new Date(value), 'dd/MM/yyyy')??''
      case 'image':
        return <img src={value} alt={field.label} style={{ width: 40, height: 40, borderRadius: 4 }} />
      default:
        return value
    }
  }
  }

  return (data!=null && data.length === 0) ? (
    <Typography variant="body1" sx={{ mt: 2 }}>{dictionary.NoDataFound}</Typography>
  ) : (
   <Box>
    <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
     <TableContainer component={Paper} sx={{ mt: 2, borderRadius: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            {visibleFields.map(field => (
              <TableCell key={field.value}
               sx={{
                    fontWeight: 'bold',
                    backgroundColor:
                      theme.palette.mode === 'dark'
                        ? backgroundColors.dark
                        : backgroundColors.light,
                    color: theme.palette.text.primary,
                  }}
              >{field.label}</TableCell>
            ))}
            {(actions!=null && Array.isArray(actions) && actions.length > 0) && actions.some(action =>
              !action.permissions || 
              action.permissions.length === 0 ||
              action.permissions.some(p => userPermissions.includes(p)) 
            ) && (
              <TableCell
                align="center"
                sx={{
                  fontWeight: 'bold',
                  backgroundColor:
                    theme.palette.mode === 'dark'
                      ? backgroundColors.dark
                      : backgroundColors.light,
                  color: theme.palette.text.primary,
                }}
              >
                {dictionary.Actions}
              </TableCell>
            )}

          </TableRow>
        </TableHead>
        <TableBody>
          {(data!=null && Array.isArray(data))&& data?.map((item) => (
            <TableRow key={item.id} sx={{
              backgroundColor: theme.palette.mode === 'dark' ? '#18141c' : '#fff',
              '&:hover': {
                  cursor: 'pointer',
                  backgroundColor: theme.palette.action.hover,
              },
              transition: 'background-color 0.3s ease',
            }}>
              {visibleFields.map((field) => (
                <TableCell key={field.value}>
                  {getDisplayValue(item, field)}
                </TableCell>
              ))}
              {actions.length > 0 && (
                <TableCell align="center" sx={{display:(actions.length > 0 && actions.some(
                  action =>
              !action.permissions || 
              action.permissions.length === 0 ||
              action.permissions.some(p => userPermissions.includes(p)) 
                ))? 'table-cell' : 'none'}}>
                  {actions.some(
                    action =>
              !action.permissions || 
              action.permissions.length === 0 ||
              action.permissions.some(p => userPermissions.includes(p)) 
                  ) && (
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
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
     </motion.div>
      </AnimatePresence>
    <Pagination currentPage={currentPage} totalPages={totalPages} onNext={onNext} onPrevious={onPrevious}/>
   </Box>
  )
}

TableContainerComponent.propTypes = {
  data: PropTypes.array.isRequired,
  fields: PropTypes.array.isRequired,
  actions: PropTypes.array,
  userPermissions: PropTypes.array,
  backgroundColors :PropTypes.object,
  currentPage: PropTypes.number, 
  totalPages: PropTypes.number, 
  onNext: PropTypes.func, 
  onPrevious: PropTypes.func
}

TableContainerComponent.defaultProps = {
  actions: [],
  userPermissions: []
}

export default TableContainerComponent;
