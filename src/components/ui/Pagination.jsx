import { Box, IconButton, Typography } from '@mui/material'
import { ArrowBackIos, ArrowForwardIos } from '@mui/icons-material'
import { useLanguage } from '../../hooks/LanguageContext'
import { motion } from 'framer-motion'
import PropTypes from 'prop-types'

const Pagination = ({ currentPage, totalPages, onNext, onPrevious }) => {
  const { dictionary } = useLanguage()
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <Box display="flex" justifyContent="center" alignItems="center" gap={2} mt={2}>
        <IconButton onClick={onPrevious} disabled={currentPage === 1}>
          <ArrowBackIos fontSize="small" />
        </IconButton>
        <Typography variant="body2">
          {dictionary.Page} {currentPage} / {totalPages}
        </Typography>
        <IconButton onClick={onNext} disabled={currentPage === totalPages}>
          <ArrowForwardIos fontSize="small" />
        </IconButton>
      </Box>
    </motion.div>
  )
}

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onNext: PropTypes.func.isRequired,
  onPrevious: PropTypes.func.isRequired,
}

export default Pagination