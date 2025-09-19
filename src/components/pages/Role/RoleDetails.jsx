import PropTypes from 'prop-types'
import { Box, Typography } from '@mui/material'
import Divider from '@mui/material/Divider'
import Modal from '../../ui/Modal'
import { useLanguage } from '../../../hooks/LanguageContext'
import { useAuth } from '../../../hooks/AuthContext'
import RoleHelper  from './RoleHelper'

const RoleDetails = ({ open, onClose, role }) => {
  const { dictionary } = useLanguage()
  const { user } = useAuth()
  const colorModal = `linear-gradient(
    to bottom,
    #373b44,
    ${user.organization.primaryColor},
    rgba(255, 255, 255, 0.6),
    white
    ) !important`
  return (
    <Modal
      open={open}
      onClose={onClose}
      showConfirmButton={false}
      colorModal={colorModal}
    >
      {role && (
        <Box sx={{ width: { xs: '300px', sm: '500px' } }}>
          <Typography
            variant="h3"
            sx={{
             
              fontWeight: 'bold',
            }}
          >
            {dictionary.RoleName} : {role.name}
          </Typography>
          <Typography variant="h5" sx={{ pl: 2, fontWeight: 'bold' }}>
            {dictionary.RolePermissions} :
          </Typography>
          <Box>
            {role?.permissions?.map((permission) => (
              <Box key={permission}>
                <RoleHelper permission={permission} />
                <Divider />
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Modal>
  )
}

 RoleDetails.propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func,
    role: PropTypes.object,
  }

export default RoleDetails
