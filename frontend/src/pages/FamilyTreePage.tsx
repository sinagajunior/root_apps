import { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { useGraph } from '../hooks/useGraph'
import FamilyChart from '../components/chart/FamilyChart'
import AddRelativeModal from '../components/modals/AddRelativeModal'
import NotificationBell from '../components/NotificationBell'

export default function FamilyTreePage() {
  const { user } = useAuthStore()
  const [showAddModal, setShowAddModal] = useState(false)
  const [degrees, setDegrees] = useState(3)

  // For now, use a default person ID or first person
  const defaultPersonId = user?.id || ''

  const { isLoading, flowData } = useGraph(defaultPersonId, degrees)

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Please log in to view your family tree</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Family Tree</h1>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              + Add Family Member
            </button>
          </div>
        </div>
      </nav>

      <div className="h-screen bg-white">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading family tree...</p>
            </div>
          </div>
        ) : flowData ? (
          <>
            <FamilyChart
              nodes={flowData.nodes}
              edges={flowData.edges}
              isLoading={isLoading}
            />
            <div className="absolute bottom-4 left-4 bg-white p-4 rounded-lg shadow">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Depth: {degrees}
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={degrees}
                onChange={(e) => setDegrees(Number(e.target.value))}
                className="w-32"
              />
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-600">No family members found</p>
          </div>
        )}
      </div>

      <AddRelativeModal
        personAId={defaultPersonId}
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </div>
  )
}
