import { Handle, Position } from 'reactflow'

interface PersonNodeProps {
  data: {
    label: string
    status: 'pending' | 'validated'
    birthDate?: string
    deathDate?: string
  }
}

export default function PersonNode({ data }: PersonNodeProps) {
  const initials = data.label
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  const ringColor = data.status === 'validated' ? 'ring-green-500' : 'ring-yellow-500'
  const bgColor = data.status === 'validated' ? 'bg-green-100' : 'bg-yellow-100'

  return (
    <div
      onClick={() => {
        // Navigate to person detail page
      }}
      className="cursor-pointer"
    >
      <Handle type="target" position={Position.Top} />

      <div
        className={`w-24 h-24 rounded-full ${bgColor} border-4 ${ringColor} flex flex-col items-center justify-center shadow-lg hover:shadow-xl transition`}
      >
        <div className="text-2xl font-bold text-gray-800">{initials}</div>
        <div className="text-xs text-center text-gray-600 max-w-20 truncate">
          {data.label}
        </div>
      </div>

      <div className="text-xs text-gray-500 mt-2 text-center max-w-24 truncate">
        {data.birthDate && `b. ${data.birthDate}`}
        {data.deathDate && ` - d. ${data.deathDate}`}
      </div>

      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}
