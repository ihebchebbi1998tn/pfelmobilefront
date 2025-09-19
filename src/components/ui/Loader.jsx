import PropTypes from 'prop-types'
import '../../styles/ui.scss'
import { useTheme } from '@mui/material'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import loaderLightAnimation from '../../assets/animation/loaderlight.lottie'
import loaderBlackAnimation from '../../assets/animation/loaderblack.lottie'

const Loader = ({ loading }) => {
  if (!loading) return null
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  return (
    <div className="loader-wrapper">
      <DotLottieReact
        src={isDark ? loaderLightAnimation : loaderBlackAnimation}
        loop
        autoplay
        style={{
          width: '100%',
          height: '100%',
          maxWidth: '300px',
          maxHeight: '300px',
        }}
      />
    </div>
  )
}
Loader.propTypes = {
    loading: PropTypes.bool.isRequired,
  }
export default Loader
