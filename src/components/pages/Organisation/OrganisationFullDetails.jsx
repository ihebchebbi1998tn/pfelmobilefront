import PropTypes from 'prop-types'
import {
  Box,
  Typography,
  Grid,
  useTheme,
  Paper,
  useMediaQuery
} from '@mui/material'
import { useLanguage } from '../../../hooks/LanguageContext'
import Button from '../../ui/Button'
import MapSelector from '../../ui/MapSelector'

const OrganisationFullDetails = ({ organisation, onUpdate, canUpdate, hasAllAccess, totalUsers }) => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'))
  const { dictionary } = useLanguage()

  const renderOrganisationColors = (org) => (
    <Grid container spacing={2} mt={1}>
      {[
        ['primaryColor', dictionary.PrimaryColor],
        ['secondaryColor', dictionary.SecondaryColor],
      ].map(([key, label]) => (
        <Grid item xs={6} key={key}>
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
    <Box sx={{ display: 'flex', flexDirection: isSmallScreen ? 'column' : 'row', gap: 3 }}>
      <Paper
        sx={{
          p: 3,
          borderRadius: 3,
          width: isSmallScreen ? '100%' : '200px',
          backgroundColor: isDark ? "#18141c" : "#ffffff",
          height: '100%',
          flexShrink: 0
        }}
      >
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
          {organisation?.logoUrl && (
            <Box
                sx={{
                width: 128,
                height: 128,
                borderRadius: '50%',
                overflow: 'hidden',
                boxShadow: isDark
                    ? '0 4px 12px rgba(255, 255, 255, 0.5)'
                    : '0 4px 12px rgba(0, 0, 0, 0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'transaprent', 
                }}
            >
                <img
                src={organisation.logoUrl}
                alt="logo"
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                }}
                />
            </Box>
            )}


          {organisation?.emailOrganisation && (
            <Typography variant="body2" textAlign="center">
              📧 {organisation.emailOrganisation}
            </Typography>
          )}

          <Box mt={2}>{renderOrganisationColors(organisation)}</Box>
        </Box>
      </Paper>

      <Paper
        sx={{
          p: 3,
          borderRadius: 3,
          flexGrow: 1,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: isDark ? '#18141c' : '#ffffff',
        }}
      >
        <Box>
          <Typography variant="h5" gutterBottom>
            {organisation?.name}
          </Typography>

         {canUpdate &&
          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
            👤 {dictionary.TotalUsers}: {totalUsers ?? 0}
          </Typography>
         }
         {canUpdate &&
          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
            💸 {dictionary.OnlinePaymentSolutions}: {organisation?.onlinePaymentSolutions ?? dictionary.None}
          </Typography>
         }
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

          {(organisation?.latitude && organisation?.longitude) && (
            <Box sx={{ mt: 3 }}>
              <Typography sx={{ fontWeight: 'bold', mb: 1 }}>
                {dictionary.OrganisationAddress} :
              </Typography>
              <MapSelector
                initialCoords={{
                  lat: organisation.latitude,
                  lng: organisation.longitude,
                }}
              />
            </Box>
          )}
        </Box>

        {(hasAllAccess || canUpdate) && (
          <Box mt={3} display="flex" gap={2}>
            {canUpdate && (
              <Button
                variant={ 'outlined primary' }
                onClick={onUpdate}
              >
                {dictionary.Update}
              </Button>
            )}
          </Box>
        )}
      </Paper>
    </Box>
  )
}

OrganisationFullDetails.propTypes = {
  organisation: PropTypes.object,
  onUpdate: PropTypes.func,
  canUpdate: PropTypes.bool,
  hasAllAccess: PropTypes.bool,
  totalUsers: PropTypes.number
}

export default OrganisationFullDetails
