import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Box, Typography, LinearProgress, useTheme } from '@mui/material'
import QuizIcon from '@mui/icons-material/Quiz'
import { WarningAmber } from '@mui/icons-material'
import InfoIcon from '@mui/icons-material/Info'
import DoneIcon from '@mui/icons-material/Done'
import { motion } from 'framer-motion'
import { lighten } from '@mui/material/styles'
import FileUpload from '../../ui/FileUpload'
import Dropdown from '../../ui/Dropdown'
import Input from '../../ui/Input'
import Modal from '../../ui/Modal'
import Button from '../../ui/Button'
import userService from '../../../services/userService'
import roleService from '../../../services/roleService'
import geminiService from '../../../services/geminiService'
import { useLanguage } from '../../../hooks/LanguageContext'
import { useAuth } from '../../../hooks/AuthContext'
import PropTypes from 'prop-types'


const ImportClientsForm = ({ open, onClose }) => {
  const theme = useTheme()
  const { toggleLoader } = useOutletContext()
  const { dictionary } = useLanguage()
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [sucessMessage, setSucessMessage] = useState(null)
  const [errorData, setErrorData] = useState(null)
  const [fileError, setFileError] = useState(null)
  const [roles, setRoles] = useState([])
  const [errors, setErrors] = useState([])
  const [activeMode, setActiveMode] = useState(0)
  const [activePage, setActivePage] = useState(1)
  const [total, setTotal] = useState(0)
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState(dictionary.Uploading)
  const [isUploaded, setIsUploaded] = useState(false)
  const usersPerPage = 4
  const startIndex = (activePage - 1) * usersPerPage
  const endIndex = startIndex + usersPerPage
  const currentUsers =users.length>0 ? users.slice(startIndex, endIndex) :[]
  const [openTutorial, setOpenTutorial] = useState(() => {
    const stored = localStorage.getItem('uploadTutorial')
      return stored === null || stored === 'true'
  })
  const langOptions = [
    { value: 'en', label: 'en' },
    { value: 'fr', label: 'fr' },
    { value: 'de', label: 'de' },
  ]

  const rolesOptions =
    roles.length > 0
      ? roles.map((role) => ({ value: role.id, label: role.name }))
      : []


  const resetForm = () => {
    setUsers([])
    setRoles([])
    setErrors([])
    setErrorData(null)
    setFileError(null)
    setSucessMessage(null)
    setActiveMode(0)
    setActivePage(1)
    setTotal(0)
    setProgress(0)
    setPhase(dictionary.Uploading)
    setIsUploaded(false)
  }

  const handleExcelUpload  = async (acceptedFiles) => {
     const file = acceptedFiles[0]
    if (file) {
        const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]
        const maxSize = 50 * 1024 * 1024
        if (!allowedTypes.includes(file.type)) {
        setFileError(dictionary.invalidFileType + ' ' + file.name)
        return
        }

        if (file.size > maxSize) {
        setFileError(dictionary.fileTooLarge + ' ' + file.name)
        return
        }
        try {
        setFileError(null)
        setTimeout(() => {
            setIsUploaded(true)
        }, 1000)
    
        const formData = new FormData()
        formData.append('file', file)

        setPhase(dictionary.Uploading)
        setProgress(0)

        let progressInterval = setInterval(() => {
            setProgress((prev) => Math.min(prev + 2, 20))
        }, 500)

        const responsePromise = geminiService.uploadUsers(formData)

        setTimeout(() => {
            clearInterval(progressInterval)
            setPhase(dictionary.Analyzing)

            progressInterval = setInterval(() => {
            setProgress((prev) => Math.min(prev + 2, 95))
            }, 500)

            setTimeout(async () => {
            clearInterval(progressInterval)
            setPhase(dictionary.Finishing)
            setProgress(100)

            try {
                const data = await responsePromise

                if (data) {
                settingUsersData(data)
                }
            } catch (e) {
                setErrorData(e?.response?.data?.ErrorMessage)
            }
            }, 40000)
        }, 10000)

        } catch (e) {
        setErrorData(e?.response?.data?.ErrorMessage)
        }
    }
    }

 const settingUsersData = (data) => {
  if (data && data.length > 0) {
    const mappedUsers = data.map(u => ({
      email: u.Email,
      password: u.Password,
      firstName: u.FirstName,
      lastName: u.LastName,
      defaultLanguage: u.DefaultLanguage,
      phoneNumber: u.PhoneNumber,
      roleId: '',
      clientOrganizationId: user.organization.id
    }))

    setUsers(mappedUsers)
    setTotal(Math.ceil(mappedUsers.length / 4))
    setActiveMode(1)
  }
 }

 const validate = () => {
    const newErrors = users.map((user) => {
        const error = {}

        if (!user.email) {
        error.email = dictionary.emailRequired
        } else if (!/\S+@\S+\.\S+/.test(user.email)) {
        error.email = dictionary.invalidEmail
        }

        if (!user.firstName) {
        error.firstName = dictionary.FirstNameRequired
        }

        if (!user.lastName) {
        error.lastName = dictionary.LastNameRequired
        }

        if (!user.defaultLanguage) {
        error.defaultLanguage = dictionary.DefaultLanguageRequired
        }

        if (!user.phoneNumber) {
        error.phoneNumber = dictionary.PhoneRequired
        } else if (user.phoneNumber.length !== 8) {
        error.phoneNumber = dictionary.PhoneInvalid
        }

        if (!user.password) {
        error.password = dictionary.passwordRequired
        } else if (user.password.length < 6) {
        error.password = dictionary.invalidpassword
        } else if (!/[!@#$%^&*(),.?":{}|<>_\-+=/\\[\]]/.test(user.password)) {
        error.password = dictionary.passwordRequiresNonAlphanumeric
        } else if (!/[a-z]/.test(user.password)) {
        error.password = dictionary.passwordRequiresLower
        } else if (!/[A-Z]/.test(user.password)) {
        error.password = dictionary.passwordRequiresUpper
        }

        if (!user.roleId) {
        error.roleId = dictionary.RoleRequired
        }

        return error
    })

    setErrors(newErrors)

    const firstErrorIndex = newErrors.findIndex(err => Object.keys(err).length > 0)

    if (firstErrorIndex !== -1) {
        const pageOfFirstError = Math.floor(firstErrorIndex / 4) + 1 
        setActivePage(pageOfFirstError)
    }

    return newErrors.every(err => Object.keys(err).length === 0)
  }

  const handleUserChange = (index, field, value) => {
  setUsers(prevUsers =>
    prevUsers.map((user, i) =>
      i === index ? { ...user, [field]: value } : user
    )
  )
 }

 const handleDropdownlang = (event,index) => {
    handleUserChange(index,"defaultLanguage",event.target.value)
  }

  const handleDropdownRole = (event,index) => {
    handleUserChange(index,"roleId",event.target.value)
  }

useEffect(() => {
    const fetchData = async () => {
      try {
      const data = await roleService.getAllRoles(1, 500, null)
      if (data) {
        const filtered = data.roles.filter((r) => r.clientOrganization?.id === user.organization.id)
        setRoles(filtered)
      }
    } catch (e) {
      if (e?.response?.data?.message) {
        const message = e.response.data.message
        if (message === 'Unknown error occurred.') {
          setErrorData(dictionary.UnknownError)
        } else {
          setErrorData(dictionary.GetRoleFailed)
        }
      } else {
        setErrorData(dictionary.GetRoleFailed)
      }
    }
    }
    fetchData()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    toggleLoader(true)
    try {
        
        const res= await userService.addListOfUsers({users})
        if(res){
            setSucessMessage(dictionary.OperationSeccesfull)
            setActiveMode(2)
            setTimeout(() => {
                resetForm()
                onClose()
            }, 3000)
        }
    }catch(e){
        setErrorData(e?.response?.data?.message)
    }finally{
        toggleLoader(false)
    }
  }

const handleCloseTutorial = () => {
    setOpenTutorial(false)
    localStorage.setItem('uploadTutorial', 'false')
  }
  return (
  <Box>
      <Modal
        open={open}
        onClose={onClose}
        showConfirmButton={false}
  >
    <Box sx={{ width: 'auto' , minWidth:"350px" }}>
        <Typography
            variant="h5"
            align="center"
            sx={{ fontWeight: 'bold' }}
        >
            {dictionary.UploadUsersList}
        </Typography>
        {activeMode==0 &&
            <motion.div
             initial={{ opacity: 0, x: 100 }}
             animate={{ opacity: 1, x: 0 }}
             exit={{ opacity: 0, x: 100 }}
             transition={{ duration: 0.8 }}
            >
                { !isUploaded ? ( 
                    <Box>
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column', 
                          alignItems: 'flex-start', 
                          border: `1px solid ${user.organization.primaryColor}`,
                          borderRadius: 2,
                          backgroundColor: 'transparent',
                          p: 2,
                          mt: 2,
                          mr: 2, 
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center', 
                            mb: 3, 
                          }}
                        >
                          <InfoIcon sx={{ color: user.organization.primaryColor, mr: 1 }} />
                          <Typography
                            variant="h6"
                            sx={{
                              color: theme.palette.text.primary,
                              fontWeight: 'bold',
                              textAlign: 'left', 
                            }}
                          >
                            {dictionary.YouShouldNoteTheFollowing}
                          </Typography>
                        </Box>

                        <Box>
                          

                          <Typography
                            variant="body2"
                            sx={{
                              color: theme.palette.text.disabled,
                              textAlign: 'left', 
                              ml: 2,
                              mb: 1, 
                            }}
                          >
                            - {dictionary.ImportNoticeT}
                          </Typography>

                          <Typography
                            variant="body2"
                            sx={{
                              color: theme.palette.text.disabled,
                              textAlign: 'left', 
                              ml: 2,
                              mb: 1, 
                            }}
                          >
                            - {dictionary.ImportNoticeT2}
                          </Typography>

                          <Typography
                            variant="body2"
                            sx={{
                              color: theme.palette.text.disabled,
                              textAlign: 'left', 
                              ml: 4,
                              mb: 1, 
                            }}
                          >
                            - {dictionary.ImportClientsNotice}
                          </Typography>
                        </Box>
                      </Box>

                        <Typography>{dictionary.FileExcel}</Typography>
                        <FileUpload
                            onDrop={handleExcelUpload }
                            errorMessage={fileError}
                        />
                    </Box>
                ) :(
                   <Box> 
                    <Typography textAlign="center" variant="body2" sx={{ marginTop: 1 }}>
                        {phase} ({progress}%)
                    </Typography>
                     <LinearProgress
                        variant="determinate"
                        value={progress}
                        sx={{
                            mt: 1,
                            height: 8,
                            borderRadius: 2,
                            backgroundColor: lighten(user.organization.primaryColor, 0.4),
                            '& .MuiLinearProgress-bar': {
                            background: `linear-gradient(to right, ${user.organization.primaryColor}, ${lighten(user.organization.primaryColor, 0.2)})`,
                            },
                        }}
                        />
                      {errorData && (
                        <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              border: '1px solid #f44336',
                              borderRadius: 2,
                              backgroundColor: 'transparent',
                              p: 2,
                              mt: 1,
                            }}
                        >
                            <WarningAmber sx={{ color: '#f44336', mr: 1 }} />
                            <Typography
                              color="error"
                              variant="body2"
                              sx={{ flex: 1, textAlign: 'center' }}
                            >
                                {errorData}
                            </Typography>
                        </Box>
                    )}
                   </Box>
                )}
            </motion.div> 
        }
        {activeMode==1 &&
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.8 }}
          >
            {currentUsers.length >0 ? 
            (
                <motion.div
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 100 }}
                  transition={{ duration: 0.8 }}
                >
                    {currentUsers.map((u, index) => {
                        const globalIndex = startIndex + index
                        return (
                            <Box
                              key={globalIndex}
                              display="flex"
                              alignItems="center"
                              gap={2} 
                              mb={2}  
                            >
                              <Input
                               showlabel={true}
                               label={dictionary.FirstName}
                               value={u.firstName}
                               placeholder={dictionary.FirstName}
                               type="string"
                               onChange={(e) => handleUserChange(globalIndex, "firstName", e.target.value)}
                               iserror={errors[globalIndex]?.firstName}
                              />
                              {errors[globalIndex]?.firstName && (
                                    <Typography color="error" variant="caption">
                                    {errors[globalIndex]?.firstName}
                                    </Typography>
                               )}
                               <Input
                               showlabel={true}
                               label={dictionary.LastName}
                               value={u.lastName}
                               placeholder={dictionary.LastName}
                               type="string"
                               onChange={(e) => handleUserChange(globalIndex, "lastName", e.target.value)}
                               iserror={errors[globalIndex]?.lastName}
                              />
                              {errors[globalIndex]?.lastName && (
                                    <Typography color="error" variant="caption">
                                    {errors[globalIndex]?.lastName}
                                    </Typography>
                               )}
                               <Input
                               showlabel={true}
                               label={dictionary.PhoneNumber}
                               value={u.phoneNumber}
                               placeholder={dictionary.PhoneNumber}
                               type="string"
                               onChange={(e) => handleUserChange(globalIndex, "phoneNumber", e.target.value)}
                               iserror={errors[globalIndex]?.phoneNumber}
                              />
                              {errors[globalIndex]?.phoneNumber && (
                                    <Typography color="error" variant="caption">
                                    {errors[globalIndex]?.phoneNumber}
                                    </Typography>
                               )}
                               <Input
                               showlabel={true}
                               label={dictionary.email}
                               value={u.email}
                               placeholder={dictionary.email}
                               type="string"
                               onChange={(e) => handleUserChange(globalIndex, "email", e.target.value)}
                               iserror={errors[globalIndex]?.email}
                              />
                              {errors[globalIndex]?.email && (
                                    <Typography color="error" variant="caption">
                                    {errors[globalIndex]?.email}
                                    </Typography>
                               )}

                                <Input
                               showlabel={true}
                               label={dictionary.password}
                               value={u.password}
                               placeholder={dictionary.password}
                               type="string"
                               onChange={(e) => handleUserChange(globalIndex, "password", e.target.value)}
                               iserror={errors[globalIndex]?.password}
                              />
                              {errors[globalIndex]?.password && (
                                    <Typography color="error" variant="caption">
                                    {errors[globalIndex]?.password}
                                    </Typography>
                               )}

                               <Dropdown
                                  options={langOptions}
                                  value={u.defaultLanguage}
                                  onChange={(e) => handleDropdownlang(e, globalIndex)}
                                  iserror={errors[globalIndex]?.defaultLanguage}
                                />
                                {errors[globalIndex]?.defaultLanguage && (
                                    <Typography color="error" variant="caption">
                                        {errors[globalIndex]?.defaultLanguage}
                                    </Typography>
                                )}
                                <Dropdown
                                  options={rolesOptions}
                                  value={u.roleId}
                                  onChange={(e) => handleDropdownRole(e, globalIndex)}
                                  iserror={errors[globalIndex]?.roleId}
                                />
                                {errors[globalIndex]?.roleId && (
                                    <Typography color="error" variant="caption">
                                        {errors[globalIndex]?.roleId}
                                    </Typography>
                                )}

                            </Box>  
                        )
                    })}
                    {errorData && (
                        <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              border: '1px solid #f44336',
                              borderRadius: 2,
                              backgroundColor: 'transparent',
                              p: 2,
                              mt: 1,
                            }}
                        >
                            <WarningAmber sx={{ color: '#f44336', mr: 1 }} />
                            <Typography
                              color="error"
                              variant="body2"
                              sx={{ flex: 1, textAlign: 'center' }}
                            >
                                {errorData}
                            </Typography>
                        </Box>
                    )}
                  <Box display="flex" justifyContent="center" gap={2} mt={3}>
                    <Button
                        variant={'outlined primary'}
                        dis={activePage === 1}
                        onClick={() => setActivePage(prev => prev - 1)}
                    >
                        {dictionary.prev}
                    </Button>

                    <Typography>{`${dictionary.Page} ${activePage} / ${total}`}</Typography>
                    {activePage !== total && 
                        <Button
                          variant={'outlined primary'}
                          onClick={() => setActivePage(prev => prev + 1)}
                        >
                            {dictionary.Next}
                        </Button>
                    }
                    {activePage === total && 
                        <Button
                          variant={'outlined primary'}
                          onClick={handleSubmit}
                        >
                            {dictionary.confirm}
                        </Button>
                    }
                    
                   </Box>
                </motion.div>
            ) : (
                <Typography textAlign="center" sx={{ fontWeight: 'normal' }}>
                    {dictionary.NoDataFound}
                </Typography>
            )}
          </motion.div>
        }
        {(activeMode==2 && sucessMessage!=null) &&
        <motion.div
         initial={{ opacity: 0, x: 100 }}
         animate={{ opacity: 1, x: 0 }}
         exit={{ opacity: 0, x: 100 }}
         transition={{ duration: 0.8 }}
        >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                border: '1px solid green',
                borderRadius: 2,
                backgroundColor: 'transparent',
                p: 2,
                mt: 1,
              }}
            >
                <DoneIcon sx={{ color: 'green', mr: 1 }} />
                <Typography
                    color="success"
                    variant="body2"
                    sx={{ flex: 1, textAlign: 'center' }}
                >
                    {sucessMessage}
                </Typography>
            </Box>
        </motion.div>
        }
        <Box mt={3} display="flex" justifyContent="space-between">
          <Button variant="primary outlined" onClick={() => setOpenTutorial(true)}>
            <>
              <QuizIcon sx={{ mr: 0.5, mb: 0.2, color:user.organization.primaryColor }} />
              {dictionary.ShowTutorial}
            </>
          </Button>
        </Box>
    </Box>
  </Modal>
   <Modal
        open={openTutorial}
        onClose={handleCloseTutorial}
        showConfirmButton={false}
  >
    <Box sx={{ width: 'auto' , minWidth:"350px" }}>
        <Typography
            variant="h5"
            align="center"
            sx={{ fontWeight: 'bold' }}
        >
            {dictionary.Tutorial}
        </Typography>
        <video
                        src={"https://dl.dropboxusercontent.com/scl/fi/t6su4ell540y5zjfxwlla/UploadObjects.mp4?rlkey=0dv4hd25ik87owup9sykxpe41&st=s9qfn01x&dl=0"}
                        autoPlay
                        loop
                        muted
                        playsInline
                        style={{ width: '100%' }}
                      />
        </Box>
  </Modal>
  </Box>
  )
}

ImportClientsForm.propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func
}

export default ImportClientsForm