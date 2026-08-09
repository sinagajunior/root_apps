import {
  BaseEdge,
  EdgeLabelRenderer,
  getStraightPath,
  EdgeProps,
} from 'reactflow'

export interface RelationshipEdgeData {
  label: string
  status: 'pending' | 'validated'
}

export default function RelationshipEdge({
  id,
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

  // Distinct colors and widths for different relationship types
  let stroke = '#22c55e'        // Green for sibling
  let strokeWidth = 4
  let strokeDasharray: string | undefined = undefined

  if (!isValidated) {
    strokeDasharray = '8,5'
    strokeWidth = 2
  } else if (relationshipType === 'spouse') {
    stroke = '#ec1b6b'          // Hot pink for spouse
    strokeWidth = 6
  } else if (relationshipType === 'parent' || relationshipType === 'child') {
    stroke = '#1e40af'          // Dark blue for parent/child
    strokeWidth = 5
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
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke,
          strokeWidth,
          strokeDasharray,
          transition: 'all 0.3s ease',
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))',
        }}
      />

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
