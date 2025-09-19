import { useState } from 'react'
import { Box, Typography } from '@mui/material'
import Button from '../ui/Button'
import Dropdown from '../ui/Dropdown'
import Input from '../ui/Input'
import CustomSnackbar from '../ui/CustomSnackbar'
import { useOutletContext } from 'react-router-dom'
import userService from '../../services/userService'
import { useAuth } from '../../hooks/AuthContext'
import { useLanguage } from '../../hooks/LanguageContext'

const Settings = () => {
  const { dictionary } = useLanguage()
  const { user, fetchUser } = useAuth()
  const { toggleLoader } = useOutletContext()
  const [errors, setErrors] = useState({})
  const [openSnackBar, setOpenSnackBar] = useState(false)
  const [typeSnack, setTypeSnack] = useState(null)
  const [messageSnack, setMessageSnack] = useState(null)
  const [email, setEmail] = useState(user?.email || '')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState(user?.firstName || '')
  const [lastName, setLastName] = useState(user?.lastName || '')
  const [defaultLanguage, setDefaultLanguage] = useState(
    user?.defaultLanguage || 'en'
  )
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '')
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

    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (validate()) {
      toggleLoader(true)

      const data = {
        email: email,
        firstName: firstName,
        lastName: lastName,
        defaultLanguage: defaultLanguage,
        phoneNumber: phoneNumber,
        password: password,
      }
      try {
        const res = await userService.updateUser(user.id, data)
        if (res) {
          await fetchUser()
        }
      } catch (e) {
        if (e?.response?.data?.message) {
          const message = e.response.data.message
          if (message === 'User with the provided id does not exist.') {
            setTypeSnack('error')
            setMessageSnack(dictionary.UserNotFound)
            setOpenSnackBar(true)
          } else if (message === 'Invalid user ID format.') {
            setTypeSnack('error')
            setMessageSnack(dictionary.InvalidId)
            setOpenSnackBar(true)
          } else if (message === 'The address provided does not exist.') {
            setTypeSnack('error')
            setMessageSnack(dictionary.AddressNotFound)
            setOpenSnackBar(true)
          } else {
            setTypeSnack('error')
            setMessageSnack(dictionary.UpdateUserFailed)
            setOpenSnackBar(true)
          }
        } else {
          setTypeSnack('error')
          setMessageSnack(dictionary.UpdateUserFailed)
          setOpenSnackBar(true)
        }
      }
      toggleLoader(false)
      setTypeSnack('success')
      setMessageSnack(dictionary.OperationSeccesfull)
      setOpenSnackBar(true)
    }
  }
  const handleDropdownlang = (event) => {
    setDefaultLanguage(event.target.value)
  }

  return (
    <Box>
      <CustomSnackbar
        open={openSnackBar}
        message={messageSnack}
        type={typeSnack}
        onClose={() => setOpenSnackBar(false)}
      />
      <Box sx={{ flexBasis: { xs: '100%', sm: '100%' } }}>
          <form onSubmit={handleSubmit}>
            <Box
              display="flex"
              flexWrap="wrap"
              justifyContent="space-between"
              gap={3}
            >
              <Box sx={{ flexBasis: { xs: '100%', sm: '48%' } }}>
                <label>{dictionary.FirstName}</label>
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
                    <br />
                  </Typography>
                )}
                <label>{dictionary.LastName}</label>
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
                    <br />
                  </Typography>
                )}
                <label>{dictionary.PhoneNumber}</label>
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
                    <br />
                  </Typography>
                )}
              </Box>
              <Box sx={{ flexBasis: { xs: '100%', sm: '48%' } }}>
                <label>{dictionary.email}</label>
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
                    <br />
                  </Typography>
                )}
                <label>{dictionary.password}</label>
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
                    <br />
                  </Typography>
                )}
                <label>{dictionary.DefaultLanguage}</label>
                <Dropdown
                  options={langOptions}
                  value={defaultLanguage}
                  onChange={handleDropdownlang}
                  iserror={errors.defaultLanguage}
                />
                {errors.defaultLanguage && (
                  <Typography color="error" variant="caption">
                    {errors.defaultLanguage}
                    <br />
                  </Typography>
                )}
              </Box>
            </Box>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Button variant="outlined primary" onClick={handleSubmit} className={'stepBtnConfirm'}>
                {dictionary.confirm}
              </Button>
            </Box>
          </form>
      </Box>
    </Box>
  )
}

export default Settings
