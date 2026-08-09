import { Handle, Position } from 'reactflow'

interface PersonNodeProps {
  data: {
    label: string
    status: 'pending' | 'validated'
    birthDate?: string
    deathDate?: string
    gender?: string
    married?: boolean
    avatar_url?: string
  }
}

export default function PersonNode({ data }: PersonNodeProps) {
  const initials = data.label
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  const ringColor = data.status === 'validated' ? 'ring-green-500' : 'ring-yellow-500'
  const bgColor = data.status === 'validated' ? 'bg-gradient-to-br from-green-100 to-green-200' : 'bg-gradient-to-br from-yellow-100 to-yellow-200'

  return (
    <div
      onClick={() => {
        // Navigate to person detail page
      }}
      className="cursor-pointer"
    >
      <Handle type="target" position={Position.Top} />

      <div className="bg-white rounded-lg shadow-lg hover:shadow-2xl transition p-3 max-w-56 border-2" style={{ borderColor: data.status === 'validated' ? '#22c55e' : '#eab308' }}>
        {/* Avatar/Initials Circle */}
        <div
          className={`w-16 h-16 rounded-full ${bgColor} border-4 ${ringColor} flex items-center justify-center shadow-md mx-auto mb-2 overflow-hidden`}
        >
          {data.avatar_url ? (
            <img
              src={data.avatar_url}
              alt={data.label}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          ) : (
            <div className="text-lg font-bold text-gray-700">{initials}</div>
          )}
        </div>

        {/* Name */}
        <div className="text-sm font-semibold text-gray-800 text-center truncate">
          {data.label}
        </div>

        {/* Gender and Status */}
        <div className="text-xs text-gray-600 text-center mt-1">
          {data.gender && <div>{data.gender}</div>}
          {data.married && <div className="text-pink-500 font-semibold">💍 Married</div>}
        </div>

        {/* Dates */}
        <div className="text-xs text-gray-500 mt-2 text-center space-y-0.5 border-t pt-2">
          {data.birthDate && <div>Born: {data.birthDate}</div>}
          {data.deathDate && <div className="text-gray-400">Died: {data.deathDate}</div>}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}
