import PropTypes from 'prop-types'
import { useTheme } from '@mui/material/styles'
import { Box, Typography } from '@mui/material'

const Card = ({ title, children , showHover=true}) => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  return (
    <Box
      sx={{
        backgroundColor: isDark ? "#18141c" : "#ffffff",
        borderRadius: 2,
        boxShadow: showHover ?
        isDark
          ? '0 0 10px rgba(255, 255, 255, 0.1)'
          : '0 0 10px rgba(0, 0, 0, 0.1)'
          :'none',
        padding: 3,
        marginBottom: 3,
        color: isDark ? '#f0f0f0' : '#000',
        transition: 'all 0.3s ease',
        cursor: 'default',
        '&:hover': {
          boxShadow: showHover ?
          isDark
            ? '0 4px 20px rgb(255, 255, 255)'
            : '0 4px 20px rgba(0, 0, 0, 0.15)'
            :'none',
          transform: 'translateY(-4px)',
        },
      }}
    >
      {title && (
        <Typography variant="h6" sx={{ marginBottom: 2, fontWeight: 'bold' }}>
          {title}
        </Typography>
      )}
      <Box>{children}</Box>
    </Box>
  )
}

Card.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
  showHover: PropTypes.bool
}

export default Card
