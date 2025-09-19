import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Box, Typography, LinearProgress, useTheme, IconButton, Divider  } from '@mui/material'
import QuizIcon from '@mui/icons-material/Quiz'
import { WarningAmber } from '@mui/icons-material'
import InfoIcon from '@mui/icons-material/Info'
import DoneIcon from '@mui/icons-material/Done'
import CloseIcon from '@mui/icons-material/Close'
import { motion } from 'framer-motion'
import { lighten } from '@mui/material/styles'
import FileUpload from '../../ui/FileUpload'
import Input from '../../ui/Input'
import Modal from '../../ui/Modal'
import Button from '../../ui/Button'
import sparePartService from '../../../services/sparePartService'
import geminiService from '../../../services/geminiService'
import { useLanguage } from '../../../hooks/LanguageContext'
import { useAuth } from '../../../hooks/AuthContext'
import PropTypes from 'prop-types'


const ImportSparePartsForm = ({ open, onClose }) => {
  const theme = useTheme()
  const { toggleLoader } = useOutletContext()
  const { dictionary } = useLanguage()
  const { user } = useAuth()
  const [spareParts, setSpareParts] = useState([])
  const [sucessMessage, setSucessMessage] = useState(null)
  const [errorData, setErrorData] = useState(null)
  const [fileError, setFileError] = useState(null)
  const [errors, setErrors] = useState([])
  const [activeMode, setActiveMode] = useState(0)
  const [activePage, setActivePage] = useState(1)
  const [total, setTotal] = useState(0)
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState(dictionary.Uploading)
  const [isUploaded, setIsUploaded] = useState(false)
  const sparePartsPerPage = 2
  const startIndex = (activePage - 1) * sparePartsPerPage
  const endIndex = startIndex + sparePartsPerPage
  const currentSpareParts =spareParts.length>0 ? spareParts.slice(startIndex, endIndex) :[]
const [openTutorial, setOpenTutorial] = useState(() => {
    const stored = localStorage.getItem('uploadTutorial')
      return stored === null || stored === 'true'
  })
  const handleCloseTutorial = () => {
    setOpenTutorial(false)
    localStorage.setItem('uploadTutorial', 'false')
  }
  const resetForm = () => {
    setSpareParts([])
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
        formData.append('lang', user.defaultLanguage)

        setPhase(dictionary.Uploading)
        setProgress(0)

        let progressInterval = setInterval(() => {
            setProgress((prev) => Math.min(prev + 2, 20))
        }, 500)

        const responsePromise = geminiService.uploadSpareParts(formData)

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
                settingSparePartsData(data)
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

 const settingSparePartsData = async (data) => {
    if (data && data.length > 0) {
        const mappedSpareParts = []
        for (let index = 0; index < data.length; index++) {
            const sparePartData = data[index]

            if (sparePartData.sparePartImageUrl != null) {
                try {
                    const imageResponse = await fetch(sparePartData.sparePartImageUrl)
                    const blob = await imageResponse.blob()
                    const fileName = blob.name || `device-${index}.jpg`
                    const newFile = new File([blob], fileName, { type: blob.type })

                    const sparePart = {
                        title: sparePartData.name,
                        description: sparePartData.description,
                        quantity: sparePartData.quantity,
                        price: sparePartData.price,
                        tva: sparePartData.tva,
                        organizationId: user.organization.id,
                        organizationName: user.organization.name,
                        preview: sparePartData.sparePartImageUrl,
                        file: newFile,
                    }

                    mappedSpareParts.push(sparePart)
                } catch (error) {
                    console.error(error.message)
                }
            } else {
                const sparePart = {
                        title: sparePartData.name,
                        description: sparePartData.description,
                        quantity: sparePartData.quantity,
                        price: sparePartData.price,
                        tva: sparePartData.tva,
                        organizationId: user.organization.id,
                        organizationName: user.organization.name,
                        preview: null,
                        file: null,
                    }

                mappedSpareParts.push(sparePart)
            }
        }
        setSpareParts(mappedSpareParts)
        setTotal(Math.ceil(mappedSpareParts.length / 2))
        setActiveMode(1)
    }
}



 const validate = () => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
    const maxSize = 50 * 1024 * 1024
    const newErrors = spareParts.map((d) => {
        const error = {}

        const parsedPrice = parseFloat((d.price + '').replace(',', '.'))
        const parsedTva = parseInt(d.tva, 10)
        const parsedQuantity = parseInt(d.quantity, 10)
        if (!d.title) {
            error.title = dictionary.TitleRequired
        }

        if (!d.description) {
            error.description = dictionary.DescriptionRequired
        }

        if (isNaN(parsedPrice)) {
            error.price = dictionary.PriceMustBeANumber
        } else if (parsedPrice <= 0) {
            error.price = dictionary.PriceMustBeGreaterThanZero
        }

        if (isNaN(parsedTva)) {
            error.tva = dictionary.TvaMustBeANumber
        } else if (parsedTva < 0) {
            error.tva = dictionary.TvaMustNotBeLessThanZero
        }

        if (isNaN(parsedQuantity)) {
            error.quantity = dictionary.QuantityMustBeANumber
        } else if (parsedQuantity < 0) {
            error.quantity = dictionary.QuantityMustBeGreaterThanZero
        }

        if (!d.file) {
            error.file = dictionary.ImageRequired
        } else {
            if (!allowedTypes.includes(d.file.type)) {
                error.file = `${dictionary.InvalidFileType} ${d.file.name}`
            }
            else if (d.file.size > maxSize) {
                error.file = `${dictionary.FileTooLarge} ${d.file.name}`
            }
        }

        return error
    })

    setErrors(newErrors)

    const firstErrorIndex = newErrors.findIndex(err => Object.keys(err).length > 0)

    if (firstErrorIndex !== -1) {
        const pageOfFirstError = Math.floor(firstErrorIndex / 2) + 1
        setActivePage(pageOfFirstError)  
    }

    return newErrors.every(err => Object.keys(err).length === 0)
}


  const handlesparePartChange = (index, field, value) => {
    if (field === "preview") {
        setSpareParts(prevSpareParts =>
            prevSpareParts.map((sparePart, i) =>
                i === index ? { ...sparePart, preview: null, file: null } : sparePart
            )
        );
    } else if (field === "file") {
        const file = value[0]

        const updatedSpareParts = spareParts.map((sparePart, i) =>
            i === index ? { ...sparePart, preview: URL.createObjectURL(file), file } : sparePart
        )

        const validationErrors = validateSpareParts(updatedSpareParts)

        setErrors(validationErrors)

        if (!validationErrors.every(err => Object.keys(err).length === 0)) {
            return
        }

        setSpareParts(updatedSpareParts)
    } else {
        setSpareParts(prevSpareParts =>
            prevSpareParts.map((sparePart, i) =>
                i === index ? { ...sparePart, [field]: value } : sparePart
            )
        )
    }
}

const validateSpareParts = (sparePartsToValidate) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
    const maxSize = 50 * 1024 * 1024

    const newErrors = sparePartsToValidate.map((d) => {
        const error = {}
        const parsedPrice = parseFloat((d.price + '').replace(',', '.'))
        const parsedTva = parseInt(d.tva, 10)
        const parsedQuantity = parseInt(d.quantity, 10)

        if (!d.title) {
            error.title = dictionary.TitleRequired
        }
        if (!d.description) error.description = dictionary.DescriptionRequired

        if (isNaN(parsedPrice)) {
            error.price = dictionary.PriceMustBeANumber
        } else if (parsedPrice <= 0) {
            error.price = dictionary.PriceMustBeGreaterThanZero
        }

        if (isNaN(parsedTva)) {
            error.tva = dictionary.TvaMustBeANumber
        } else if (parsedTva < 0) {
            error.tva = dictionary.TvaMustNotBeLessThanZero
        }

       if (isNaN(parsedQuantity)) {
            error.quantity = dictionary.QuantityMustBeANumber
        } else if (parsedQuantity < 0) {
            error.quantity = dictionary.QuantityMustBeGreaterThanZero
        }

        if (!d.file) {
            error.file = dictionary.ImageRequired
        } else {
            if (!allowedTypes.includes(d.file.type)) {
                error.file = `${dictionary.InvalidFileType} ${d.file.name}`
            } else if (d.file.size > maxSize) {
                error.file = `${dictionary.FileTooLarge} ${d.file.name}`
            }
        }

        return error
    })

    const firstErrorIndex = newErrors.findIndex(err => Object.keys(err).length > 0)
    if (firstErrorIndex !== -1) {
        const pageOfFirstError = Math.floor(firstErrorIndex / 2) + 1
        setActivePage(pageOfFirstError)
    }

    return newErrors
}





  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    toggleLoader(true)
    try {
        const formData = new FormData()
        spareParts.forEach((sparePart, index) => {
            formData.append(`spareParts[${index}].title`, sparePart.title)
            formData.append(`spareParts[${index}].description`, sparePart.description)
            formData.append(`spareParts[${index}].quantity`, sparePart.quantity)
            formData.append(`spareParts[${index}].price`, sparePart.price)
            formData.append(`spareParts[${index}].tva`, sparePart.tva)
            formData.append(`spareParts[${index}].file`, sparePart.file)
            formData.append(`spareParts[${index}].organizationId`, sparePart.organizationId)
            formData.append(`spareParts[${index}].organizationName`, sparePart.organizationName)
        })
        
        const res= await sparePartService.addListOfSparePart(formData)
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
            {dictionary.UploadSparePartsList}
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
                            - {dictionary.ImportSparePartsNotice}
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
            {currentSpareParts.length >0 ? 
            (
                <motion.div
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 100 }}
                  transition={{ duration: 0.8 }}
                >
                    {currentSpareParts.map((u, index) => {
                        const globalIndex = startIndex + index
                        return (
                            <Box
                                key={globalIndex}
                                display="flex"
                                flexDirection="column"
                                gap={2} 
                                mb={2}
                            >
                                <Box display="flex" gap={2}>
                                    <Input
                                        showlabel={true}
                                        label={dictionary.Title}
                                        value={u.title}
                                        placeholder={dictionary.Title}
                                        type="string"
                                        onChange={(e) => handlesparePartChange(globalIndex, "title", e.target.value)}
                                        iserror={errors[globalIndex]?.title}
                                    />
                                    {errors[globalIndex]?.title && (
                                        <Typography color="error" variant="caption">
                                            {errors[globalIndex]?.title}
                                        </Typography>
                                    )}
                                    <Input
                                        showlabel={true}
                                        label={dictionary.Quantity}
                                        value={u.quantity}
                                        placeholder={dictionary.Quantity}
                                        type="string"
                                        onChange={(e) => handlesparePartChange(globalIndex, "quantity", e.target.value)}
                                        iserror={errors[globalIndex]?.quantity}
                                    />
                                    {errors[globalIndex]?.quantity && (
                                        <Typography color="error" variant="caption">
                                            {errors[globalIndex]?.quantity}
                                        </Typography>
                                    )}
                                    <Input
                                        showlabel={true}
                                        label={dictionary.Price}
                                        value={u.price}
                                        placeholder={dictionary.Price}
                                        type="string"
                                        onChange={(e) => handlesparePartChange(globalIndex, "price", e.target.value)}
                                        iserror={errors[globalIndex]?.price}
                                    />
                                    {errors[globalIndex]?.price && (
                                        <Typography color="error" variant="caption">
                                            {errors[globalIndex]?.price}
                                        </Typography>
                                    )}
                                    <Input
                                        showlabel={true}
                                        label={dictionary.Tva}
                                        value={u.tva}
                                        placeholder={dictionary.TvaInPercentage}
                                        type="string"
                                        onChange={(e) => handlesparePartChange(globalIndex, "tva", e.target.value)}
                                        iserror={errors[globalIndex]?.tva}
                                    />
                                    {errors[globalIndex]?.tva && (
                                        <Typography color="error" variant="caption">
                                            {errors[globalIndex]?.tva}
                                        </Typography>
                                    )}
                                </Box>

                                <Box display="flex" flexDirection="row" gap={2} alignItems="flex-start">
                                    <Box flex={1}>
                                        <Input
                                            showlabel={true}
                                            label={dictionary.Description}
                                            value={u.description}
                                            minRows={3}
                                            placeholder={dictionary.Description}
                                            type="string"
                                            onChange={(e) => handlesparePartChange(globalIndex, "description", e.target.value)}
                                            iserror={errors[globalIndex]?.description}
                                        />
                                        {errors[globalIndex]?.description && (
                                            <Typography color="error" variant="caption">
                                                {errors[globalIndex]?.description}
                                            </Typography>
                                        )}
                                    </Box>

                                    <Box>
                                        {u.preview != null ? (
                                            <Box mt={2} display="flex" alignItems="center" justifyContent="center" gap={2}>
                                                <Box
                                                    component="img"
                                                    src={u.preview}
                                                    alt="logo-preview"
                                                    sx={{
                                                        width: { xs: 150, sm: 200, md: 200 },
                                                        height: { xs: 60, sm: 80, md: 80 },
                                                        borderRadius: 1.5,
                                                        objectFit: 'cover',
                                                        border: '1px solid #ccc',
                                                    }}
                                                />
                                                <IconButton
                                                    onClick={() => handlesparePartChange(globalIndex, "preview", null)} 
                                                    sx={{ color: 'error.main' }}
                                                >
                                                    <CloseIcon />
                                                </IconButton>
                                            </Box>
                                        ) : (
                                            <FileUpload
                                                onDrop={(acceptedFiles) => handlesparePartChange(globalIndex, "file", acceptedFiles)} 
                                                errorMessage={errors[globalIndex]?.file} 
                                            />
                                        )}
                                    </Box>
                                </Box>


                                <Divider sx={{ mt: 2 }} />
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

ImportSparePartsForm.propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func
}

export default ImportSparePartsForm