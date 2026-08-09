import { useState, useRef, useEffect } from 'react'
import { useValidationInbox } from '../hooks/useValidations'
import { useNavigate } from 'react-router-dom'

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { data: inbox } = useValidationInbox()

  const pendingCount = inbox?.data.filter((v) => v.status === 'pending').length || 0

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition"
        aria-label="Notifications"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {pendingCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {pendingCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {!inbox?.data || inbox.data.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No notifications
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {inbox.data.slice(0, 5).map((validation) => (
                  <div
                    key={validation.id}
                    className="p-4 hover:bg-gray-50 cursor-pointer transition"
                    onClick={() => {
                      navigate('/inbox')
                      setIsOpen(false)
                    }}
                  >
                    <p className="text-sm text-gray-800">
                      You have a pending relationship to validate
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(validation.created_at).toLocaleDateString()}
                    </p>
                    {validation.status === 'pending' && (
                      <span className="inline-block mt-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                        Pending
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-200">
            <button
              onClick={() => {
                navigate('/inbox')
                setIsOpen(false)
              }}
              className="w-full text-center text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              View All
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
