import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { persons } from '../api/endpoints'

export default function PersonDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: person, isLoading, error } = useQuery({
    queryKey: ['person', id],
    queryFn: async () => {
      if (!id) throw new Error('Person ID required')
      const response = await persons.get(id)
      return response.data
    },
    enabled: !!id,
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading person details...</p>
        </div>
      </div>
    )
  }

  if (error || !person) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <button
              onClick={() => navigate(-1)}
              className="text-blue-600 hover:text-blue-700 font-semibold mb-4"
            >
              ← Back
            </button>
            <h1 className="text-3xl font-bold text-gray-800">Error</h1>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <p className="text-red-600">Failed to load person details</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="text-blue-600 hover:text-blue-700 font-semibold mb-4 text-sm"
          >
            ← Back to Family Tree
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex gap-8">
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
              </div>

              {/* Status Badge */}
              <div className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full font-semibold">
                ✓ Validated
              </div>
            </div>
          </div>
        </div>

        {/* Additional Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Person ID */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-3">ID</h3>
            <p className="text-sm text-gray-600 font-mono break-all">{person.id}</p>
          </div>

          {/* Age Calculator */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-3">Age</h3>
            {person.birth_date ? (
              <p className="text-sm text-gray-600">
                {person.death_date ? (
                  <>
                    {Math.floor(
                      (new Date(person.death_date).getTime() -
                        new Date(person.birth_date).getTime()) /
                        (365.25 * 24 * 60 * 60 * 1000)
                    )}{' '}
                    years (at death)
                  </>
                ) : (
                  <>
                    {Math.floor(
                      (Date.now() - new Date(person.birth_date).getTime()) /
                        (365.25 * 24 * 60 * 60 * 1000)
                    )}{' '}
                    years old
                  </>
                )}
              </p>
            ) : (
              <p className="text-sm text-gray-600">Not calculated</p>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">About</h3>
          <div className="space-y-2 text-gray-600">
            <p>
              <span className="font-semibold">Full Name:</span> {person.full_name}
            </p>
            {person.gender && (
              <p>
                <span className="font-semibold">Gender:</span>{' '}
                <span className="capitalize">{person.gender}</span>
              </p>
            )}
            <p>
              <span className="font-semibold">Profile:</span>{' '}
              {person.avatar_url ? (
                <a
                  href={person.avatar_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700"
                >
                  View Avatar
                </a>
              ) : (
                'Generated avatar'
              )}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4">
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
          >
            Back to Family Tree
          </button>
        </div>
      </div>
    </div>
  )
}
