import React, { createContext, useState, useContext, useEffect } from 'react'
import PropTypes from 'prop-types'
import en from '../locales/en.json'
import fr from '../locales/fr.json'
import de from '../locales/de.json'

const translations = { en, fr, de }
const languageToCurrency = {
  fr: '€',
  en: '$',
  de: '€'
};

const LanguageContext = createContext()

export const LanguageProvider = ({ children }) => {
  const defaultLang = localStorage.getItem('lang') || 'en'
  const [language, setLanguage] = useState(defaultLang)
  const [currency , setCurrency ] = useState(languageToCurrency[language] || '$')
  const [dictionary, setDictionary] = useState(translations[defaultLang])

  useEffect(() => {
    setDictionary(translations[language])
  }, [language])

  const changeLanguage = (langCode) => {
    if (translations[langCode]) {
      setLanguage(langCode)
      localStorage.setItem('lang', langCode)
      setCurrency(languageToCurrency[langCode])
    }
  }

  const contextValue = React.useMemo(
    () => ({ language, dictionary, defaultLang, currency, changeLanguage }),
    [language, dictionary, defaultLang, currency]
  )

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  )
}

LanguageProvider.propTypes = {
  children: PropTypes.node.isRequired,
}
export const useLanguage = () => useContext(LanguageContext)
