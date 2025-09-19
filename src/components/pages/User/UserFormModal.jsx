import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Box, Typography, Stepper, Step, StepLabel } from '@mui/material'
import { darken } from '@mui/material/styles'
import { motion } from 'framer-motion'
import CustomSnackbar from '../../ui/CustomSnackbar'
import Dropdown from '../../ui/Dropdown'
import Input from '../../ui/Input'
import Modal from '../../ui/Modal'
import Button from '../../ui/Button'
import userService from '../../../services/userService'
import OrganisationService from '../../../services/OrganisationService'
import roleService from '../../../services/roleService'
import { useLanguage } from '../../../hooks/LanguageContext'
import { useAuth } from '../../../hooks/AuthContext'
import PropTypes from 'prop-types'

const UserFormModal = ({ open, onClose, userUpdate }) => {
  const { user } = useAuth()
  const { dictionary } = useLanguage()
  const { toggleLoader } = useOutletContext()
  const hasAllAcess = user?.permissions?.some((perm) => perm === 'Permissions.AllowAll') || false
  const [email, setEmail] = useState(userUpdate?.email || '')
  const [password, setPassword] = useState(userUpdate?.password || '')
  const [firstName, setFirstName] = useState(userUpdate?.firstName || '')
  const [lastName, setLastName] = useState(userUpdate?.lastName || '')
  const [selectedOrganisation, setSelectedOrganisation] = useState(userUpdate?.clientOrganization.id || user?.organization.id || 0)
  const [defaultLanguage, setDefaultLanguage] = useState(userUpdate?.defaultLanguage || 'en')
  const [phoneNumber, setPhoneNumber] = useState(userUpdate?.phoneNumber || '')
  const [selectedOption, setSelectedOption] = useState(userUpdate?.role.id || '')
  const [roles, setRoles] = useState([])
  const [errors, setErrors] = useState({})
  const [typeSnack, setTypeSnack] = useState(null)
  const [messageSnack, setMessageSnack] = useState(null)
  const [openSnackBar, setOpenSnackBar] = useState(false)
  const [allOrganisations, setAllOrganisations] = useState([])
  const [filteredData, setFilteredData] = useState(roles.length > 0 ? roles : [])
  const [activeStep, setActiveStep] = useState(hasAllAcess ? 0 : 1)
  const steps = [dictionary.StepOrganisations, dictionary.UsersInforamations]
  const isLastStep = activeStep === steps.length - 1
  const handleStepNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep((prev) => prev + 1)
    }
  }
  const handleStepBack = () => {
    if (activeStep > 0) {
      setActiveStep((prev) => prev - 1)
    }
  }
  const resetForm = () => {
    setEmail('')
    setPassword('')
    setFirstName('')
    setLastName('')
    setSelectedOrganisation(0)
    setDefaultLanguage('en')
    setPhoneNumber('')
    setSelectedOption('')
    setActiveStep(0)
    setErrors({})
  }
  const showAllOrganisations = user?.permissions?.some((perm) => perm === 'Permissions.AllowAll') || false
  let OrganisationsOptions =
    showAllOrganisations && allOrganisations.length > 0
      ? allOrganisations.map((c) => ({ value: c.id, label: c.name }))
      : [{ value: user.organization.id, label: user.organization.name }]
  const rolesOptions =
    filteredData.length > 0
      ? filteredData.map((role) => ({ value: role.id, label: role.name }))
      : []

  const langOptions = [
    { value: 'en', label: 'en' },
    { value: 'fr', label: 'fr' },
    { value: 'de', label: 'de' },
  ]

  const validate = () => {
    const newErrors = {}
    if (!email) {
      newErrors.email = dictionary.emailRequired
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = dictionary.invalidEmail
    }

    if (!firstName) {
      newErrors.firstName = dictionary.FirstNameRequired
    }

    if (!lastName) {
      newErrors.lastName = dictionary.LastNameRequired
    }

    if (!defaultLanguage) {
      newErrors.defaultLanguage = dictionary.DefaultLanguageRequired
    }

    if (!phoneNumber) {
      newErrors.phoneNumber = dictionary.PhoneRequired
    } else if (phoneNumber.length != 8) {
      newErrors.phoneNumber = dictionary.PhoneInvalid
    }

    if (!password) {
      newErrors.password = dictionary.passwordRequired
    } else if (password.length < 6) {
      newErrors.password = dictionary.invalidpassword
    } else if (!/[!@#$%^&*(),.?":{}|<>_\-+=/\\[\]]/.test(password)) {
      newErrors.password = dictionary.passwordRequiresNonAlphanumeric
    } else if (!/[a-z]/.test(password)) {
      newErrors.password = dictionary.passwordRequiresLower
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password = dictionary.passwordRequiresUpper
    }

    if (!selectedOption) {
      newErrors.selectedOption = dictionary.RoleRequired
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleDropdownOrganisation = (event) => {
    setSelectedOrganisation(event.target.value)
  }

  const handleDropdownlang = (event) => {
    setDefaultLanguage(event.target.value)
  }

  const handleDropdownRole = (event) => {
    setSelectedOption(event.target.value)
  }

  const handleError = (error, messagesMap) => {
    const message = error?.response?.data?.message
    const translated =
      message && messagesMap[message]
        ? messagesMap[message]
        : messagesMap.default

    setTypeSnack('error')
    setMessageSnack(translated)
    setOpenSnackBar(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    toggleLoader(true)
    const data = {
      email,
      firstName,
      lastName,
      defaultLanguage,
      phoneNumber,
      password,
      clientOrganizationId: selectedOrganisation,
    }

    try {
      if (userUpdate?.id) {
        await userService.updateUser(userUpdate.id, data)
        if (selectedOption && selectedOption!='') {
          try {
            await userService.updateUserRoles(userUpdate.id, {
              roleId: selectedOption,
            })
          } catch (e) {
            handleError(e, {
              'User not found.': dictionary.UserNotFound,
              default: dictionary.UpdateUserFailed,
            })
            return
          }
        }
      } else {
        await userService.addUser({ ...data, roleId: selectedOption })
      }
      setTypeSnack('success')
      setMessageSnack(dictionary.OperationSeccesfull)
      setOpenSnackBar(true)
      resetForm()
      onClose()
    } catch (e) {
      handleError(e, {
        'User with the provided id does not exist.': dictionary.UserNotFound,
        'Invalid user ID format.': dictionary.InvalidId,
        'The address provided does not exist.': dictionary.AddressNotFound,
        'A user with the provided email already exists.': dictionary.EmailExist,
        default: userUpdate?.id
          ? dictionary.UpdateUserFailed
          : dictionary.CreateUserFailed,
      })
    } finally {
      toggleLoader(false)
    }
  }
  const fetchOrganasationData = async () => {
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

  const fetchRolesData = async () => {
    try {
      const data = await roleService.getAllRoles(1, 500, null)
      if (data) {
        setRoles(data.roles)
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
      await Promise.all([fetchRolesData(), fetchOrganasationData()])
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (selectedOrganisation === 0) {
      setFilteredData(roles)
      return
    }
    const filtered = roles.filter((r) => r.clientOrganization?.id === selectedOrganisation)
    setFilteredData(filtered)
  }, [selectedOrganisation, roles])

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
        <Box sx={{ width: { xs: '300px', sm: '400px', md: '500px', lg: '800px' } }}>
          <Typography
            variant="h5"
            align="center"
            sx={{
              fontWeight: 'bold',
            }}
          >
            {userUpdate == null ? dictionary.AddUser : dictionary.updateUser}
          </Typography>
          {hasAllAcess && (
            <Stepper activeStep={activeStep} alternativeLabel>
              {(hasAllAcess ? steps : steps.slice(1)).map((label) => (
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
          )}
          <Box mt={3}>
            {activeStep === 0 && (
              <motion.div
                      initial={{ opacity: 0, x: 100 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 100 }}
                      transition={{ duration: 0.8 }}
                    >
              <Box sx={{ flexBasis: { xs: '100%', sm: '48%' } }}>
                <label style={{ color: '#a3a3a3' }}>{dictionary.Organisation}</label>
                <Dropdown
                  options={OrganisationsOptions}
                  value={selectedOrganisation}
                  label={dictionary.ChoseOrganisation}
                  onChange={handleDropdownOrganisation}
                />
              </Box>
              </motion.div>
            )}
            {activeStep === 1 && (
              <motion.div
                      initial={{ opacity: 0, x: 100 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 100 }}
                      transition={{ duration: 0.8 }}
                    >
              <Box
                display="flex"
                flexWrap="wrap"
                justifyContent="space-between"
                gap={1}
              >
                <Box sx={{ flexBasis: { xs: '100%', sm: '48%' } }}>
                  <label style={{ color: '#a3a3a3' }}>
                    {dictionary.FirstName}
                  </label>
                  <Input
                    showlabel={false}
                    label={dictionary.FirstName}
                    value={firstName}
                    placeholder={dictionary.FirstName}
                    type="string"
                    onChange={(e) => setFirstName(e.target.value)}
                    iserror={errors.firstName}
                  />
                  {errors.firstName && (
                    <Typography color="error" variant="caption">
                      {errors.firstName}
                    </Typography>
                  )}
                </Box>
                <Box sx={{ flexBasis: { xs: '100%', sm: '48%' } }}>
                  <label style={{ color: '#a3a3a3' }}>
                    {dictionary.LastName}
                  </label>
                  <Input
                    showlabel={false}
                    label={dictionary.LastName}
                    value={lastName}
                    placeholder={dictionary.LastName}
                    type="string"
                    onChange={(e) => setLastName(e.target.value)}
                    iserror={errors.lastName}
                  />
                  {errors.lastName && (
                    <Typography color="error" variant="caption">
                      {errors.lastName}
                    </Typography>
                  )}
                </Box>
                <Box sx={{ flexBasis: { xs: '100%', sm: '48%' } }}>
                  <label style={{ color: '#a3a3a3' }}>
                    {dictionary.PhoneNumber}
                  </label>
                  <Input
                    showlabel={false}
                    label={dictionary.PhoneNumber}
                    value={phoneNumber}
                    placeholder={dictionary.PhoneNumber}
                    type="string"
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    iserror={errors.phoneNumber}
                  />
                  {errors.phoneNumber && (
                    <Typography color="error" variant="caption">
                      {errors.phoneNumber}
                    </Typography>
                  )}
                </Box>
                <Box sx={{ flexBasis: { xs: '100%', sm: '48%' } }}>
                  <label style={{ color: '#a3a3a3' }}>{dictionary.email}</label>
                  <Input
                    showlabel={false}
                    label={dictionary.email}
                    value={email}
                    placeholder={dictionary.email}
                    type="string"
                    onChange={(e) => setEmail(e.target.value)}
                    iserror={errors.email}
                  />
                  {errors.email && (
                    <Typography color="error" variant="caption">
                      {errors.email}
                    </Typography>
                  )}
                </Box>
                <Box sx={{ flexBasis: { xs: '100%', sm: '48%' } }}>
                  <label style={{ color: '#a3a3a3' }}>
                    {dictionary.UserRole}
                  </label>
                  <Dropdown
                    options={rolesOptions}
                    value={selectedOption}
                    label={dictionary.ChoseRole}
                    onChange={handleDropdownRole}
                    iserror={errors.selectedOption}
                  />
                  {errors.selectedOption && (
                    <Typography color="error" variant="caption">
                      {errors.selectedOption}
                    </Typography>
                  )}
                </Box>
                <Box sx={{ flexBasis: { xs: '100%', sm: '48%' } }}>
                  <label style={{ color: '#a3a3a3' }}>
                    {dictionary.DefaultLanguage}
                  </label>
                  <Dropdown
                    options={langOptions}
                    value={defaultLanguage}
                    onChange={handleDropdownlang}
                    iserror={errors.defaultLanguage}
                  />
                  {errors.defaultLanguage && (
                    <Typography color="error" variant="caption">
                      {errors.defaultLanguage}
                    </Typography>
                  )}
                </Box>
                <Box sx={{ flexBasis: { xs: '100%', sm: '100%' } }}>
                  <label style={{ color: '#a3a3a3' }}>
                    {dictionary.password}
                  </label>
                  <Input
                    showlabel={false}
                    label={dictionary.password}
                    placeholder={dictionary.password}
                    type="string"
                    onChange={(e) => setPassword(e.target.value)}
                    iserror={errors.password}
                  />
                  {errors.password && (
                    <Typography color="error" variant="caption">
                      {errors.password}
                    </Typography>
                  )}
                </Box>
              </Box>
              </motion.div>
            )}
          </Box>
          {hasAllAcess && (
            <Box mt={3} display="flex" justifyContent="space-between">
              <Button variant="primary" disabled={activeStep === 0} onClick={handleStepBack}>
                {dictionary.prev}
              </Button>
              {!isLastStep && (
                <Button variant="primary" onClick={handleStepNext}>{dictionary.Next}</Button>
              )}
            </Box>
          )}
        </Box>
      </Modal>
    </Box>
  )
}

UserFormModal.propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func,
    userUpdate: PropTypes.object,
  }

export default UserFormModal
