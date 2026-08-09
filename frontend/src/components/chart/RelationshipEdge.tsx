import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
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
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps<RelationshipEdgeData>) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  const isValidated = data?.status === 'validated'
  const relationshipType = data?.label?.toLowerCase() || ''

  // Determine styling based on relationship type
  let stroke = '#10b981'
  let strokeWidth = 2
  let strokeDasharray = undefined

  if (!isValidated) {
    stroke = '#f59e0b'
    strokeDasharray = '5,5'
  } else if (relationshipType === 'spouse') {
    stroke = '#ec4899'
    strokeWidth = 3
  } else if (relationshipType === 'parent' || relationshipType === 'child') {
    stroke = '#3b82f6'
    strokeWidth = 2
  }

  // Get emoji for relationship type
  let emoji = '👥'
  if (relationshipType === 'spouse') {
    emoji = '💍'
  } else if (relationshipType === 'parent') {
    emoji = '👨‍👧'
  } else if (relationshipType === 'child') {
    emoji = '👶'
  } else if (relationshipType === 'sibling') {
    emoji = '👯'
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
        }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          <div
            style={{
              background: relationshipType === 'spouse' ? '#fce7f3' : '#eff6ff',
              borderColor: stroke,
              color: stroke,
            }}
            className="px-3 py-1.5 rounded-full text-xs font-bold border-2 shadow-lg whitespace-nowrap"
          >
            <span className="mr-1">{emoji}</span>
            {data?.label}
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  )
}
