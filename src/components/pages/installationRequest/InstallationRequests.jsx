import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Box, Typography, Paper, useTheme, Avatar } from '@mui/material'
import QuizIcon from '@mui/icons-material/Quiz'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import noDataAnimation from '../../../assets/animation/noData.lottie'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import installationRequestService from '../../../services/installationRequestService'
import userService from '../../../services/userService'
import { useLanguage } from '../../../hooks/LanguageContext'
import { useAuth } from '../../../hooks/AuthContext'
import CustomBadge from '../../ui/CustomBadge'
import Button from '../../ui/Button'
import Modal from '../../ui/Modal'
import CustomSnackbar from '../../ui/CustomSnackbar'
import Card from '../../ui/Card'
import InstallationRequestWarnningMessage from './InstallationRequestWarnningMessage'
import { format } from 'date-fns'
import FormModal from './FormModal'
import InstallationRequestDetails from './InstallationRequestDetails'

const InstallationRequests = () => {
 const { toggleLoader } = useOutletContext()
 const { dictionary } = useLanguage()
 const theme = useTheme()
 const { user } = useAuth()
 const isDark = theme.palette.mode === 'dark'
 const [typeSnack, setTypeSnack] = useState(null)
 const [messageSnack, setMessageSnack] = useState(null)
 const [openSnackBar, setOpenSnackBar] = useState(false)
 const [installations, setInstallations] = useState([])
 const [users, setUsers] = useState([])
 const [selectedRow, setSelectedRow] = useState(null)
 const [mode, setMode] = useState(null)
 const [openForm, setOpenForm] = useState(false)
 const [openDetails, setOpenDetails] = useState(false)
 const [showWarningMessage, setShowWarningMessage] = useState(false)
 const [warningMessage, setWarningMessage] = useState(null)
const [openTutorial, setOpenTutorial] = useState(() => {
    const stored = localStorage.getItem('dragTutorial')
      return stored === null || stored === 'true'
  })
  const handleCloseTutorial = () => {
    setOpenTutorial(false)
    localStorage.setItem('dragTutorial', 'false')
  }
 const statusInstallations = {
    Pending: ['Refused', 'InProgress'],
    InProgress: ['Dispatched'],
    Dispatched: ['Completed'],
  }

  const STATUSES = [
  'Pending',
  'InProgress',
  'Dispatched',
  'Completed',
  'Cancelled',
  'Refused',
 ]

 const HandleOpenModalDetailsInstallation = (row) =>{
    setSelectedRow(row)
    setOpenDetails(true)
 }

 const installationsByStatus = STATUSES.reduce((acc, status) => {
    const installationsArray = Array.isArray(installations) ? installations : []
    acc[status] = installationsArray.filter((i) => i.status === status)
    return acc
  }, {})
  const getTitleCard = (s) =>{
    switch (s) {
        case"Pending":
            return dictionary.Pending
        case"InProgress":
            return dictionary.InProgress
        case"Dispatched":
            return dictionary.Dispatched
        case"Completed":
            return dictionary.Completed
        case"Cancelled":
            return dictionary.Cancelled
        case"Refused":
            return dictionary.Refused
        default:
            return dictionary.Pending
    }
  }

  const getStatusBadge = (s) =>{
    switch (s) {
        case true:
            return <CustomBadge label={dictionary.Payed} type="success" />
        case false:
            return <CustomBadge label={dictionary.NotPaid} type="danger" />
        default:
            return <CustomBadge label={dictionary.NotPaid} type="danger" />
    }
  }

 const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result
    if (!destination || destination.droppableId === source.droppableId) return
    const item = installations.find((i) => i.id.toString() === draggableId)
    if (!item) return

    const cs = item.status
    const ns = destination.droppableId

    if (['Cancelled','Refused'].includes(cs)) return
    if (!statusInstallations[cs]?.includes(ns)) return
    if(cs==='InProgress' && ns==='Dispatched' && !item.isPaid && item.paymentMethod!=='Cash'){
        setShowWarningMessage(true)
        setWarningMessage(dictionary.CustomerMustPayFirst)
        return
    }
    if(ns==='Dispatched'){
        try{
            const formData = new FormData()
            formData.append('id', item.id)
            formData.append('status', 'Dispatched')
            toggleLoader(true)
             const res = await installationRequestService.toggleInstallationRequest(formData)
           if (res) {
                toggleLoader(false)
                setTypeSnack('success')
                setMessageSnack(dictionary.OperationSeccesfull)
                setOpenSnackBar(true)
                setInstallations((prev) =>
                    prev.map((s) => s.id === item.id ? { ...s, status: ns } : s)
                )
                fetchInstallationsData()
            }
        }catch(e){
            toggleLoader(false)
            if (e?.response?.data?.message) {
            const message = e.response.data.message
            if (message === 'User not authenticated') {
                setTypeSnack('error')
                setMessageSnack(dictionary.UserNotAuthenticated)
                setOpenSnackBar(true)
            }  else {
                setTypeSnack('error')
                setMessageSnack(dictionary.ToggleInstallationStatusFailed)
                setOpenSnackBar(true)
                }
            } else {
                setTypeSnack('error')
                setMessageSnack(dictionary.ToggleInstallationStatusFailed)
                setOpenSnackBar(true)
            }
        } 
    }else{
        setInstallations((prev) =>
            prev.map((s) => s.id === item.id ? { ...s, status: ns } : s)
        )
        setMode(ns)
        setSelectedRow(item)
        setOpenForm(true)
    }
 }

 const getUserInfos = (id) => {
    if (!Array.isArray(users) || users.length === 0) return null

    const find = users.find(u => u.id === id) || null
    if (!find) return null

    const userName = `${find.firstName || ''} ${find.lastName || ''}`.trim()

    return {
        id: find.id,
        initials: userName ? userName.split(' ').map(word => word.charAt(0)).slice(0, 2).join('').toUpperCase() : '',
        image: find.imageUrl || null
    }
  }


 const fetchUsersData = async () => {
      try {
        const data = await userService.getUsersInfos()
        if (data) {
          if (data.users.length > 0) {
            const array = data.users
              .filter((u) => u.id !== user?.id)
              .map((u) => {
                return {
                  id: u.id,
                  firstName: u.firstName,
                  lastName: u.lastName,
                  imageName:u.imageName,
                  imageUrl:u.imageUrl 
                }
              })

            setUsers(array)
          }
        }
      } catch (e) {
        console.log(e?.response?.data?.message || 'Get users info failed')
      }
    }

 const fetchInstallationsData = async () => {
    try {
      const data = await installationRequestService.getAllInstallationRequest(user.organization.id)
      console.log('Installation data:', data) // Debug log
      if (data && data.items) {
        setInstallations(data.items)
      } else if (Array.isArray(data)) {
        setInstallations(data)
      } else {
        setInstallations([])
      }
    } catch (e) {
      console.log(e)
      setInstallations([])
    }
  }

   useEffect(() => {
     const fetchData = async () => {
        await Promise.all([fetchInstallationsData(), fetchUsersData()])
    }
    fetchData()
  }, [])

 return (
    <Box>
        <CustomSnackbar
            open={openSnackBar}
            message={messageSnack}
            type={typeSnack}
            onClose={() => setOpenSnackBar(false)}
        />
       {showWarningMessage && (
            <InstallationRequestWarnningMessage
                open={true}
                onClose={() => {
                   setShowWarningMessage(false)
                   setWarningMessage(null)
                }}
                message={warningMessage}
            />
        )}
        {openDetails && (
            <InstallationRequestDetails
                open={true}
                onClose={() => {
                    setOpenDetails(false)
                    setSelectedRow(null)
                }}
                installation={selectedRow}
            />
        )}
        {openForm && (
            <FormModal
                open={true}
                onClose={() => {
                   fetchInstallationsData()
                   setOpenForm(false)
                   setSelectedRow(null)
                   setMode(null)
                }}
                installation={selectedRow}
                mode={mode}
            />
        )}
        <Card title={dictionary.InstallationRequests} showHover={false}>
            <Box  display="flex" justifyContent="end">
          <Button variant="primary outlined" onClick={() => setOpenTutorial(true)}>
            <>
              <QuizIcon sx={{ mr: 0.5, mb: 0.2, color:user.organization.primaryColor }} />
              {dictionary.ShowTutorial}
            </>
          </Button>
        </Box>
        </Card>
        {(installations!=null && installations.length>0) ?
        (
        <Box sx={{ minHeight:'100vh' }}>
            <motion.div
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                transition={{ duration: 0.3 }}
            >
                <DragDropContext onDragEnd={onDragEnd}>
                    <Box sx={{ display:'flex', flexWrap: 'wrap', gap:2, overflowX:'auto', pb:2 }}>
                            {STATUSES.map((status) => {
                                const items = installationsByStatus[status]
                                return (
                                <Droppable
                                    droppableId={status}
                                    key={status}
                                    isCombineEnabled={false}
                                >
                                    {(provided, snapshot) => (
                                    <Paper
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        sx={{
                                        minWidth:280, maxHeight:'100vh', overflowY:'auto', p:2,
                                        bgcolor: snapshot.isDraggingOver ? theme.palette.action.hover : isDark ?'#18141c': '#ffffff',
                                        borderRadius:2, 
                                        boxShadow:3,
                                        display:'flex', 
                                        flexDirection:'column',
                                        '&::WebkitScrollbar': {
                                        width: '8px',
                                        borderRadius: '8px',
                                        },
                                        '&::WebkitScrollbarThumb': {
                                        borderRadius: '8px'
                                        },
                                        scrollbarWidth: 'thin',
                                        scrollbarColor:isDark ? "white transparent" : "black transparent"
                                        }}
                                    >
                                        <Typography variant="h6"  mb={2}
                                        sx={{ color: theme.palette.text.secondary, fontWeight:'medium' }}
                                        >
                                        {getTitleCard(status)}
                                        </Typography>
                                        {items.length === 0 && (
                                        <Typography variant="body2" sx={{ color:theme.palette.text.disabled, textAlign:'center', mt:4 }}>
                                            {dictionary.NoRequests}
                                        </Typography>
                                        )}
                                        {items.map((installation, index) => {
                                            const client =getUserInfos(installation.userId)
                                        return(
                                            <Draggable
                                            draggableId={installation.id.toString()}
                                            index={index}
                                            key={installation.id}
                                            isDragDisabled={['Cancelled','Refused'].includes(installation.status)}
                                        >
                                            {(provided, snapshot) => (
                                            <Paper
                                            onClick={() => HandleOpenModalDetailsInstallation(installation)}
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                sx={{
                                                p:2, mb:2, borderRadius:2,
                                                boxShadow: snapshot.isDragging ? `0 0 10px ${user.organization.primaryColor}` : '0 1px 3px rgba(0,0,0,0.2)',
                                                bgcolor: theme.palette.background.paper,
                                                cursor: ['Cancelled','Refused'].includes(installation.status) ? 'not-allowed' : 'grab',
                                                userSelect: 'none', transition:'box-shadow 0.2s ease',
                                                border: `1px solid ${isDark ? '#ffffff' : '#9da7b7'}`,
                                                '&:hover': {
                                                    transform:['Cancelled','Refused'].includes(installation.status) ? 'none' : 'scale(1.08)'
                                                    },
                                                }}
                                            >
                                                <Typography variant="subtitle1" fontWeight="bold"
                                                sx={{ mb:1, color: theme.palette.text.primary }}
                                                >
                                                {installation?.device?.name}
                                                </Typography>
                                                
                                                <Box sx={{mb:1}}>
                                                    {getStatusBadge(installation.isPaid)}
                                                </Box>
                                               
                                                <Box display="flex" alignItems="center" gap={1} sx={{mb:1}}>
                                                    <AccessTimeIcon fontSize="small" />
                                                    {format(new Date(installation.createdAt), 'dd/MM/yyyy')}
                                                </Box>
                                                
                                                {client!=null &&
                                                     <Box
                                                        sx={{
                                                            mt: 1,
                                                            mb: 1,
                                                            display: 'flex',
                                                            justifyContent:  'flex-end'
                                                        }}
                                                    >
                                                        {client.image!=null ? 
                                                        (
                                                            <img
                                                            src={client.image}
                                                            alt="Profile"
                                                            style={{
                                                            borderRadius:"20px",
                                                            height: "32px", 
                                                            width:"32px",
                                                            objectFit: 'cover',
                                                            }}
                                                        />
                                                        ) : (
                                                             <Avatar
                                                                sx={{
                                                                    fontSize: '15px',
                                                                    width: 30,
                                                                    height: 30,
                                                                    bgcolor: isDark ? '#747574' : '#bdbcbc',
                                                                    color: isDark ? '#000' : '#fff',
                                                                }}
                                                                >
                                                                {client.initials}
                                                            </Avatar>
                                                        )}
                                                    </Box>
                                                }
                                            </Paper>
                                            )}
                                        </Draggable>
                                        )
                                        })}
                                        {provided.placeholder}
                                    </Paper>
                                    )}
                                </Droppable>
                                )
                            })}
                    </Box>
                </DragDropContext>
            </motion.div>
        </Box>
        ):
        (
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
        }
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
                                 src={"https://dl.dropboxusercontent.com/scl/fi/jrhl3pu6qz3k2kugg9iv2/ticketsDrag.mp4?rlkey=24dysqproubzlj28t312gv4dc&st=axdje055&dl=0"}
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

export default InstallationRequests