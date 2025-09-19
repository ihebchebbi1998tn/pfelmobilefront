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
        setOrganisation(data.organization)
        const pages = data.organization?.uiPages || []
        const page = pages.find((p) => p.pageReference === reference)
        if (page) {
          setPageReference(reference)
          setUiPage(page)
        }
      }
    } catch (e) {
      console.error(e?.response?.data?.message)
    }
  }, [])

  const handleChangePageReference = useCallback((reference) => {
    if (!organisation || !organisation.uiPages?.length) return
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

export const useOrganisation = () => useContext(OrganisationContext)
