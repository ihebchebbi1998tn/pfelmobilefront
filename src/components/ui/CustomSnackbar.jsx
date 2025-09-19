import { Snackbar, Alert } from '@mui/material'
import PropTypes from 'prop-types'

const CustomSnackbar = ({ open, message, type, onClose }) => {
  CustomSnackbar.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    message: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['success', 'error', 'warning']).isRequired,
  }
  return (
    <Snackbar
      open={open}
      autoHideDuration={4000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert
        onClose={onClose}
        severity={type}
        sx={{
          display: 'flex',
          position: 'relative',
          alignItems: 'center',
          gap: 2,
          minWidth: '300px',
          padding: '14px 18px',
          top: '50px',
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  )
}

export default CustomSnackbar
