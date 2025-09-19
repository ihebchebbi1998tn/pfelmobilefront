import { Box, Typography } from '@mui/material'
import { motion } from 'framer-motion'
import Modal from '../../ui/Modal'
import { WarningAmber } from '@mui/icons-material'
import PropTypes from 'prop-types'

const ServiceRequestWarnningMessage = ({ open, onClose, message }) => {

 return (
   <Modal
         open={open}
         onClose={onClose}
         showConfirmButton={false}
   >
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
                    borderRadius: 2,
                    backgroundColor: 'transparent',
                    p: 2,
                    mt: 2,
                }}
            >
                <WarningAmber sx={{ color: '#efc158', mr: 1 }} />
                <Typography
                    variant="body2"
                    sx={{ flex: 1, textAlign: 'center', color:'#efc158' }}
                >
                    {message}
                </Typography>
            </Box>
        </motion.div>
   </Modal>
 )
}

ServiceRequestWarnningMessage.propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func,
    message: PropTypes.string,
}

export default ServiceRequestWarnningMessage