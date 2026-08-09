import { useQueryClient } from '@tanstack/react-query'
import PersonForm from '../forms/PersonForm'

interface AddPersonModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AddPersonModal({ isOpen, onClose }: AddPersonModalProps) {
  const queryClient = useQueryClient()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg my-8 border-2 border-green-500">
        <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4 rounded-t-lg">
          <div className="flex items-center gap-3">
            <span className="text-3xl">👤</span>
            <div>
              <h2 className="text-2xl font-bold text-white">Add New Person</h2>
              <p className="text-green-100 text-sm">Create a new member for your family tree</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <PersonForm
            onSuccess={() => {
              // Invalidate persons and graph queries so data refreshes
              queryClient.invalidateQueries({ queryKey: ['persons'] })
              queryClient.invalidateQueries({ queryKey: ['graph'] })
              onClose()
            }}
          />

          <button
            onClick={onClose}
            className="mt-6 w-full px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
          >
            ✕ Close
          </button>
        </div>
      </div>
    </div>
  )
}
