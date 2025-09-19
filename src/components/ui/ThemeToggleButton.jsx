import { useContext } from 'react'
import { useTheme } from '@mui/material'
import { LightMode } from '@mui/icons-material'
import BedtimeIcon from '@mui/icons-material/Bedtime'
import { ColorModeContext } from '../../hooks/ThemeContext'
import PropTypes from 'prop-types'

const ThemeToggleButton = ({ marginBottom, className }) => {
  
  const theme = useTheme()
  const { toggleColorMode } = useContext(ColorModeContext)
  const isDark = theme.palette.mode === 'dark'

  return (
    <button
    className={className}
      onClick={toggleColorMode}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        marginBottom: marginBottom ?? 0,
      }}
    >
      {isDark ? (
        <LightMode
          style={{
            color: '#fff', 
          }}
        />
      ) : (
        <BedtimeIcon
          style={{
            color: '#000', 
          }}
        />
      )}
    </button>
  )
}
ThemeToggleButton.propTypes = {
  marginBottom: PropTypes.string,
  className: PropTypes.string
}
export default ThemeToggleButton
