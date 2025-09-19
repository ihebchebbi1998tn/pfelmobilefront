import * as React from 'react'
import { useTheme } from '@mui/material/styles'
import { Paper } from '@mui/material'
import { LocalizationProvider, StaticDatePicker } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import 'dayjs/locale/fr'
import PropTypes from 'prop-types'

const Calendar = ({ language = 'en', color = '#1976d2' }) => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const [date, setDate] = React.useState(dayjs())

  React.useEffect(() => {
    dayjs.locale(language)
  }, [language])

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={language}>
      <Paper
        elevation={0}
        square
        sx={{
          backgroundColor: 'transparent',
          borderRadius: 2,
          p: 2,
          width: 300,
        }}
      >
        <StaticDatePicker
          displayStaticWrapperAs="desktop"
          openTo="day"
          value={date}
          onChange={(newValue) => setDate(newValue)}
          slots={{
            actionBar: () => null
          }}
          sx={{
            '& .MuiPickersDay-today': {
                backgroundColor: `${color} !important`,
                color: isDark ? 'white' : 'black',
                border: 'none',
            }
        }}
          slotProps={{
            day: {
              sx: ({ day }) => {
                const isToday = dayjs(day).isSame(dayjs(), 'day')
                return {
                  backgroundColor: isToday ?  'transparent': `#9e3599 !important`,
                  color: isDark
                    ? 'white'
                    : 'black',
                  borderRadius: '50%',
                }
              },
            },
          }}
        />
      </Paper>
    </LocalizationProvider>
  )
}

Calendar.propTypes = {
  language: PropTypes.string,
  color: PropTypes.string,
}

export default Calendar
