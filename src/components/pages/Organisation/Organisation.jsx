import { useEffect, useState } from 'react'
import {
  Box,
  Card as MUICard,
  CardContent,
  Typography,
  Grid,
  useTheme,
  IconButton,
  Pagination
} from '@mui/material'
import { motion } from 'framer-motion'
import WarningIcon from '@mui/icons-material/Warning'
import LiveHelpIcon from '@mui/icons-material/LiveHelp'
import Modal from '../../ui/Modal'
import OrganisationService from '../../../services/OrganisationService'
import { useAuth } from '../../../hooks/AuthContext'
import { useLanguage } from '../../../hooks/LanguageContext'
import OrganisationFormStepper from './OrganisationFormStepper'
import OrganisationDetails from './OrganisationDetails'
import OrganisationFullDetails from './OrganisationFullDetails'
import { useOutletContext } from 'react-router-dom'
import Button from '../../ui/Button'
import Card from '../../ui/Card'
import CustomSnackbar from '../../ui/CustomSnackbar'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import noDataAnimation from '../../../assets/animation/noData.lottie'
import Tutorial from '../Tutorial/Tutorial'
import { format } from 'date-fns'

const Organisation = () => {

  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const { user } = useAuth()
  const { dictionary } = useLanguage()
  const [organisation, setOrganisation] = useState(null)
  const [totalUsers, setTotalUsers] = useState(null)
  const [allOrganisations, setAllOrganisations] = useState([])
  const [allDeltedOrganisations, setAllDeltedOrganisations] = useState([])
  const { toggleLoader } = useOutletContext()
  const [typeSnack, setTypeSnack] = useState(null)
  const [messageSnack, setMessageSnack] = useState(null)
  const [openSnackBar, setOpenSnackBar] = useState(false)
  const [openStepper, setOpenStepper] = useState(false)
  const [selectedOrganisation, setSelectedOrganisation] = useState(null)
  const [showDeleted, setShowDeleted] = useState(false)
  const [selectedOrg, setSelectedOrg] = useState(null)
  const [openDetails, setOpenDetails] = useState(false)
  const [openModalDelete, setOpenModalDelete] = useState(false)
  const [selectedOrgTodelete, setSelectedOrgTodelete] = useState(null)
  const [mode, setMode] = useState(null)
  const [page, setPage] = useState(1)

  const ITEMS_PER_PAGE = 6

  const hasAllAccess = user?.permissions?.includes('Permissions.AllowAll')
  const canUpdate = user?.permissions?.includes('Permissions.Organizations.Manage') 
  const [openTutorial, setOpenTutorial] = useState(() => {
  const stored = localStorage.getItem('organisationTutorial')
    return (stored === null && hasAllAccess) || (stored === 'true' && hasAllAccess)
  })

  const handleOpenModalDelete = (row,mode) => {
    if (row.id) {
      setOpenModalDelete(true)
      setSelectedOrgTodelete(row)
      setMode(mode)
    }
  }

   const handleCloseModalDelete = () => {
    setOpenModalDelete(false)
    setSelectedOrgTodelete(null)
    setMode(null)
    
  }
    const fetchOrganisationData = async () => {
    try {
      const data = await OrganisationService.getAllOrganizations()
      if (data) {
        setAllOrganisations(data.filter(o=>o.id!=user.organization.id))
      }
    } catch (e) {
      const message = e.response.data.message
      setTypeSnack('error')
      setMessageSnack(dictionary.GetOrganisationFailed || message)
      setOpenSnackBar(true)
    }
  }
   const fetchDeltedOrganisationData = async () => {
    try {
      const data = await OrganisationService.getAllDeltedOrganizations()
      if (data) {
        setAllDeltedOrganisations(data)
      }
    } catch (e) {
      const message = e.response.data.message
      setTypeSnack('error')
      setMessageSnack(dictionary.GetOrganisationFailed || message)
      setOpenSnackBar(true)
    }
  }

   const fetchUserOrganisationData = async () => {
    try {
      const data = await OrganisationService.GetOrganizationById()
      if (data) {
        setOrganisation(data.organization)
        setTotalUsers(data.totalUsers)
      }
    } catch (e) {
      const message = e.response.data.message
      setTypeSnack('error')
      setMessageSnack(dictionary.GetOrganisationFailed || message)
      setOpenSnackBar(true)
    }
  }
   const handleToggleOrganizationStatus = async (id) => {
    try {
      toggleLoader(true)
      const data = await OrganisationService.ToggleOrganizationStatus(id)
      if (data) {
        fetchOrganisationData()
        fetchDeltedOrganisationData()
        handleCloseModalDelete()
        toggleLoader(false)
      }
    } catch (e) {
      const message = e.response.data.message
      toggleLoader(false)
      setTypeSnack('error')
      setMessageSnack(dictionary.ToggleOrganisationFailed || message)
      setOpenSnackBar(true)
    }
  }
  const handleOpenUpdate = (organisation) => {
    setSelectedOrganisation(organisation)
    setOpenStepper(true)
  }
  const handleOpenDetails = (org) => {
    setSelectedOrg(org)
    setOpenDetails(true)
  }

  const handleCloseDetails = () => {
    setOpenDetails(false)
    setSelectedOrg(null)
  }
   useEffect(() => {
    if (hasAllAccess) {
      fetchOrganisationData()
    } else {
      fetchUserOrganisationData()
    }
  }, [hasAllAccess])

  const stepsTutorial = [
    { target: '.stepOpenOrganisationForm', content: dictionary.HereYoucanOpenTheFormToAddOrganisation },
    { target: '.stepShowOrganisations', content: dictionary.HereYoucanSeeTheArchivedOrganisations},
  ]

   const renderOrganisationColors = (organisation) => (
    <Grid container spacing={2} mt={1}>
      {[
        ['primaryColor', dictionary.PrimaryColor],
        ['secondaryColor', dictionary.SecondaryColor]
      ].map(([key, label]) => (
        <Grid item xs={6} sm={3} key={key}>
          <Box display="flex" alignItems="center" gap={1}>
            <Box
              sx={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                backgroundColor: organisation[key],
                border: '1px solid #ccc',
              }}
            />
            <Typography variant="caption">{label}</Typography>
          </Box>
        </Grid>
      ))}
    </Grid>
  )
  const truncateDescription = (desc) => {
        return desc.length > 70 ? desc.slice(0, 70) + '...' : desc
    }
   const renderOrganisationCard = (org) => (
  <motion.div
    key={org.id}
    initial={{ opacity: 0, x: 100 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 100 }}
    transition={{ duration: 0.3 }}
  >
    <MUICard
    onClick={() => handleOpenDetails(org)}
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
            <img src={org.logoUrl} alt="logo" style={{ width: 64, height: 55 }} />
            <Box>
              <Typography variant="h6">{org.name}</Typography>
              <Typography variant="body2" color="textSecondary">
                {dictionary.CreatedAt}{' '}
                {format(new Date(org.createdAt), 'dd/MM/yyyy')}
              </Typography>
              {org.emailOrganisation && (
                <Typography variant="body2" color="textSecondary">
                  📧 {org.emailOrganisation}
                </Typography>
              )}
            </Box>
          </Box>

          {org.description && (
            <Box sx={{ mb: 1 }} >
              <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                {dictionary.OrganisationDetails} :
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {truncateDescription(org.description)}
              </Typography>
              {org.description.length > 70 && (
                <Typography
                  component="span"
                  sx={{
                    cursor: 'pointer',
                    ml: 1,
                    color: user.organization.primaryColor,
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleOpenDetails(org)
                  }}
                >
                  {dictionary.SeeMore}
                </Typography>
              )}
            </Box>
          )}
        </Box>

        <Box sx={{ mt: 'auto' }}>
          {org.totalUsers !== undefined && org.totalUsers !== null && (
            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
              👤 {dictionary.TotalUsers}: {org.totalUsers}
            </Typography>
          )}
          {org.onlinePaymentSolutions !== undefined && org.onlinePaymentSolutions !== null && (
            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
              💸 {dictionary.OnlinePaymentSolutions}: {org.onlinePaymentSolutions}
            </Typography>
          )}
          {renderOrganisationColors(org)}
        </Box>
      </CardContent>


      <Box display="flex" justifyContent="space-between" p={2} pt={0}>
        {(hasAllAccess || canUpdate) && (
          <Button
            variant={ 'outlined primary' }
            onClick={(e) => {
                  e.stopPropagation()
                  handleOpenUpdate(org)
                }}
          >
            {dictionary.Update}
          </Button>
        )}
        {hasAllAccess && (() => {
          let buttonVariant= org.isDeleted ? 'outlined success' : 'outlined danger'
          return (
            <Button
              variant={buttonVariant}
              onClick={(e) => {
                e.stopPropagation()
                handleOpenModalDelete(org,org.isDeleted ? "restore" : "archive")
              }}
            >
              {org.isDeleted ? dictionary.Restore : dictionary.Archive}
            </Button>
          );
        })()}
      </Box>
    </MUICard>
  </motion.div>
)



  let currentItems = []
  if (hasAllAccess) {
    if (showDeleted) {
      currentItems = allDeltedOrganisations.slice(
        (page - 1) * ITEMS_PER_PAGE,
        page * ITEMS_PER_PAGE
      )
    } else {
      currentItems = allOrganisations.slice(
        (page - 1) * ITEMS_PER_PAGE,
        page * ITEMS_PER_PAGE
      )
    }
  }

  let totalPages = 1
  if (hasAllAccess) {
    if (showDeleted) {
      totalPages = Math.ceil(allDeltedOrganisations.length / ITEMS_PER_PAGE)
    } else {
      totalPages = Math.ceil(allOrganisations.length / ITEMS_PER_PAGE)
    }
  }
 const handleToggleDeleted = async () => {
    toggleLoader(true)
    setShowDeleted(!showDeleted)
    setPage(1)
    await fetchDeltedOrganisationData()
    toggleLoader(false)
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
 return (
<Box p={2}>
      <CustomSnackbar
        open={openSnackBar}
        message={messageSnack}
        type={typeSnack}
        onClose={() => setOpenSnackBar(false)}
      />
      {hasAllAccess && (
        <Card  showHover={false}>
          <Box display="flex" justifyContent="space-between" mb={2}>
            <Button
              variant={isDark ? 'outlined primary' : 'primary'}
              onClick={() => handleOpenUpdate(null)}
              className={'stepOpenOrganisationForm'}
            >
                {dictionary.AddOrganisation}
            </Button>
            <Box>
                <IconButton
                  onClick={() => setOpenTutorial(true)} 
                >
                    <LiveHelpIcon sx={{color:user.organization.primaryColor}}/>
                </IconButton>
                <Button
                  variant={isDark ? 'outlined primary' : 'primary'}
                  onClick={handleToggleDeleted}
                  className={'stepShowOrganisations'}
                >
                  {showDeleted
                    ? dictionary.HideDeltedOrganisations
                    : dictionary.ShowDeltedOrganisations}
                </Button>
            </Box>
          </Box>
        </Card>
      )}    

         {(() => {
          if (hasAllAccess) {
            return currentItems.length > 0 ? (
              <Grid container spacing={3} alignItems="stretch">
                {currentItems.map((org) => (
                  <Grid key={org.id} item xs={12} sm={6} md={4} lg={3} sx={{ height: '100%' }}>
                    {renderOrganisationCard(org)}
                  </Grid>
                ))}
              </Grid>
            ) : (
              renderNoData()
            );
          } else if (organisation) {
           
           return (
              <OrganisationFullDetails 
                onUpdate={() => handleOpenUpdate(organisation)}
                organisation={organisation} 
                totalUsers={totalUsers}
                canUpdate={canUpdate}
                hasAllAccess={hasAllAccess}
              />
            )
          } else {
            return renderNoData();
          }
        })()}

            {hasAllAccess && totalPages > 1 && (
                <Box display="flex" justifyContent="center" mt={3}>
                <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(e, value) => setPage(value)}
                />
                </Box>
            )}

      {openStepper && (
        <OrganisationFormStepper
          open={true}
          onClose={() => {
            fetchOrganisationData()
            setOpenStepper(false)
            setSelectedOrganisation(null)
          }}
          organisation={selectedOrganisation}
        />
      )}

       {openDetails && (
        <OrganisationDetails
          open={true}
          onClose={() => {
            handleCloseDetails()
          }}
          organisation={selectedOrg}
        />
      )}

       <Tutorial
              open={openTutorial}
              steps={stepsTutorial}
              beaconSize={100}
              onClose={() => {
                localStorage.setItem('organisationTutorial', 'false')
                setOpenTutorial(false)
              }}
            />
      <Modal
        open={openModalDelete}
        onClose={handleCloseModalDelete}
        showConfirmButton={true}
        onConfirm={() => handleToggleOrganizationStatus(selectedOrgTodelete?.id)}
        variant={mode=="archive" ? 'danger' : 'warning'}
        labelConfirmButton={mode=="archive" ? dictionary.ArchiveOrganisation : dictionary.Restore}
        title={
          <>
            {' '}
            <WarningIcon sx={{ color: mode=="archive" ? 'red' : 'yellow' }} /> {mode=="archive" ? dictionary.ArchiveOrganisation : dictionary.Restore}{' '}
          </>
        }
        className="custom-modal"
      >
        <Typography>{mode=="archive" ? dictionary.AreYouSureYouWantToArechiveThisOrg : dictionary.AreYouSureYouWantToRestoreThisOrg}</Typography>
      </Modal>
    </Box>
 )
}

export default Organisation