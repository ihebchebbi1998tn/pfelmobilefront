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
import sparePartService from '../../../services/sparePartService'
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
import SparePartsFormModal from './SparePartsFormModal'
import SparePartDetails from './SparePartDetails'
import ImportSparePartsForm from './ImportSparePartsForm'

const SpareParts = () => {
  const { user } = useAuth()
  const { toggleLoader, handleRightDrawerOpen } = useOutletContext()
  const { dictionary } = useLanguage()
  const { fetchOrganisationData, uiPage } = useOrganisation()
  const [typeSnack, setTypeSnack] = useState(null)
  const [messageSnack, setMessageSnack] = useState(null)
  const [openSnackBar, setOpenSnackBar] = useState(false)
  const [openModalFrom, setOpenModalFrom] = useState(false)
  const [openModalDelete, setOpenModalDelete] = useState(false)
  const [openUpload, setOpenUpload] = useState(false)
  const [selectedId, setSelectedId] = useState('')
  const [selectedDevice, setSelectedDevice] = useState(null)
  const [openDevice, setOpenDevice] = useState(null)
  const [uniqueCompanyNames, setUniqueCompanyNames] = useState([])
  const [spareParts, setSpareParts] = useState([])
  const [searchInput, setSearchInput] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('')
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
  const hasAllAcess =
    user?.permissions?.some((perm) => perm === 'Permissions.AllowAll') || false
  const manageOrganisations =
    user?.permissions?.some(
      (perm) =>
        perm === 'Permissions.AllowAll' || perm === 'Permissions.Organizations.Manage'
    ) || false
  const showAddButton =
    user?.permissions?.some(
      (perm) =>
        perm === 'Permissions.AllowAll' || perm === 'Permissions.Products.Manage'
    ) || false

    const showAddListDevice =
    user?.permissions?.some(
      (perm) =>  perm === 'Permissions.Products.Manage' ) || false

    const actions = [
    {
      type: 'update',
      label: dictionary.Update,
      icon: 'edit', 
      onClick: (row) => {
        handleOpenForm(row)
      },
      permissions: ['Permissions.AllowAll','Permissions.Products.Manage'],
    },
    {
      type: 'delete',
      label: dictionary.Delete,
      icon: 'delete',
      onClick: (row) => {
        handleDelete(row)
      },
      permissions: ['Permissions.AllowAll','Permissions.Products.Manage'],
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
    { label: dictionary.Image, value: 'imageUrl', type: 'image', unique: false, visible: isFieldVisible("imageUrl"), isItSatus: false },
    { label: dictionary.Title, value: 'title', type: 'string', unique: true, visible: isFieldVisible("title"), isItSatus: false },
    { label: dictionary.Description, value: 'description', type: 'string', unique: false, visible: isFieldVisible("description"), isItSatus: false },
    { label: dictionary.Price, value: 'price', type: 'number', unique: false, visible: isFieldVisible("price"), isItSatus: false },
    { label: dictionary.Tva, value: 'tva', type: 'number', unique: false, visible: isFieldVisible("tva"), isItSatus: false },
    { label: dictionary.Quantity, value: 'quantity', type: 'number', unique: false, visible: isFieldVisible("quantity"), isItSatus: false },
    { label: dictionary.OrganisationName, value: 'organizationName', type: 'string', unique: false, visible: isFieldVisible("organizationName"), isItSatus: false },
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
        const data = await sparePartService.DeleteSparePart(selectedId)
        if (data) {
          fetchSparePartsData(itemsPerPage,currentPage, null)
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
          if (message === 'Device not found') {
            setTypeSnack('error')
            setMessageSnack(dictionary.DeviceNotFound)
            setOpenSnackBar(true)
          }  else {
            setTypeSnack('error')
            setMessageSnack(dictionary.DeleteSparePartFailed)
            setOpenSnackBar(true)
          }
        } else {
          setTypeSnack('error')
          setMessageSnack(dictionary.DeleteSparePartFailed)
          setOpenSnackBar(true)
        }
      }
    }
  }
    const handleOpenForm = (row) => {
        if (row!=null) {
      spareParts.forEach((device) => {
        if (device.id == row.id) setSelectedDevice(device)
      })
    }
    setOpenModalFrom(true)
  }

  const handlePrev = async () => {
    toggleLoader(true)
    setCurrentPage(currentPage - 1)
    await fetchSparePartsData(itemsPerPage,currentPage - 1, null)
    toggleLoader(false)
  }

  const handleNext = async () => {
    toggleLoader(true)
    setCurrentPage(currentPage + 1)
    await fetchSparePartsData(itemsPerPage,currentPage + 1, null)
    toggleLoader(false)
  }

  const handleSearchChange = (searchTerm) => {
    if (!searchTerm) {
      fetchSparePartsData(itemsPerPage,currentPage, null)
      return
    }
    setCurrentPage(1)
    fetchSparePartsData(itemsPerPage,currentPage, searchTerm)
  }

  const handleOpenDetails = (device) => setOpenDevice(device)
  const handleCloseDetails = () => setOpenDevice(null)

   const fetchSparePartsData = async (itemsNumber,pageNumber, searchTerm) => {
    try {
      const data = await sparePartService.getAllSpareParts(
        pageNumber,
        itemsNumber,
        user.organization.id,
        searchTerm
      )
      
      // Always show interface
      setHasAnyDevice(true)
      
      if (data) {
        if (data.totalCount > 0) {
          setTotalPages(Math.ceil(data.totalCount / itemsNumber))
        } else {
          setTotalPages(0)
        }
        setSpareParts(data.items || [])
        setUniqueCompanyNames(data.companyNames || [])
      } else {
        setSpareParts([])
        setUniqueCompanyNames([])
        setTotalPages(0)
      }
    } catch (e) {
      setHasAnyDevice(true) // Show interface even on error
      setSpareParts([])
      setUniqueCompanyNames([])
      setTotalPages(0)
      
      if (e?.response?.data?.message) {
        const message = e.response.data.message
       
        if (message === 'User not authenticated') {
          setTypeSnack('error')
          setMessageSnack(dictionary.UserNotAuthenticated)
          setOpenSnackBar(true)
        } else {
          setTypeSnack('error')
          setMessageSnack(dictionary.GetSparePartsFailed)
          setOpenSnackBar(true)
        }
      } else {
        setTypeSnack('error')
        setMessageSnack(dictionary.GetSparePartsFailed)
        setOpenSnackBar(true)
      }
    }
  }
 
  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([fetchSparePartsData(itemsPerPage,currentPage, null), fetchOrganisationData("spare parts")])
    }
    fetchData()
  }, [])

  useEffect(() => {
      const delayDebounce = setTimeout(() => {
        handleSearchChange(searchInput.trim())
      }, 500)
  
      return () => clearTimeout(delayDebounce)
    }, [searchInput])

 useEffect(() => {
  const fetchAndInit = async () => {
    if (uiPage != null) {
      setFields([
        { label: dictionary.Image, value: 'imageUrl', type: 'image', unique: false, visible: isFieldVisible("imageUrl"), isItSatus: false },
        { label: dictionary.Title, value: 'title', type: 'string', unique: true, visible: isFieldVisible("title"), isItSatus: false },
        { label: dictionary.Description, value: 'description', type: 'string', unique: false, visible: isFieldVisible("description"), isItSatus: false },
        { label: dictionary.Price, value: 'price', type: 'number', unique: false, visible: isFieldVisible("price"), isItSatus: false },
        { label: dictionary.Tva, value: 'tva', type: 'number', unique: false, visible: isFieldVisible("tva"), isItSatus: false },
         { label: dictionary.Quantity, value: 'quantity', type: 'number', unique: false, visible: isFieldVisible("quantity"), isItSatus: false },
        { label: dictionary.OrganisationName, value: 'organizationName', type: 'string', unique: false, visible: isFieldVisible("organizationName"), isItSatus: false },
      ])

      setLayout(uiPage.layout)
      setImagePostion(uiPage.imagePosition)
      setBackgroundColors({ dark: uiPage.darkModeColor, light: uiPage.lightModeColor })
      setItemsPerPage(uiPage.itemsPerPage)

      await fetchSparePartsData(uiPage.itemsPerPage, currentPage, null)
    }
  }

  fetchAndInit()
}, [uiPage])


    useEffect(() => {
  if (spareParts.length > 0 && fields.length > 0) {
    setCommonProps({
      data: spareParts,
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
    });
  }
}, [spareParts, fields, backgroundColors, imagePostion, currentPage, totalPages, itemsPerPage]);


  return (
    <Box>
        <CustomSnackbar
        open={openSnackBar}
        message={messageSnack}
        type={typeSnack}
        onClose={() => setOpenSnackBar(false)}
      />
      {openModalFrom && (
        <SparePartsFormModal
          open={true}
          onClose={() => {
            fetchSparePartsData(itemsPerPage,currentPage, null)
            setOpenModalFrom(false)
            setSelectedDevice(null)
          }}
          sparePart={selectedDevice}
        />
      )}
      {openUpload && (
        <ImportSparePartsForm
          open={true}
          onClose={() => {
            fetchSparePartsData(itemsPerPage,currentPage, null)
            setOpenUpload(false)
          }}
        />
      )}
      <Card title={dictionary.SpareParts} showHover={false}>
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
            <Box display="flex" mb={3}>
              <Button variant="outlined primary" onClick={() => handleOpenForm(null)}>
                {dictionary.AddSparePart}
              </Button>
            </Box>
          }
          <Box display="flex" mb={3}>
            {manageOrganisations &&
            <Box >
              <Button variant="magic" onClick={handleRightDrawerOpen}>
                <>
                  <AutoAwesomeIcon sx={{ mr: 0.5, mb: 0.2 }} />
                  {dictionary.CustomizeSparePartsInterface}
                </>
              </Button>
            </Box>
            }
            {showAddListDevice &&
             <Box >
              <Button variant="magic"  onClick={() => setOpenUpload(true)}>
                <>
                  <AutoAwesomeIcon sx={{ mr: 0.5, mb: 0.2 }} />
                  {dictionary.UploadSparePartsList}
                </>
              </Button>
            </Box>
            }
          </Box>
          
        </Box>
       
        {hasAnyDevice && 
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.3 }}
          >
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
                    {hasAllAcess && (
                        <TextField
                            select
                            label={dictionary.filterOrgName}
                            value={selectedFilter}
                            onChange={(e) => {
                                setSelectedFilter(e.target.value)
                                handleSearchChange(e.target.value)
                            }}
                            fullWidth
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
                            >
                            <MenuItem value="">{dictionary.ClearFilter}</MenuItem>
                            {uniqueCompanyNames.map((name) => (
                                <MenuItem key={name} value={name}>
                                    {name}
                                </MenuItem>
                            ))}
                        </TextField>
                    )}
                </Box>
          </motion.div>
        }
      </Card>
      
       
        {hasAnyDevice ? ( 
             <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.3 }}
          >
                {spareParts.length > 0 ? (
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
          <SparePartDetails
            open={true}
            onClose={handleCloseDetails}
            sparePart={openDevice}
        />
      )}
    </Box>
  )
}

export default SpareParts
