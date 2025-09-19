import { Box, Typography } from '@mui/material'
import Divider from '@mui/material/Divider'
import Chip from '@mui/material/Chip'
import Modal from '../../ui/Modal'
import { useAuth } from '../../../hooks/AuthContext'
import { useLanguage } from '../../../hooks/LanguageContext'
import RoleHelper  from '../Role/RoleHelper'
import PropTypes from 'prop-types'

const UserDetails = ({ open, onClose, userDetail }) => {
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
      className="custom-modal"
      colorModal={colorModal}
    >
      {userDetail && (
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
              {dictionary.UserDetails}
            </Typography>
          </Box>
          <Typography variant="h5" sx={{ pl: 2, fontWeight: 'bold' }}>
            {dictionary.UserRole} :
          </Typography>
            <Box>
              <Typography sx={{ fontWeight: 'bold' }}>
                {dictionary.RoleName} :{' '}
                <span style={{ fontWeight: 'normal' }}>{userDetail?.role?.roleName}</span>
              </Typography>
              <Typography sx={{ fontWeight: 'bold' }}>
                {dictionary.RolePermissions} :
              </Typography>
              {userDetail?.role?.permissions?.map((permission) => (
                <Box key={permission}>
                  <RoleHelper permission={permission} />
                  <Divider />
                </Box>
              ))}
            </Box>
          <Divider>
            <Chip label={dictionary.Addresses} size="small" />
          </Divider>
          <Typography variant="h5" sx={{ pl: 2, fontWeight: 'bold' }}>
            {dictionary.UserAddresses} :
          </Typography>
          {userDetail && userDetail.address.id != 0 ? (
            <Box key={user.address.id}>
              <Typography sx={{ fontWeight: 'bold' }}>
                {dictionary.StreetName} :{' '}
                <span style={{ fontWeight: 'normal' }}>
                  {userDetail.address.streetName}
                </span>
              </Typography>
              <Typography sx={{ fontWeight: 'bold' }}>
                {dictionary.City} :{' '}
                <span style={{ fontWeight: 'normal' }}>
                  {userDetail.address.city}
                </span>
              </Typography>
              <Typography sx={{ fontWeight: 'bold' }}>
                {dictionary.State} :{' '}
                <span style={{ fontWeight: 'normal' }}>
                  {userDetail.address.state}
                </span>
              </Typography>
              <Typography sx={{ fontWeight: 'bold' }}>
                {dictionary.ZipCode} :{' '}
                <span style={{ fontWeight: 'normal' }}>
                  {userDetail.address.zipCode}
                </span>
              </Typography>
            </Box>
          ) : (
            <Typography sx={{ fontWeight: 'normal' }}>
              {dictionary.UserDontHaveAddresses}
            </Typography>
          )}
          <Divider>
            <Chip label={dictionary.Organisation} size="small" />
          </Divider>
          <Typography sx={{ fontWeight: 'bold' }}>
            {dictionary.OrganisationName} :{' '}
            <span style={{ fontWeight: 'normal' }}>
              {userDetail.clientOrganization.name}
            </span>
          </Typography>
        </Box>
      )}
    </Modal>
  )
}
  UserDetails.propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func,
    userDetail: PropTypes.object,
  }
export default UserDetails
