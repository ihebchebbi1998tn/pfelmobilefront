import {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback
} from 'react'
import OrganisationService from '../services/OrganisationService'
import PropTypes from 'prop-types'

const OrganisationContext = createContext()

export const OrganisationProvider = ({ children }) => {
  const [organisation, setOrganisation] = useState(null)
  const [pageReference, setPageReference] = useState(null)
  const [uiPage, setUiPage] = useState(null)

  const fetchOrganisationData = useCallback(async (reference) => {
    try {
      const data = await OrganisationService.GetOrganizationById()
      if (data) {
        // Mock organization structure for offline mode
        const mockOrganisation = {
          id: '1',
          name: 'L-Mobile',
          description: 'Main organization',
          isActive: true,
          uiPages: [
            {
              id: '1',
              pageReference: reference || 'default',
              title: 'Default Page',
              content: 'Default content'
            }
          ]
        }
        
        setOrganisation(mockOrganisation)
        const pages = Array.isArray(mockOrganisation.uiPages) ? mockOrganisation.uiPages : []
        const page = pages.length > 0 ? (pages.find((p) => p.pageReference === reference) || pages[0]) : null
        if (page) {
          setPageReference(reference || 'default')
          setUiPage(page)
        }
      }
    } catch (e) {
      console.error('Failed to fetch organization data')
    }
  }, [])

  const handleChangePageReference = useCallback((reference) => {
    if (!organisation || !organisation.uiPages || !Array.isArray(organisation.uiPages) || !organisation.uiPages.length) return
    const page = organisation.uiPages.find((p) => p.pageReference === reference)
    if (page) {
      setPageReference(reference)
      setUiPage(page)
    }
  }, [organisation])

  const contextValue = useMemo(
    () => ({
      organisation,
      pageReference,
      uiPage,
      fetchOrganisationData,
      setUiPage,
      handleChangePageReference
    }),
    [organisation, pageReference, uiPage, fetchOrganisationData, handleChangePageReference]
  )

  return (
    <OrganisationContext.Provider value={contextValue}>
      {children}
    </OrganisationContext.Provider>
  )
}

OrganisationProvider.propTypes = {
  children: PropTypes.node.isRequired,
}

export const useOrganisation = () => {
  const context = useContext(OrganisationContext)
  if (!context) {
    throw new Error('useOrganisation must be used within an OrganisationProvider')
  }
  return context
}
