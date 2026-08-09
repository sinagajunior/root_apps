import { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { usePersonsList } from '../hooks/usePersons'
import { useGraph } from '../hooks/useGraph'
import FamilyChart from '../components/chart/FamilyChart'
import AddRelativeModal from '../components/modals/AddRelativeModal'
import NotificationBell from '../components/NotificationBell'

export default function FamilyTreePage() {
  const { user } = useAuthStore()
  const [showAddModal, setShowAddModal] = useState(false)
  const [degrees, setDegrees] = useState(1)

  // Fetch user's persons
  const { data: personsData, isLoading: personsLoading } = usePersonsList(100, 0)

  // Use the first person's ID as the root for the family tree
  const personId = personsData?.data?.[0]?.id

  const { isLoading: graphLoading, flowData } = useGraph(personId, degrees)
  const isLoading = personsLoading || graphLoading

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
        ) : !personsData?.data || personsData.data.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-gray-600 mb-4">Add a person to get started</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                + Add Family Member
              </button>
            </div>
          </div>
        ) : flowData ? (
          <>
            <FamilyChart
              nodes={flowData.nodes}
              edges={flowData.edges}
              isLoading={isLoading}
            />
            <div className="absolute bottom-4 left-4 bg-white p-4 rounded-lg shadow-lg border-2 border-blue-500">
              <label className="block text-sm font-bold text-gray-800 mb-3">
                📊 Generations: <span className="text-blue-600">{degrees}</span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1"
                  max="7"
                  value={degrees}
                  onChange={(e) => setDegrees(Number(e.target.value))}
                  className="w-40 h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div className="text-xs text-gray-500 mt-2">
                1 = Just you • 7 = Full tree
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-600">No family members found</p>
          </div>
        )}
      </div>

      {personId && (
        <AddRelativeModal
          personAId={personId}
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  )
}
