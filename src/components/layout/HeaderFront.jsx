import { useState } from 'react'
import ThemeToggleButton from '../ui/ThemeToggleButton'
import { useLanguage } from '../../hooks/LanguageContext'
import logo from '../../assets/img/logo.png'
import { Typography, Box, MenuItem, Select } from '@mui/material'

const HeaderFront = () => {
  const { defaultLang, changeLanguage, dictionary } = useLanguage()
  const [language, setLanguage] = useState(defaultLang || 'en')
  const handletoggleModal = (lang) => {
    setLanguage(lang)
    changeLanguage(lang)
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        px: 4,
        py: 2,
        position: 'absolute',
        width: '100%',
        backgroundColor: 'transparent',
        zIndex: 10,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <img
          src={logo}
          alt="Logo"
          className="logo"
          style={{ width: 40, transition: '0.3s' }}
        />
        <Typography variant="h6" fontWeight="bold">
          {dictionary.ClientPortal}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Select
          value={language}
          onChange={(e) => handletoggleModal(e.target.value)}
          className="language-select"
          MenuProps={{
            PaperProps: {
              sx: {
                borderRadius: '20px',
                width: { xs: '100px', sm: '200px' },
              },
            },
            MenuListProps: {
              sx: {
                padding: 0,
              },
            },
          }}
          sx={{
            fontSize: 'small',
            '.MuiOutlinedInput-notchedOutline': {
              borderColor: 'transparent',
            },
          }}
        >
          <MenuItem value="fr" sx={{ fontSize: 'small' }}>
            <img
              src="https://flagcdn.com/w40/fr.png"
              alt="FR"
              width="20"
              style={{ borderRadius: '2px', marginRight: '3px' }}
            />
            {dictionary.French} (FR)
          </MenuItem>
          <MenuItem value="en" sx={{ fontSize: 'small' }}>
            <img
              src="https://flagcdn.com/w40/gb.png"
              alt="EN"
              width="20"
              style={{ borderRadius: '2px', marginRight: '3px' }}
            />
            {dictionary.English} (EN)
          </MenuItem>
          <MenuItem value="de" sx={{ fontSize: 'small' }}>
            <img
              src="https://flagcdn.com/w40/de.png"
              alt="DE"
              width="20"
              style={{ borderRadius: '2px', marginRight: '3px' }}
            />
            {dictionary.German} (DE)
          </MenuItem>
        </Select>

        <ThemeToggleButton />
      </Box>
    </Box>
  )
}

export default HeaderFront
