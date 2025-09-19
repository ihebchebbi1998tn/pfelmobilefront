import PropTypes from 'prop-types'
import { Select, MenuItem } from '@mui/material'
import { useAuth } from '../../hooks/AuthContext'
import '../../styles/ui.scss'

const Dropdown = ({ options, value, onChange, label, iserror = false }) => {
  const { user } = useAuth()
  return (
    <Select
      value={value}
      onChange={onChange}
      fullWidth
      displayEmpty
      className="custom-dropdown"
      sx={{
        backgroundColor: 'white',
        color: iserror ? '#d32f2f' : '#a3a3a3',
        '.MuiSvgIcon-root ': {
          fill: iserror ? '#d32f2f' : user.organization.primaryColor,
        },
        '.MuiOutlinedInput-notchedOutline': {
          borderColor: iserror ? '#d32f2f' : user.organization.primaryColor,
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: user.organization.primaryColor,
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: user.organization.primaryColor,
        },
        '& .MuiOutlinedInput-root': {
          '& fieldset': {
            borderColor: user.organization.primaryColor,
          },
          '&:hover fieldset': {
            borderColor: user.organization.primaryColor,
          },
          '&.Mui-focused fieldset': {
            borderColor: user.organization.primaryColor,
          },
        },
      }}
    >
      {label && (
        <MenuItem value="" disabled>
          {label}
        </MenuItem>
      )}
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </Select>
  )
}

  Dropdown.propTypes = {
    options: PropTypes.arrayOf(
      PropTypes.shape({
        value: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
      })
    ).isRequired,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    label: PropTypes.string,
    iserror: PropTypes.bool,
  }

export default Dropdown
