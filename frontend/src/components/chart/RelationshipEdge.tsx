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
  const strokeDasharray = isValidated ? undefined : '5,5'
  const stroke = isValidated ? '#16a34a' : '#eab308'

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke,
          strokeWidth: 2,
          strokeDasharray,
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
          <div className="bg-white px-2 py-1 rounded text-xs font-semibold text-gray-700 border border-gray-300 shadow-md">
            {data?.label}
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  )
}
