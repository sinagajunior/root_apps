import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { persons } from '../api/endpoints'
import PersonEditModal from '../components/modals/PersonEditModal'
import DashboardLayout from '../components/layout/DashboardLayout'

export default function PersonDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const { data: person, isLoading, error } = useQuery({
    queryKey: ['person', id],
    queryFn: async () => {
      if (!id) throw new Error('Person ID required')
      const response = await persons.get(id)
      return response.data
    },
    enabled: !!id,
  })

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!id) throw new Error('Person ID required')
      await persons.delete(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['persons'] })
      navigate('/family-tree')
    },
  })

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading person details...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !person) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 p-8">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => navigate(-1)}
              className="text-blue-600 hover:text-blue-700 font-semibold mb-4"
            >
              ← Back
            </button>
            <h1 className="text-3xl font-bold text-gray-800">Error</h1>
            <p className="text-red-600 mt-4">Failed to load person details</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="bg-gray-50 min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Card */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="flex gap-8 mb-6">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <img
                  src={
                    person.avatar_url ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(person.full_name)}&background=random&color=fff&size=200`
                  }
                  alt={person.full_name}
                  className="w-48 h-48 rounded-full object-cover border-4 border-blue-500 shadow-lg"
                />
              </div>

              {/* Basic Info */}
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">
                  {person.full_name}
                </h1>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  {/* Birth Date */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 font-semibold">Birth Date</p>
                    <p className="text-lg text-gray-800">
                      {person.birth_date
                        ? new Date(person.birth_date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                        : 'Not specified'}
                    </p>
                  </div>

                  {/* Death Date */}
                  {person.death_date && (
                    <div className="bg-gray-200 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 font-semibold">Death Date</p>
                      <p className="text-lg text-gray-800">
                        {new Date(person.death_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  )}

                  {/* Gender */}
                  {person.gender && (
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 font-semibold">Gender</p>
                      <p className="text-lg text-gray-800 capitalize">
                        {person.gender}
                      </p>
                    </div>
                  )}

                  {/* Married Status */}
                  <div className="bg-pink-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 font-semibold">Marital Status</p>
                    <p className="text-lg text-gray-800">
                      {person.married ? '💍 Married' : 'Single'}
                    </p>
                  </div>

                  {/* Partner Information */}
                  <div className="bg-rose-50 p-4 rounded-lg col-span-2">
                    <p className="text-sm text-gray-600 font-semibold mb-2">Partner</p>
                    <p className="text-lg text-gray-800">
                      {person.partner_status && person.partner_status !== 'n/a' ? (
                        <>💍 {person.partner_status}</>
                      ) : (
                        <span className="text-gray-500">No partner information</span>
                      )}
                    </p>
                  </div>

                  {/* Father Information */}
                  {person.father_info && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 font-semibold">Father</p>
                      <p className="text-lg text-gray-800">👨 {person.father_info}</p>
                    </div>
                  )}

                  {/* Mother Information */}
                  {person.mother_info && (
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 font-semibold">Mother</p>
                      <p className="text-lg text-gray-800">👩 {person.mother_info}</p>
                    </div>
                  )}
                </div>

                {/* Status Badge */}
                <div className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full font-semibold">
                  ✓ Validated
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex gap-4">
            <button
              onClick={() => navigate(-1)}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 font-semibold"
            >
              ← Back
            </button>
            <button
              onClick={() => setShowEditModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
            >
              ✎ Edit
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 font-semibold"
            >
              🗑 Delete
            </button>
          </div>

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl p-8 max-w-md">
                <h2 className="text-2xl font-bold text-red-600 mb-4">Delete Person</h2>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete <strong>{person?.full_name}</strong>? This action cannot be undone.
                </p>
                <div className="flex gap-4 justify-end">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-6 py-2 rounded-lg border-2 border-gray-300 hover:bg-gray-50 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false)
                      deleteMutation.mutate()
                    }}
                    disabled={deleteMutation.isPending}
                    className="px-6 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 font-semibold disabled:opacity-50"
                  >
                    {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Edit Modal */}
          {person && (
            <PersonEditModal
              person={person}
              isOpen={showEditModal}
              onClose={() => setShowEditModal(false)}
              onSave={() => {
                setShowEditModal(false)
                queryClient.invalidateQueries({ queryKey: ['person', id] })
              }}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
