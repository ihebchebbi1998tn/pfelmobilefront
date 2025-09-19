import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Box, Typography, IconButton } from '@mui/material'
import CustomSnackbar from '../../ui/CustomSnackbar'
import Card from '../../ui/Card'
import TableComponent from '../../ui/TableComponent'
import Button from '../../ui/Button'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import noDataAnimation from '../../../assets/animation/noData.lottie'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import QuizIcon from '@mui/icons-material/Quiz'
import EditIcon from '@mui/icons-material/Edit'
import VisibilityIcon from '@mui/icons-material/Visibility'
import WarningIcon from '@mui/icons-material/Warning'
import RestoreIcon from '@mui/icons-material/Restore'
import DevicesIcon from '@mui/icons-material/Devices'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import Modal from '../../ui/Modal'
import userService from '../../../services/userService'
import { useLanguage } from '../../../hooks/LanguageContext'
import { useAuth } from '../../../hooks/AuthContext'
import UserDetails from './UserDetails'
import UserFormModal from './UserFormModal'
import UserConnectedDevice from './UserConnectedDevice'
import ImportClientsForm from './ImportClientsForm'
import Tutorial from '../Tutorial/Tutorial'

const Users = () => {
  const { dictionary } = useLanguage()
  const { user } = useAuth()
  const { toggleLoader } = useOutletContext()
  const [isSerched, setIsSerched] = useState(false)
  const [openImportUsersModal, setOpenImportUsersModal] = useState(false)
  const [openSnackBar, setOpenSnackBar] = useState(false)
  const [openModalDetails, setOpenModalDetails] = useState(false)
  const [openModalUserDevices, setOpenModalUserDevices] = useState(false)
  const [openModalForm, setOpenModalForm] = useState(false)
  const [showDeletedUsers, setShowDeletedUsers] = useState(false)
  const [openModalDelete, setOpenModalDelete] = useState(false)
  const [openModalRestore, setOpenModalRestore] = useState(false)
  const [idSelected, setIdSelected] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const [typeSnack, setTypeSnack] = useState(null)
  const [messageSnack, setMessageSnack] = useState(null)
  const [deletedUsers, setDeletedUsers] = useState([])
  const [uniqueCompanyNames, setUniqueCompanyNames] = useState([])
  const showAddButtonTable =
    user?.permissions?.some(
      (perm) =>
        perm === 'Permissions.AllowAll' || perm === 'Permissions.Users.Manage'
    ) || false
  const hasMangeUsers =
    user?.permissions?.some(
      (perm) => perm === 'Permissions.Users.Manage') || false
  const itemsPerPage = 3
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [currentPageArchived, setCurrentPageArchived] = useState(1)
  const [totalPagesArchived, setTotalPagesArchived] = useState(0)
  const [filteredData, setFilteredData] = useState([])
  const hasAllAcess =
    user?.permissions?.some((perm) => perm === 'Permissions.AllowAll') || false
  const handleSearchChange = async (searchTerm) => {
    if (!searchTerm) {
      fetchData(currentPage, null)
      return
    }
    setIsSerched(true)
    setCurrentPage(1)
    fetchData(currentPage, searchTerm)
  }
  const [layoutReady, setLayoutReady] = useState(false)
  const [openTutorial, setOpenTutorial] = useState(false)
    useEffect(() => {
    setTimeout(() => {
      setLayoutReady(true)
    }, 3000)
  }, [])

  useEffect(() => {
    if (layoutReady) {
      const stored = localStorage.getItem('usersInterfaceTutorial')
      if ((stored === null && hasMangeUsers) || (stored === 'true' && hasMangeUsers)) {
        setOpenTutorial(true)
      }
    }
  }, [layoutReady])
  const columns = [
    { key: 'firstName', label: dictionary.FirstName },
    { key: 'lastName', label: dictionary.LastName },
    { key: 'email', label: dictionary.email },
    { key: 'phoneNumber', label: dictionary.PhoneNumber },
    { key: 'defaultLanguage', label: dictionary.LanguageCode },
    { key: 'isActive', label: dictionary.Status },
  ]

  const columnsDelete = [
    { key: 'firstName', label: dictionary.FirstName },
    { key: 'lastName', label: dictionary.LastName },
    { key: 'email', label: dictionary.email },
    { key: 'phoneNumber', label: dictionary.PhoneNumber },
    { key: 'defaultLanguage', label: dictionary.LanguageCode },
  ]

  const actionsDeleted = [
    {
      label: dictionary.Restore,
      onClick: (row) => {
        handleRestore(row)
      },
      permissions: ['Permissions.AllowAll', 'Permissions.Users.Manage'],
      icon: <RestoreIcon />,
    },
  ]

  const actions = [
    {
      label: dictionary.ToggleUserStatus,
      onClick: (row) => {
        handleToggleStatus(row)
      },
      permissions: ['Permissions.AllowAll', 'Permissions.Users.Manage'],
      icon: <EditIcon />,
    },
    {
      label: dictionary.ShowDetails,
      onClick: (row) => {
        handleShowDetails(row)
      },
      icon: <VisibilityIcon />,
    },
     {
      label: dictionary.UserConnectedDevices,
      onClick: (row) => {
        handleShowUserDevices(row)
      },
      permissions: ['Permissions.AllowAll', 'Permissions.Users.Manage'],
      icon: <DevicesIcon />,
    },
    {
      label: dictionary.ArchiveUser,
      onClick: (row) => {
        handleDelete(row)
      },
      permissions: ['Permissions.AllowAll', 'Permissions.Users.Manage'],
      icon: <DeleteForeverIcon />,
    },
    {
      label: dictionary.Update,
      onClick: (row) => {
        handleUpdate(row)
      },
      permissions: ['Permissions.AllowAll', 'Permissions.Users.Manage'],
      icon: <EditIcon />,
    },
  ]
  const handleUpdate = (row) => {
    if (row.id) {
      setOpenModalForm(true)
      setSelectedUser(row)
    }
  }
  const handleShowDeletedUsers = () => {
    setShowDeletedUsers(!showDeletedUsers)
  }

  const handleOpenAddModal = () => {
    setOpenModalForm(true)
  }

  const handleShowDetails = (row) => {
    if (row.id) {
      setOpenModalDetails(true)
      setSelectedUser(row)
    }
  }

   const handleShowUserDevices = (row) => {
    if (row.id) {
      setOpenModalUserDevices(true)
      setSelectedUser(row)
    }
  }

  const handleRestore = (row) => {
    if (row.id) {
      setOpenModalRestore(true)
      setIdSelected(row.id)
    }
  }

  const handleCancelRestore = () => {
    setOpenModalRestore(false)
    setIdSelected(null)
  }

  const handleCancelDelete = () => {
    setOpenModalDelete(false)
    setIdSelected(null)
  }
  const handleDelete = (row) => {
    if (row.id) {
      setOpenModalDelete(true)
      setIdSelected(row.id)
    }
  }

  const Delete = async () => {
    if (idSelected) {
      toggleLoader(true)
      try {
        const data = await userService.toggleUserIsDeleted(idSelected)
        if (data) {
          fetchData(currentPage, null)
          fetchArchivedData(currentPageArchived)
          toggleLoader(false)
          setTypeSnack('success')
          setMessageSnack(dictionary.OperationSeccesfull)
          setOpenSnackBar(true)
          setOpenModalDelete(false)
          setOpenModalRestore(false)
          setIdSelected('')
        }
      } catch (e) {
        toggleLoader(false)
        setIdSelected('')
        if (e?.response?.data?.message) {
          const message = e.response.data.message
          if (message === 'User not found.') {
            setTypeSnack('error')
            setMessageSnack(dictionary.UserNotFound)
            setOpenSnackBar(true)
          } else {
            setTypeSnack('error')
            setMessageSnack(dictionary.DeleteUserFailed)
            setOpenSnackBar(true)
          }
        } else {
          setTypeSnack('error')
          setMessageSnack(dictionary.DeleteUserFailed)
          setOpenSnackBar(true)
        }
      }
    }
  }

  const handleToggleStatus = async (row) => {
    if (row.id) {
      toggleLoader(true)
      try {
        const data = await userService.toggleUserIsActive(row.id)
        if (data) fetchData(currentPage, null)
      } catch (e) {
        if (e?.response?.data?.message) {
          const message = e.response.data.message
          if (message === 'User not found.') {
            setTypeSnack('error')
            setMessageSnack(dictionary.UserNotFound)
            setOpenSnackBar(true)
          } else {
            setTypeSnack('error')
            setMessageSnack(dictionary.UpdateUserStatusFailed)
            setOpenSnackBar(true)
          }
        } else {
          setTypeSnack('error')
          setMessageSnack(dictionary.UpdateUserStatusFailed)
          setOpenSnackBar(true)
        }
      }
      toggleLoader(false)
      setTypeSnack('success')
      setMessageSnack(dictionary.OperationSeccesfull)
      setOpenSnackBar(true)
      setOpenModalDelete(false)
      setIdSelected('')
    }
  }
  const fetchData = async (pageNumber, term) => {
    try {
      const data = await userService.getAllUsers(pageNumber, itemsPerPage, term)
      if (data) {
        if (data.totalCount > 0) {
          setTotalPages(Math.ceil(data.totalCount / itemsPerPage))
        }
        setFilteredData(data.users)
        setUniqueCompanyNames(data.companyNames)
      }
    } catch (e) {
      setTypeSnack('error')
      setMessageSnack(e?.response?.data?.message || 'Get all users failed')
      setOpenSnackBar(true)
    }
  }
  const fetchArchivedData = async (pageNumber) => {
    try {
      const data = await userService.getAllDeletedUsers(pageNumber, itemsPerPage)
      if (data) {
         if (data.totalCount > 0) {
          setTotalPagesArchived(Math.ceil(data.totalCount / itemsPerPage))
        }
        setDeletedUsers(data.users)
      }
    } catch (e) {
      setTypeSnack('error')
      setMessageSnack(e?.response?.data?.message || 'Get all users failed')
      setOpenSnackBar(true)
    }
  }

  const handlepageNext = () => {
    toggleLoader(true)
    setCurrentPage(currentPage + 1)
    fetchData(currentPage + 1, null)
    toggleLoader(false)
  }

  const handlepagePrev = async () => {
    toggleLoader(true)
    setCurrentPage(currentPage - 1)
    fetchData(currentPage - 1, null)
    toggleLoader(false)
  }

  const handlepageNextArchived = () => {
    toggleLoader(true)
    setCurrentPageArchived(currentPageArchived + 1)
    fetchArchivedData(currentPageArchived + 1)
    toggleLoader(false)
  }

  const handlepagePrevArchived = async () => {
    toggleLoader(true)
    setCurrentPageArchived(currentPageArchived - 1)
    fetchArchivedData(currentPageArchived - 1)
    toggleLoader(false)
  }

  useEffect(() => {
    fetchData(currentPage, null)
    fetchArchivedData(currentPageArchived)
  }, [])
const stepsTutorial = [
        { target: '.stepArchivedUserss', content: dictionary.HereYouCanSeeArchivedUsers },
        { target: '.stepBtnUpbloadCustomers', content: dictionary.ThisButtonOpensAmodalToUploadListOfCustomerUsingAi},
        { target: '.stepBtnCreateUser', content: dictionary.HereTheButtonToOpenAddUserForm},
      ]
  return (
    <Box>
      <CustomSnackbar
        open={openSnackBar}
        message={messageSnack}
        type={typeSnack}
        onClose={() => setOpenSnackBar(false)}
      />
      {openModalForm && (
        <UserFormModal
          open={true}
          onClose={() => {
            fetchData(currentPage, null)
            setOpenModalForm(false)
            setSelectedUser(null)
          }}
          userUpdate={selectedUser}
        />
      )}
      {openModalDetails && (
        <UserDetails
          open={true}
          onClose={() => {
            setOpenModalDetails(false)
            setSelectedUser(null)
          }}
          userDetail={selectedUser}
        />
      )}

      {openModalUserDevices && (
        <UserConnectedDevice
          open={true}
          onClose={() => {
            fetchData(currentPage, null)
            setOpenModalUserDevices(false)
            setSelectedUser(null)
          }}
          userDetail={selectedUser}
        />
      )}
      {openImportUsersModal && (
        <ImportClientsForm
          open={true}
          onClose={() => {
            fetchData(currentPage, null)
            setOpenImportUsersModal(false)
          }}
        />
      )}
      <Modal
        open={openModalDelete}
        onClose={handleCancelDelete}
        showConfirmButton={true}
        onConfirm={Delete}
        variant={'danger'}
        labelConfirmButton={dictionary.ArchiveUser}
        title={
          <>
            {' '}
            <WarningIcon sx={{ color: 'red' }} /> {dictionary.ArchiveUser}{' '}
          </>
        }
        className="custom-modal"
      >
        <Typography>{dictionary.AreYouSureYouWantToArchive}</Typography>
      </Modal>
      <Modal
        open={openModalRestore}
        onClose={handleCancelRestore}
        showConfirmButton={true}
        onConfirm={Delete}
        variant={'danger'}
        labelConfirmButton={dictionary.Restore}
        title={
          <>
            {' '}
            <WarningIcon sx={{ color: 'red' }} /> {dictionary.Restore}{' '}
          </>
        }
        className="custom-modal"
      >
        <Typography>{dictionary.AreYouSureYouWantToRestore}</Typography>
      </Modal>
      <Box >
        <Box
          sx={{
            mb: 1,
            display: 'flex',
            justifyContent: ((isSerched)||(filteredData && filteredData.length > 0))
              ? 'space-between'
              : 'flex-end',
          }}
        >
          {((isSerched)||(filteredData && filteredData.length > 0)) && (
            <Box>
              <Button variant="outlined primary" onClick={handleShowDeletedUsers} className={'stepArchivedUserss'}>
                {showDeletedUsers ? dictionary.HideArchivedUsers: dictionary.ShowArchivedUsers}
              </Button>
            </Box>
          )}
          {hasMangeUsers &&
             <Box>
              
                      <IconButton
                        onClick={() => setOpenTutorial(true)} 
                      >
                        <QuizIcon sx={{color:user.organization.primaryColor}}/>
                      </IconButton>
                    
            <Button variant="magic" onClick={() => setOpenImportUsersModal(true)} className={'stepBtnUpbloadCustomers'}>
              <>
                <AutoAwesomeIcon sx={{ mr: 0.5, mb: 0.2 }} />
                {dictionary.UploadUsersList}
              </>
            </Button>
          </Box>
          }
         
        </Box>

       <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2, 
        }}
       >
         <Box
          sx={{
            flex: showDeletedUsers ? '1 1 48%' : '1 1 100%', 
            minWidth: '300px', 
          }}
         >
{((isSerched)||(filteredData && filteredData.length > 0)) ? (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.3 }}
          >
          <Card title={dictionary.UsersTable}>
            <TableComponent
              columns={columns}
              data={filteredData}
              actions={actions}
              totalPages={totalPages}
              currentPage={currentPage}
              showAddButton={showAddButtonTable}
              addButtonLabel={dictionary.CreateUser}
              onAddButtonClick={handleOpenAddModal}
              userPermissions={user?.permissions}
              onNextPage={handlepageNext}
              onPrevPage={handlepagePrev}
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
            {showAddButtonTable && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Button
                  variant={'outlined primary'}
                  onClick={handleOpenAddModal}
                >
                  {dictionary.CreateUser}
                </Button>
              </Box>
            )}
          </Box>
        )}
         </Box>
        {showDeletedUsers && (
    <Box
      sx={{
        flex: '1 1 48%',
        minWidth: '300px',
      }}
    >
      <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.3 }}
          >
      <Card title={dictionary.ArchivedUsersList}>
        <TableComponent
          columns={columnsDelete}
          data={deletedUsers}
          actions={actionsDeleted}
          showSerchInput={false}
          showAddButton={false}
          onNextPage={handlepageNextArchived}
          onPrevPage={handlepagePrevArchived}
          totalPages={totalPagesArchived}
          currentPage={currentPageArchived}
          userPermissions={user?.permissions}
        />
      </Card>
      </motion.div>
    </Box>
  )}
  </Box>
      </Box>
       {layoutReady && (
<Tutorial
              open={openTutorial}
              steps={stepsTutorial}
              beaconSize={150}
              onClose={() => {
                localStorage.setItem('usersInterfaceTutorial', 'false')
                setOpenTutorial(false)
              }}
            />
       )}
      
    </Box>
  )
}

export default Users
