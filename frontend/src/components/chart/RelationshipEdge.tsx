import {
  EdgeLabelRenderer,
  getStraightPath,
  EdgeProps,
} from 'reactflow'

export interface RelationshipEdgeData {
  label: string
  status: 'pending' | 'validated'
}

export default function RelationshipEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
}: EdgeProps<RelationshipEdgeData>) {
  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  })

  const isValidated = data?.status === 'validated'
  const relationshipType = data?.label?.toLowerCase() || ''

  // ULTRA THICK line widths
  let stroke = '#16a34a'        // Green for sibling
  let strokeWidth = 35
  let strokeDasharray: string | undefined = undefined

  if (!isValidated) {
    strokeDasharray = '20,15'
    strokeWidth = 18
  } else if (relationshipType === 'spouse') {
    stroke = '#dc2626'          // Red for spouse
    strokeWidth = 45
  } else if (relationshipType === 'parent' || relationshipType === 'child') {
    stroke = '#0066cc'          // Blue for parent/child
    strokeWidth = 40
  }

  // Get display text for relationship type
  let displayLabel = data?.label || ''
  let emoji = '👥'
  let bgColor = '#dbeafe'

  if (relationshipType === 'spouse') {
    emoji = '💍'
    displayLabel = 'Spouse'
    bgColor = '#ffe0eb'
  } else if (relationshipType === 'parent') {
    emoji = '👨‍👧'
    displayLabel = 'Parent'
    bgColor = '#dbeafe'
  } else if (relationshipType === 'child') {
    emoji = '👶'
    displayLabel = 'Child'
    bgColor = '#dbeafe'
  } else if (relationshipType === 'sibling') {
    emoji = '👯'
    displayLabel = 'Sibling'
    bgColor = '#dcfce7'
  }

  return (
    <>
      {/* Main SVG line */}
      <svg
        style={{
          position: 'absolute',
          pointerEvents: 'none',
          overflow: 'visible',
          zIndex: 1,
        }}
        width="100%"
        height="100%"
      >
        <path
          d={edgePath}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.2))',
          }}
        />
      </svg>

      {/* Label box */}
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'none',
          }}
          className="nodrag nopan"
        >
          <div
            style={{
              background: bgColor,
              borderColor: stroke,
              color: stroke,
              fontSize: '14px',
              fontWeight: 'bold',
              padding: '6px 12px',
              borderRadius: '8px',
              border: `2px solid ${stroke}`,
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span style={{ fontSize: '16px' }}>{emoji}</span>
            {displayLabel}
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  )
}
