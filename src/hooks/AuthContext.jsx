import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react'
import axiosInstance from '../utils/axiosInstance'
import PropTypes from 'prop-types'
import { useLanguage } from './LanguageContext'
import { setAuthContext } from '../utils/authHelper'
import { getDeviceInfo } from '../utils/getDeviceInfo'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [authError, setAuthError] = useState(null)
  const { dictionary } = useLanguage()

  const refreshToken = useCallback(async () => {
    try {
      setAuthError(null)
      await axiosInstance.post(`/user/api/auth/refresh`)
      setIsAuthenticated(true)
    } catch (error) {
      if (error?.response?.data?.message) {
        const message = error.response.data.message
        setAuthError(message)
      } else {
        setAuthError('Unknown error occurred.')
      }
      setIsAuthenticated(false)
      setUser(null)
    }
  }, [])

  const fetchUser = useCallback(async () => {
    try {
      setAuthError(null)
      const { deviceType, operatingSystem, browser } = await getDeviceInfo()

       const params = new URLSearchParams({
        deviceType: deviceType.toString(),
        operatingSystem: operatingSystem.toString(),
        browser: browser.toString()
      })
      const response = await axiosInstance.get(`/user/api/auth/me?${params.toString()}`)

      if (response.data?.id) {
        const data = response.data
        setUser({
          id: data.id,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phoneNumber: data.phoneNumber,
          address: data.address,
          permissions: data.permissions || [],
          defaultLanguage: data.defaultLanguage,
          organization: data.clientOrganization,
          imageUrl: data.imageUrl,
          imageName: data.imageName,
        })
        setIsAuthenticated(true)
        localStorage.setItem('lang', data.defaultLanguage)
      } else {
        setIsAuthenticated(false)
        setUser(null)
      }
    } catch (err) {
      if (err?.response?.data?.message) {
        const message = err.response.data.message
        if (message === 'User not authenticated')
          setAuthError(dictionary.UserNotAuthenticated)
        else if (message === 'User not found')
          setAuthError(dictionary.UserNotFound)
        else if (isAuthenticated) setAuthError(dictionary.GetUserFailed)
      } else if (isAuthenticated) {
        setAuthError(dictionary.GetUserFailed)
      }
    } finally {
      setLoading(false)
    }
  }, [dictionary])

  const contextValue = React.useMemo(
    () => ({
      refreshToken,
      fetchUser,
      authError,
      user,
      isAuthenticated,
      loading,
    }),
    [refreshToken, fetchUser, authError, user, isAuthenticated, loading]
  )

  useEffect(() => {
    setAuthContext(contextValue)
    try {
      const token =
        (typeof window !== 'undefined' &&
          (localStorage.getItem('access_token') ||
            sessionStorage.getItem('access_token')))
      if (token) {
        fetchUser()
      } else {
        setLoading(false)
      }
    } catch {
      setLoading(false)
    }
  }, [fetchUser])
  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  )
}

 AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
  }

export const useAuth = () => useContext(AuthContext)
