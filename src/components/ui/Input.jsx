import PropTypes from 'prop-types'
import '../../styles/ui.scss'
import { useAuth } from '../../hooks/AuthContext'
import { TextField, useTheme } from '@mui/material'

const Input = ({
  label,
  value,
  onChange,
  type = 'text',
  minRows,
  placeholder,
  iserror = false,
  slotProps,
  showlabel = true,
  className
}) => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const { user } = useAuth()

  return (
    <div className={`input-container ${className}`}>
      <TextField
        label={showlabel ? label : ''}
        value={value}
        onChange={onChange}
        type={type}
        placeholder={placeholder}
        minRows={minRows}
        multiline
        fullWidth
        variant="outlined"
        error={iserror}
        slotProps={slotProps}
        sx={{
          '& .MuiOutlinedInput-root': {
            color: isDark ? 'black' : '#000',
            '& fieldset': {
              borderColor: iserror ? '#d32f2f' : user.organization.primaryColor,
            },
            '&:hover fieldset': {
              borderColor: iserror ? '#d32f2f' : user.organization.primaryColor,
            },
            '&.Mui-focused fieldset': {
              borderColor: iserror ? '#d32f2f' : user.organization.primaryColor,
            },
          },
          '& .MuiInputLabel-root': {
            color: iserror ? '#d32f2f' : user.organization.primaryColor,
          },
          '& .MuiInputLabel-root.Mui-focused': {
            fontWeight: 'bold',
          },
          '& .MuiInputLabel-shrink': {
            fontWeight: 'bold',
          },
        }}
      />
    </div>
  )
}

Input.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  type: PropTypes.string,
  placeholder: PropTypes.string,
  iserror: PropTypes.bool,
  slotProps: PropTypes.object,
  showlabel: PropTypes.bool,
  minRows:PropTypes.number,
  className: PropTypes.string
}

export default Input
