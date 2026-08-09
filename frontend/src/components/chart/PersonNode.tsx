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
    spouse?: string
    children?: string[]
    partner_status?: string
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
  const bgColor = data.status === 'validated' ? '#f0fdf4' : '#fffbeb'

  return (
    <div style={{ width: '240px' }}>
      <Handle type="target" position={Position.Top} />

      {/* Social Media Card Box */}
      <div
        style={{
          background: '#ffffff',
          border: `3px solid ${borderColor}`,
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          overflow: 'hidden',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)'
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.25)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)'
        }}
      >
        {/* Avatar Square - Top of Card */}
        <div
          style={{
            width: '100%',
            height: '160px',
            background: bgColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            borderBottom: `2px solid ${borderColor}`,
            padding: '16px',
          }}
        >
          {data.avatar_url ? (
            <img
              src={data.avatar_url}
              alt={data.label}
              style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: `3px solid ${borderColor}`,
              }}
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          ) : (
            <div
              style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                border: `3px solid ${borderColor}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#ffffff',
                fontSize: '40px',
                fontWeight: 'bold',
                color: borderColor,
              }}
            >
              {initials}
            </div>
          )}
        </div>

        {/* Card Content */}
        <div style={{ padding: '12px' }}>
          {/* Name */}
          <div
            style={{
              fontSize: '15px',
              fontWeight: '700',
              color: '#1f2937',
              textAlign: 'center',
              marginBottom: '8px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {data.label}
          </div>

          {/* Status Badge */}
          <div
            style={{
              fontSize: '11px',
              fontWeight: '600',
              color: borderColor,
              textAlign: 'center',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              paddingLeft: '8px',
              paddingRight: '8px',
              paddingTop: '4px',
              paddingBottom: '4px',
              backgroundColor: borderColor + '20',
              borderRadius: '8px',
              border: `1px solid ${borderColor}`,
              marginBottom: '8px',
            }}
          >
            {data.status === 'validated' ? '✓ Verified' : '⏳ Pending'}
          </div>

          {/* Info Row */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-around',
              fontSize: '13px',
              color: '#6b7280',
              marginBottom: '8px',
              paddingTop: '8px',
              borderTop: `1px solid ${borderColor}20`,
            }}
          >
            {data.children && data.children.length > 0 && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '18px' }}>👶</div>
                <div style={{ fontSize: '10px' }}>{data.children.length} kids</div>
              </div>
            )}
            {data.birthDate && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '18px' }}>🎂</div>
                <div style={{ fontSize: '10px' }}>{new Date(data.birthDate).getFullYear()}</div>
              </div>
            )}
          </div>

          {/* Partner Status Row */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              fontSize: '12px',
              color: '#6b7280',
              paddingTop: '8px',
              paddingLeft: '8px',
              paddingRight: '8px',
              borderTop: `1px solid ${borderColor}20`,
              gap: '8px',
            }}
          >
            <span style={{ fontWeight: '600' }}>Partner:</span>
            <span
              style={{
                fontWeight: '500',
                color: data.partner_status && data.partner_status !== 'n/a' ? '#059669' : '#9ca3af',
                textAlign: 'right',
                flex: 1,
                wordWrap: 'break-word',
              }}
            >
              💍 {data.partner_status || 'n/a'}
            </span>
          </div>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}
