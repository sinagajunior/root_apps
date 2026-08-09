import {
  EdgeLabelRenderer,
  EdgeProps,
  getStraightPath,
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

  // Distinct colors for different relationship types
  let stroke = '#22c55e'        // Green for sibling
  let strokeWidth = 4
  let strokeDasharray = undefined

  if (!isValidated) {
    strokeDasharray = '8,5'
    strokeWidth = 3
  } else if (relationshipType === 'spouse') {
    stroke = '#ec1b6b'          // Hot pink for spouse
    strokeWidth = 5
  } else if (relationshipType === 'parent' || relationshipType === 'child') {
    stroke = '#1e40af'          // Dark blue for parent/child
    strokeWidth = 4
  }

  // Get display text for relationship type
  let displayLabel = data?.label || ''
  let emoji = '👥'

  if (relationshipType === 'spouse') {
    emoji = '💍'
    displayLabel = 'Spouse'
  } else if (relationshipType === 'parent') {
    emoji = '👨‍👧'
    displayLabel = 'Parent'
  } else if (relationshipType === 'child') {
    emoji = '👶'
    displayLabel = 'Child'
  } else if (relationshipType === 'sibling') {
    emoji = '👯'
    displayLabel = 'Sibling'
  }

  return (
    <>
      {/* Main line */}
      <svg
        style={{
          position: 'absolute',
          pointerEvents: 'none',
          overflow: 'visible',
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
          style={{
            transition: 'all 0.3s ease',
            filter: `drop-shadow(0 2px 4px rgba(0,0,0,0.1))`,
          }}
        />
      </svg>

      {/* Label */}
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
              background: relationshipType === 'spouse' ? '#ffe0eb' : '#dbeafe',
              borderColor: stroke,
              color: stroke,
            }}
            className="px-4 py-2 rounded-lg text-sm font-bold border-2 shadow-md whitespace-nowrap"
          >
            <span className="mr-1.5 text-base">{emoji}</span>
            {displayLabel}
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  )
}
