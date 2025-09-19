import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { darken } from '@mui/material/styles'
import { motion } from 'framer-motion'
import OrganisationService from '../../../services/OrganisationService'
import roleService from '../../../services/roleService'
import { useLanguage } from '../../../hooks/LanguageContext'
import { useAuth } from '../../../hooks/AuthContext'
import { Box, Typography, Stepper, Step, StepLabel } from '@mui/material'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormLabel from '@mui/material/FormLabel'
import Divider from '@mui/material/Divider'
import CustomSnackbar from '../../ui/CustomSnackbar'
import Dropdown from '../../ui/Dropdown'
import Modal from '../../ui/Modal'
import Input from '../../ui/Input'
import Button from '../../ui/Button'
import PropTypes from 'prop-types'

const RoleFormModal = ({ open, onClose, role }) => {
  const { toggleLoader } = useOutletContext()
  const { user } = useAuth()
  const { dictionary } = useLanguage()
  const [allOrganisations, setAllOrganisations] = useState([])
  const [openSnackBar, setOpenSnackBar] = useState(false)
  const [messageSnack, setMessageSnack] = useState(null)
  const [typeSnack, setTypeSnack] = useState(null)
  const [selectedOrganisation, setSelectedOrganisation] = useState(() => {
    if (role?.clientOrganization) {
      return role.clientOrganization.id
    } else if (user?.organization) {
      return user.organization.id
    }
    return ''
  })
  let organisationsOptions =
    allOrganisations.length > 0
      ? allOrganisations.map((c) => ({ value: c.id, label: c.name }))
      : []
  const hasAllAcess =
    user?.permissions?.some((perm) => perm === 'Permissions.AllowAll') || false

  const [name, setName] = useState(role?.name || '')
  const [manageOrganizations, setManageOrganizations] = useState(
      role?.permissions?.includes('Permissions.Organizations.Manage') ||
      false
  )
   const [manageDevices, setManageDevices] = useState(
      role?.permissions?.includes('Permissions.Devices.Manage') ||
      false
  )
  const [manageProducts, setManageProducts] = useState(
      role?.permissions?.includes('Permissions.Products.Manage') ||
      false
  )
  const [manageMyDevices, setManageMyDevices] = useState(
    role?.permissions?.includes('Permissions.Devices.ManageMine') || false
  )
  const [manageMyServices, setManageMyServices] = useState(
    role?.permissions?.includes('Permissions.Services.ManageMine') || false
  )
  const [manageServices, setManageServices] = useState(
      role?.permissions?.includes('Permissions.Services.Manage') ||
      false
  )
  const [manageInstallationRequests, setManageInstallationRequests] = useState(
      role?.permissions?.includes('Permissions.Request.InstallationRequeste') ||
      false
  )
  const [allowAll, setAllowAll] = useState(
    role?.permissions?.includes('Permissions.AllowAll') || false
  )
  const [manageUsers, setManageUsers] = useState(
    role?.permissions?.includes('Permissions.Users.Manage')  ||
      false
  )
  const [seeUsers, setSeeUsers] = useState(
    role?.permissions?.includes('Permissions.Users.Read') || false
  )
  const [seeAddresses, setSeeAddresses] = useState(
    role?.permissions?.includes('Permissions.Addresses.ReadAll') || false
  )
  const [manageRoles, setManageRoles] = useState(
    role?.permissions?.includes('Permissions.Roles.Manage')  ||
      false
  )
  const [seeRoles, setSeeRoles] = useState(
    role?.permissions?.includes('Permissions.Roles.Read') || false
  )
  const [communicateWithClients, setCommunicateWithClients] = useState(
    role?.permissions?.includes('Permissions.Messages.Clients') || false
  )
  const [communicateWithSupports, setCommunicateWithSupports] = useState(
    role?.permissions?.includes('Permissions.Messages.Users') || false
  )
  const [communicateWithChatBot, setCommunicateWithChatBot] = useState(
    role?.permissions?.includes('Permissions.Messages.ChatBot') || false
  )
  const [showClientQ, setShowClientQ] = useState(
    role?.permissions?.includes('Permissions.Messages.Clients') || true
  )
  const [showSupportsQ, setShowSupportsQ] = useState(
    role?.permissions?.includes('Permissions.Messages.Users') || true
  )
  const [activeStep, setActiveStep] = useState(0)
  const [errors, setErrors] = useState({})
  const steps = [
    dictionary.StepGeneral,
    dictionary.StepUsers,
    dictionary.StepRoles,
    dictionary.StepAddresses,
    dictionary.StepChat,
    dictionary.StepOrganisations,
    dictionary.StepServices,
    dictionary.StepDevicesAndProducts,
    dictionary.Summary,
  ]
  const resetForm = () => {
    setName('')
    setManageOrganizations(false)
    setManageDevices(false)
    setManageProducts(false)
    setManageMyDevices(false)
    setManageMyServices(false)
    setManageServices(false)
    setManageInstallationRequests(false)
    setAllowAll(false)
    setManageUsers(false)
    setSeeUsers(false)
    setSeeAddresses(false)
    setManageRoles(false)
    setSeeRoles(false)
    setCommunicateWithClients(false)
    setCommunicateWithSupports(false)
    setCommunicateWithChatBot(false)
    setShowClientQ(true)
    setShowSupportsQ(true)
    setActiveStep(0)
    setErrors({})
  }
  const isLastStep = activeStep === steps.length - 1
  const handleStepNext = () => {
    if (allowAll) {
      setActiveStep(8)
    } else if (activeStep < steps.length - 1) {
      setActiveStep((prev) => prev + 1)
    }
  }
  const handleDropdownOrganisation = (event) => {
    setSelectedOrganisation(event.target.value)
  }

  const handleStepBack = () => {
    if (allowAll) {
      setActiveStep(0)
    } else if (activeStep > 0) {
      setActiveStep((prev) => prev - 1)
    }
  }
  const renderPermissionSwitch = (label, value, onChange) => (
    <Box display="flex" alignItems="center" gap={2}>
      <FormLabel component="legend">{label}</FormLabel>
      <FormControlLabel
        control={
          <Switch
            checked={value}
            onChange={onChange}
            sx={{
              '& .MuiSwitch-switchBase.Mui-checked': {
                color: user.organization.primaryColor,
                '& + .MuiSwitch-track': {
                  backgroundColor: user.organization.primaryColor,
                },
              },
            }}
          />
        }
        label={value ? dictionary.yes : dictionary.no}
        labelPlacement="end"
        sx={{ m: 0, ml: 50 }}
      />
    </Box>
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    const builtPermissions = buildPermissions()
    const isValid = validate(name, builtPermissions)

    if (!isValid) return

    toggleLoader(true)

    const data = {
      name,
      permissions: builtPermissions,
      clientOrganizationId: selectedOrganisation,
    }

    const showError = (error, fallbackMessage) => {
      const message = error?.response?.data?.message
      switch (message) {
        case 'Invalid role ID format.':
          setMessageSnack(dictionary.InvalidId)
          break
        case 'Client organization with the provided id does not exist.':
          setMessageSnack(dictionary.OrganisationNotFound)
          break
        case 'One or more of the permissions are invalid.':
          setMessageSnack(dictionary.InvalidPermission)
          break
        case 'Role not found by provided Id.':
          setMessageSnack(dictionary.RoleNotFound)
          break
        case 'A role with the same name already exists.':
          setMessageSnack(dictionary.RoleExist)
          break
        default:
          setMessageSnack(fallbackMessage)
      }
      setTypeSnack('error')
      setOpenSnackBar(true)
    }

    try {
      if (role) {
        await roleService.updateRole(role.id, data)
      } else {
        await roleService.addRole(data)
      }
      setTypeSnack('success')
      setMessageSnack(dictionary.OperationSeccesfull)
      setOpenSnackBar(true)
      resetForm()
      onClose()
    } catch (error) {
      const fallback = role
        ? dictionary.UpdateRoleFailed
        : dictionary.CreateRoleFailed
      showError(error, fallback)
    } finally {
      toggleLoader(false)
    }
  }
  const buildPermissions = () => {
    if (allowAll) return ['Permissions.AllowAll']

    const permissions = []
    addUserPermissions(permissions)
    addAddressPermissions(permissions)
    addRolePermissions(permissions)
    addCommunicationPermissions(permissions)
    addOrganisationssPermissions(permissions)
    addServicesPermissions(permissions)

    return permissions
  }
  const addServicesPermissions = (permissions) => {
    if (manageServices) {
      permissions.push('Permissions.Services.Manage')
    }
    if(manageMyServices){
       permissions.push('Permissions.Services.ManageMine')
    }
    if(manageInstallationRequests){
       permissions.push('Permissions.Request.InstallationRequest')
    }
  }
  const addOrganisationssPermissions = (permissions) => {
    if (manageOrganizations) {
      permissions.push('Permissions.Organizations.Manage')
    }

     if (manageDevices) {
      permissions.push('Permissions.Devices.Manage')
    }

    if (manageProducts) {
      permissions.push('Permissions.Products.Manage')
    }
    if(manageMyDevices){
       permissions.push('Permissions.Devices.ManageMine')
    }
  }
  const addUserPermissions = (permissions) => {
    if (manageUsers) {
      permissions.push('Permissions.Users.Manage')
    } else if (seeUsers) {
      permissions.push('Permissions.Users.Read')
    }
  }

  const addAddressPermissions = (permissions) => {
    if (seeAddresses) permissions.push('Permissions.Addresses.ReadAll')
  }

  const addRolePermissions = (permissions) => {
    if (manageRoles) {
      permissions.push('Permissions.Roles.Manage')
    } else if (seeRoles) {
       permissions.push('Permissions.Roles.Read')
    }
  }

  const addCommunicationPermissions = (permissions) => {
    if (communicateWithSupports) permissions.push('Permissions.Messages.Users')
    if (communicateWithClients) permissions.push('Permissions.Messages.Clients')
    if (communicateWithChatBot) permissions.push('Permissions.Messages.ChatBot')
  }

  const handleClientQ = () => {
    setCommunicateWithClients(!communicateWithClients)
    setShowSupportsQ(!showSupportsQ)
  }

  const handleSupportQ = () => {
    setCommunicateWithSupports(!communicateWithSupports)
    setShowClientQ(!showClientQ)
  }

  const validate = (nameValue, permissionsArray) => {
    const newErrors = {}

    if (!nameValue) {
      newErrors.name = dictionary.NameRequired
    }

    if (permissionsArray.length < 1) {
      newErrors.rolePermissions = dictionary.PermissionsRequired
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  useEffect(() => {
    const fetchData = async () => {
      if(hasAllAcess){
        try {
        const data = await OrganisationService.getAllOrganizations()
        if (data) {
          setAllOrganisations(data)
        }
      } catch (e) {
        const message = e.response.data.message
        setTypeSnack('error')
        setMessageSnack(dictionary.GetOrganisationFailed || message)
        setOpenSnackBar(true)
      }
      }
    }
    fetchData()
  }, [hasAllAcess])

  return (
    <Box>
      <CustomSnackbar
        open={openSnackBar}
        message={messageSnack}
        type={typeSnack}
        onClose={() => setOpenSnackBar(false)}
      />
      <Modal
        open={open}
        onClose={onClose}
        showConfirmButton={isLastStep}
        onConfirm={handleSubmit}
        labelConfirmButton={dictionary.confirm}
      >
        <Box sx={{ width: { xs: '300px', sm: '400px', md: '500px', lg: '800px' }, p: 2 }}>
          <Typography
            variant="h5"
            align="center"
            sx={{
              fontWeight: 'bold',
            }}
          >
            {role == null ? dictionary.AddRole : dictionary.UpdateRole}
          </Typography>

          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel
                  StepIconProps={{
                    sx: {
                      '&.Mui-active': {
                        color: user.organization.primaryColor, 
                      },
                      '&.Mui-completed': {
                        color: darken(user.organization.primaryColor, 0.2), 
                      },
                    },
                  }}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box mt={3}>
            {activeStep === 0 && (
              <motion.div
                      initial={{ opacity: 0, x: 100 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 100 }}
                      transition={{ duration: 0.8 }}
                    >
                <label style={{ color: '#a3a3a3' }}>{dictionary.name}</label>
                <Input
                  showlabel={false}
                  label={dictionary.name}
                  value={name}
                  placeholder={dictionary.name}
                  type="string"
                  onChange={(e) => setName(e.target.value)}
                  iserror={errors.name}
                />
                {errors.name && (
                  <Typography color="error" variant="caption">
                    {errors.name}
                  </Typography>
                )}
                <br />
                {hasAllAcess && (
                  <Box sx={{ flexBasis: { xs: '100%', sm: '48%' } }}>
                    <label style={{ color: '#a3a3a3' }}>
                      {dictionary.Company}
                    </label>
                    <Dropdown
                      options={organisationsOptions}
                      value={selectedOrganisation}
                      label={dictionary.ChoseOrganisation}
                      onChange={handleDropdownOrganisation}
                    />
                    <br />
                  </Box>
                )}
                {hasAllAcess &&
                  renderPermissionSwitch(dictionary.AllowAllQ, allowAll, () =>
                    setAllowAll(!allowAll)
                  )}
              </motion.div>
            )}
            {activeStep === 1 && (
               <motion.div
                      initial={{ opacity: 0, x: 100 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 100 }}
                      transition={{ duration: 0.8 }}
                    >
                <Typography>{dictionary.manageUsers}</Typography>
                {!seeUsers && (
                  <>
                    {renderPermissionSwitch(
                      dictionary.AllowManageUserQ,
                      manageUsers,
                      () =>setManageUsers(!manageUsers)
                    )}
                  </>
                )}
                {!manageUsers && (
                  <>
                    {renderPermissionSwitch(dictionary.GetUserQ, seeUsers, () =>
                      setSeeUsers(!seeUsers)
                    )}
                  </>
                )}
              </motion.div>
            )}
            {activeStep === 2 && (
               <motion.div
                      initial={{ opacity: 0, x: 100 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 100 }}
                      transition={{ duration: 0.8 }}
                    >
                <Typography>{dictionary.manageRoles}</Typography>
                {!seeRoles && (
                  <>
                    {renderPermissionSwitch(
                      dictionary.AllowManageRolesQ,
                      manageRoles,
                      () => setManageRoles(!manageRoles)
                    )}
                  </>
                )}
               
                {!manageRoles && (
                  <>
                    {renderPermissionSwitch(
                      dictionary.GetRolesQ,
                      seeRoles,
                      () => setSeeRoles(!seeRoles)
                    )}
                  </>
                )}
              </motion.div>
            )}
            {activeStep === 3 && (
              <motion.div
                      initial={{ opacity: 0, x: 100 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 100 }}
                      transition={{ duration: 0.8 }}
                    >
                {renderPermissionSwitch(
                  dictionary.GetAddressesQ,
                  seeAddresses,
                  () => setSeeAddresses(!seeAddresses)
                )}
              </motion.div>
            )}
            {activeStep === 4 && (
              <motion.div
                      initial={{ opacity: 0, x: 100 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 100 }}
                      transition={{ duration: 0.8 }}
                    >
                <Typography>{dictionary.ChatSystemQ}</Typography>
                {showClientQ &&
                  renderPermissionSwitch(
                    dictionary.SupportQ,
                    communicateWithClients,
                    handleClientQ
                  )}
                {showSupportsQ &&
                  renderPermissionSwitch(
                    dictionary.clientQ,
                    communicateWithSupports,
                    handleSupportQ
                  )}
                {renderPermissionSwitch(
                  dictionary.CommunicateWithChatBotQ,
                  communicateWithChatBot,
                  () => setCommunicateWithChatBot(!communicateWithChatBot)
                )}
              </motion.div>
            )}
            {activeStep === 5 && (
              <motion.div
                      initial={{ opacity: 0, x: 100 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 100 }}
                      transition={{ duration: 0.8 }}
                    >
                <Typography>{dictionary.StepOrganisations}</Typography>
                {renderPermissionSwitch(
                  dictionary.AllowManageOrganisationQ,
                  manageOrganizations,
                  () => setManageOrganizations(!manageOrganizations)
                )}
              </motion.div>
            )}
            {activeStep === 6 && (
              <motion.div
                      initial={{ opacity: 0, x: 100 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 100 }}
                      transition={{ duration: 0.8 }}
                    >
                <Typography>{dictionary.StepServices}</Typography>
                {!manageMyServices && (
                  <>
                    {renderPermissionSwitch(
                      dictionary.AllowManageServices,
                      manageServices,
                      () => setManageServices(!manageServices)
                    )}
                  </>
                )}
                {!manageMyServices && (
                  <>
                    {renderPermissionSwitch(
                      dictionary.AllowManageInstallationRequests,
                      manageInstallationRequests,
                      () => setManageInstallationRequests(!manageInstallationRequests)
                    )}
                  </>
                )}

                {!manageServices && (
                  <>
                    {renderPermissionSwitch(
                      dictionary.AllowManageMyServices,
                      manageMyServices,
                      () => setManageMyServices(!manageMyServices)
                    )}
                  </>
                )}
              </motion.div>
            )}
            {activeStep === 7 && (
              <motion.div
                      initial={{ opacity: 0, x: 100 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 100 }}
                      transition={{ duration: 0.8 }}
                    >
                <Typography>{dictionary.StepDevicesAndProducts}</Typography>
                {!manageMyDevices && (
                  <>
                    {renderPermissionSwitch(
                      dictionary.AllowManageDevices,
                      manageDevices,
                      () => setManageDevices(!manageDevices)
                    )}
                  </>
                )}
                {!manageMyDevices && (
                  <>
                    {renderPermissionSwitch(
                      dictionary.AllowManageProducts,
                      manageProducts,
                      () => setManageProducts(!manageProducts)
                    )}
                  </>
                )}

                {!manageDevices && (
                  <>
                    {renderPermissionSwitch(
                      dictionary.AllowManageMyDevices,
                      manageMyDevices,
                      () => setManageMyDevices(!manageMyDevices)
                    )}
                  </>
                )}
              </motion.div>
            )}
            {activeStep === 8 && (
              <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {dictionary.summaryTitle}
                </Typography>

                <Box>
                  <Typography fontWeight="bold">{dictionary.name}</Typography>
                  <Typography>{name ?? dictionary.NoName}</Typography>
                </Box>

                <Divider />
                {hasAllAcess && (
                  <Box>
                    <Box mt={2}>
                      <Typography fontWeight="bold">
                        {dictionary.AllowAllQ}
                      </Typography>
                      <Typography>
                        {dictionary.AllowAllQ}: {allowAll ? '✔️' : '❌'}
                      </Typography>
                    </Box>
                    <Box mt={2}>
                      <Typography fontWeight="bold">
                        {dictionary.OrganisationName}
                      </Typography>
                      <Typography>
                        {dictionary.OrganisationName}:{' '}
                        {allOrganisations.length > 0
                          ? allOrganisations.find((c) => c.id === selectedOrganisation)
                              ?.name || ''
                          : ''}
                      </Typography>
                    </Box>
                  </Box>
                )}
                {!allowAll && (
                  <>
                    <Box mt={2}>
                      <Typography fontWeight="bold" sx={{ mb: 2 }}>
                        {dictionary.StepOrganisations}
                      </Typography>
                       <Typography>
                        {dictionary.AllowManageOrganisationQ}:{' '}
                        {manageOrganizations ? '✔️' : '❌'}
                      </Typography>
                    </Box>
                    
                    <Box mt={2}>
                      <Typography fontWeight="bold" sx={{ mb: 2 }}>
                        {dictionary.StepServices}
                      </Typography>
                      <Typography>
                        {dictionary.AllowManageServices}:{' '}
                        {manageServices ? '✔️' : '❌'}
                      </Typography>
                      <Typography>
                        {dictionary.AllowManageInstallationRequests}:{' '}
                        {manageInstallationRequests ? '✔️' : '❌'}
                      </Typography>
                      <Typography>
                        {dictionary.AllowManageMyServices}:{' '}
                        {manageMyServices ? '✔️' : '❌'}
                      </Typography>
                    </Box>
                     <Box mt={2}>
                      <Typography fontWeight="bold" sx={{ mb: 2 }}>
                        {dictionary.StepDevicesAndProducts}
                      </Typography>
                       <Typography>
                        {dictionary.AllowManageDevices}:{' '}
                        {manageDevices ? '✔️' : '❌'}
                      </Typography>
                      <Typography>
                        {dictionary.AllowManageProducts}:{' '}
                        {manageProducts ? '✔️' : '❌'}
                      </Typography>
                      <Typography>
                        {dictionary.AllowManageMyDevices}:{' '}
                        {manageMyDevices ? '✔️' : '❌'}
                      </Typography>
                    </Box>
                    <Box mt={2}>
                      <Typography fontWeight="bold" sx={{ mb: 2 }}>
                        {dictionary.manageUsers}
                      </Typography>
                      {manageUsers && (
                        <Typography>
                          {dictionary.AllowManageUserQ}:{' '}
                          {manageUsers ? '✔️' : '❌'}
                      </Typography>
                      )}

                      {seeUsers && (
                        <Typography>
                          {dictionary.GetUserQ}:{' '}
                          {seeUsers ? '✔️' : '❌'}
                      </Typography>
                      )}
                    </Box>
                    <Box mt={2}>
                      <Typography fontWeight="bold" sx={{ mb: 2 }}>
                        {dictionary.manageRoles}
                      </Typography>
                      {manageRoles && 
                        <Typography>
                          {dictionary.AllowManageRolesQ}:{' '}
                          {manageRoles ? '✔️' : '❌'}
                        </Typography>
                      }
                      {seeRoles && 
                        <Typography>
                          {dictionary.GetRolesQ}:{' '}
                          {seeRoles ? '✔️' : '❌'}
                        </Typography>
                      }
                    </Box>
                    <Box mt={2}>
                      <Typography fontWeight="bold" sx={{ mb: 2 }}>
                        {dictionary.GetAddressesQ}
                      </Typography>
                      <Typography>
                        {dictionary.GetAddressesQ}: {seeAddresses ? '✔️' : '❌'}
                      </Typography>
                    </Box>
                    
                    <Box mt={2}>
                      <Typography fontWeight="bold" sx={{ mb: 2 }}>
                        {dictionary.ChatSystemQ}
                      </Typography>
                      {showClientQ && (
                        <Typography>
                          {dictionary.SupportQ}:{' '}
                          {communicateWithClients ? '✔️' : '❌'}
                        </Typography>
                      )}
                      {showSupportsQ && (
                        <Typography>
                          {dictionary.clientQ}:{' '}
                          {communicateWithSupports ? '✔️' : '❌'}
                        </Typography>
                      )}
                      <Typography>
                        {dictionary.CommunicateWithChatBotQ}:{' '}
                        {communicateWithChatBot ? '✔️' : '❌'}
                      </Typography>
                    </Box>
                  </>
                )}
              </Box>
            )}
          </Box>
          {(errors.name || errors.rolePermissions) && (
            <Box mt={2}>
              {errors.name && (
                <Typography color="error" variant="caption">
                  {errors.name}
                </Typography>
              )}
              {errors.rolePermissions && (
                <Typography color="error" variant="caption">
                  {errors.rolePermissions}
                </Typography>
              )}
            </Box>
          )}
          <Box variant="primary" mt={3} display="flex" justifyContent="space-between">
            <Button variant="primary" disabled={activeStep === 0} onClick={handleStepBack}>
              {dictionary.prev}
            </Button>
            {!isLastStep && (
              <Button variant="primary" onClick={handleStepNext}>{dictionary.Next}</Button>
            )}
          </Box>
        </Box>
      </Modal>
    </Box>
  )
}

RoleFormModal.propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func,
    role: PropTypes.object,
  }

export default RoleFormModal
