import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
  Box,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  useTheme
} from '@mui/material'
import WarningIcon from '@mui/icons-material/Warning'
import Pagination from '@mui/material/Pagination'
import { InfoOutlined } from '@mui/icons-material'
import customerDevicesService from '../../../services/customerDevicesService'
import { useLanguage } from '../../../hooks/LanguageContext'
import { useAuth } from '../../../hooks/AuthContext'
import CustomSnackbar from '../../ui/CustomSnackbar'
import noDataAnimation from '../../../assets/animation/noData.lottie'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import Button from '../../ui/Button'
import Modal from '../../ui/Modal'
import FormModal from './FormModal'
import ClientInstallationRequests from '../installationRequest/ClientInstallationRequests'

const CustomerDevices = () => {

  const { user } = useAuth()
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const colorBadge = isDark? user.company.template.primaryColorDarkMode : user.company.template.primaryColorLightMode
  const { toggleLoader } = useOutletContext()
  const { dictionary } = useLanguage()
  const [typeSnack, setTypeSnack] = useState(null)
  const [messageSnack, setMessageSnack] = useState(null)
  const [openSnackBar, setOpenSnackBar] = useState(false)
  const [openModalFrom, setOpenModalFrom] = useState(false)
  const [openModalDelete, setOpenModalDelete] = useState(false)
  const [openInstallationRequests, setOpenInstallationRequests] = useState(false)
  const [selectedId, setSelectedId] = useState('')
  const [openDevice, setOpenDevice] = useState(null)
  const [devices, setDevices] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 3
  const totalPages = Math.ceil(devices.length / itemsPerPage)
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentDevices = devices.slice(indexOfFirstItem, indexOfLastItem)

  const showAddButton = user?.permissions?.some((perm) =>perm === 'Permissions.Devices.ManageMine' ) || false

  const handlePageChange = (_, value) => {
    setCurrentPage(value)
  }

   const handleDelete = (row) => {
    if (row.id) {
      setOpenModalDelete(true)
      setSelectedId(row.id)
    }
  }
  const handleCloseDeleteModal = () => {
    setOpenModalDelete(false)
    setSelectedId('')
  }
   const Delete = async () => {
    if (selectedId) {
      toggleLoader(true)
      try {
        const data = await customerDevicesService.DeleteCustomerDevices(selectedId)
        if (data) {
          fetchDevicesData()
          toggleLoader(false)
          setOpenModalDelete(false)
          setSelectedId('')
          setTypeSnack('success')
          setMessageSnack(dictionary.OperationSeccesfull)
          setOpenSnackBar(true)
        }
      } catch (e) {
        toggleLoader(false)
        setSelectedId('')
        if (e?.response?.data?.message) {
          const message = e.response.data.message
          if (message === 'Customer device not found') {
            setTypeSnack('error')
            setMessageSnack(dictionary.DeviceNotFound)
            setOpenSnackBar(true)
          }  else {
            setTypeSnack('error')
            setMessageSnack(dictionary.DeleteDeviceFailed)
            setOpenSnackBar(true)
          }
        } else {
          setTypeSnack('error')
          setMessageSnack(dictionary.DeleteDeviceFailed)
          setOpenSnackBar(true)
        }
      }
    }
  }
 const handleOpenForm = () => {
    setOpenModalFrom(true)
  }

  const handleOpenDetails = (device) => setOpenDevice(device)
  const handleCloseDetails = () => setOpenDevice(null)

  const truncateDescription = (desc) => {
    return desc.length > 120 ? desc.slice(0, 120) + '...' : desc
  }

  const fetchDevicesData = async () => {
    try {
      const data = await customerDevicesService.getAllCustomerDevices(user.company.id)
      if (data) {
        setDevices(data)
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
          setMessageSnack(dictionary.GetDevicesFailed)
          setOpenSnackBar(true)
        }
      } else {
        setTypeSnack('error')
        setMessageSnack(dictionary.GetDevicesFailed)
        setOpenSnackBar(true)
      }
    }
  }
  useEffect(() => {
    const fetchData = async () => {
      await fetchDevicesData()
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
      {openModalFrom && (
        <FormModal
          open={true}
          onClose={() => {
            fetchDevicesData()
            setOpenModalFrom(false)
          }}
        />
      )}

      {openInstallationRequests && (
        <ClientInstallationRequests
          open={true}
          onClose={() => {
            setOpenInstallationRequests(false)
          }}
        />
      )}
      <Typography variant="h4" fontWeight="bold" mb={3} sx={{mt:2}}>
        {showAddButton? dictionary.MyDevices:dictionary.CustomerDevices}
      </Typography>
        {showAddButton &&
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Button variant="outlined primary" onClick={() => handleOpenForm()}>
                {dictionary.AddMyDevices}
                </Button>
                <Button variant="outlined primary" onClick={() => setOpenInstallationRequests(true)}>
                {dictionary.SeeMyInstalations}
                </Button>
            </Box>
        }
        {devices.length > 0 ? (
          <Box>
            <Grid container spacing={4} sx={{ justifyContent: 'center' }}>
                {currentDevices.map((device) => (
                    <Grid item xs={12} sm={6} md={4} key={device.id}>
                        <Card
                        onClick={() => handleOpenDetails(device)}
                        sx={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            borderRadius: 3,
                            boxShadow: 4,
                            cursor: 'pointer',
                            position: 'relative',
                            transition: 'transform 0.2s ease-in-out',
                            '&:hover': {
                            transform: 'scale(1.02)',
                            },
                        }}
                        >
                            <Box position="relative">
                                <CardMedia
                                component="img"
                                height="180"
                                image={device.device.imageUrl}
                                alt={device.device.imageName}
                                />
                                <IconButton
                                sx={{
                                    position: 'absolute',
                                    top: 8,
                                    right: 8,
                                    background: 'rgba(0,0,0,0.5)',
                                    color: 'white',
                                    '&:hover': { background: 'rgba(0,0,0,0.7)' },
                                }}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleOpenDetails(device)
                                }}
                                >
                                <InfoOutlined />
                                </IconButton>
                            </Box>
                            <CardContent sx={{ flex: 1 }}>
                                <Typography variant="h6" fontWeight="bold" gutterBottom>
                                {device.device.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                {truncateDescription(device.device.description)}
                                {device.device.description.length > 120 && (
                                    <Typography
                                    component="span"
                                    color="primary"
                                    sx={{ cursor: 'pointer', ml: 1 }}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleOpenDetails(device)
                                    }}
                                    >
                                    {dictionary.SeeMore}
                                    </Typography>
                                )}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                {dictionary.CompanyName}: {device.device.companyName}
                                </Typography>
                                <br />
                                <Typography variant="caption" color="text.secondary">
                                {dictionary.UserName}: {device.userName}
                                </Typography>
                            </CardContent>
                            <Box display="flex" justifyContent="space-between" p={2}>
                                {showAddButton &&
                                    <Button variant="outlined danger" onClick={(e) => {e.stopPropagation(); handleDelete(device);}}>
                                        {dictionary.Delete}
                                    </Button>
                                }
                            </Box>
                            </Card>
                        </Grid>
                        ))}
                    </Grid>
                    {totalPages > 1 && (
                      <Box mt={3} display="flex" justifyContent="center">
                        <Pagination
                          count={totalPages}
                          page={currentPage}
                          onChange={handlePageChange}
                          sx={{
                            '& .MuiPaginationItem-root': {
                              borderColor: colorBadge, 
                            },
                            '& .Mui-selected': {
                              backgroundColor: colorBadge,
                            },
                          }}
                        />
                      </Box>
                    )}
               </Box>
        ) : (
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
        )}

        <Modal
        open={openModalDelete}
        onClose={handleCloseDeleteModal}
        showConfirmButton={true}
        onConfirm={Delete}
        variant={'danger'}
        labelConfirmButton={dictionary.Delete}
        className="custom-modal"
        title={
          <>
            {' '}
            <WarningIcon sx={{ color: 'red' }} /> {dictionary.Delete}{' '}
          </>
        }
      >
        <Typography>{dictionary.AreYouSure}</Typography>
      </Modal>
       
      <Dialog open={Boolean(openDevice)} onClose={handleCloseDetails} maxWidth="sm" fullWidth>
        <DialogTitle>{openDevice?.device.name}</DialogTitle>
        <DialogContent>
          <img
            src={openDevice?.device.imageUrl}
            alt={openDevice?.device.imageName}
            style={{ width: '100%', borderRadius: 8, marginBottom: 16 }}
          />
          <Typography variant="body1">
            {dictionary.SerialNumber}: {openDevice?.serialNumber}
          </Typography>
          <Typography variant="body1">
            {openDevice?.device.description}
          </Typography>
          <Typography variant="subtitle2">{dictionary.CompanyName}: {openDevice?.device.companyName}</Typography>
          <Typography variant="subtitle2">{dictionary.UserName}: {openDevice?.userName}</Typography>
        </DialogContent>
      </Dialog>
    </Box>
    )
}

export default CustomerDevices