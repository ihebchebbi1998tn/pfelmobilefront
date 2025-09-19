import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Box, Typography, CardMedia } from '@mui/material'
import QuizIcon from '@mui/icons-material/Quiz'
import noDataAnimation from '../../../assets/animation/noData.lottie'
import { motion } from 'framer-motion'
import pdfsrc from '../../../assets/img/pdf-icon.png'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import ModalInvoice from './ModalInvoice'
import { useLanguage } from '../../../hooks/LanguageContext'
import { useAuth } from '../../../hooks/AuthContext'
import invoiceService from '../../../services/invoiceService'
import orderService from '../../../services/orderService'
import serviceRequestService from '../../../services/serviceRequestService'
import ServiceAiRequest from '../../../services/ServiceAiRequest'
import installationRequestService from '../../../services/installationRequestService'
import CustomSnackbar from '../../ui/CustomSnackbar'
import Card from '../../ui/Card'
import Button from '../../ui/Button'
import Modal from '../../ui/Modal'

const Devices = () => {
  const { user } = useAuth()
  const { toggleLoader } = useOutletContext()
  const { dictionary } = useLanguage()
  const [typeSnack, setTypeSnack] = useState(null)
  const [messageSnack, setMessageSnack] = useState(null)
  const [openSnackBar, setOpenSnackBar] = useState(false)
  const [openModal, setOpenModal] = useState(false)
  const [data, setData] = useState({})
  const [dataGet, setDataGet] = useState(false)
  const [file, setFile] = useState(null)
const [openTutorial, setOpenTutorial] = useState(() => {
    const stored = localStorage.getItem('invoiceTutorial')
      return stored === null || stored === 'true'
  })
  const handleCloseTutorial = () => {
    setOpenTutorial(false)
    localStorage.setItem('invoiceTutorial', 'false')
  }
  const handleInvoiceClick = async (id, type) =>{
    if(type==="service request"){
        try{
            toggleLoader(true)
            const res = await serviceRequestService.DownloadInvoiceServiceRequest(
                id,
                user.defaultLanguage,
                user.address.city,
                user.address.streetName,
                user.address.zipCode,
                user.phoneNumber,
                user.organization.emailOrganisation,
            )
            if(res){
                toggleLoader(false)
                setFile(res)
                setOpenModal(true)
            }
        }catch{
            toggleLoader(false)
            setTypeSnack('error')
            setMessageSnack(dictionary.GenerateInvoiceFailed)
            setOpenSnackBar(true)
        }
    }else if (type==="service request ai"){
         try{
            toggleLoader(true)
            const res = await ServiceAiRequest.DownloadInvoiceServiceRequestAi(
                id,
                user.defaultLanguage,
                user.address.city,
                user.address.streetName,
                user.address.zipCode,
                user.phoneNumber,
                user.organization.emailOrganisation,
            )
            if(res){
                toggleLoader(false)
                setFile(res)
                setOpenModal(true)
            }
        }catch{
            toggleLoader(false)
            setTypeSnack('error')
            setMessageSnack(dictionary.GenerateInvoiceFailed)
            setOpenSnackBar(true)
        }
    } else if(type==="installation"){
       try{
            toggleLoader(true)
            const res = await installationRequestService.DownloadInvoiceInstallationRequest(
                id,
                user.defaultLanguage,
                user.address.city,
                user.address.streetName,
                user.address.zipCode,
                user.phoneNumber,
                user.organization.emailOrganisation,
            )
            if(res){
                toggleLoader(false)
                setFile(res)
                setOpenModal(true)
            }
        }catch{
            toggleLoader(false)
            setTypeSnack('error')
            setMessageSnack(dictionary.GenerateInvoiceFailed)
            setOpenSnackBar(true)
        } 
    }else{
        try{
            toggleLoader(true)
            const res = await orderService.DownloadInvoiceOrder(
                id,
                user.defaultLanguage,
                user.address.city,
                user.address.streetName,
                user.address.zipCode,
                user.phoneNumber,
                user.organization.emailOrganisation,
            )
            if(res){
                toggleLoader(false)
                setFile(res)
                setOpenModal(true)
            }
        }catch{
            toggleLoader(false)
            setTypeSnack('error')
            setMessageSnack(dictionary.GenerateInvoiceFailed)
            setOpenSnackBar(true)
        }
    }
  }

  useEffect(() => {
    const fetchData = async () => {
     try {
        const res = await invoiceService.getdata()
        if(res){
            setDataGet(true)
            setData(res) 
        }
     }catch(e){
         if (e?.response?.data?.message) {
        const message = e.response.data.message
       
        if (message === 'User not authenticated') {
          setTypeSnack('error')
          setMessageSnack(dictionary.UserNotAuthenticated)
          setOpenSnackBar(true)
        } else {
          setTypeSnack('error')
          setMessageSnack(dictionary.GetInvoicesFailed)
          setOpenSnackBar(true)
        }
      } else {
        setTypeSnack('error')
        setMessageSnack(dictionary.GetInvoicesFailed)
        setOpenSnackBar(true)
      }
     }
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
     {openModal && (
        <ModalInvoice
         open={true}
         onClose={() => {
            setOpenModal(false)
            setFile(null)
        }}
         file={file}
        />
    )}
    {dataGet ? (
        <motion.div
         initial={{ opacity: 0, x: 100 }}
         animate={{ opacity: 1, x: 0 }}
         exit={{ opacity: 0, x: 100 }}
         transition={{ duration: 0.8 }}
        >
            <Box display={'flex'} justifyContent={'end'}>
                <Button variant="primary outlined" onClick={() => setOpenTutorial(true)}>
                                            <>
                                              <QuizIcon sx={{ mr: 0.5, mb: 0.2, color:user.organization.primaryColor }} />
                                              {dictionary.ShowTutorial}
                                            </>
                                          </Button>
            </Box>
            <Card title={dictionary.MyInstallationRequests} showHover={false}>
                {(data?.installationRequests!=null && Array.isArray(data?.installationRequests) && data?.installationRequests.length> 0) ? 
                (
                    <Box
                     display="flex"
                     alignItems="center"
                     gap={2} 
                     mb={2}  
                    >
                        {data?.installationRequests.map((i) => (
                            <Box
                            key={i.id}
                            position="relative"
                            align="center"
                            sx={{ display: 'inline-block', cursor: 'pointer' }}
                            onClick={(e) => {
                                e.stopPropagation()
                                handleInvoiceClick(i.id, "installation")
                            }}
                            >
                                <Typography align="center" >{i.SerialNumber}.pdf</Typography>
                                <CardMedia
                                    component="img"
                                    image={pdfsrc}
                                    alt="invoice"
                                    sx={{
                                    borderRadius: '10px',
                                    transition: '0.3s ease-in-out',
                                    maxHeight: '150px',
                                    maxWidth: '60%',
                                    height: 'auto',
                                    display: 'block',
                                    '&:hover': {
                                        transform: 'scale(1.2)'
                                    },
                                    }}
                                />
                            </Box>
                        ))}
                    </Box>
                )
                : (
                    <Typography align="center" >{dictionary.NoDataFound}</Typography>
                )
            }   
            </Card>
            <Card title={dictionary.MyOrders} showHover={false}>
                {(data?.orders!=null && Array.isArray(data?.orders) && data?.orders.length> 0) ?
                (
                    <Box
                     display="flex"
                     alignItems="center"
                     gap={2} 
                     mb={2}  
                    >
                        {data?.orders.map((i) => (
                            <Box
                            key={i.id}
                            position="relative"
                            align="center"
                            sx={{ display: 'inline-block', cursor: 'pointer' }}
                            onClick={(e) => {
                                e.stopPropagation()
                                handleInvoiceClick(i.id, "order")
                            }}
                            >
                                <Typography align="center">{dictionary.Order}_{i.id}.pdf</Typography>
                                <CardMedia
                                    component="img"
                                    image={pdfsrc}
                                    alt="invoice"
                                    sx={{
                                    borderRadius: '10px',
                                    transition: '0.3s ease-in-out',
                                    maxHeight: '150px',
                                    maxWidth: '60%',
                                    height: 'auto',
                                    display: 'block',
                                    '&:hover': {
                                        transform: 'scale(1.2)'
                                    },
                                    }}
                                />
                            </Box>
                        ))}
                    </Box>
                )
                : (
                    <Typography align="center" >{dictionary.NoDataFound}</Typography>
                )
            }   
            </Card>
            <Card title={dictionary.MyServiceRequests} showHover={false}>
                {(data?.serviceRequests!=null && Array.isArray(data?.serviceRequests) && data?.serviceRequests.length> 0) ?
                (
                    <Box
                     display="flex"
                     alignItems="center"
                     gap={2} 
                     mb={2}  
                    >
                        {data?.serviceRequests.map((i) => (
                            <Box
                            key={i.id}
                            position="relative"
                            align="center"
                            sx={{ display: 'inline-block', cursor: 'pointer' }}
                            onClick={(e) => {
                                e.stopPropagation()
                                handleInvoiceClick(i.id, "service request")
                            }}
                            >
                                <Typography align="center">Service_{i.id}.pdf</Typography>
                                <CardMedia
                                    component="img"
                                    image={pdfsrc}
                                    alt="invoice"
                                    sx={{
                                    borderRadius: '10px',
                                    transition: '0.3s ease-in-out',
                                    maxHeight: '150px',
                                    maxWidth: '60%',
                                    height: 'auto',
                                    display: 'block',
                                    '&:hover': {
                                        transform: 'scale(1.2)'
                                    },
                                    }}
                                />
                            </Box>
                        ))}
                    </Box>
                )
                : (
                    <Typography align="center" >{dictionary.NoDataFound}</Typography>
                )
            }   
            </Card>
            <Card title={dictionary.AiServiceRequest} showHover={false}>
                {(data?.serviceRequestAis!=null && Array.isArray(data?.serviceRequestAis) && data?.serviceRequestAis.length> 0) ?
                (
                    <Box
                     display="flex"
                     alignItems="center"
                     gap={2} 
                     mb={2}  
                    >
                        {data?.serviceRequestAis.map((i) => (
                            <Box
                            key={i.id}
                            position="relative"
                            align="center"
                            sx={{ display: 'inline-block', cursor: 'pointer' }}
                            onClick={(e) => {
                                e.stopPropagation()
                                handleInvoiceClick(i.id, "service request ai")
                            }}
                            >
                                <Typography align="center">Service_{i.id}.pdf</Typography>
                                <CardMedia
                                    component="img"
                                    image={pdfsrc}
                                    alt="invoice"
                                    sx={{
                                    borderRadius: '10px',
                                    transition: '0.3s ease-in-out',
                                    maxHeight: '150px',
                                    maxWidth: '60%',
                                    height: 'auto',
                                    display: 'block',
                                    '&:hover': {
                                        transform: 'scale(1.2)'
                                    },
                                    }}
                                />
                            </Box>
                        ))}
                    </Box>
                )
                : (
                    <Typography align="center" >{dictionary.NoDataFound}</Typography>
                )
            }   
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
    ) }
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
                                            src={"https://dl.dropboxusercontent.com/scl/fi/h7v5l1w2t9xcloiqc0sxy/InvoiceTuto.mp4?rlkey=1fgg3g5amvrvtyiumlzfsmb62&st=5ia0bawr&dl=0"}
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

export default Devices