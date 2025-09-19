import { forwardRef } from 'react'
import PropTypes from 'prop-types'
import {
  Grid,
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  Slide,
  useTheme
} from '@mui/material'
import { useLanguage } from '../../../hooks/LanguageContext'
import MapSelector from '../../ui/MapSelector'

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />
})

const OrganisationDetails = ({ open, onClose, organisation }) => {
  const { dictionary } = useLanguage()
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const renderOrganisationColors = (org) => (
    <Grid container spacing={2} mt={1}>
      {[
        ['primaryColor', dictionary.PrimaryColor],
        ['secondaryColor', dictionary.SecondaryColor]
      ].map(([key, label]) => (
        <Grid item xs={6} sm={3} key={key}>
          <Box display="flex" alignItems="center" gap={1}>
            <Box
              sx={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                backgroundColor: org[key],
                border: '1px solid #ccc',
              }}
            />
            <Typography variant="caption">{label}</Typography>
          </Box>
        </Grid>
      ))}
    </Grid>
  )

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      TransitionComponent={Transition}
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: 'visible'
        }
      }}
      aria-labelledby="organisation-details-title"
    >
      <DialogTitle id="organisation-details-title">
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {organisation?.name}
          </Typography>
          {organisation?.logoUrl && (
            <img
              src={organisation.logoUrl}
              alt="logo"
              style={{ width: 64, height: 55, borderRadius: 6, marginLeft: 8 }}
            />
          )}
        </Box>
      </DialogTitle>

      <DialogContent dividers
        sx={{
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
        {organisation?.emailOrganisation && (
          <Typography variant="body2" gutterBottom>
            📧 {organisation.emailOrganisation}
          </Typography>
        )}

        {organisation?.description && (
          <Box>
             <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                {dictionary.OrganisationDetails} :
            </Typography>
            <Typography variant="body1" sx={{ mt: 1 }}>
                {organisation.description}
            </Typography>
          </Box>
        )}

        <Typography variant="body2" sx={{ mt: 2, fontWeight: 'bold' }}>
          {dictionary.TotalUsers}: {organisation?.totalUsers ?? 0}
        </Typography>
        <Typography variant="body2" sx={{ mt: 2, mb:2, fontWeight: 'bold' }}>
          {dictionary.OnlinePaymentSolutions}: {organisation?.onlinePaymentSolutions ?? dictionary.None}
        </Typography>
        {(organisation?.latitude && organisation?.longitude) &&
            <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontWeight: 'bold', mb: 1 }}>
                    {dictionary.OrganisationAddress} :
                </Typography>
                <MapSelector
                    initialCoords={{
                    lat: organisation?.latitude,
                    lng: organisation?.longitude,
                    }}
                />
            </Box>
        }
        <Box sx={{ mt: 2 }}>
          {organisation && renderOrganisationColors(organisation)}
        </Box>
      </DialogContent>
    </Dialog>
  )
}

OrganisationDetails.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  organisation: PropTypes.object
}

export default OrganisationDetails
