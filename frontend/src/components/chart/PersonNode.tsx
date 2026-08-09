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
    .slice(0, 2)

  const borderColor = data.status === 'validated' ? '#10b981' : '#f59e0b'
  const bgGradient = data.status === 'validated'
    ? 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)'
    : 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)'

  return (
    <div style={{ width: '280px' }}>
      <Handle type="target" position={Position.Top} />

      {/* Main Card Container */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: `0 10px 25px rgba(0, 0, 0, 0.1)`,
          border: `3px solid ${borderColor}`,
          transition: 'all 0.3s ease',
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = `0 15px 35px rgba(0, 0, 0, 0.2)`
          e.currentTarget.style.transform = 'translateY(-5px)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = `0 10px 25px rgba(0, 0, 0, 0.1)`
          e.currentTarget.style.transform = 'translateY(0)'
        }}
      >
        {/* Avatar Circle */}
        <div
          style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            margin: '0 auto 16px',
            background: bgGradient,
            border: `4px solid ${borderColor}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          {data.avatar_url ? (
            <img
              src={data.avatar_url}
              alt={data.label}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          ) : (
            <div
              style={{
                fontSize: '36px',
                fontWeight: 'bold',
                color: '#374151',
              }}
            >
              {initials}
            </div>
          )}
        </div>

        {/* Name */}
        <div
          style={{
            fontSize: '16px',
            fontWeight: '700',
            color: '#1f2937',
            textAlign: 'center',
            marginBottom: '12px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {data.label}
        </div>

        {/* Gender */}
        {data.gender && (
          <div
            style={{
              fontSize: '12px',
              color: '#6b7280',
              textAlign: 'center',
              marginBottom: '8px',
            }}
          >
            👤 {data.gender}
          </div>
        )}

        {/* Married Status */}
        {data.married && (
          <div
            style={{
              fontSize: '14px',
              color: '#ec4899',
              textAlign: 'center',
              fontWeight: '600',
              marginBottom: '12px',
            }}
          >
            💍 Married
          </div>
        )}

        {/* Divider */}
        <div
          style={{
            height: '1px',
            background: '#e5e7eb',
            margin: '12px 0',
          }}
        />

        {/* Dates */}
        <div
          style={{
            fontSize: '11px',
            color: '#6b7280',
            textAlign: 'center',
            lineHeight: '1.6',
          }}
        >
          {data.birthDate && (
            <div>📅 Born: {data.birthDate}</div>
          )}
          {data.deathDate && (
            <div style={{ color: '#9ca3af' }}>🪦 Died: {data.deathDate}</div>
          )}
        </div>

        {/* Status Badge */}
        <div
          style={{
            marginTop: '12px',
            textAlign: 'center',
            fontSize: '11px',
            fontWeight: '600',
            color: borderColor,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          {data.status === 'validated' ? '✓ Validated' : '⏳ Pending'}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}
