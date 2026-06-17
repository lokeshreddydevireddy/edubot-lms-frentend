import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

const AuthContext = createContext(null)

import api from '../services/api'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('eb_user')) } catch { return null }
  })
  const [token, setToken] = useState(() => localStorage.getItem('eb_token') || null)
  const [loading, setLoading] = useState(true)

  // Verify token on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('eb_token')
      if (storedToken) {
        try {
          const res = await api.get('/auth/me')
          if (res.data.success) {
            setUser(res.data.user)
            localStorage.setItem('eb_user', JSON.stringify(res.data.user))
          }
        } catch (err) {
          console.error('Session expired or invalid', err)
          logout()
        }
      }
      setLoading(false)
    }
    initAuth()
  }, [])

  const login = useCallback(async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password })
      if (res.data.success) {
        const { token: newToken, user: userData } = res.data
        localStorage.setItem('eb_token', newToken)
        localStorage.setItem('eb_user', JSON.stringify(userData))
        setToken(newToken)
        setUser(userData)
        return userData
      }
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Login failed')
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('eb_token')
    localStorage.removeItem('eb_user')
    setUser(null)
    setToken(null)
    // Optional: api.post('/auth/logout')
  }, [])

  if (loading) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0F1B2D', color: '#fff' }}>Loading session...</div>
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
