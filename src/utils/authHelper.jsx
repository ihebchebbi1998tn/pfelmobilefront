let authContext = null

export const setAuthContext = (context) => {
  authContext = context
}

export const getAuthContext = () => {
  if (!authContext) {
    console.error('AuthContext is not set yet')
    throw new Error('AuthContext is not set yet')
  }
  return authContext
}
