import { useState, useRef, useEffect } from 'react'
import {
  Box,
  IconButton,
  InputBase,
  Tooltip,
  Chip,
  useTheme,
  Typography,
} from '@mui/material'
import axiosInstance from '../../../utils/axiosInstance'
import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import AddIcon from '@mui/icons-material/Add'
import SendIcon from '@mui/icons-material/Send'
import CloseIcon from '@mui/icons-material/Close'
import InfoIcon from '@mui/icons-material/Info'
import MicIcon from '@mui/icons-material/Mic'
import EmojiPicker from 'emoji-picker-react'
import { useLanguage } from '../../../hooks/LanguageContext'
import { useAuth } from '../../../hooks/AuthContext'
import { useUserToUserChat } from '../../../hooks/ChatUserToUserContext'
import { useChat } from '../../../hooks/ChatContext'
import { ReactMic } from 'react-mic'
import { ThreeDot } from 'react-loading-indicators'
import { WarningAmber } from '@mui/icons-material'
import PropTypes from 'prop-types'

const ChatInput = ({ isAI, setIsTyping, otherUserId, otherUserData }) => {

  const [sending, setSending] = useState(false)
  const [erroruserMessage, setErroruserMessage] = useState(null)
  const { sendMessage, chatSessions, sessionId } = useChat()
  const { sendUserToUserMessage, setUserToUserMessages, handleTyping, userToUserChatSessions, userToUserSessionId } = useUserToUserChat()
  const theme = useTheme()
  const { user } = useAuth()
  const { dictionary } = useLanguage()
  const [input, setInput] = useState('')
  const [recording, setRecording] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showFiles, setShowFiles] = useState(true)
  const [recordingTime, setRecordingTime] = useState(0)
  const [currentUserToUserSession, setCurrentUserToUserSession]= useState(null)
  const [currentAiSession, setCurrentAiSession]= useState(null)
  const inputRef = useRef(null)
  const emojiPickerRef = useRef(null)
  const isDark = theme.palette.mode === 'dark'
  useEffect(() => {
  if( chatSessions.length > 0 && sessionId != null)
    setCurrentAiSession(chatSessions.find((c) => c?.id == sessionId))
    
  else setCurrentUserToUserSession(null)
  }, [chatSessions, sessionId])
 useEffect(() => {
  if( userToUserChatSessions.length > 0 && userToUserSessionId != null)
    setCurrentUserToUserSession(userToUserChatSessions.find((c) => c?.id == userToUserSessionId))
    
  else setCurrentUserToUserSession(null)
  }, [userToUserChatSessions, userToUserSessionId])
  const isDisabled = isAI? 
    (currentAiSession!=null && (currentAiSession?.endAt!=undefined && currentAiSession?.endAt!=null))
    : (currentUserToUserSession == null?  otherUserId === null : (otherUserId === null || currentUserToUserSession.isDeleted))

  const messageBlock =otherUserData!=null ? (currentUserToUserSession?.userIdWhoDeleted==user?.id ? dictionary.YouBlockedThisConversation : `${otherUserData?.firstName} ${otherUserData?.lastName} ${dictionary.OtherUserBlocked }`) : null

  const serviceCreatedMessage =(isAI && currentAiSession!=null && (currentAiSession?.endAt!=undefined && currentAiSession?.endAt!=null) && currentAiSession?.activeStep===5)
  ? dictionary.serviceRequestCreatedMessage
  : null

  const SessionEndedMessage =(isAI && currentAiSession!=null && (currentAiSession?.endAt!=undefined && currentAiSession?.endAt!=null) && currentAiSession?.activeStep===4)
  ? dictionary.SessionEnded
  : null

  const addFakeMessage = (file, messageType) => {
  const tempId = crypto.randomUUID(); 
  const tempMessage = {
    id: tempId,
    content: URL.createObjectURL(file),
    fileName: file.name,
    type: messageType,
    userId: user.id,
    timestamp: new Date().toISOString(),
    isTemp: true,
  };

  setUserToUserMessages(prev => [...prev, tempMessage]);
  return tempId;
};

const removeFakeMessage = (tempId) => {
  setUserToUserMessages(prev => prev.filter(m => m.id !== tempId));
};

  const ALLOWED_FILE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'video/mp4',
    'audio/mpeg',
    'video/webm',
    'audio/webm',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ]

  const MAX_FILE_SIZE_MB = 50

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`
    }
  }, [input])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target) &&
        showEmojiPicker
      ) {
        setShowEmojiPicker(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showEmojiPicker])

  const handleInputChange = (e) => {
    setInput(e.target.value)
    if (otherUserId && !isAI) {
      handleTyping(otherUserId)
    }
  }
  const toggleEmojiPicker = () => setShowEmojiPicker((prev) => !prev)
  const handleFileChange = (e) => {
    setErroruserMessage(null)
    const newFiles = Array.from(e.target.files)
    const validFiles = []
    let hasInvalid = false

    for (const file of newFiles) {
      const isValidType = ALLOWED_FILE_TYPES.includes(file.type)
      const isValidSize = file.size <= MAX_FILE_SIZE_MB * 1024 * 1024
      if (!isValidType) {
        hasInvalid = true
        setErroruserMessage(dictionary.invalidFileType + ' ' + file.name)
        break
      }
      if (!isValidSize) {
        hasInvalid = true
        setErroruserMessage(dictionary.fileTooLarge + ' ' + file.name)
        break
      }
      validFiles.push(file)
    }

    if (!hasInvalid) {
      setUploadedFiles((prev) => [...prev, ...validFiles])
      if (otherUserId && !isAI) {
        handleTyping(otherUserId)
      }
      setErroruserMessage(null)
    }
    e.target.value = null
  }

  const removeFile = (index) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }
  const formatTime = (seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, '0')
    const s = String(seconds % 60).padStart(2, '0')
    return `${m}:${s}`
  }
  const startRecording = () => {
    setRecording(true)
    if (otherUserId && !isAI) {
      handleTyping(otherUserId)
    }
  }
  const stopRecording = () => setRecording(false)
  const onStop = (recordedBlob) => {
    const audioFile = new File(
      [recordedBlob.blob],
      `voice-${Date.now()}.webm`,
      {
        type: 'audio/webm',
      }
    )
    setUploadedFiles((prev) => [...prev, ...[audioFile]])
  }
  const handleEmojiClick = (emojiData) => {
    setInput((prev) => prev + emojiData.emoji)
  }
  const handleSend = async () => {
    if (!input.trim() && uploadedFiles.length === 0) return

    if (isAI) {
      setIsTyping(true)
      setInput('')
      await sendMessage(input)
      setIsTyping(false)
    } else {
      if (otherUserId != null) {
        if (input.trim()) {
          setSending(true)
          setInput('')
          await sendUserToUserMessage(input, 'text', otherUserId, null)
          setSending(false)
        }

        if (uploadedFiles.length > 0) {
          setShowFiles(false)
          for (const file of uploadedFiles) {
            if (file.size > 50 * 1024 * 1024) {
              console.warn(
                `Le fichier "${file.name}" dépasse la limite de 50 Mo et ne sera pas envoyé.`
              )
              continue
            }

            const fileType = file.type

            let messageType = 'file'

            if (fileType.startsWith('image/')) {
              messageType = 'image'
            } else if (fileType === 'application/pdf') {
              messageType = 'pdf'
            } else if (
              fileType ===
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
              fileType === 'application/vnd.ms-excel'
            ) {
              messageType = 'xlsx'
            } else if (fileType.startsWith('audio/')) {
              messageType = 'audio'
            } else if (fileType.startsWith('webm/')) {
              messageType = 'audio'
            } else if (fileType.startsWith('video/')) {
              messageType = 'video'
            }
            const tempId = addFakeMessage(file, messageType);
            let fileUrl = ''
            let fileName = ''
            const formData = new FormData()
            formData.append('file', file)
            setSending(true)
            const response = await axiosInstance.post(
              `/chat/api/chat/UserToUser/upload`,
              formData
            )
            if (response.status === 200 && response.data) {
              fileUrl = response.data.presignedUrl
              fileName = response.data.objectName
              await sendUserToUserMessage(
                fileUrl,
                messageType,
                otherUserId,
                fileName
              )
              removeFakeMessage(tempId);
            }
            setSending(false)
          }
        }
      }
    }
    setInput('')
    setUploadedFiles([])
    setShowFiles(true)
  }

  useEffect(() => {
    let timer
    if (recording) {
      timer = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } else {
      setRecordingTime(0)
    }
    return () => clearInterval(timer)
  }, [recording])
  return (
    <Box
      px={2}
      py={1}
      sx={{
        backgroundColor: isDark ? '#242424' : '#f4f5f5',
        position: 'relative',
      }}
    >
      {erroruserMessage && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            border: '1px solid #f44336',
            borderRadius: 2,
            backgroundColor: 'transparent',
            p: 2,
            mt: 2,
            mb: 2,
          }}
        >
          <WarningAmber sx={{ color: '#f44336', mr: 1 }} />
          <Typography
            color="error"
            variant="body2"
            sx={{ flex: 1, textAlign: 'center' }}
          >
            {erroruserMessage}
          </Typography>
        </Box>
      )}
      {sending && (
        <div
          style={{
            alignSelf: 'flex-start',
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'row',
            gap: '0.5rem',
            padding: '0.5rem',
            borderRadius: '12px',
            maxWidth: '90%',
          }}
        >
          <span style={{ fontSize: '0.9rem' }}>{dictionary.Sending}</span>
          <ThreeDot size="small" color={isDark ? 'white' : 'black'} />
        </div>
      )}
      {!isAI && uploadedFiles.length > 0 && showFiles && (
        <Box display="flex" flexWrap="wrap" gap={1} mb={1}>
          {uploadedFiles.map((file, index) => (
            <Chip
              key={file.name}
              label={file.name}
              onDelete={() => removeFile(index)}
              deleteIcon={<CloseIcon />}
            />
          ))}
        </Box>
      )}
      {recording && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#e0f0ff',
            borderRadius: '20px',
            marginLeft: 10,
            animation: 'slideIn 0.3s ease-out',
          }}
        >
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: '50%',
              backgroundColor: 'red',
              animation: 'pulse 1s infinite',
            }}
          />
          <MicIcon style={{ color: '#4286f4' }} />
          <span style={{ fontWeight: '500', color: '#242424' }}>
            {formatTime(recordingTime)}
          </span>
        </div>
      )}
      {showEmojiPicker && (
        <Box
          ref={emojiPickerRef}
          sx={{
            position: 'absolute',
            bottom: '60px',
            left: '20px',
            zIndex: 10,
          }}
        >
          <EmojiPicker onEmojiClick={handleEmojiClick} height={300} />
        </Box>
      )}
        {(currentUserToUserSession != null && currentUserToUserSession.isDeleted) && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              border: `1px solid ${user.organization.primaryColor}`,
              borderRadius: 2,
              backgroundColor: 'transparent',
              p: 1,
              mb: 1,
            }}
          >
            <InfoIcon sx={{ color: user.organization.primaryColor, mr: 1 }} />
            <Typography
              variant="body2"
              sx={{ flex: 1, textAlign: 'center', color:user.organization.primaryColor }}
            >
              {messageBlock}
            </Typography>
          </Box>
        )}
        {(serviceCreatedMessage != null) && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              border: `1px solid ${user.organization.primaryColor}`,
              borderRadius: 2,
              backgroundColor: 'transparent',
              p: 1,
              mb: 1,
            }}
          >
            <InfoIcon sx={{ color: user.organization.primaryColor, mr: 1 }} />
            <Typography
              variant="body2"
              sx={{ flex: 1, textAlign: 'center', color:user.organization.primaryColor }}
            >
              {serviceCreatedMessage}
            </Typography>
          </Box>
        )}
        {(SessionEndedMessage != null) && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              border: `1px solid ${user.organization.primaryColor}`,
              borderRadius: 2,
              backgroundColor: 'transparent',
              p: 1,
              mb: 1,
            }}
          >
            <InfoIcon sx={{ color: user.organization.primaryColor, mr: 1 }} />
            <Typography
              variant="body2"
              sx={{ flex: 1, textAlign: 'center', color:user.organization.primaryColor }}
            >
              {SessionEndedMessage}
            </Typography>
          </Box>
        )}
      <Box
        display="flex"
        alignItems="center"
        gap={1}
        borderRadius="25px"
        border={1}
        borderColor="#ccc"
        px={2}
        py={1}
         sx={{
          opacity: isDisabled ? 0.5 : 1,
          pointerEvents: isDisabled ? 'none' : 'auto',
        }}
      >
        <InputBase
          disabled={isDisabled}
          ref={inputRef}
          value={input}
          onChange={handleInputChange}
          placeholder={dictionary.TypeMessageInput}
          multiline
          fullWidth
          sx={{ maxHeight: '100px', overflow: 'auto' }}
        />
         <Tooltip title="Emojis">
          <span>
            <IconButton onClick={toggleEmojiPicker} disabled={isDisabled}>
              <InsertEmoticonIcon />
            </IconButton>
          </span>
        </Tooltip>
        {!isAI && (
          <Tooltip title="Upload File">
            <label htmlFor="file-upload">
              <IconButton component="span" disabled={isDisabled}>
                {uploadedFiles.length > 0 ? <AddIcon /> : <AttachFileIcon />}
              </IconButton>
              <input
                id="file-upload"
                type="file"
                hidden
                multiple
                onChange={handleFileChange}
              />
            </label>
          </Tooltip>
        )}
        {!isAI && (
          <Tooltip title="Voice Message">
            <IconButton
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              disabled={isDisabled}
              sx={{ color: recording ? 'red' : 'inherit' }}
            >
              <MicIcon />
            </IconButton>
          </Tooltip>
        )}
        <ReactMic
          record={recording}
          onStop={onStop}
          mimeType="audio/webm"
          strokeColor="#000000"
          backgroundColor="#ffffff"
          className="d-none"
        />
        {(input.trim() !== '' || uploadedFiles.length > 0) && (
          <Tooltip title="Send">
            <span>
              <IconButton
                onClick={handleSend}
                disabled={isDisabled}
                sx={{
                  bgcolor: user.organization.primaryColor,
                  color: isDark ? '#242424' : '#FEFFFE',
                }}
              >
                <SendIcon />
              </IconButton>
            </span>
          </Tooltip>
        )}
      </Box>
    </Box>
  )
}

ChatInput.propTypes = {
    isAI: PropTypes.bool,
    setIsTyping: PropTypes.func,
    otherUserId: PropTypes.string,
    otherUserData: PropTypes.object
  }

export default ChatInput
