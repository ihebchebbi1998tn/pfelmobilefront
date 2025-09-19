import { useEffect, useState } from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useLanguage } from '../../hooks/LanguageContext'
import PropTypes from 'prop-types'
import { Box, Typography } from '@mui/material'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

const DEFAULT_POSITION = { lat: 36.450644, lng: 10.751034 }

function LocationHandler({ onSelect }) {
  const map = useMap()
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng
      let locationDetails = { lat, lng }

      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
        )
        const data = await res.json()
        const address = data.address || {}

        locationDetails = {
          ...locationDetails,
          street: address.road || '',
          city: address.city || address.town || address.village || '',
          state: address.state || '',
          zipCode: address.postcode || '',
          country: address.country || '',
        }
      } catch (error) {
        console.error('Failed to fetch location info:', error)
      }

      if (onSelect) onSelect(locationDetails)
      map.setView([lat, lng], map.getZoom())
    },
  })

  return null
}

LocationHandler.propTypes = {
  onSelect: PropTypes.func,
}

const MapSelector = ({ onLocationChange, initialCoords, className }) => {
  const [position, setPosition] = useState(null)
  const { dictionary } = useLanguage()

 useEffect(() => {
  const updatePosition = (coords) => {
    setPosition(coords)
    if (onLocationChange) {
      onLocationChange(coords)
    }
  }

  if (
    initialCoords?.lat &&
    initialCoords?.lng &&
    (position?.lat !== initialCoords.lat || position?.lng !== initialCoords.lng)
  ) {
    updatePosition(initialCoords)
  } else if (!position) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }
        updatePosition(coords)
      },
      () => {
        updatePosition(DEFAULT_POSITION)
      }
    )
  }
}, [initialCoords])



  const handleSelect = (coords) => {
    setPosition(coords)
    if (onLocationChange) onLocationChange(coords)
  }

  if (!position) return <p>{dictionary.LoadingMap}</p>

  return (
    <Box position="relative" className={className}>
      {position?.lat && (
        <Box
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            backgroundColor: 'rgba(255,255,255,0.9)',
            padding: 1,
            borderRadius: 1,
            zIndex: 1000,
            boxShadow: 1,
            maxWidth: '60%',
          }}
        >
          <Typography variant="caption" color="black">
            <strong>Lat:</strong> {position.lat.toFixed(5)} <br />
            <strong>Lng:</strong> {position.lng.toFixed(5)} <br />
          </Typography>
        </Box>
      )}

      <MapContainer
        center={[position.lat, position.lng]}
        zoom={13}
        scrollWheelZoom
        style={{
          height: '400px',
          width: '100%',
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid #e0e0e0',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
          transition: 'transform 0.3s ease',
        }}
        className="custom-map-container"
        >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={[position.lat, position.lng]} />
        <LocationHandler onSelect={handleSelect} />
      </MapContainer>
    </Box>
  )
}

MapSelector.propTypes = {
  onLocationChange: PropTypes.func,
  initialCoords: PropTypes.object,
  className: PropTypes.string
}

export default MapSelector
