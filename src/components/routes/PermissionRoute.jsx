import PropTypes from 'prop-types'
import { useAuth } from '../../hooks/AuthContext'
import { useLanguage } from '../../hooks/LanguageContext'

const PermissionRoute = ({ children, requiredPermissions = [] }) => {
  PermissionRoute.propTypes = {
    children: PropTypes.node.isRequired,
    requiredPermissions: PropTypes.arrayOf(PropTypes.string),
  }
  const { dictionary } = useLanguage()
  const { user } = useAuth()
  const hasPermission = requiredPermissions.some((permission) =>
    user?.permissions?.includes(permission)
  )

  if (!hasPermission) {
    return (
      <div style={{ padding: '2rem' }}>
        <h2>🚫 {dictionary.AccessDenied}</h2>
        <p>{dictionary.AccessDeniedDescription}</p>
      </div>
    )
  }

  return children
}

export default PermissionRoute
