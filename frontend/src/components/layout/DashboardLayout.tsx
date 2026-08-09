import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import NotificationBell from '../NotificationBell'

interface DashboardLayoutProps {
  children: React.ReactNode
  onAddPerson?: () => void
  onAddFamilyMember?: () => void
}

export default function DashboardLayout({
  children,
  onAddPerson,
  onAddFamilyMember
}: DashboardLayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, clearAuth } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  // Show action buttons on family tree and admin pages
  const showActionButtons =
    location.pathname === '/family-tree' ||
    location.pathname === '/admin' ||
    location.pathname === '/'

  const handleLogout = () => {
    clearAuth()
    navigate('/login')
  }

  const isActive = (path: string) => location.pathname === path

  const menuItems = [
    { label: 'Family Tree', path: '/family-tree', icon: '🌳' },
    { label: 'Admin', path: '/admin', icon: '⚙️' },
  ]

  const handleAddPerson = () => {
    if (onAddPerson) {
      onAddPerson()
    }
  }

  const handleAddFamilyMember = () => {
    if (onAddFamilyMember) {
      onAddFamilyMember()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Left Panel */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-white shadow-lg transition-all duration-300 flex flex-col overflow-hidden`}
      >
        <div className="p-4 flex items-center justify-between border-b-2 border-gray-200 flex-shrink-0">
          {sidebarOpen && (
            <h1 className="text-2xl font-bold text-gray-800">Root</h1>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        {/* Menu Items */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                isActive(item.path)
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <span className="text-2xl">{item.icon}</span>
              {sidebarOpen && <span className="font-semibold">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Action Buttons - Right after navigation */}
        {showActionButtons && (
          <>
            {sidebarOpen && (
              <div className="px-4 py-2 space-y-2">
                {onAddPerson && (
                  <button
                    onClick={handleAddPerson}
                    className="w-full flex flex-col items-center justify-center gap-2 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 active:bg-green-800 font-semibold transition-all duration-200 hover:shadow-lg text-sm"
                    title="Add a new person to your family tree"
                  >
                    <span className="text-xl">👤</span>
                    <span>Add Person</span>
                  </button>
                )}
                {onAddFamilyMember && (
                  <button
                    onClick={handleAddFamilyMember}
                    className="w-full flex flex-col items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 active:bg-blue-800 font-semibold transition-all duration-200 hover:shadow-lg text-sm"
                    title="Add a family relationship"
                  >
                    <span className="text-xl">🔗</span>
                    <span>Add Member</span>
                  </button>
                )}
              </div>
            )}
            {!sidebarOpen && (
              <div className="px-2 py-2 space-y-2">
                {onAddPerson && (
                  <button
                    onClick={handleAddPerson}
                    className="w-full flex items-center justify-center bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 active:bg-green-800 transition-all duration-200 hover:shadow-lg"
                    title="Add Person"
                  >
                    <span className="text-lg">👤</span>
                  </button>
                )}
                {onAddFamilyMember && (
                  <button
                    onClick={handleAddFamilyMember}
                    className="w-full flex items-center justify-center bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-all duration-200 hover:shadow-lg"
                    title="Add Member"
                  >
                    <span className="text-lg">🔗</span>
                  </button>
                )}
              </div>
            )}
          </>
        )}

      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white shadow flex-shrink-0">
          <div className="px-4 py-4 flex justify-between items-center">
            <h2 className="text-3xl font-bold text-gray-800">
              {location.pathname === '/family-tree' && '🌳 Family Tree'}
              {location.pathname === '/admin' && '⚙️ Admin Dashboard'}
              {location.pathname === '/settings' && '⚡ Settings'}
              {location.pathname === '/' && '🌳 Family Tree'}
            </h2>
            <div className="flex items-center gap-4 relative">
              <NotificationBell />

              {/* User Avatar with Dropdown Menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                  title="User menu"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm text-gray-600 max-w-xs truncate">{user?.name}</span>
                  <span className="text-gray-400 text-xs">▼</span>
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.email || 'user@example.com'}</p>
                    </div>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false)
                        handleLogout()
                      }}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors text-sm font-semibold"
                    >
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
