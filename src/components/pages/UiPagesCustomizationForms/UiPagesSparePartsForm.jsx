import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { 
  Box, 
  Typography, 
  ToggleButtonGroup, 
  ToggleButton, 
  Switch, 
  FormControlLabel, 
  IconButton, 
  Popover,
  Tabs, 
  Tab ,
  Card, 
  CardActionArea,
  Grid, 
  Slider,
  useTheme
} from '@mui/material'
import { WarningAmber } from '@mui/icons-material'
import TableChartIcon from '@mui/icons-material/TableChart'
import GridViewIcon from '@mui/icons-material/GridView'
import ViewColumnIcon from '@mui/icons-material/ViewColumn'
import TabIcon from '@mui/icons-material/Tab'
import { motion } from 'framer-motion'
import { ChromePicker } from 'react-color'
import Button from '../../ui/Button'
import { useLanguage } from '../../../hooks/LanguageContext'
import { useOrganisation } from '../../../hooks/OrganisationContext'
import { useAuth } from '../../../hooks/AuthContext'
import OrganisationService from '../../../services/OrganisationService'

const UiPagesSparePartsForm = ({ onCloseRightDrawer, toggleLoader}) => {

  const { user } = useAuth()
  const theme = useTheme()
  const { dictionary } = useLanguage()
  const isDark = theme.palette.mode === 'dark'
  
  // Safely get organisation context with fallback
  let handleChangePageReference = () => {}
  let setUiPage = () => {}
  let uiPage = null
  try {
    const orgContext = useOrganisation()
    handleChangePageReference = orgContext?.handleChangePageReference || (() => {})
    setUiPage = orgContext?.setUiPage || (() => {})
    uiPage = orgContext?.uiPage || null
  } catch (error) {
    console.warn('OrganisationProvider not available in UiPagesSparePartsForm context')
  }
  const [darkModeColor, setDarkModeColor] = useState(uiPage?.darkModeColor ?? '#18141c')
  const [lightModeColor, setLightModeColor] = useState(uiPage?.lightModeColor ?? '#eeefef')
  const [layout, setLayout] = useState(uiPage?.layout ?? 'Table')
  const [itemsPerPage, setItemsPerPage] = useState(uiPage?.itemsPerPage ?? 3)
  const [imagePosition, setImagePosition] = useState(uiPage?.imagePosition ?? 'Top')
  const [fieldsToNotDisplay, setFieldsToNotDisplay] = useState(uiPage?.fieldsToNotDisplay ?? [])
  const [showWarring, setShowWarring] = useState(false)
  const [anchorEl, setAnchorEl] = useState(null)
  const [currentColor, setCurrentColor] = useState('') 
  const [colorType, setColorType] = useState('')
  const [mode, setMode] = useState(0)
  const tabsLabels= [dictionary.Layout, dictionary.Fields, dictionary.Basics]
  useEffect(() => {
    if(uiPage!=null){
     setDarkModeColor(uiPage?.darkModeColor ?? '#18141c')
     setLightModeColor(uiPage?.lightModeColor ?? '#eeefef')
     setLayout(uiPage?.layout ?? 'Table')
     setItemsPerPage(uiPage?.itemsPerPage ?? 3)
     setImagePosition(uiPage?.imagePosition ?? 'Top')
     setFieldsToNotDisplay(uiPage?.fieldsToNotDisplay ?? [])
    }
      
    }, [uiPage])

  const displayOptions = [
    { label: 'Table', icon: <TableChartIcon fontSize="large" /> },
    { label: 'Grid', icon: <GridViewIcon fontSize="large" /> },
    { label: 'Column', icon: <ViewColumnIcon fontSize="large" /> },
    { label: 'Tab', icon: <TabIcon fontSize="large" /> },
  ]

  
  const fields = [
    { label: dictionary.Title, value: 'title' },
    { label: dictionary.Description, value: 'description' },
    { label: dictionary.Quantity, value: 'quantity' },
    { label: dictionary.Price, value: 'price' },
    { label: dictionary.Tva, value: 'tva' },
    { label: dictionary.OrganisationName, value: 'organizationName' },
    { label: dictionary.Image, value: 'imageUrl' }
  ]

  const resetForm = () => {
    setTimeout(() => {
      setDarkModeColor(uiPage?.darkModeColor ?? '#18141c')
      setLightModeColor(uiPage?.lightModeColor ?? '#eeefef')
      setLayout(uiPage?.layout ?? 'Table')
      setItemsPerPage(uiPage?.itemsPerPage ?? 3)
      setImagePosition(uiPage?.imagePosition ?? 'Top')
      setFieldsToNotDisplay(uiPage?.fieldsToNotDisplay ?? [])
      setAnchorEl(null)
      setCurrentColor('')
      setColorType('')
      setMode(0)
    }, 200)
  }

  const handleCancel  = async() => {
    toggleLoader(true)
    await handleChangePageReference("spare parts")
    resetForm()
    toggleLoader(false)
    onCloseRightDrawer()
  }
  const handleSubmit  = async() => {
    const data={
      id:uiPage?.id,
      pageReference:uiPage?.pageReference,
      darkModeColor,
      lightModeColor,
      layout,
      itemsPerPage,
      imagePosition,
      fieldsToNotDisplay
    }
    try{
      toggleLoader(true)
      const res= await OrganisationService.UpdateUiPage(data)
      if(res){
        resetForm()
        onCloseRightDrawer()
      }
    }catch (e) {
        const message = e?.response?.data?.message
        console.log(message||e)
    }finally{
      toggleLoader(false)
    }
  }

  const handleTabChange = (_, newValue) => {
    setMode(newValue)

    const label = tabsLabels[newValue]
    if (label === dictionary.Layout) handleModeChange('layout')
    else if (label === dictionary.Fields) handleModeChange('fields')
    else handleModeChange('basics')
  }

  const handleModeChange = (type) => {
    if(type==="layout")
      setMode(0)
    else if(type==="fields")
      setMode(1)
    else
      setMode(2)
  }

  const handleColorClick = (event, type) => {
    setAnchorEl(event.currentTarget)
    setColorType(type)
    if(type==="dark")
      setCurrentColor(darkModeColor)
    else
      setCurrentColor(lightModeColor) 
  }

  const handleColorChangeComplete = (color) => {
    if(colorType==="dark"){
      setDarkModeColor(color.hex)
      setUiPage(data => ({
        ...data,
        darkModeColor: color.hex
      }))
    }
    else{
      setLightModeColor(color.hex)
      setUiPage(data => ({
        ...data,
        lightModeColor: color.hex
      }))
    }
    setCurrentColor(color.hex)
  }

  const handleDisplayChange = (_, newDisplay) => {
    if (newDisplay !== null){
      setLayout(newDisplay)
      setUiPage(data => ({
        ...data,
        layout: newDisplay
      }))
    } 
  }

 const handleFieldsToDisplayChange = (value) => {
  setShowWarring(false)
    let updatedFields

    if (fieldsToNotDisplay.includes(value)) {
      updatedFields = fieldsToNotDisplay.filter(f => f !== value)
    } else {
      updatedFields = [...fieldsToNotDisplay, value]
    }

    if(updatedFields.length===fields.length){
      setShowWarring(true)
      return
    }
    setFieldsToNotDisplay(updatedFields)
    setUiPage(data => ({
      ...data,
      fieldsToNotDisplay: updatedFields
    }))
  }

    
  const handleImagePositions = (position) => {
    setImagePosition(position)
    setUiPage(data => ({
        ...data,
        imagePosition: position
    }))
  }
  const handleItemsPerPageChange = (_event, value) => {
    if (!isNaN(value) && value > 0) {
      setItemsPerPage(value)
      setUiPage(data => ({
        ...data,
        itemsPerPage: value
      }))
    }
  }

  const handleClosePopover = () => {
    setAnchorEl(null)  
  }
    
  

  return (
   <Box>
    <Box sx={{ ml: 1, width: '100%' }}>
      <Tabs 
        value={mode}
        onChange={handleTabChange}
        variant="fullWidth" 
        TabIndicatorProps={{
          style: {
            backgroundColor: user.organization.primaryColor,
          },
        }}
        sx={{ width: '100%' }}
      >
        {tabsLabels.map((label) => (
          <Tab
            key={label}
            label={label}
            sx={{
              minWidth: 0, 
              fontSize: 'clamp(0.6rem, 1.5vw, 0.9rem)',
              textTransform: 'none',
              '&.Mui-selected': {
                color: user.organization.primaryColor,
              },
            }}
          />
        ))}
      </Tabs>
    </Box>


    <Box sx={{ml:1, mt:2}}>
      {mode===0 &&
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
           <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={2}>
        {displayOptions.map((option) => {
          const isSelected = layout === option.label
          return (
            <Grid item xs={6} sm={6} md={3} key={option.label}>
              <Card
                sx={{
                  border: isSelected
                    ? `2px solid ${user.organization.primaryColor}`
                    :isDark 
                    ? `1px solid white`
                    : `1px solid black`,
                  boxShadow: isSelected ? 4 : 1,
                  borderRadius:5,
                  minWidth:'100px',
                  transition: 'all 0.3s',
                  '&:hover': {
                    boxShadow: 6,
                    borderColor: user.organization.primaryColor,
                  },
                }}
              >
                <CardActionArea
                  onClick={() => handleDisplayChange(null, option.label)}
                  sx={{
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {option.icon}
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    {option.label}
                  </Typography>
                </CardActionArea>
              </Card>
            </Grid>
          )
        })}
      </Grid>
    </Box>
        </motion.div>
      }
      {mode===1 &&
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Typography sx={{ fontWeight: 'bold' }}>{dictionary.FieldsYouDontWantToDisplay}</Typography>
             <Box mb={1} mt={1} sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {fields.map(field => (
                <FormControlLabel
                  key={field.label}
                  control={
                    <Switch
                      checked={fieldsToNotDisplay.includes(field.value)}
                      onChange={() => handleFieldsToDisplayChange(field.value)}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: user.organization.primaryColor,
                          '& + .MuiSwitch-track': {
                            backgroundColor: user.organization.primaryColor,
                          },
                        },
                      }}
                    />
                  }
                  label={field.label}
                />
              ))}
          </Box>
          {showWarring && 
            <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
           >
            <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '1px solid #efc158',
                  borderRadius: 2,
                  backgroundColor: 'transparent',
                  p: 2,
                  mt: 2,
                }}
              >
                <WarningAmber sx={{ color: '#efc158', mr: 1 }} />
                <Typography
                  variant="body2"
                  sx={{ flex: 1, textAlign: 'center', color:'#efc158' }}
                >
                  {dictionary.YouCannotSelectAllTheFields}
                </Typography>
              </Box>
           </motion.div>
          }
        </motion.div>
      }
      {mode === 2 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            {layout === 'Table' ? dictionary.TableHeaderColor : dictionary.BackgroundColor}
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={6} sm={6} md={3}>
              <Box display="flex" alignItems="center" gap={6} justifyContent="flex-end">
                <Typography>{dictionary.DarkMode}</Typography>
                <Box
                sx={{
                  border: `2px solid ${user.organization.primaryColor}`,
                  borderRadius:5
                }}
                >
                <IconButton
                  sx={{
                    backgroundColor: darkModeColor,
                    borderRadius: '50%',
                    width: 30,
                    height: 30,
                    '&:hover': {
                      backgroundColor: darkModeColor,
                    },
                  }}
                  onClick={(e) => handleColorClick(e, 'dark')}
                />
                </Box>
              </Box>
            </Grid>

            <Grid item xs={6} sm={6} md={3}>
              <Box display="flex" alignItems="center" gap={6} justifyContent="flex-end">
                <Typography>{dictionary.LightMode}</Typography>
                <Box
                sx={{
                  border: `2px solid ${user.organization.primaryColor}`,
                  borderRadius:5
                }}
                >
                  <IconButton
                  sx={{
                    backgroundColor: lightModeColor,
                    borderRadius: '50%',
                    width: 30,
                    height: 30,
                    '&:hover': {
                      backgroundColor: lightModeColor,
                    },
                  }}
                  onClick={(e) => handleColorClick(e, 'light')}
                />
                </Box>
              </Box>
            </Grid>
          </Grid>

          <Popover
            open={Boolean(anchorEl)}
            anchorEl={anchorEl}
            onClose={handleClosePopover}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'center',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'center',
            }}
          >
            <Box sx={{ padding: 2 }}>
              <ChromePicker
                color={currentColor}
                onChangeComplete={handleColorChangeComplete}
              />
            </Box>
          </Popover>
          {(layout != 'Table' && !fieldsToNotDisplay.includes('imageUrl')) &&
           <Box sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ mt: 3, mb:1 }}>
              {dictionary.ImagePosition}:
            </Typography>

            <ToggleButtonGroup
              value={imagePosition}
              exclusive
              onChange={(_, value) => value && handleImagePositions(value)}
              sx={{ mb: 2, width: '100%' }}
            >
              <Grid container spacing={4}>
                <Grid item xs={6}>
                  <ToggleButton value="Top" sx={{minWidth:"85px"}}>
                    {dictionary.Top}
                  </ToggleButton>
                </Grid>
                <Grid item xs={6}>
                  <ToggleButton value="Bottom" sx={{minWidth:"85px"}}>
                    {dictionary.Bottom}
                  </ToggleButton>
                </Grid>
                <Grid item xs={6}>
                  <ToggleButton value="Left" sx={{minWidth:"85px"}}>
                    {dictionary.Left}
                  </ToggleButton>
                </Grid>
                <Grid item xs={6}>
                  <ToggleButton value="Right" sx={{minWidth:"85px"}}>
                    {dictionary.Right}
                  </ToggleButton>
                </Grid>
              </Grid>
            </ToggleButtonGroup>
          </Box>
          }
          <Box>
            <Typography variant="h6" sx={{ mt: 3, mb:1 }}>
              {dictionary.ObjectPerPage}:
            </Typography>
            <Slider
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              step={1}
              min={1}
              max={10}
              marks={[
               ...Array.from({ length: 10 }, (_, i) => ({
               value: i + 1,
               label: `${i + 1}`,
               })),
              ]}
              sx={{
                width:'95%',
              color: user.organization.primaryColor, 
              '& .MuiSlider-thumb': {
                backgroundColor: user.organization.primaryColor, 
              },
              '& .MuiSlider-track': {
                backgroundColor: user.organization.primaryColor, 
              },
              '& .MuiSlider-rail': {
                backgroundColor: '#ccc', 
              },
              '& .MuiSlider-markLabel': {
                color: user.organization.primaryColor, 
                fontWeight: 'bold',
              },
            }}
            />
          </Box>
        </motion.div>
      )}

    </Box>
      
      <Box mt={6} display="flex" justifyContent="space-between" >
        <Button variant="outlined danger" onClick={handleCancel}>
          {dictionary.buttonCancel}
        </Button>
        <Button variant="outlined primary" onClick={handleSubmit}>
          {dictionary.confirm}
        </Button>
      </Box>
  </Box>
 )
}

UiPagesSparePartsForm.propTypes = {
  onCloseRightDrawer: PropTypes.func.isRequired,
  toggleLoader: PropTypes.func.isRequired
}

export default UiPagesSparePartsForm