import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import PropTypes from 'prop-types'
import { Box, Slide } from '@mui/material'
import OrganisationService from '../../services/OrganisationService'
import { useLanguage } from '../../hooks/LanguageContext'
import Button from '../ui/Button'

const StripeCheckoutButton = ({ amount, name, id, type }) => {
  const { toggleLoader } = useOutletContext()
  const { defaultLang, dictionary } = useLanguage()
  const [show, setShow] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => setShow(true), 100)
    return () => clearTimeout(timeout)
  }, [])

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

  const handleCheckout = async () => {
    toggleLoader(true)
    try {
      const request={
        amount,
        name,
        currency,
        orderId: id,
        type
      }
      const response = await OrganisationService.paymentStripe(request)

      if (response?.url) {
        window.location.href = response.url
      } else {
        alert(dictionary.PaymentFailed || 'Stripe checkout failed.')
      }
    } catch (error) {
      console.error('Stripe checkout error:', error)
      alert(dictionary.UnexpectedError || 'An error occurred during Stripe checkout.')
    } finally {
      toggleLoader(false)
    }
  }

  return (
    <Slide direction="up" in={show} mountOnEnter unmountOnExit timeout={400}>
      <Box>
        <Button onClick={handleCheckout} variant="outlined primary">
          {dictionary.PayWithStripe || 'Pay with Stripe'}
        </Button>
      </Box>
    </Slide>
  )
}

StripeCheckoutButton.propTypes = {
  amount: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  id: PropTypes.number.isRequired,
  type: PropTypes.string.isRequired
}

export default StripeCheckoutButton
