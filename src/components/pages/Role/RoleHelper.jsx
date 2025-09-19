import { useLanguage } from '../../../hooks/LanguageContext'
import { Typography, useTheme } from '@mui/material'
import PropTypes from 'prop-types'

const RoleHelper = ({ permission }) => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const { dictionary } = useLanguage()

  const permissionMap = {
    "Permissions.AllowAll": dictionary.PermissionAllowAll,
    "Permissions.Addresses.ReadAll": dictionary.PermissionReadAddresses,
    "Permissions.Users.Manage": dictionary.PermissionManageUsers,
    "Permissions.Users.Read": dictionary.PermissionReadUsers,
    "Permissions.Roles.Manage": dictionary.PermissionManageRoles,
    "Permissions.Roles.Read": dictionary.PermissionReadRoles,
    "Permissions.Messages.Users": dictionary.PermissionCommunicateWithUsers,
    "Permissions.Messages.Clients": dictionary.PermissionCommunicateWithClients,
    "Permissions.Messages.ChatBot": dictionary.PermissionCommunicateWithChatBot,
    "Permissions.Organizations.Manage": dictionary.PermissionUpdateOrganisations,
    "Permissions.Devices.Manage": dictionary.PermissionManageDevices,
    "Permissions.Devices.ManageMine": dictionary.PermissionManageMyDevices,
    "Permissions.Request.InstallationRequest": dictionary.PermissionManageInstallationRequest,
    "Permissions.Products.Manage": dictionary.PermissionManageProducts,
    "Permissions.Services.ManageMine": dictionary.PermissionManageMyServices,
    "Permissions.Services.Manage": dictionary.PermissionManageServices,
  }

  const description = permissionMap[permission] || 'Unknown permission'

  return (
    <Typography sx={{ color: isDark ? "white" : "black", fontWeight: 'normal' }}>
      {description}
    </Typography>
  )
}

RoleHelper.propTypes = {
  permission: PropTypes.string,
}

export default RoleHelper
