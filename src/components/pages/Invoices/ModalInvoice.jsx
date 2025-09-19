import { Box, Typography } from '@mui/material'
import Modal from '../../ui/Modal'
import Button from '../../ui/Button'
import { useLanguage } from '../../../hooks/LanguageContext'
import PropTypes from 'prop-types'

const ModalInvoice = ({ open, onClose, file }) => {
  const { dictionary } = useLanguage()
   const url = URL.createObjectURL(file)

 return (
  <Modal
      open={open}
      onClose={onClose}
      showConfirmButton={false}
      className="custom-modal"
  >
     <Box sx={{ width: { xs: '300px', sm: '400px', md: '500px', lg: '800px' } }}>
        <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
        >
            <Typography
              variant="h3"
              sx={{fontWeight: 'bold'}}
            >
              {dictionary.Invoice}
            </Typography>
        </Box>
        <Box
        sx={{
          width: '80%',
          height: '100%',
          backgroundColor: 'white',
          margin: 'auto',
          marginTop: '5vh',
          padding: 2,
          position: 'relative',
        }}
      >
        {url && (
          <>
            <iframe
              src={url}
              title="Facture PDF"
              width="100%"
              height="90%"
              style={{ border: 'none' }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: 1 }}>
              <Button variant="primary" onClick={() => window.open(url, '_blank')}>
                {dictionary.Download}
              </Button>
              <Button variant="secondary" onClick={onClose}>{dictionary.close}</Button>
            </Box>
          </>
        )}
      </Box>
     </Box>
  </Modal>
 )
}
  ModalInvoice.propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func,
    file: PropTypes.instanceOf(Blob),
  }
export default ModalInvoice