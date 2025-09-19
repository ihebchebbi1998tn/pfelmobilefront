import { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { useOutletContext } from 'react-router-dom'
import { Box, Typography, Slide } from '@mui/material'
import Button from '../ui/Button'
import OrganisationService from '../../services/OrganisationService'
import { useLanguage } from '../../hooks/LanguageContext'

const SquareCheckoutButton = ({ amount, name, id, type  }) => {
  const cardRef = useRef(null)
  const [card, setCard] = useState(null)
  const { toggleLoader } = useOutletContext()
  const { defaultLang, dictionary } = useLanguage()
  const [show, setShow] = useState(false)

  const appId = import.meta.env.VITE_SQUARE_APP_ID
  const locationId = import.meta.env.VITE_SQUARE_LOCATION_ID

  const getCurrencyFromLang = (lang) => {
    switch (lang) {
      case 'en':
        return 'USD'
      case 'fr':
      case 'de':
        return 'EUR'
      default:
        return 'EUR'
    }
  }

  const currency = getCurrencyFromLang(defaultLang)
 useEffect(() => {
    const timeout = setTimeout(() => setShow(true), 100)
    return () => clearTimeout(timeout)
  }, [])
  useEffect(() => {
    const initSquare = async () => {
      try {
        if (!window.Square) {
          console.error('Square.js not loaded')
          return
        }
       

        const payments = window.Square.payments(appId, locationId)
        const card = await payments.card()

        const alreadyAttached = cardRef.current?.querySelector('iframe')
        if (alreadyAttached) {
          return
        }

        await card.attach(cardRef.current)
        setCard(card)
      } catch (error) {
        console.error('Square initialization failed:', error)
      }
    }

    initSquare()

    return () => {

      if (cardRef.current) {
        cardRef.current.innerHTML = ''
      }
    }
  }, [appId, locationId])

  const handlePayment = async () => {
    if (!card) return

    toggleLoader(true)

    try {
      const result = await card.tokenize()

      if (result.status === 'OK') {
        const response = await OrganisationService.paymentSquare({
          sourceId: result.token,
          amount,
          currency,
        })

        if (response.status === 200) {
          const date = new Date().toLocaleString('fr-FR')
          window.location.href = `/payment-success?solution=square&amount=${amount}&date=${encodeURIComponent(date)}&id=${encodeURIComponent(id)}&type=${encodeURIComponent(
            type
          )}`
        } else {
          alert(dictionary.PaymentFailed || 'Payment failed.')
        }
      } else {
        alert(result.errors?.[0]?.message || dictionary.CardTokenizationFailed || 'Failed to tokenize card.')
      }
    } catch (err) {
      console.error('Payment failed:', err)
      alert(dictionary.UnexpectedError || 'An unexpected error occurred.')
    } finally {
      toggleLoader(false)
    }
  }

  return (
    <Slide direction="up" in={show} mountOnEnter unmountOnExit timeout={400}>
      <Box>
        <Box sx={{ mb: 2 }}>
          <Typography fontWeight="bold" fontSize="1.1rem" sx={{mb:0.5}}>
            {name} 
          </Typography>
          <Typography fontWeight="bold" fontSize="1.1rem">
            {currency} {amount.toFixed(2)}
          </Typography>
        </Box>
        <div ref={cardRef} style={{ marginBottom: 3 }} />
        <Button onClick={handlePayment} dis={!card} variant={"outlined primary"}>
          {dictionary.PayWithSquare}
        </Button>
      </Box>
    </Slide>
  )
}

SquareCheckoutButton.propTypes = {
  amount: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  id: PropTypes.number.isRequired,
  type: PropTypes.string.isRequired,
}

export default SquareCheckoutButton
