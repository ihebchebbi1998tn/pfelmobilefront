import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { useDropzone } from 'react-dropzone'
import { Box, Typography } from '@mui/material'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { useLanguage } from '../../hooks/LanguageContext'
import { useAuth } from '../../hooks/AuthContext'
import { lighten } from '@mui/material/styles'

const FileUpload = ({ onDrop, resetTrigger, errorMessage }) => {
  const [uploaded, setUploaded] = useState(false)
  const { dictionary } = useLanguage()
  const { user } = useAuth()
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      setUploaded(true)
      onDrop(acceptedFiles)
    },
    multiple: false,
  })

  useEffect(() => {
    setUploaded(false)
  }, [resetTrigger])

  const hasError = Boolean(errorMessage)

  return (
    <Box
      {...getRootProps()}
      sx={{
        border: hasError
          ? '2px solid red'
          : uploaded
            ? '2px solid #4caf50'
            : isDragActive
              ? '2px dashed #ffa000'
              : `2px dashed ${user.organization.primaryColor}`,
        borderRadius: '8px',
        padding: '16px',
        textAlign: 'center',
        cursor: 'pointer',
        backgroundColor: hasError
          ? '#ffebee'
          : uploaded
            ? '#e8f5e9'
            : isDragActive
              ? '#fff3e0'
              : '#f7faff',
        '&:hover': { backgroundColor: lighten(user.organization.primaryColor, 0.7)  },
        transition: 'all 0.3s ease-in-out',
      }}
    >
      <input {...getInputProps()} />
      {uploaded && !hasError ? (
        <CheckCircleIcon sx={{ color: '#4caf50', fontSize: '32px' }} />
      ) : (
        <AttachFileIcon
          sx={{
            color: hasError ? 'red' : isDragActive ? '#ffa000' : user.organization.primaryColor,
            fontSize: '32px',
          }}
        />
      )}
      <Typography
        color={hasError ? 'error.main' : uploaded ? 'success.main' : user.organization.primaryColor}
        fontWeight="bold"
      >
        {hasError
          ? errorMessage
          : uploaded
            ? dictionary.uploadFileSuccess
            : dictionary.uploadFile}
      </Typography>
      <Typography variant="body2" sx={{color:user.organization.secondaryColor}}>
        {hasError
          ? null
          : uploaded
            ? dictionary.uploadFileSuccessDescription
            : dictionary.uploadFileDescription}
      </Typography>
    </Box>
  )
}

FileUpload.propTypes = {
  onDrop: PropTypes.func.isRequired,
  resetTrigger: PropTypes.any,
  errorMessage: PropTypes.string,
}

export default FileUpload
