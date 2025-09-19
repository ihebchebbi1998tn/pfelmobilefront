import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  InputAdornment
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import WarningIcon from '@mui/icons-material/Warning'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import { motion, AnimatePresence } from 'framer-motion'
import customerDevicesService from '../../../services/customerDevicesService'
import { useLanguage } from '../../../hooks/LanguageContext'
import { useOrganisation } from '../../../hooks/OrganisationContext'
import { useAuth } from '../../../hooks/AuthContext'
import CustomSnackbar from '../../ui/CustomSnackbar'
import noDataAnimation from '../../../assets/animation/noData.lottie'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import Button from '../../ui/Button'
import Modal from '../../ui/Modal'
import Card from '../../ui/Card'
import TableContainerComponent from '../../ui/TableContainer'
import GridContainer from '../../ui/GridContainer'
import ColumnContainer from '../../ui/ColumnContainer'
import TabContainer from '../../ui/TabContainer'
import FormModal from './FormModal'
import CustomerDeviceDetails from './CustomerDeviceDetails'

const CustomerDevices = () => {
  const { user } = useAuth()
  const { toggleLoader, handleRightDrawerOpen } = useOutletContext()
  const { dictionary } = useLanguage()
  const { fetchOrganisationData, uiPage } = useOrganisation()
  const [typeSnack, setTypeSnack] = useState(null)
  const [messageSnack, setMessageSnack] = useState(null)
  const [openSnackBar, setOpenSnackBar] = useState(false)
  const [openModalFrom, setOpenModalFrom] = useState(false)
  const [openModalDelete, setOpenModalDelete] = useState(false)
  const [selectedId, setSelectedId] = useState('')
  const [openDevice, setOpenDevice] = useState(null)
  const [devices, setDevices] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [hasAnyDevice, setHasAnyDevice] = useState(false)
  const [commonProps, setCommonProps] = useState({})
  const [itemsPerPage, setItemsPerPage] = useState(
    uiPage!=null ? uiPage?.itemsPerPage : 2
  )
  const [layout, setLayout] = useState(
    uiPage!=null ? uiPage?.layout : 'table'
  )
  const [imagePostion, setImagePostion] = useState(
    uiPage!=null ? uiPage?.imagePosition : "top"
  )
  const [backgroundColors, setBackgroundColors] = useState(
    { dark:uiPage!=null ? uiPage?.darkModeColor : '#18141c', light:uiPage!=null ? uiPage?.lightModeColor : '#eeefef' }
  )
  const [indexOfLastItem, setIndexOfLastItem] = useState(currentPage * itemsPerPage)
  const [indexOfFirstItem, setIndexOfFirstItem] = useState(indexOfLastItem - itemsPerPage)
  const [currentDevices, setCurrentDevices] = useState(devices.slice(indexOfFirstItem, indexOfLastItem))
  const manageOrganisations =
    user?.permissions?.some(
      (perm) =>
        perm === 'Permissions.AllowAll' || perm === 'Permissions.Organizations.Manage'
    ) || false
  const showAddButton =
    user?.permissions?.some(
      (perm) => perm === 'Permissions.Devices.ManageMine') || false

    const actions = [
    {
      type: 'delete',
      label: dictionary.Delete,
      icon: 'delete',
      onClick: (row) => {
        handleDelete(row)
      },
      permissions: ['Permissions.AllowAll','Permissions.Devices.ManageMine'],
    },
    {
      type: 'show',
      label: dictionary.ShowDetails,
      icon: 'show',
      onClick: (row) => {
        handleOpenDetails(row)
      }
    },
  ]
  const isFieldVisible = (field) => {
  if (!uiPage || !Array.isArray(uiPage.fieldsToNotDisplay)) return true;
  return !uiPage.fieldsToNotDisplay.includes(field)
}
   const [fields, setFields] = useState([
    { label: dictionary.Image, value: 'device.imageUrl', type: 'image', unique: false, visible: isFieldVisible("device.imageUrl"), isItSatus: false },
    { label: dictionary.Name, value: 'device.name', type: 'string', unique: true, visible: isFieldVisible("device.name"), isItSatus: false },
    { label: dictionary.Description, value: 'device.description', type: 'string', unique: false, visible: isFieldVisible("device.description"), isItSatus: false },
    { label: dictionary.SerialNumber, value: 'serialNumber', type: 'string', unique: false, visible: isFieldVisible("serialNumber"), isItSatus: false },
    { label: dictionary.UserName, value: 'device.userName', type: 'string', unique: false, visible: isFieldVisible("device.userName"), isItSatus: false },
    { label: dictionary.OrganisationName, value: 'device.organizationName', type: 'string', unique: false, visible: isFieldVisible("device.organizationName"), isItSatus: false },
  ])
  
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
          fetchDevicesData(itemsPerPage)
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

  const handlePrev =  () => {
    setCurrentPage(currentPage - 1)
    setIndexOfLastItem((currentPage - 1) * itemsPerPage)
    setIndexOfFirstItem(((currentPage - 1) * itemsPerPage) - itemsPerPage)
    setCurrentDevices(devices.slice((((currentPage - 1) * itemsPerPage) - itemsPerPage), ((currentPage - 1) * itemsPerPage)))
  }

  const handleNext =  () => {
     setCurrentPage(currentPage + 1)
    setIndexOfLastItem((currentPage + 1) * itemsPerPage)
    setIndexOfFirstItem(((currentPage + 1) * itemsPerPage) - itemsPerPage)
    setCurrentDevices(devices.slice((((currentPage + 1) * itemsPerPage) - itemsPerPage), ((currentPage + 1) * itemsPerPage)))
  }

  const handleOpenDetails = (device) => setOpenDevice(device)
  const handleCloseDetails = () => setOpenDevice(null)

   const fetchDevicesData = async (itemsNumber) => {
    try {
      const data = await customerDevicesService.getAllCustomerDevices(user.organization.id)
      if (data) {    
      setTotalPages(Math.ceil(data.length / itemsNumber))
      setDevices(data)
      setIndexOfLastItem(currentPage * itemsNumber)
      setIndexOfFirstItem((currentPage * itemsNumber) - itemsNumber)
      setCurrentDevices(data.slice(((currentPage * itemsNumber) - itemsNumber), (currentPage * itemsNumber)))
      if(!hasAnyDevice) setHasAnyDevice(true)
      }
    } catch (e) {
      console.log(e)
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
      await Promise.all([fetchDevicesData(itemsPerPage), fetchOrganisationData("customer devices")])
    }
    fetchData()
  }, [])

 useEffect(() => {
  const fetchAndInit = async () => {
    if (uiPage != null) {
      setFields([
        { label: dictionary.Image, value: 'device.imageUrl', type: 'image', unique: false, visible: isFieldVisible("device.imageUrl"), isItSatus: false },
    { label: dictionary.Name, value: 'device.name', type: 'string', unique: true, visible: isFieldVisible("device.name"), isItSatus: false },
    { label: dictionary.Description, value: 'device.description', type: 'string', unique: false, visible: isFieldVisible("device.description"), isItSatus: false },
    { label: dictionary.SerialNumber, value: 'serialNumber', type: 'string', unique: false, visible: isFieldVisible("serialNumber"), isItSatus: false },
    { label: dictionary.UserName, value: 'userName', type: 'string', unique: false, visible: isFieldVisible("device.userName"), isItSatus: false },
    { label: dictionary.OrganisationName, value: 'device.organizationName', type: 'string', unique: false, visible: isFieldVisible("device.organizationName"), isItSatus: false },
      ])

      setLayout(uiPage.layout)
      setImagePostion(uiPage.imagePosition)
      setBackgroundColors({ dark: uiPage.darkModeColor, light: uiPage.lightModeColor })
      setItemsPerPage(uiPage.itemsPerPage)

      await fetchDevicesData(uiPage.itemsPerPage)
    }
  }

  fetchAndInit()
}, [uiPage])


    useEffect(() => {
  if (devices.length > 0 && fields.length > 0) {
    setCommonProps({
      data: currentDevices,
      fields,
      actions,
      userPermissions: user?.permissions,
      backgroundColors,
      imagePositions: imagePostion,
      currentPage,
      totalPages,
      onNext: handleNext,
      onPrevious: handlePrev,
      handleshowObject: handleOpenDetails,
    })
  }
}, [currentDevices, fields, backgroundColors, imagePostion, currentPage, totalPages])


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
            fetchDevicesData(itemsPerPage)
            setOpenModalFrom(false)
          }}
        />
      )}
      <Card title={showAddButton? dictionary.MyDevices:dictionary.CustomerDevices} showHover={false}>
         <Box
          sx={{
            mb: 1,
            display: 'flex',
            justifyContent: showAddButton
              ? 'space-between'
              : 'flex-end',
          }}
        >
          {showAddButton &&
            <Box display="flex" mb={1}>
              <Button variant="outlined primary" onClick={() => handleOpenForm()}>
                {dictionary.AddMyDevices}
              </Button>
            </Box>
          }
          {manageOrganisations &&
            <Box display="flex" mb={1}>
              <Button variant="magic" onClick={handleRightDrawerOpen}>
                <>
                  <AutoAwesomeIcon sx={{ mr: 0.5, mb: 0.2 }} />
                  {dictionary.CustomizeCustmoerDevicesInterface}
                </>
              </Button>
            </Box>
          }
        </Box>
      </Card>
      
       
        {hasAnyDevice ? ( 
             <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.3 }}
          >
                {devices.length > 0 ? (
                  <AnimatePresence mode="wait">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      {layout === 'Table' && <TableContainerComponent {...commonProps} />}
                      {layout === 'Grid' && <GridContainer {...commonProps} />}
                      {layout === 'Column' && <ColumnContainer {...commonProps} />}
                      {layout === 'Tab' && <TabContainer {...commonProps} />}
                    </motion.div>
                  </AnimatePresence>
                ) : (
                    <Typography variant="h6" textAlign="center" color="text.secondary">
                    🔍 {dictionary.NoDataFound}
                    </Typography>
                )}
                
            </motion.div>
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

       {Boolean(openDevice) && (
          <CustomerDeviceDetails
            open={true}
            onClose={handleCloseDetails}
            device={openDevice}
        />
      )}
    </Box>
  )
}

export default CustomerDevices
