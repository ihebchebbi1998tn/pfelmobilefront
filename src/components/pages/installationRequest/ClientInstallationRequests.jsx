import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Box,
  Card as MUICard,
  CardContent,
  Typography,
  Grid,
  useTheme,
  Pagination,
  Avatar
} from '@mui/material'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import noDataAnimation from '../../../assets/animation/noData.lottie'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import WarningIcon from '@mui/icons-material/Warning'
import installationRequestService from '../../../services/installationRequestService'
import userService from '../../../services/userService'
import { useLanguage } from '../../../hooks/LanguageContext'
import { useAuth } from '../../../hooks/AuthContext'
import { format } from 'date-fns'
import CustomBadge from '../../ui/CustomBadge'
import CustomSnackbar from '../../ui/CustomSnackbar'
import Card from '../../ui/Card'
import Modal from '../../ui/Modal'
import Button from '../../ui/Button'
import InstallationRequestDetails from './InstallationRequestDetails'
import PayInstallation from './PayInstallation'

const ClientInstallationRequests = () => {
 const { toggleLoader } = useOutletContext()
 const { dictionary } = useLanguage()
 const theme = useTheme()
 const { user } = useAuth()
 const isDark = theme.palette.mode === 'dark'
 const [typeSnack, setTypeSnack] = useState(null)
 const [messageSnack, setMessageSnack] = useState(null)
 const [openSnackBar, setOpenSnackBar] = useState(false)
 const [installations, setInstallations] = useState([])
 const [users, setUsers] = useState([])
 const [selectedRow, setSelectedRow] = useState(null)
 const [openCancel, setOpenCancel] = useState(false)
 const [openDetails, setOpenDetails] = useState(false)
 const [openPay, setOpenPay] = useState(false)
 const [page, setPage] = useState(1)
 const ITEMS_PER_PAGE = 6
 let currentItems =installations.length>0 ?
    installations.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)
    :[]
 let totalPages = installations.length>0 ?
    Math.ceil(installations.length / ITEMS_PER_PAGE)
    :0
 const HandleOpenModalDetailsInstallation = (row) =>{
    setSelectedRow(row)
    setOpenDetails(true)
 }
 const HandleOpenModalPayInstallation = (row) =>{
    setSelectedRow(row)
    setOpenPay(true)
 }

 const HandleOpenModalCancelInstallation = (row) =>{
    setSelectedRow(row)
    setOpenCancel(true)
 }

 const HandleCloseModalCancelInstallation = () =>{
    setSelectedRow(null)
    setOpenCancel(false)
 }

 const cancelInstallation = async() =>{
    try{
        toggleLoader(true)
        const formData = new FormData()
        formData.append('id', selectedRow.id)
        formData.append('status', 'Cancelled')
        const res = await installationRequestService.toggleInstallationRequest(formData)
        if (res) {
            await fetchInstallationsData()
            toggleLoader(false)
            setTypeSnack('success')
            setMessageSnack(dictionary.OperationSeccesfull)
            setOpenSnackBar(true)
            setSelectedRow(null)
            setOpenCancel(false)
        }
    }catch (e){
        toggleLoader(false)
        if (e?.response?.data?.message) {
            const message = e.response.data.message
            if (message === 'User not authenticated') {
                setTypeSnack('error')
                setMessageSnack(dictionary.UserNotAuthenticated)
                setOpenSnackBar(true)
            }  else {
                setTypeSnack('error')
                setMessageSnack(dictionary.ToggleInstallationStatusFailed)
                setOpenSnackBar(true)
                }
        } else {
                setTypeSnack('error')
                setMessageSnack(dictionary.ToggleInstallationStatusFailed)
                setOpenSnackBar(true)
        }
    }
 }

 const getPaidBadge = (s) =>{
       switch (s) {
           case true:
               return <CustomBadge label={dictionary.Payed} type="success" />
           case false:
               return <CustomBadge label={dictionary.NotPaid} type="danger" />
           default:
               return <CustomBadge label={dictionary.NotPaid} type="danger" />
       }
     }
 
     const getStatusBadge = (s) =>{
       switch (s) {
            case "Pending": 
                 return <CustomBadge label={dictionary.Pending} type="gray" />
             case "Cancelled": 
                 return <CustomBadge label={dictionary.Cancelled} type="danger" />
             case "Refused": 
                 return <CustomBadge label={dictionary.Refused} type="danger" />
             case "InProgress": 
                 return <CustomBadge label={dictionary.InProgress} type="info" />
             case "Dispatched": 
                 return <CustomBadge label={dictionary.Dispatched} type="warning" />
             case "Completed": 
                 return <CustomBadge label={dictionary.Completed} type="success" />
             default:
                 return <CustomBadge label={dictionary.Pending} type="gray" />
       }
     }

 const getUserInfos = (id) => {
     if (!Array.isArray(users) || users.length === 0) return null
 
     const find = users.find(u => u.id === id) || null
     if (!find) return null
 
     const userName = `${find.firstName || ''} ${find.lastName || ''}`.trim()
 
     return {
         id: find.id,
         initials: userName ? userName.split(' ').map(word => word.charAt(0)).slice(0, 2).join('').toUpperCase() : '',
         image: find.imageUrl || null
     }
   }
const truncateText = (txt) => {
     return txt.length > 40 ? txt.slice(0, 40) + '...' : txt
  }
   const renderInstallationCard = (installation) => {
    const agent= getUserInfos(installation.agentId)
     return(
        <motion.div
       key={installation.id}
       initial={{ opacity: 0, x: 100 }}
       animate={{ opacity: 1, x: 0 }}
       exit={{ opacity: 0, x: 100 }}
       transition={{ duration: 0.3 }}
     >
       <MUICard
       onClick={() => HandleOpenModalDetailsInstallation(installation)}
         sx={{
           height: '100%',
           display: 'flex',
           flexDirection: 'column',
           justifyContent: 'space-between',
           borderRadius: 3,
           backgroundColor: isDark ? "#18141c" : "#ffffff",
           minHeight: 300,
           cursor: 'pointer',
           transition: 'transform 0.3s, box-shadow 0.3s',
           boxShadow: isDark
         ? '0 4px 12px rgba(255, 255, 255, 0.5)' 
         : '0 4px 12px rgba(0, 0, 0, 0.1)',     
         '&:hover': {
           transform: 'translateY(-5px)',
           boxShadow: isDark
             ? '0 6px 20px rgba(255, 255, 255, 0.68)' 
             : '0 6px 20px rgba(0, 0, 0, 0.2)',     
         },
         }}
       >
         <CardContent
           sx={{
             flexGrow: 1,
             display: 'flex',
             flexDirection: 'column',
             justifyContent: 'space-between',
           }}
         >
           <Box>
             <Box display="flex" alignItems="center" gap={2} mb={2}>
               <img src={installation?.device?.imageUrl} alt="logo" style={{ width: 80, height: 70, borderRadius:10 }} />
               <Box>
                 <Typography variant="h6">{installation?.device?.name}</Typography>
                 {agent!=null &&
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent:  'flex-end'
                        }}
                    >
                        {agent.image!=null ? 
                        (
                            <img
                                src={agent.image}
                                alt="Profile"
                                style={{
                                    borderRadius:"20px",
                                    height: "32px", 
                                    width:"32px",
                                    objectFit: 'cover',
                                }}
                            />
                        ) : (
                            <Avatar
                                sx={{
                                    fontSize: '15px',
                                    width: 30,
                                    height: 30,
                                    bgcolor: isDark ? '#747574' : '#bdbcbc',
                                    color: isDark ? '#000' : '#fff',
                                }}
                            >
                                {agent.initials}
                            </Avatar>
                        )}
                    </Box>
                }
               </Box>
             </Box>
                <Typography  variant="subtitle2">
                    {dictionary.Description} : 
                </Typography>
                <Typography variant="body1" sx={{mb:1}}>
                    {truncateText(installation?.device?.description)}
                     {installation?.device?.description.length > 40 && (
                  <Typography
                    component="span"
                    sx={{
                      cursor: 'pointer',
                      ml: 1,
                      color: user.organization.primaryColor,
                    }}
                    onClick={(e) => {
                        e.stopPropagation()
                        HandleOpenModalDetailsInstallation(installation)
                    }}
                  >
                    {dictionary.SeeMore}
                  </Typography>
                )}
                </Typography>
           </Box>
   
           <Box sx={{ mt: 'auto' }}>
             <Box sx={{mb:1}}>
                {getPaidBadge(installation?.isPaid)}
             </Box>
             <Box sx={{mb:1}}>
                {getStatusBadge(installation?.status)}
             </Box>
             <Box display="flex" alignItems="center" gap={1} sx={{mb:1}}>
                <AccessTimeIcon fontSize="small" />
                {format(new Date(installation?.createdAt), 'dd/MM/yyyy')}
             </Box>
           </Box>
         </CardContent>
   
   
         <Box display="flex" justifyContent="space-between" p={2} pt={0}>
            {(installation?.status==='Pending' && !installation?.isPaid) &&
                <Button
                    variant={ 'outlined danger' }
                    onClick={(e) => {
                            e.stopPropagation()
                            HandleOpenModalCancelInstallation(installation)
                        }}
                >
                    {dictionary.CancelInstallation}
                </Button>
            }
            {(installation?.status==='InProgress' && !installation?.isPaid && installation?.paymentMethod!='Cash' ) &&
                <Button
                    variant={ 'outlined blinkingZoom' }
                    onClick={(e) => {
                            e.stopPropagation()
                            HandleOpenModalPayInstallation(installation)
                        }}
                >
                  {' '}
                <WarningIcon sx={{ 
                  color:user.organization.primaryColor, 
                  mb:0.5, 
                  mr:0.5 ,
                  '&:hover': {
                      color: '#fff',
                    },
                }} 
                /> 
                {dictionary.PayNow}{' '}
                    
                </Button>
            }
            
         </Box>
       </MUICard>
     </motion.div>
     )
   }

   const renderNoData = () => (
        <Box sx={{ flexBasis: { xs: '100%', sm: '100%' } }}>
           <DotLottieReact
             src={noDataAnimation}
             loop
             autoplay
             style={{ width: '100%', height: '100%' }}
           />
           <Box
             sx={{
               display: 'flex',
               justifyContent: 'center',
               alignItems: 'center',
             }}
           >
             <Typography
               sx={{
                 fontWeight: 'bold',
               }}
             >
               {dictionary.NoDataFound}
             </Typography>
           </Box>
        </Box>
    )
 
  const fetchUsersData = async () => {
       try {
         const data = await userService.getUsersInfos()
         if (data) {
           if (data.users.length > 0) {
             const array = data.users
               .filter((u) => u.id !== user?.id)
               .map((u) => {
                 return {
                   id: u.id,
                   firstName: u.firstName,
                   lastName: u.lastName,
                   imageName:u.imageName,
                   imageUrl:u.imageUrl 
                 }
               })
 
             setUsers(array)
           }
         }
       } catch (e) {
         console.log(e?.response?.data?.message || 'Get users info failed')
       }
     }
 
  const fetchInstallationsData = async () => {
     try {
       const data = await installationRequestService.getAllInstallationRequest(user.organization.id)
       if (data) {
         setInstallations(data)
       }
     } catch (e) {
       console.log(e)
     }
   }
 
    useEffect(() => {
      const fetchData = async () => {
         await Promise.all([fetchInstallationsData(), fetchUsersData()])
     }
     fetchData()
   }, [])
 

 return (
  <Box>
    <CustomSnackbar
        open={openSnackBar}
        message={messageSnack}
        type={typeSnack}
        onClose={() => setOpenSnackBar(false)}
    />
    {openPay && (
        <PayInstallation
            open={true}
            onClose={() => {
                setOpenPay(false)
                setSelectedRow(null)
            }}
            installation={selectedRow}
        />
    )}
    {openDetails && (
        <InstallationRequestDetails
            open={true}
            onClose={() => {
                setOpenDetails(false)
                setSelectedRow(null)
            }}
            installation={selectedRow}
        />
    )}
    <Modal
        open={openCancel}
        onClose={HandleCloseModalCancelInstallation}
        showConfirmButton={true}
        onConfirm={cancelInstallation}
        variant={'danger'}
        labelConfirmButton={dictionary.CancelInstallation}
        title={
             <>
                {' '}
                <WarningIcon sx={{ color:'red' }} /> {dictionary.CancelInstallation}{' '}
            </>
        }
        className="custom-modal"
    >
        <Typography>{dictionary.CancelInstallationQ}</Typography>
    </Modal>
    <Card title={dictionary.MyInstallationRequests} showHover={false}/>
    {currentItems.length > 0 ?
        (
        <Box>
            <Grid container spacing={3} alignItems="stretch">
                {currentItems.map((i) => (
                  <Grid key={i.id} item xs={12} sm={6} md={4} lg={3} sx={{ height: '100%' }}>
                    {renderInstallationCard(i)}
                  </Grid>
                ))}
            </Grid>
            <Box display="flex" justifyContent="center" mt={3}>
                <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(e, value) => setPage(value)}
                />
            </Box>
        </Box>
        )
        :(
            renderNoData()
        )
    }
  </Box>
  )
}

export default ClientInstallationRequests