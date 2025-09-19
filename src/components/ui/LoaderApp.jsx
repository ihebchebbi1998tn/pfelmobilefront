import { Box } from '@mui/material'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import logo from '../../assets/animation/logo.lottie'
import PropTypes from 'prop-types'

const LoaderApp = ({ loading }) => {
     if (!loading) return null
return(
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
          border: `3px solid white`,
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
}

LoaderApp.propTypes = {
    loading: PropTypes.bool,
}

export default LoaderApp
