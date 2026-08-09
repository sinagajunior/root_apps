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

  // Show right panel only on family tree and admin pages
  const showRightPanel =
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
    { label: 'Settings', path: '/settings', icon: '⚡' },
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
        } bg-white shadow-lg transition-all duration-300 flex-shrink-0 overflow-hidden`}
      >
        <div className="p-4 flex items-center justify-between border-b-2 border-gray-200">
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

        {/* Logout Button at Bottom */}
        <div className="p-4 border-t-2 border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors font-semibold"
          >
            <span className="text-xl">🚪</span>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
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
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user?.name}</span>
              <NotificationBell />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>

      {/* Right Panel */}
      {showRightPanel && (
        <aside className="w-64 bg-white border-l border-gray-200 shadow-lg flex flex-col justify-center items-center gap-6 p-6 flex-shrink-0">
          {onAddPerson && (
            <button
              onClick={handleAddPerson}
              className="w-full flex flex-col items-center justify-center gap-3 bg-green-600 text-white px-6 py-4 rounded-lg hover:bg-green-700 active:bg-green-800 font-semibold transition-all duration-200 hover:shadow-lg"
              title="Add a new person to your family tree"
            >
              <span className="text-4xl">👤</span>
              <span className="text-center">Add Person</span>
            </button>
          )}
          {onAddFamilyMember && (
            <button
              onClick={handleAddFamilyMember}
              className="w-full flex flex-col items-center justify-center gap-3 bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 active:bg-blue-800 font-semibold transition-all duration-200 hover:shadow-lg"
              title="Add a family relationship"
            >
              <span className="text-4xl">🔗</span>
              <span className="text-center">Add Member</span>
            </button>
          )}
        </aside>
      )}
    </div>
  )
}
