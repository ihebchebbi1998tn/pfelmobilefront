import PropTypes from 'prop-types'
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import '../../styles/ui.scss'

const CustomDatePicker = ({ value, onChange, label }) => {
  CustomDatePicker.propTypes = {
    value: PropTypes.object,
    onChange: PropTypes.func.isRequired,
    label: PropTypes.string,
  }
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="datepicker-container">
        <DatePicker
          label={label}
          value={value}
          onChange={onChange}
          slotProps={{ textField: { fullWidth: true } }}
        />
      </div>
    </LocalizationProvider>
  )
}

export default CustomDatePicker
