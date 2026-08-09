import { useCallback, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MiniMap,
  Panel,
  useReactFlow,
} from 'reactflow'
import 'reactflow/dist/style.css'
import PersonNode from './PersonNode'
import RelationshipEdge from './RelationshipEdge'

interface FamilyChartProps {
  nodes: Node[]
  edges: Edge[]
  isLoading?: boolean
  onNodeClick?: (nodeId: string) => void
}

function FamilyChartContent({
  nodes: initialNodes,
  edges: initialEdges,
  isLoading,
  onNodeClick,
}: FamilyChartProps) {
  const navigate = useNavigate()
  const { fitView } = useReactFlow()
  const [nodes, , onNodesChange] = useNodesState(initialNodes)
  const [edges, , onEdgesChange] = useEdgesState(initialEdges)

  useEffect(() => {
    if (initialNodes.length > 0) {
      setTimeout(() => fitView({ padding: 0.2 }), 100)
    }
  }, [initialNodes, fitView])

  const nodeTypes = useMemo(() => ({ personNode: PersonNode }), [])
  const edgeTypes = useMemo(() => ({ relationshipEdge: RelationshipEdge }), [])

  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      onNodeClick?.(node.id)
      // Navigate to person detail page
      navigate(`/person/${node.id}`)
    },
    [onNodeClick, navigate]
  )

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading family tree...</p>
        </div>
      </div>
    )
  }

  if (nodes.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No family members found</p>
          <p className="text-sm text-gray-500">Add a person to get started</p>
        </div>
      </div>
    )
  }

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onNodeClick={handleNodeClick}
    >
      <Background />
      <Controls />
      <MiniMap />
      <Panel position="top-left" className="space-y-2">
        <div className="bg-white p-3 rounded-lg shadow">
          <h3 className="font-semibold text-gray-700 mb-2">Legend</h3>
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full border-2 border-pink-500"></div>
              <span>💍 Spouse (14px)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full border-2 border-blue-600"></div>
              <span>👨‍👧 Parent/Child (12px)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full border-2 border-green-500"></div>
              <span>👯 Sibling (10px)</span>
            </div>
          </div>
        </div>
      </Panel>
    </ReactFlow>
  )
}

export default function FamilyChart(props: FamilyChartProps) {
  return (
    <ReactFlow>
      <FamilyChartContent {...props} />
    </ReactFlow>
  )
}
