import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../hooks/AuthContext'
import { Box } from '@mui/material'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import logo from '../../assets/animation/logo.lottie'
import PropTypes from 'prop-types'

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth()

  const Loader = ({ borderColor }) => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
      }}
    >
      <Box
        sx={{
          width: 150,
          height: 150,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'white',
          border: `3px solid ${borderColor}`,
        }}
      >
        <DotLottieReact
          src={logo}
          loop
          autoplay
          style={{
            width: '77%',
             height: '77%',
             maxWidth: '250px',
             maxHeight: '250px',
          }}
        />
      </Box>
    </Box>
  )

  Loader.propTypes = {
    borderColor: PropTypes.string.isRequired,
  }

  if (loading) {
    return <Loader borderColor="white" />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export default ProtectedRoute
