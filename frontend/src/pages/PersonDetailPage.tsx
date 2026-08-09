import { useParams } from 'react-router-dom'

export default function PersonDetailPage() {
  const { id } = useParams<{ id: string }>()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold text-gray-800">Person Details</h1>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <p className="text-gray-600">Person details for {id} will appear here.</p>
      </div>
    </div>
  )
}
