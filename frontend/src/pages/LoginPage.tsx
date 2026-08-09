import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import axiosInstance from '../api/client'

export default function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleDemoLogin = async () => {
    setIsLoading(true)
    setError('')
    try {
      const response = await axiosInstance.post('/auth/demo-login')
      const { token, user } = response.data

      // Store token and user in auth store
      setAuth(token, user)

      // Redirect to family tree
      navigate('/family-tree')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed')
      console.error('Login error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h1 className="text-4xl font-bold text-center mb-2 text-gray-800">Root</h1>
        <p className="text-center text-gray-600 mb-8">Family & Ancestor Relationship Manager</p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleDemoLogin}
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Logging in...' : 'Demo Login'}
          </button>
          <p className="text-xs text-gray-500 text-center">
            (Demo login uses test account for development)
          </p>
        </div>
      </div>
    </div>
  )
}
