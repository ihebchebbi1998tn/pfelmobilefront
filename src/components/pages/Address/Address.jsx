import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Box, Typography } from '@mui/material'
import { motion } from 'framer-motion'
import CustomSnackbar from '../../ui/CustomSnackbar'
import Card from '../../ui/Card'
import TableComponent from '../../ui/TableComponent'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import noDataAnimation from '../../../assets/animation/noData.lottie'
import addressService from '../../../services/addressService'
import { useLanguage } from '../../../hooks/LanguageContext'
import { useAuth } from '../../../hooks/AuthContext'
import AddressDetails from './AddressDetails'
import VisibilityIcon from '@mui/icons-material/Visibility'

const Address = () => {
  const { dictionary } = useLanguage()
  const { user } = useAuth()
  const [allAddresses, setAllAddresses] = useState([])
  const [uniqueCompanyNames, setUniqueCompanyNames] = useState([])
  const { toggleLoader } = useOutletContext()
  const [openModalDetails, setOpenModalDetails] = useState(false)
  const [openSnackBar, setOpenSnackBar] = useState(false)
  const [isSerched, setIsSerched] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState(null)
  const itemsPerPage = 3
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [typeSnack, setTypeSnack] = useState(null)
  const [messageSnack, setMessageSnack] = useState(null)
  const [filteredData, setFilteredData] = useState([])
  const hasAllAcess =
    user?.permissions?.some((perm) => perm === 'Permissions.AllowAll') || false
  const handleSearchChange = (searchTerm) => {
    if (!searchTerm) {
      fetchAddressData(currentPage, null)
      return
    }
    setIsSerched(true)
    setCurrentPage(1)
    fetchAddressData(currentPage, searchTerm)
  }
  const columns = hasAllAcess
    ? [
        { key: 'streetName', label: dictionary.StreetName },
        { key: 'city', label: dictionary.City },
        { key: 'countryKey', label: dictionary.country },
        { key: 'state', label: dictionary.State },
        { key: 'zipCode', label: dictionary.ZipCode },
        { key: 'username', label: dictionary.UserName },
        { key: 'companyName', label: dictionary.CompanyName },
      ]
    : [
        { key: 'streetName', label: dictionary.StreetName },
        { key: 'city', label: dictionary.City },
        { key: 'countryKey', label: dictionary.country },
        { key: 'state', label: dictionary.State },
        { key: 'zipCode', label: dictionary.ZipCode },
        { key: 'username', label: dictionary.UserName },
      ]

  const actions = [
    {
      label: dictionary.ShowDetails,
      onClick: (row) => {
        handleShowDetails(row)
      },
      icon: <VisibilityIcon />,
    }
  ]

  const handleShowDetails = (row) => {
    if (row.id) {
      allAddresses.forEach((address) => {
        if (address.id == row.id) setSelectedAddress(address)
        setOpenModalDetails(true)
      })
    }
  }

  const fetchAddressData = async (pageNumber, searchTerm) => {
    try {
      const data = await addressService.getAllAddresses(
        pageNumber,
        itemsPerPage,
        searchTerm
      )
      if (data) {
        if (data.totalCount > 0) {
          setTotalPages(Math.ceil(data.totalCount / itemsPerPage))
        }
        setAllAddresses(data.items)
        setUniqueCompanyNames(data.organizationNames)
      }
    } catch (e) {
      if (e?.response?.data?.message) {
        const message = e.response.data.message
        if (message === 'Unknown error occurred.') {
          setTypeSnack('error')
          setMessageSnack(dictionary.UnknownError)
          setOpenSnackBar(true)
        } else {
          setTypeSnack('error')
          setMessageSnack(dictionary.GetAddressFailed)
          setOpenSnackBar(true)
        }
      } else {
        setTypeSnack('error')
        setMessageSnack(dictionary.GetAddressFailed)
        setOpenSnackBar(true)
      }
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      await fetchAddressData(currentPage, null)
    }
    fetchData()
  }, [])

  const handlepageNext = async () => {
    toggleLoader(true)
    setCurrentPage(currentPage + 1)
    await fetchAddressData(currentPage + 1, null)
    toggleLoader(false)
  }

  const handlepagePrev = async () => {
    toggleLoader(true)
    setCurrentPage(currentPage - 1)
    await fetchAddressData(currentPage - 1, null)
    toggleLoader(false)
  }

  useEffect(() => {
    setFilteredData(allAddresses)
  }, [allAddresses])

  return (
    <Box>
      <CustomSnackbar
        open={openSnackBar}
        message={messageSnack}
        type={typeSnack}
        onClose={() => setOpenSnackBar(false)}
      />
      {openModalDetails && (
        <AddressDetails
          open={true}
          onClose={() => {
            setOpenModalDetails(false)
            setSelectedAddress(null)
          }}
          address={selectedAddress}
        />
      )}

      <Box sx={{ flexBasis: { xs: '100%', sm: '100%' } }}>
        {(allAddresses.length > 0 || isSerched) ? (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.3 }}
          >
          <Card title={dictionary.AddressesTable}>
            <TableComponent
              columns={columns}
              data={filteredData}
              actions={actions}
              totalPages={totalPages}
              currentPage={currentPage}
              onNextPage={handlepageNext}
              onPrevPage={handlepagePrev}
              userPermissions={user?.permissions}
              onSearchChange={handleSearchChange}
              showFilter={hasAllAcess}
              dataFilter={uniqueCompanyNames}
            />
          </Card>
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
      </Box>
    </Box>
  )
}

export default Address
