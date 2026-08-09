import { create } from 'zustand'
import { User } from '../api/types'

interface AuthState {
  token: string | null
  user: User | null
  isAuthenticated: boolean
  setAuth: (token: string, user: User) => void
  clearAuth: () => void
  setToken: (token: string) => void
}

const loadAuthFromStorage = () => {
  const token = localStorage.getItem('auth_token')
  const user = localStorage.getItem('auth_user')
  return {
    token,
    user: user ? JSON.parse(user) : null,
  }
}

export const useAuthStore = create<AuthState>((set) => {
  const { token, user } = loadAuthFromStorage()

  return {
    token,
    user,
    isAuthenticated: !!token,

    setAuth: (newToken: string, newUser: User) => {
      localStorage.setItem('auth_token', newToken)
      localStorage.setItem('auth_user', JSON.stringify(newUser))
      set({
        token: newToken,
        user: newUser,
        isAuthenticated: true,
      })
    },

    clearAuth: () => {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      set({
        token: null,
        user: null,
        isAuthenticated: false,
      })
    },

    setToken: (newToken: string) => {
      localStorage.setItem('auth_token', newToken)
      set({ token: newToken })
    },
  }
})
