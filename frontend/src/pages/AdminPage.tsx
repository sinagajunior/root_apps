import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePersonsList } from '../hooks/usePersons'
import AddPersonModal from '../components/modals/AddPersonModal'
import DashboardLayout from '../components/layout/DashboardLayout'

export default function AdminPage() {
  const navigate = useNavigate()
  const [showAddPersonModal, setShowAddPersonModal] = useState(false)
  const { data: personsData, isLoading } = usePersonsList(100, 0)

  return (
    <DashboardLayout
      onAddPerson={() => setShowAddPersonModal(true)}
      onAddFamilyMember={() => {
        // Navigate to family tree if needed, or just close the panel
        console.log('Add family member from admin')
      }}
    >
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header with Add Button */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
              <p className="text-gray-600">Manage all family members and relationships</p>
            </div>
            <button
              onClick={() => setShowAddPersonModal(true)}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-semibold flex items-center gap-2"
            >
              <span>👤</span>
              Add New Person
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-3xl mb-2">👥</div>
              <h3 className="text-gray-600 text-sm font-semibold mb-1">Total Members</h3>
              <p className="text-3xl font-bold text-gray-800">{personsData?.total || 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-3xl mb-2">🔗</div>
              <h3 className="text-gray-600 text-sm font-semibold mb-1">Relationships</h3>
              <p className="text-3xl font-bold text-gray-800">--</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-3xl mb-2">✅</div>
              <h3 className="text-gray-600 text-sm font-semibold mb-1">Validated</h3>
              <p className="text-3xl font-bold text-gray-800">--</p>
            </div>
          </div>

          {/* Members List */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b-2 border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">Family Members</h2>
            </div>

            {isLoading ? (
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading members...</p>
              </div>
            ) : !personsData?.data || personsData.data.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-gray-600 mb-4">No family members yet</p>
                <button
                  onClick={() => setShowAddPersonModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Add First Member
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Name</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Gender</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Birth Date</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Partner</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Father</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Mother</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {personsData.data.map((person) => (
                      <tr key={person.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-gray-800">{person.full_name}</td>
                        <td className="px-6 py-4 text-gray-600">
                          {person.gender ? (
                            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                              {person.gender}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {person.birth_date
                            ? new Date(person.birth_date).toLocaleDateString()
                            : '-'}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {person.partner_status && person.partner_status !== 'n/a' ? (
                            <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                              💍 {person.partner_status}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {person.father_info ? (
                            <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                              👨 {person.father_info}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {person.mother_info ? (
                            <span className="inline-block px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-sm">
                              👩 {person.mother_info}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => navigate(`/person/${person.id}`)}
                            className="text-blue-600 hover:text-blue-800 font-semibold mr-4"
                          >
                            View
                          </button>
                          <button className="text-red-600 hover:text-red-800 font-semibold">
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Add Person Modal */}
        <AddPersonModal
          isOpen={showAddPersonModal}
          onClose={() => setShowAddPersonModal(false)}
        />
      </div>
    </DashboardLayout>
  )
}
