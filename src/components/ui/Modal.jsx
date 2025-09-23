import { forwardRef} from 'react'
import PropTypes from 'prop-types'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  useTheme,
  Slide
} from '@mui/material'
import Button from './Button'
import { useLanguage } from '../../hooks/LanguageContext'

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />
})

const Modal = ({
  open,
  title,
  children,
  onClose,
  onConfirm,
  showConfirmButton,
  labelConfirmButton,
  colorModal,
  variant,
}) => {
  const { dictionary } = useLanguage()
  const theme = useTheme()
    const isDark = theme.palette.mode === 'dark'
  return (
    <Dialog
    TransitionComponent={Transition}  
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        sx: {
          width: 'fit-content',
          maxWidth: '90vw', 
        },
      }}
    >
      <Box
        sx={{
          background: colorModal || '',
           overflowY: 'auto',
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
        <DialogTitle>{title}</DialogTitle>
        <DialogContent aria-describedby="modal-content-description">{children}</DialogContent>
        <DialogActions>
          <Button onClick={onClose} variant={'outlined secondary'}>
            {dictionary?.close || 'Close'}
          </Button>
          {showConfirmButton && (
            <Button onClick={onConfirm} variant={variant || 'primary'}>
              {labelConfirmButton || dictionary?.confirm || 'Confirm'}
            </Button>
          )}
        </DialogActions>
      </Box>
    </Dialog>
  )
}

Modal.propTypes = {
    open: PropTypes.bool.isRequired,
    title: PropTypes.string.isRequired,
    children: PropTypes.node,
    onClose: PropTypes.func.isRequired,
    showConfirmButton: PropTypes.bool,
    labelConfirmButton: PropTypes.string,
    colorModal: PropTypes.string,
    onConfirm: PropTypes.func,
    variant: PropTypes.string,
  }

export default Modal
