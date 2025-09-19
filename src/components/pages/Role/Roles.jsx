import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Box, Typography } from '@mui/material'
import CustomSnackbar from '../../ui/CustomSnackbar'
import Card from '../../ui/Card'
import TableComponent from '../../ui/TableComponent'
import Button from '../../ui/Button'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import noDataAnimation from '../../../assets/animation/noData.lottie'
import Modal from '../../ui/Modal'
import roleService from '../../../services/roleService'
import { useLanguage } from '../../../hooks/LanguageContext'
import { useAuth } from '../../../hooks/AuthContext'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import EditIcon from '@mui/icons-material/Edit'
import VisibilityIcon from '@mui/icons-material/Visibility'
import WarningIcon from '@mui/icons-material/Warning'
import RoleFormModal from './RoleFormModal'
import RoleDetails from './RoleDetails'

const Roles = () => {
  const { dictionary } = useLanguage()
  const { user } = useAuth()
  const [roles, setRoles] = useState([])
  const [uniqueCompanyNames, setUniqueCompanyNames] = useState([])
  const itemsPerPage = 3
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [isSerched, setIsSerched] = useState(false)
  const [openSnackBar, setOpenSnackBar] = useState(false)
  const [openModalDeleteRole, setOpenModalDeleteRole] = useState(false)
  const [openModalDetails, setOpenModalDetails] = useState(false)
  const [openModalFrom, setOpenModalFrom] = useState(false)
  const [selectedId, setSelectedId] = useState('')
  const [selectedRole, setSelectedRole] = useState(null)
  const { toggleLoader } = useOutletContext()
  const [typeSnack, setTypeSnack] = useState(null)
  const [messageSnack, setMessageSnack] = useState(null)
  const hasAllAcess =
    user?.permissions?.some((perm) => perm === 'Permissions.AllowAll') || false
  const [filteredData, setFilteredData] = useState([])
  const showAddButtonTable =
    user?.permissions?.some(
      (perm) =>
        perm === 'Permissions.AllowAll' || perm === 'Permissions.Roles.Manage'
    ) || false

  const handleSearchChange = (searchTerm) => {
    if (!searchTerm) {
      fetchRolesData(currentPage, null)
      return
    }
    setIsSerched(true)
    setCurrentPage(1)
    fetchRolesData(currentPage, searchTerm)
  }

  const columns = hasAllAcess
    ? [
        { key: 'name', label: dictionary.RoleName },
        { key: 'userCount', label: dictionary.userCount },
        { key: 'permissions', label: dictionary.permissionsCount },
        { key: 'clientOrganization.name', label: dictionary.OrganisationName },
      ]
    : [
        { key: 'name', label: dictionary.RoleName },
        { key: 'userCount', label: dictionary.userCount },
        { key: 'permissions', label: dictionary.permissionsCount },
      ]
  const actions = [
    {
      label: dictionary.Update,
      onClick: (row) => {
        handleModalUpdate(row)
      },
      permissions: ['Permissions.AllowAll', 'Permissions.Roles.Manage'],
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
      label: dictionary.Delete,
      onClick: (row) => {
        handleDelete(row)
      },
      permissions: ['Permissions.AllowAll', 'Permissions.Roles.Manage'],
      icon: <DeleteForeverIcon />,
    },
  ]
  const handleModalUpdate = (row) => {
    if (row.id) {
      roles.forEach((role) => {
        if (role.id == row.id) setSelectedRole(role)
        setOpenModalFrom(true)
      })
    }
  }
  const handleShowDetails = (row) => {
    if (row.id) {
      roles.forEach((role) => {
        if (role.id == row.id) setSelectedRole(role)
        setOpenModalDetails(true)
      })
    }
  }
  const handleCloseDeleteModal = () => {
    setOpenModalDeleteRole(false)
    setSelectedId('')
  }
  const handleDelete = (row) => {
    if (row.id) {
      setOpenModalDeleteRole(true)
      setSelectedId(row.id)
    }
  }
  const Delete = async () => {
    if (selectedId) {
      toggleLoader(true)
      try {
        const data = await roleService.DeleteRole(selectedId)
        if (data) {
          fetchRolesData(currentPage, null)
          toggleLoader(false)
          setOpenModalDeleteRole(false)
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
          if (message === 'Invalid role ID format.') {
            setTypeSnack('error')
            setMessageSnack(dictionary.InvalidId)
            setOpenSnackBar(true)
          } else if (message === 'Role not found by provided Id.') {
            setTypeSnack('error')
            setMessageSnack(dictionary.RoleNotFound)
            setOpenSnackBar(true)
          } else {
            setTypeSnack('error')
            setMessageSnack(dictionary.DeleteRoleFailed)
            setOpenSnackBar(true)
          }
        } else {
          setTypeSnack('error')
          setMessageSnack(dictionary.DeleteRoleFailed)
          setOpenSnackBar(true)
        }
      }
    }
  }
  const handleOpenForm = () => {
    setOpenModalFrom(true)
  }

  const fetchRolesData = async (pageNumber, searchTerm) => {
    try {
      const data = await roleService.getAllRoles(
        pageNumber,
        itemsPerPage,
        searchTerm
      )
      if (data) {
        if (data.totalCount > 0) {
          setTotalPages(Math.ceil(data.totalCount / itemsPerPage))
        }
        setRoles(data.roles)
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
          setMessageSnack(dictionary.GetRoleFailed)
          setOpenSnackBar(true)
        }
      } else {
        setTypeSnack('error')
        setMessageSnack(dictionary.GetRoleFailed)
        setOpenSnackBar(true)
      }
    }
  }
  useEffect(() => {
    const fetchData = async () => {
      await fetchRolesData(currentPage, null)
    }
    fetchData()
  }, [])

  const handlepageNext = async () => {
    toggleLoader(true)
    setCurrentPage(currentPage + 1)
    await fetchRolesData(currentPage + 1, null)
    toggleLoader(false)
  }

  const handlepagePrev = async () => {
    toggleLoader(true)
    setCurrentPage(currentPage - 1)
    await fetchRolesData(currentPage - 1, null)
    toggleLoader(false)
  }

  useEffect(() => {
    setFilteredData(roles)
  }, [roles])

  return (
    <Box>
      <CustomSnackbar
        open={openSnackBar}
        message={messageSnack}
        type={typeSnack}
        onClose={() => setOpenSnackBar(false)}
      />
      {openModalFrom && (
        <RoleFormModal
          open={true}
          onClose={() => {
            fetchRolesData(currentPage, null)
            setOpenModalFrom(false)
            setSelectedRole(null)
          }}
          role={selectedRole}
        />
      )}
      {openModalDetails && (
        <RoleDetails
          open={true}
          onClose={() => {
            setOpenModalDetails(false)
            setSelectedRole(null)
          }}
          role={selectedRole}
        />
      )}
      <Modal
        open={openModalDeleteRole}
        onClose={handleCloseDeleteModal}
        showConfirmButton={true}
        onConfirm={Delete}
        variant={'danger'}
        labelConfirmButton={dictionary.Delete}
        className="custom-modal"
        title={
          <>
            {' '}
            <WarningIcon sx={{ color: 'red' }} /> {dictionary.DeleteRole}{' '}
          </>
        }
      >
        <Typography>{dictionary.AreYouSure}</Typography>
      </Modal>
      <Box sx={{ flexBasis: { xs: '100%', sm: '100%' } }}>
        {(roles.length > 0 || isSerched) ? (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.3 }}
          >
          <Card title={dictionary.RolesTable}>
            <TableComponent
              columns={columns}
              data={filteredData}
              actions={actions}
              totalPages={totalPages}
              currentPage={currentPage}
              showAddButton={showAddButtonTable}
              addButtonLabel={dictionary.CreateRole}
              onAddButtonClick={handleOpenForm}
              onNextPage={handlepageNext}
              onPrevPage={handlepagePrev}
              onSearchChange={handleSearchChange}
              userPermissions={user?.permissions}
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
                <Button variant="outlined primary" onClick={handleOpenForm}>
                  {dictionary.AddRole}
                </Button>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default Roles
