import PropTypes from 'prop-types'
import { Button as MUIButton } from '@mui/material'
import '../../styles/ui.scss'
import { useAuth } from '../../hooks/AuthContext'
import { darken } from '@mui/material/styles'

const Button = ({ variant, children, onClick, fullWidth, dis, className }) => {
  const { user } = useAuth()

  return (
    <MUIButton
      className={`custom-button ${variant} ${variant === 'outlined' ? 'outlined' : ''} ${className}`}
      onClick={onClick}
      fullWidth={fullWidth}
      disabled={dis}
      style={{
        '--primary-color': user?.organization?.primaryColor || '#015eb9',
        '--primary-hover-color': darken(user?.organization?.primaryColor || '#015eb9', 0.2) ,
        '--secondary-color': user?.organization?.secondaryColor || '#4286f4',
        '--secondary-hover-color': darken(user?.organization?.secondaryColor || '#4286f4', 0.2),
      }}
      sx={{
        m: 0.5,
        fontWeight: 'bold !important',
        borderRadius: '10px',
        textTransform: 'none',
        '&.Mui-disabled': {
          cursor: 'not-allowed !important',
          opacity: 0.2,
        },
      }}
    >
      {children}
    </MUIButton>
  )
}
 Button.propTypes = {
    variant: PropTypes.oneOf([
      'primary',
      'secondary',
      'outlined',
      'danger',
      'warning',
      'success',
      'table',
      'light',
      'magic',
      'blinkingZoom'
    ]).isRequired,
    children: PropTypes.node.isRequired,
    onClick: PropTypes.func,
    fullWidth: PropTypes.bool,
    dis: PropTypes.bool,
    className: PropTypes.string
  }
export default Button
