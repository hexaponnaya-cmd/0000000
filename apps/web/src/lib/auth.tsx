import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { api } from './api'

interface User {
  id: string
  email: string
  name: string
  teamId: string
  teamName: string
}

interface AuthCtx {
  user: User | null
  token: string | null
  login: (email: string, pw: string) => Promise<void>
  register: (email: string, pw: string, name: string) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthCtx>(null!)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('legsend_token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      api.me().then((data: any) => {
        setUser(data.user)
        setLoading(false)
      }).catch(() => {
        setToken(null)
        localStorage.removeItem('legsend_token')
        setLoading(false)
      })
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    const data: any = await api.login(email, password)
    setToken(data.token)
    setUser(data.user)
    localStorage.setItem('legsend_token', data.token)
  }

  const register = async (email: string, password: string, name: string) => {
    const data: any = await api.register(email, password, name)
    setToken(data.token)
    setUser(data.user)
    localStorage.setItem('legsend_token', data.token)
  }

  const logout = () => {
    api.logout().catch(() => {})
    setToken(null)
    setUser(null)
    localStorage.removeItem('legsend_token')
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
