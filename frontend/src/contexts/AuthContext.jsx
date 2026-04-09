import React, { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../utils/api'
import SoundManager from '../utils/SoundManager'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showAuthModal, setShowAuthModal] = useState(true) // Show on first load
  const [authMode, setAuthMode] = useState('login') // 'login' | 'signup'

  useEffect(() => {
    // 1. Detect token in URL (OAuth Callback)
    const urlParams = new URLSearchParams(window.location.search)
    const urlToken = urlParams.get('token')
    
    if (urlToken) {
      console.log('[AuthContext] Token detected in URL:', urlToken.substring(0, 10) + '...')
      localStorage.setItem('authToken', urlToken)
      
      // We wait for user interaction in the App component gate to play audio
      setShowAuthModal(false)
      setLoading(false)
      
      window.history.replaceState({}, document.title, window.location.pathname)
      if (window.location.pathname.includes('/auth/callback')) {
        console.log('[AuthContext] Login detected. Transitioning to dashboard instantly...');
      }
    }

    // 2. Validate existing token
    const token = localStorage.getItem('authToken')
    if (token) {
      console.log('[AuthContext] Validating persistent token...')
      authAPI.validate().then(response => {
        console.log('[AuthContext] Session valid. User:', response.data.email)
        setUser(response.data)
        setShowAuthModal(false)
      }).catch(err => {
        console.error('[AuthContext] Token validation failed:', err.response?.data?.detail || err.message)
        localStorage.removeItem('authToken')
      }).finally(() => {
        setLoading(false)
      })
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (credentials) => {
    const response = await authAPI.login(credentials)
    localStorage.setItem('authToken', response.data.token)
    setUser(response.data.user)
    setShowAuthModal(false)
    return response.data.user
  }

  const signup = async (userData) => {
    const response = await authAPI.signup(userData)
    localStorage.setItem('authToken', response.data.token)
    setUser(response.data.user)
    setShowAuthModal(false)
    return response.data.user
  }

  const googleMockLogin = async () => {
    const response = await authAPI.googleMock({
      name: 'Google User',
      email: `google.user.${Date.now()}@example.com`,
    })
    localStorage.setItem('authToken', response.data.token)
    setUser(response.data.user)
    setShowAuthModal(false)
    return response.data.user
  }

  const logout = () => {
    localStorage.removeItem('authToken')
    setUser(null)
    setShowAuthModal(true)
  }

  const value = {
    user,
    login,
    signup,
    googleMockLogin,
    logout,
    loading,
    showAuthModal,
    setShowAuthModal,
    authMode,
    setAuthMode
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

