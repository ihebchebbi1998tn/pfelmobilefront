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
  TextField,
  InputAdornment,
  Avatar
} from '@mui/material'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import SearchIcon from '@mui/icons-material/Search'
import noDataAnimation from '../../../assets/animation/noData.lottie'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import WarningIcon from '@mui/icons-material/Warning'
import serviceRequestService from '../../../services/serviceRequestService'
import userService from '../../../services/userService'
import { useLanguage } from '../../../hooks/LanguageContext'
import { useAuth } from '../../../hooks/AuthContext'
import { format } from 'date-fns'
import CustomBadge from '../../ui/CustomBadge'
import CustomSnackbar from '../../ui/CustomSnackbar'
import Card from '../../ui/Card'
import Modal from '../../ui/Modal'
import Button from '../../ui/Button'
import Pagination from '../../ui/Pagination'
import ServiceRequestDetails from './ServiceRequestDetails'
import PayService from './PayService'
import ServiceRequestFormModal from './ServiceRequestFormModal'
import ServiceImagePreview from './ServiceImagePreview'
import AddressFormModal from '../Address/AddressFormModal'

const ClientServiceRequest = () => {
 const { toggleLoader } = useOutletContext()
 const { dictionary } = useLanguage()
 const theme = useTheme()
 const { user } = useAuth()
 const isDark = theme.palette.mode === 'dark'
 const [typeSnack, setTypeSnack] = useState(null)
 const [messageSnack, setMessageSnack] = useState(null)
 const [openSnackBar, setOpenSnackBar] = useState(false)
 const [openModalAddress, setOpenModalAddress] = useState(false)
 const [services, setServices] = useState([])
 const [users, setUsers] = useState([])
 const [selectedRow, setSelectedRow] = useState(null)
 const [openCancel, setOpenCancel] = useState(false)
 const [openDetails, setOpenDetails] = useState(false)
 const [openForm, setOpenForm] = useState(false)
 const [openPay, setOpenPay] = useState(false)
 const [hasAnyServiceRequest, setHasAnyServiceRequest] = useState(false)
 const [searchInput, setSearchInput] = useState('')
 const [currentPage, setCurrentPage] = useState(1)
 const [totalPages, setTotalPages] = useState(0)
 const itemsPerPage = 6
 const handleSearchChange = (searchTerm) => {
    if (!searchTerm) {
      fetchServicesData(currentPage, null)
      return
    }
    setCurrentPage(1)
    fetchServicesData(currentPage, searchTerm)
  }

  const HandleOpenModalForm = (row) =>{
    if(user?.address!=null){
        setSelectedRow(row)
        setOpenForm(true)
    }else{
        setOpenModalAddress(true)
    }
 }
 const HandleOpenModalDetailsService = (row) =>{
    setSelectedRow(row)
    setOpenDetails(true)
 }
 const HandleOpenModalPayService = (row) =>{
    setSelectedRow(row)
    setOpenPay(true)
 }

 const HandleOpenModalCancelService = (row) =>{
    setSelectedRow(row)
    setOpenCancel(true)
 }

 const HandleCloseModalCancelService = () =>{
    setSelectedRow(null)
    setOpenCancel(false)
 }

 const cancelService = async() =>{
    try{
        toggleLoader(true)
        const formData = new FormData()
        formData.append('id', selectedRow.id)
        formData.append('status', 'Cancelled')
        const res = await serviceRequestService.toggleServiceRequestStatus(formData)
        if (res) {
            await fetchServicesData(currentPage, null)
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
                setMessageSnack(dictionary.ToggleServiceRequestStatusFailed)
                setOpenSnackBar(true)
                }
        } else {
                setTypeSnack('error')
                setMessageSnack(dictionary.ToggleServiceRequestStatusFailed)
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
   const renderServiceCard = (service) => {
    const agent= getUserInfos(service?.agentId)
     return(
        <motion.div
       key={service?.id}
       initial={{ opacity: 0, x: 100 }}
       animate={{ opacity: 1, x: 0 }}
       exit={{ opacity: 0, x: 100 }}
       transition={{ duration: 0.3 }}
     >
       <MUICard
       onClick={() => HandleOpenModalDetailsService(service)}
         sx={{
           height: '100%',
           display: 'flex',
           flexDirection: 'column',
           justifyContent: 'space-between',
           borderRadius: 3,
           backgroundColor: isDark ? "#18141c" : "#ffffff",
           minHeight: 320,
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
                <ServiceImagePreview
                    serviceRequest={service}
                    handleOpenModalDetails={HandleOpenModalDetailsService}
                />
               <Box>
                 <Typography variant="h6">{service?.title}</Typography>
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
                <Typography variant="body1" sx={{mb:1}}>
                    {truncateText(service?.description)}
                     {service?.description.length > 40 && (
                  <Typography
                    component="span"
                    sx={{
                      cursor: 'pointer',
                      ml: 1,
                      color: user.organization.primaryColor,
                    }}
                    onClick={(e) => {
                        e.stopPropagation()
                        HandleOpenModalDetailsService(service)
                    }}
                  >
                    {dictionary.SeeMore}
                  </Typography>
                )}
                </Typography>
           </Box>
   
           <Box sx={{ mt: 'auto' }}>
             <Box sx={{mb:1}}>
                {getPaidBadge(service?.isPaid)}
             </Box>
             <Box sx={{mb:1}}>
                {getStatusBadge(service?.status)}
             </Box>
             <Box display="flex" alignItems="center" gap={1} sx={{mb:1}}>
                <AccessTimeIcon fontSize="small" />
                {format(new Date(service?.createdAt), 'dd/MM/yyyy')}
             </Box>
           </Box>
         </CardContent>
   
   
         <Box display="flex" justifyContent="space-between" p={2} pt={0}>
            {(service?.status==='Pending' && !service?.isPaid) &&
                <Button
                    variant={ 'outlined danger' }
                    onClick={(e) => {
                            e.stopPropagation()
                            HandleOpenModalCancelService(service)
                        }}
                >
                    {dictionary.Cancel}
                </Button>
            }
            {(service?.status==='Pending' && !service?.isPaid) &&
                <Button
                    variant={ 'outlined primary' }
                    onClick={(e) => {
                            e.stopPropagation()
                            HandleOpenModalForm(service)
                        }}
                >
                    {dictionary.Update}
                </Button>
            }
            {(service?.status==='InProgress' && !service?.isPaid && service?.paymentMethod!='Cash' ) &&
                <Button
                    variant={ 'outlined blinkingZoom' }
                    onClick={(e) => {
                            e.stopPropagation()
                            HandleOpenModalPayService(service)
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
 
  const fetchServicesData = async (page,searchTerm) => {
     try {
       const data = await serviceRequestService.getAllServiceRequest(page,itemsPerPage,user.organization.id,searchTerm)
       if (data) {
         if (data.totalCount > 0) {
            if(!hasAnyServiceRequest) setHasAnyServiceRequest(true)
          setTotalPages(Math.ceil(data.totalCount / itemsPerPage))
        }
        setServices(data.items)
      }
     } catch (e) {
       if (e?.response?.data?.message) {
        const message = e.response.data.message
        if (message === 'User not authenticated') {
          setTypeSnack('error')
          setMessageSnack(dictionary.UserNotAuthenticated)
          setOpenSnackBar(true)
        } else {
          setTypeSnack('error')
          setMessageSnack(dictionary.GetServiceRequestFailed)
          setOpenSnackBar(true)
        }
      } else {
        setTypeSnack('error')
        setMessageSnack(dictionary.GetServiceRequestFailed)
        setOpenSnackBar(true)
      }
     }
   }
 const handlePrev = async () => {
    toggleLoader(true)
    setCurrentPage(currentPage - 1)
    await fetchServicesData(currentPage - 1, null)
    toggleLoader(false)
  }

  const handleNext = async () => {
    toggleLoader(true)
    setCurrentPage(currentPage + 1)
    await fetchServicesData(currentPage + 1, null)
    toggleLoader(false)
  }
    useEffect(() => {
      const fetchData = async () => {
         await Promise.all([fetchServicesData(currentPage, null), fetchUsersData()])
     }
     fetchData()
   }, [])
 
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
          handleSearchChange(searchInput.trim())
        }, 500)
    
        return () => clearTimeout(delayDebounce)
    }, [searchInput])
 return (
  <Box>
    <CustomSnackbar
        open={openSnackBar}
        message={messageSnack}
        type={typeSnack}
        onClose={() => setOpenSnackBar(false)}
    />
    {openPay && (
        <PayService
            open={true}
            onClose={() => {
                setOpenPay(false)
                setSelectedRow(null)
            }}
            service={selectedRow}
        />
    )}
    {openModalAddress && (
        <AddressFormModal
            open={true}
            onClose={() => {
                setOpenModalAddress(false)
            }}
            address={user?.address}
        />
    )}
    {openDetails && (
        <ServiceRequestDetails
            open={true}
            onClose={() => {
                setOpenDetails(false)
                setSelectedRow(null)
            }}
            service={selectedRow}
        />
    )}
    {openForm && (
        <ServiceRequestFormModal
            open={true}
            onClose={() => {
                fetchServicesData(currentPage, null)
                setOpenForm(false)
                setSelectedRow(null)
            }}
            service={selectedRow}
        />
    )}
    <Modal
        open={openCancel}
        onClose={HandleCloseModalCancelService}
        showConfirmButton={true}
        onConfirm={cancelService}
        variant={'danger'}
        labelConfirmButton={dictionary.Cancel}
        title={
             <>
                {' '}
                <WarningIcon sx={{ color:'red' }} /> {dictionary.Cancel}{' '}
            </>
        }
        className="custom-modal"
    >
        <Typography>{dictionary.CancelServiceQ}</Typography>
    </Modal>
    <Card title={dictionary.MyServiceRequests} showHover={false}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Button variant="outlined primary" onClick={() => HandleOpenModalForm(null)}>
                {dictionary.AddServiceRequest}
            </Button>
        </Box>
        <Box display="flex" gap={2} flexWrap="wrap" mb={4}>
             <TextField
                    label={dictionary.SearchByName}
                    variant="outlined"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    fullWidth
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        
                        '&:hover fieldset': {
                        borderColor: user.organization.primaryColor,
                        },
                        '&.Mui-focused fieldset': {
                        borderColor: user.organization.primaryColor,
                        },
                        },
                        '& .MuiInputLabel-root': {
                        color: user.organization.primaryColor,
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                        fontWeight: 'bold',
                    },
                    '& .MuiInputLabel-shrink': {
                        fontWeight: 'bold',
                    },
                    }}
            />
        </Box>
    </Card>
    {(services.length > 0 && hasAnyServiceRequest) ?
        (
        <Box>
            {
               services.length > 0 ? (
                <Box>
                    <Grid container spacing={3} alignItems="stretch">
                        {services.map((i) => (
                        <Grid key={i.id} item xs={12} sm={6} md={4} lg={3} sx={{ height: '100%' }}>
                            {renderServiceCard(i)}
                        </Grid>
                        ))}
                    </Grid>
                    <Box display="flex" justifyContent="center" mt={3}>
                        <Pagination currentPage={currentPage} totalPages={totalPages} onNext={handleNext} onPrevious={handlePrev}/>
                    </Box>
                </Box>
               ) : (
                    <Typography variant="h6" textAlign="center" color="text.secondary">
                        🔍 {dictionary.NoDataFound}
                    </Typography>
               ) 
            }
            
        </Box>
        )
        :(
            renderNoData()
        )
    }
  </Box>
  )
}

export default ClientServiceRequest