import { useState, useEffect } from 'react'
import Joyride from 'react-joyride'
import { useAuth } from '../../../hooks/AuthContext'

import PropTypes from 'prop-types'

const Tutorial = ({open, onClose, steps, beaconSize}) => {
  const [run, setRun] = useState(false)
  const { user } = useAuth() 
  
    const handleClose = () => {
        setRun(false)
        onClose()
    }
   useEffect(() => {
    if (open) {
      setRun(true)
    }
   }, [open])
 return(
    <Joyride
        steps={steps}
        run={run}
        continuous
        showSkipButton
        showProgress
        styles={{
          beacon: {
            width:beaconSize,
            height:beaconSize
          },
          options: {
            arrowColor: '#ffffff',
            backgroundColor: '#ffffff',
             overlayColor: 'rgba(0, 0, 0, 0.4)',
            primaryColor: user?.organization?.secondaryColor || '#4286f4',
            width: 900,
            zIndex: 1300,
          },
        overlay: {
            backdropFilter: 'blur(1px)',       
            WebkitBackdropFilter: 'blur(1px)',   
        },
        spotlight: {
            borderRadius: 8,                     
            boxShadow: '0 0 0 3px rgba(255,255,255,0.9)', 
        },
    }}
        
        callback={(data) => {
          const { status } = data
          const finished = ['finished', 'skipped'].includes(status)
          if (finished) handleClose()
        }}
      />
 )
}
Tutorial.propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func,
    steps:PropTypes.array,
    beaconSize:PropTypes.number
}
export default Tutorial