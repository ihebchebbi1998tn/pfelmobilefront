import { createContext, useEffect, useMemo, useState } from 'react'
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material'
import PropTypes from 'prop-types'

export const ColorModeContext = createContext({ toggleColorMode: () => {} })

export const ColorModeProvider = ({ children }) => {
  ColorModeProvider.propTypes = {
    children: PropTypes.node.isRequired,
  }

  const [mode, setMode] = useState('light')

  useEffect(() => {
    const savedMode = localStorage.getItem('themeMode')
    if (savedMode) {
      setMode(savedMode)
    }
  }, [])

  const toggleColorMode = () => {
    setMode((prev) => {
      const newMode = prev === 'light' ? 'dark' : 'light'
      localStorage.setItem('themeMode', newMode)
      return newMode
    })
  }

  const theme = useMemo(() => {
    return createTheme({
      palette: { mode },
      typography: {
        fontFamily: 'Inter, Roboto, sans-serif',
      },
      components: {
        MuiCssBaseline: {
          styleOverrides: {
            body: {
              backgroundColor: mode === 'light' ? '#e1e0e1' : '#08040c',
              color: mode === 'light' ? '#000' : '#fff',
              transition: 'all 0.3s ease',
            },
          },
        },
      },
    })
  }, [mode])

  const contextValue = useMemo(() => ({ toggleColorMode }), [])

  return (
    <ColorModeContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  )
}
