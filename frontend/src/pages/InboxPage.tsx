import { useState } from 'react'
import { useValidationInbox, useAcceptValidation, useRejectValidation } from '../hooks/useValidations'
import NotificationBell from '../components/NotificationBell'

export default function InboxPage() {
  const { data: inbox, isLoading } = useValidationInbox()
  const acceptValidation = useAcceptValidation()
  const rejectValidation = useRejectValidation()
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  const handleAccept = async (id: string) => {
    await acceptValidation.mutateAsync(id)
  }

  const handleReject = async (id: string) => {
    await rejectValidation.mutateAsync(id)
    setConfirmingId(null)
  }

  const pendingValidations = inbox?.data.filter((v) => v.status === 'pending') || []
  const acceptedValidations = inbox?.data.filter((v) => v.status === 'accepted') || []
  const rejectedValidations = inbox?.data.filter((v) => v.status === 'rejected') || []

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Relationship Inbox</h1>
          <NotificationBell />
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading inbox...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Pending Requests */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Pending Requests ({pendingValidations.length})
              </h2>
              {pendingValidations.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                  <p className="text-gray-500">No pending validation requests</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingValidations.map((validation) => (
                    <div
                      key={validation.id}
                      className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-lg font-semibold text-gray-800">
                            Relationship Request
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(validation.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                          Pending
                        </span>
                      </div>

                      <p className="text-gray-700 mb-4">
                        Someone has requested to connect a family relationship. Please review and
                        confirm to validate.
                      </p>

                      {confirmingId === validation.id ? (
                        <div className="bg-gray-50 p-4 rounded mb-4 border border-gray-200">
                          <p className="text-gray-700 mb-3">Are you sure you want to reject this relationship?</p>
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                handleReject(validation.id)
                              }
                              className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700 disabled:bg-gray-400"
                              disabled={rejectValidation.isPending}
                            >
                              {rejectValidation.isPending ? 'Rejecting...' : 'Confirm Reject'}
                            </button>
                            <button
                              onClick={() => setConfirmingId(null)}
                              className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-3">
                          <button
                            onClick={() =>
                              handleAccept(validation.id)
                            }
                            className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:bg-gray-400 font-medium"
                            disabled={acceptValidation.isPending}
                          >
                            {acceptValidation.isPending ? 'Accepting...' : 'Accept'}
                          </button>
                          <button
                            onClick={() => setConfirmingId(validation.id)}
                            className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700 font-medium"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Accepted Requests */}
            {acceptedValidations.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Accepted ({acceptedValidations.length})
                </h2>
                <div className="space-y-4">
                  {acceptedValidations.map((validation) => (
                    <div
                      key={validation.id}
                      className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-lg font-semibold text-gray-800">
                            Relationship Validated
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(validation.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                          Accepted
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rejected Requests */}
            {rejectedValidations.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Rejected ({rejectedValidations.length})
                </h2>
                <div className="space-y-4">
                  {rejectedValidations.map((validation) => (
                    <div
                      key={validation.id}
                      className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-lg font-semibold text-gray-800">
                            Relationship Rejected
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(validation.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">
                          Rejected
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
