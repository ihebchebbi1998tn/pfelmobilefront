import { Menu, MenuItem, Box } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import VisibilityIcon from '@mui/icons-material/Visibility'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import ToggleOnIcon from '@mui/icons-material/ToggleOn'
import PendingActionsIcon from '@mui/icons-material/PendingActions'
import PropTypes from 'prop-types'

const MenuActions = ({
  item,
  anchorEls,
  actions,
  userPermissions,
  onClose
}) => {
const getIconAction = (action) => {

    switch (action.type) {
      case 'update':
        return (
         <Box
          component="span"
            sx={{ display: 'flex', alignItems: 'center' }}
         >
            <EditIcon />
         </Box>
        )
      case 'delete':
        return (
         <Box
          component="span"
            sx={{ display: 'flex', alignItems: 'center' }}
         >
            <DeleteForeverIcon />
         </Box>
        )
      case 'show':
         return (
         <Box
          component="span"
            sx={{ display: 'flex', alignItems: 'center' }}
         >
            <VisibilityIcon />
         </Box>
        )
      case 'toggle':
          return (
         <Box
          component="span"
            sx={{ display: 'flex', alignItems: 'center' }}
         >
            <ToggleOnIcon />
         </Box>
        )
      default:
         return (
         <Box
          component="span"
            sx={{ display: 'flex', alignItems: 'center' }}
         >
            <PendingActionsIcon />
         </Box>
        )
    }
}
  return (
    <Menu
        anchorEl={anchorEls[item.id]}
        open={Boolean(anchorEls[item.id])}
        onClose={() => onClose(item.id)}
        sx={{
          '& .MuiPaper-root': {
            borderRadius: '20px',
          },
        }}
      >
        {actions.map((action) => {
          const shouldDisplay =
            !action.permissions ||
            action.permissions.length === 0 || 
            action.permissions.some(p => userPermissions.includes(p))

          return shouldDisplay && (
            <MenuItem
              key={action.label}
              onClick={() => {
                action.onClick(item);
                onClose(item.id);
              }}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              {(action.icon && action.type) && getIconAction(action)}
              {action.label}
            </MenuItem>
          )
        })}
      </Menu>
 )
}
        
MenuActions.propTypes = {
    item: PropTypes.object.isRequired, 
    anchorEls: PropTypes.object.isRequired, 
    actions: PropTypes.array.isRequired,  
    userPermissions: PropTypes.array.isRequired, 
    onClose: PropTypes.func.isRequired
}   
export default MenuActions
        