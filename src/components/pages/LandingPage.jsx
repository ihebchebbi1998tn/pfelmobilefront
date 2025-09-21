import { useState, useEffect } from 'react'
import { 
  Box, 
  Typography, 
  Grid, 
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  useMediaQuery
 } from '@mui/material'
 import { LineChart } from '@mui/x-charts/LineChart'
 import { PieChart } from '@mui/x-charts/PieChart'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import statsService from '../../services/statsService'
import { useLanguage } from '../../hooks/LanguageContext'
import { useAuth } from '../../hooks/AuthContext'
import CustomSnackbar from '../ui/CustomSnackbar'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import animationData from '../../assets/animation/Server.lottie'
import { motion } from "framer-motion"
import { alpha } from "@mui/material/styles"
import { format } from 'date-fns'
import Calendar from './Calendar'

const LandingPage = () => {
  const { dictionary, defaultLang } = useLanguage()
  const { user } = useAuth()
  const theme = useTheme()
  const [userStats, setUserStats] = useState({})
  const [serviceStats, setServiceStats] = useState({})
  const [typeSnack, setTypeSnack] = useState(null)
  const [messageSnack, setMessageSnack] = useState(null)
  const [openSnackBar, setOpenSnackBar] = useState(false)
  const tableStyleCellHead ={fontWeight: 'bold',backgroundColor:theme.palette.mode === 'dark'? theme.palette.grey[900]: theme.palette.grey[200],color: theme.palette.text.primary}
  const isDark = theme.palette.mode === 'dark'
  const primaryColor = user?.organization?.primaryColor || '#015eb9'
  const fetchUserStats = async () => {
    try {
      const data = await statsService.getStatsUser()
      if (data) {
        setUserStats(data)
      }
    } catch {
      setTypeSnack('error')
      setMessageSnack(dictionary.GetStatsFailed)
      setOpenSnackBar(true)
    }
  }
  const fetchServiceStats = async () => {
    try {
      const data = await statsService.getStatsService()
      if (data) {
        setServiceStats(data)
      }
    } catch {
      setTypeSnack('error')
      setMessageSnack(dictionary.GetStatsFailed)
      setOpenSnackBar(true)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([fetchUserStats(), fetchServiceStats()])
    }
    fetchData()
  }, [])
  const COLORS = [
  primaryColor, alpha(primaryColor, 0.8), alpha(primaryColor, 0.7), alpha(primaryColor, 0.6),
  alpha(primaryColor, 0.5), alpha(primaryColor, 0.4), alpha(primaryColor, 0.3), alpha(primaryColor, 0.2)
]

 const getStatus = (s) =>{
    switch (s) {
      case "Pending": 
        return dictionary.Pending
      case "Cancelled": 
        return dictionary.Cancelled
      case "Refused": 
        return dictionary.Refused
      case "InProgress": 
        return dictionary.InProgress
      case "Dispatched": 
        return dictionary.Dispatched
      case "Completed": 
        return dictionary.Completed
      case "Delivered": 
        return dictionary.Delivered
      default:
        return dictionary.Pending
    }
  }
 const renderPieChart = (data, title) => {
  if (!data || data.length === 0) return null
   
  const total = data.reduce((sum, item) => sum + item.count, 0)

  const sortedData = [...data].sort((a, b) => b.count - a.count)

  const chartData = sortedData.map((item, index) => ({
    id: index,
    value: item.count,
    label: `${getStatus(item.status)} (${((item.count / total) * 100).toFixed(1)}%)`,
    color: COLORS[index % COLORS.length],
  }))

  return (
    <Box
      sx={{
        backgroundColor:(isDark? theme.palette.grey[900] : theme.palette.grey[200] ),
        padding: 2,
        mt:3,
        mb:3,
        borderRadius:4,
        width: '30%' ,
        height: 'auto',
        display: 'inline-block',
        mx: 2,
        position: 'relative',
      }}
      key={title}
    >
      <Typography variant="h6" align="center">{title}</Typography>
      <PieChart
        series={[
          {
            data: chartData,
            innerRadius: 60,
            outerRadius: 100,
            arcLabel: (item) => `${Math.round((item.value / total) * 100)}%`,
          }
        ]}
        width={200}    
        height={200}
        slotProps={{ legend: { hidden: true } }}
        sx={{
          '& .MuiChartsArc-root': {
            stroke: 'transparent', 
          },
        }}
      />
    </Box>
  )
}

const monthLabels = [
  dictionary.January, dictionary.February, dictionary.March, dictionary.April, dictionary.May, dictionary.June,
  dictionary.July, dictionary.August, dictionary.September, dictionary.October, dictionary.November, dictionary.December
]
  return (
    <Box>
      <CustomSnackbar
        open={openSnackBar}
        message={messageSnack}
        type={typeSnack}
        onClose={() => setOpenSnackBar(false)}
      />
        <Box sx={{ pt: 2 }}>
          <Grid container spacing={2} alignItems="stretch">
            <Grid item sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              width: { xs: '70%', sm: '100%', md: '100%', lg: '70%' }
               }}>
              <Paper
                elevation={3}
                sx={{
                  padding: 2,
                  borderRadius: 4,
                  flexGrow: 1,
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: `linear-gradient(to right, ${user?.organization?.primaryColor || '#015eb9'},${user?.organization?.primaryColor || '#015eb9'}, ${user?.organization?.secondaryColor || '#4286f4'} )`,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  height: '100%',
                }}
              >
                <motion.div
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 100 }}
                  transition={{ duration: 0.8 }}
                  style={{ display: 'flex', width: '100%' }}
                >
                  <Box sx={{ flex: 6, textAlign: 'left', pr: 2 }}>
                    <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                      {dictionary.WelcomeBack} {user?.firstName} {user?.lastName}!
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.disabled, mt: '50px', ml:4}}>
                      {dictionary.YourSystemReady}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      flex: 4,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <DotLottieReact
                      src={animationData}
                      loop
                      autoplay
                      style={{ width: '100%', height: 'auto' }}
                    />
                  </Box>
                </motion.div>
              </Paper>
            </Grid>
            <Grid item sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              width: { xs: '28%', sm: '100%', md: '100%', lg: '28%' }
               }}>
              <Paper
                elevation={3}
                 sx={{
                  padding: 2,
                  textAlign: 'center',
                  borderRadius: 4,
                  backgroundColor: isDark ? '#18141c' : '#ffffff',
                  height: '100%',
                  flexGrow: 1,
                  display: 'flex',
                }}
              >
                <motion.div
                   initial={{ opacity: 0, x: 100 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: 100 }}
                   transition={{ duration: 0.8 }}
                   style={{ display: 'flex', width: '100%' }}
                  >
                <Box sx={{ borderRadius: 6 }}>
                  
                  {userStats?.lastLoginDate && (
                    <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1 }}>
                      <AccessTimeIcon fontSize="small" />
                      <Box>
                         
                        <Typography align="center">{dictionary.LastLoginDate} : &nbsp;&nbsp;&nbsp;{format(new Date(userStats?.lastLoginDate), 'dd/MM/yyyy')}</Typography>
                        </Box>
                      
                    </Box>
                  )}
                  <Typography align="center" sx={{mb:1}}>{dictionary.MyConnectedDevices}</Typography>

                  {Array.isArray(userStats?.connectedDevices) && userStats.connectedDevices.length > 0 ? (
                    <TableContainer component={Paper} sx={{ borderRadius: 2, mt: 1 }}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={tableStyleCellHead}>{dictionary.DeviceType}</TableCell>
                            <TableCell sx={tableStyleCellHead}>{dictionary.OperatingSystem}</TableCell>
                            <TableCell sx={tableStyleCellHead}>{dictionary.Browser}</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {userStats.connectedDevices.map((row, index) => (
                            <TableRow
                              key={row.id || index}
                              sx={{
                                '&:hover': {
                                  cursor: 'pointer',
                                  backgroundColor: theme.palette.action.hover,
                                },
                                transition: 'background-color 0.3s ease',
                              }}
                            >
                              <TableCell>{row?.deviceType}</TableCell>
                              <TableCell>{row?.operatingSystem}</TableCell>
                              <TableCell>{row?.browser}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography align="center" sx={{ mt: 2 }}>
                      {dictionary.NoDataFound}
                    </Typography>
                  )}
                  
                </Box>
                </motion.div>
              </Paper>
            </Grid>
          </Grid>
          <Grid container spacing={2} alignItems="stretch" mt={2}>
              <Grid item sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                width: { xs: '70%', sm: '100%', md: '100%', lg: '70%' }
              }}>
              <Paper
                elevation={0}
                square
                sx={{
                  backgroundColor: 'transparent',
                  flexGrow: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  height: '100%',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    borderRadius: 4,
                    backgroundColor: isDark ? '#18141c' : '#ffffff',
                  }}
                >
                  <motion.div
                   initial={{ opacity: 0, x: 100 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: 100 }}
                   transition={{ duration: 0.8 }}
                   style={{ display: 'flex', width: '100%' }}
                  >
                  {Array.isArray(serviceStats?.orders) && serviceStats.orders.length > 0 &&
                    renderPieChart(serviceStats?.orders, dictionary.Orders)}

                  {Array.isArray(serviceStats?.installtions) && serviceStats.installtions.length > 0 &&
                    renderPieChart(serviceStats?.installtions, dictionary.Installations)}

                  {Array.isArray(serviceStats?.serviceRequests) && serviceStats.serviceRequests.length > 0 &&
                    renderPieChart(serviceStats?.serviceRequests, dictionary.ServiceRequests)}
                    </motion.div>
                </Box>
                <Box
                  sx={{
                    mt: 2,
                    borderRadius: 4,
                    backgroundColor: isDark ? '#18141c' : '#ffffff',
                    p: 2,
                  }}
                >
                  
                  {Array.isArray(serviceStats?.metricksByMonths) && serviceStats.metricksByMonths.length > 0 && (() => {
                    const sorted = [...serviceStats.metricksByMonths].sort((a, b) => a.month - b.month)
                    const xAxisLabels = sorted.map(item => monthLabels[item.month - 1])
                    const seriesData = sorted.map(item => item.count)
                    return (
                      <Box>
                          <Typography variant="h6">{dictionary.CasesMetricks}</Typography>
                          <LineChart
                            xAxis={[{ scaleType: 'band', data: xAxisLabels }]}
                            series={[
                              {
                                data: seriesData,
                                showMark: false,
                              },
                            ]}
                            colors={[primaryColor]}
                            height={300}
                      />
                      </Box>
                    )
                  })()}
                  
                </Box>
              </Paper>
            </Grid>
            <Grid item sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              width: { xs: '28%', sm: '100%', md: '100%', lg: '28%' }
               }}>
              <Paper
                elevation={0}
                square
                 sx={{
                  textAlign: 'center',
                  borderRadius: 4,
                  backgroundColor: 'transparent',
                  height: '100%',
                  flexGrow: 1,
                  display: 'flex',
                  flexDirection: 'column', 
                  gap: 2,
                }}
              >
                 <Box
                  sx={{
                    mt: 2,
                    borderRadius: 4,
                    backgroundColor: isDark ? '#18141c' : '#ffffff',
                    p: 2,
                  }}
                >
                   <motion.div
                   initial={{ opacity: 0, x: 100 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: 100 }}
                   transition={{ duration: 0.8 }}
                   style={{ display: 'flex', width: '100%' }}
                  >
                    <Calendar language={defaultLang} color={primaryColor}/>
                  </motion.div>
                </Box>
                  <Box
                    sx={{
                      backgroundColor: isDark ? '#18141c' : '#ffffff', 
                      padding: 2,
                      borderRadius: 2,
                      width: '100%',
                    }}
                  >
                     <motion.div
                   initial={{ opacity: 0, x: 100 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: 100 }}
                   transition={{ duration: 0.8 }}
                   style={{ display: 'flex', width: '100%' }}
                  >
                    <List disablePadding>
                       {Array.isArray(serviceStats?.orders) && serviceStats.orders.length > 0 && (() => {
                          const total = serviceStats.orders.reduce((sum, item) => sum + item.averagedurationResoloutionInminutes, 0)
                          const totalCount = serviceStats.orders.length
                          if(totalCount===0) return
                          const TotalAveragedurationResoloutionInminutes =(total/totalCount)
                           if(total==0 || total==undefined) return null
                           const inDays = ((TotalAveragedurationResoloutionInminutes/60)/60).toFixed(2)
                          return (
                            <ListItem
                              key={dictionary.Orders}
                              sx={{
                                backgroundColor:isDark? '#0b162b' : '#e1e1e0' ,
                                color: 'white',
                                mb: 1,
                                borderLeft:`4px solid ${primaryColor}`,
                                borderRadius: 2,
                                paddingY: 1.5,
                                paddingX: 2,
                                alignItems: 'flex-start',
                              }}
                            >
                          <ListItemIcon sx={{ mt: 0.2 }}>
                            <AccessTimeIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Typography
                                variant="body1"
                                sx={{ fontWeight: 500, fontSize: 15, color: isDark? 'white' : 'black' }}
                              >
                                {dictionary.AverageOrderResolutionTimeInMinutes}
                              </Typography>
                            }
                            secondary={
                              <Typography variant="caption" sx={{ color: '#b0b0b0', fontSize: 12 }}>
                                {inDays}
                              </Typography>
                            }
                          />
                        </ListItem>
                          )
                       })()}
                       {Array.isArray(serviceStats?.installtions) && serviceStats.installtions.length > 0 && (() => {
                          const total = serviceStats.installtions.reduce((sum, item) => sum + item.averagedurationResoloutionInminutes, 0)
                           const totalCount = serviceStats.installtions.length
                          if(totalCount===0) return
                          const TotalAveragedurationResoloutionInminutes =(total/totalCount)
                           if(total==0 || total==undefined) return null
                           const inDays = ((TotalAveragedurationResoloutionInminutes/60)/60).toFixed(2)
                          return (
                            <ListItem
                              key={dictionary.Installations}
                              sx={{
                                backgroundColor:isDark? theme.palette.grey[900] : theme.palette.grey[200] ,
                                color: 'white',
                                mb: 1,
                                borderLeft:isDark? '4px solid white' : '4px solid black',
                                borderRadius: 2,
                                paddingY: 1.5,
                                paddingX: 2,
                                alignItems: 'flex-start',
                              }}
                            >
                          <ListItemIcon sx={{ mt: 0.2 }}>
                            <AccessTimeIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Typography
                                variant="body1"
                                sx={{ fontWeight: 500, fontSize: 15, color: isDark? 'white' : 'black' }}
                              >
                                {dictionary.AverageInstallationResolutionTimeInMinutes}
                              </Typography>
                            }
                            secondary={
                              <Typography variant="caption" sx={{ color: '#b0b0b0', fontSize: 12 }}>
                                {inDays}
                              </Typography>
                            }
                          />
                        </ListItem>
                          )
                       })()}
                      {Array.isArray(serviceStats?.serviceRequests) && serviceStats.serviceRequests.length > 0 && (() => {
                          const total = serviceStats.serviceRequests.reduce((sum, item) => sum + item.averagedurationResoloutionInminutes, 0)
                          const totalCount = serviceStats.serviceRequests.length
                          if(totalCount===0) return
                          const TotalAveragedurationResoloutionInminutes =(total/totalCount)
                           if(total==0 || total==undefined) return null
                           const inDays = ((TotalAveragedurationResoloutionInminutes/60)/60).toFixed(2)
                          return (
                            <ListItem
                              key={dictionary.ServiceRequests}
                              sx={{
                                backgroundColor:isDark? theme.palette.grey[900] : theme.palette.grey[200] ,
                                color: 'white',
                                mb: 1,
                                borderLeft:isDark? '4px solid white' : '4px solid black',
                                borderRadius: 2,
                                paddingY: 1.5,
                                paddingX: 2,
                                alignItems: 'flex-start',
                              }}
                            >
                          <ListItemIcon sx={{ mt: 0.2 }}>
                            <AccessTimeIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Typography
                                variant="body1"
                                sx={{ fontWeight: 500, fontSize: 15, color: isDark? 'white' : 'black' }}
                              >
                                {dictionary.AverageServiceResolutionTimeInMinutes}
                              </Typography>
                            }
                            secondary={
                              <Typography variant="caption" sx={{ color: '#b0b0b0', fontSize: 12 }}>
                                {inDays}
                              </Typography>
                            }
                          />
                        </ListItem>
                          )
                       })()}
                    </List>
                    </motion.div>
                  </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
    </Box>
  )
}

export default LandingPage
