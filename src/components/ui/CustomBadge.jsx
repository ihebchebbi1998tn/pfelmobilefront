import { Box, Typography, useTheme } from '@mui/material'
import PropTypes from 'prop-types'

const CustomBadge = ({ label, type = 'gray' }) => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  const typeStyles = {
    danger: {
      background: '#bb2a33',
      color: isDark? 'white' : 'black',
    },
    warning: {
      background: '#efc158',
      color: isDark? 'white' : 'black',
    },
    info: {
      background: '#0063b8',
      color: isDark? 'white' : 'black',
    },
    success: {
      background: '#436f00',
      color: isDark? 'white' : 'black',
    },
    gray: {
      background: '#636363',
      color: isDark? 'white' : 'black',
    },
}
  const { background, color } = typeStyles[type] || typeStyles.gray

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 1.5,
        py: 0.5,
        borderRadius: '10px',
        backgroundColor: background,
        color,
        fontSize: '0.75rem',
        fontWeight: "bold",
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        minWidth: '100px',
        textAlign: 'center',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: 'scale(1.2)'
        },
      }}
    >
      <Typography component="span" sx={{ fontSize: 'inherit', fontWeight: 'inherit' }}>
        {label}
      </Typography>
    </Box>
  )
}

CustomBadge.propTypes = {
  label: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['danger', 'warning', 'info', 'success', 'gray']),
}

export default CustomBadge
