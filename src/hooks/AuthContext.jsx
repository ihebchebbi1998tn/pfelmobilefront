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
      // For localStorage-only app, just check if token exists
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token')
      if (token) {
        setIsAuthenticated(true)
      } else {
        setIsAuthenticated(false)
        setUser(null)
      }
    } catch (error) {
      setAuthError('Token refresh failed')
      setIsAuthenticated(false)
      setUser(null)
    }
  }, [])

  const fetchUser = useCallback(async () => {
    try {
      setAuthError(null)
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token')
      
      if (token) {
        // Mock user data for admin
        const userData = {
          id: '1',
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@lmobile.com',
          phoneNumber: '+1234567890',
          address: null,
          permissions: ['Permissions.AllowAll'],
          defaultLanguage: 'en',
          imageUrl: null,
          imageName: null,
          clientOrganization: {
            id: '1',
            name: 'L-Mobile',
            description: 'Main organization',
            isActive: true,
            primaryColor: '#1976d2',
            logoUrl: '/logo.svg'
          }
        }
        
        setUser({
          id: userData.id,
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          phoneNumber: userData.phoneNumber,
          address: userData.address,
          permissions: userData.permissions || [],
          defaultLanguage: userData.defaultLanguage,
          organization: userData.clientOrganization,
          imageUrl: userData.imageUrl,
          imageName: userData.imageName,
        })
        setIsAuthenticated(true)
        localStorage.setItem('lang', userData.defaultLanguage)
      } else {
        setIsAuthenticated(false)
        setUser(null)
      }
    } catch (err) {
      setAuthError('Failed to get user information')
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
