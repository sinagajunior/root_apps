import { useCallback, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  useReactFlow,
  MiniMap,
  Panel,
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

function FamilyChartContent() {
  const { fitView } = useReactFlow()

  return (
    <>
      <Background />
      <Controls />
      <MiniMap />
      <Panel position="top-left" className="space-y-2">
        <div className="bg-white p-3 rounded-lg shadow">
          <h3 className="font-semibold text-gray-700 mb-2">Relationship Types</h3>
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <svg width="16" height="16" style={{ minWidth: '16px' }}>
                <line x1="2" y1="8" x2="14" y2="8" stroke="#dc2626" strokeWidth="1" strokeDasharray="2,3" />
              </svg>
              <span>💍 Spouse</span>
            </div>
            <div className="flex items-center gap-2">
              <svg width="16" height="16" style={{ minWidth: '16px' }}>
                <line x1="2" y1="8" x2="14" y2="8" stroke="#0066cc" strokeWidth="1" strokeDasharray="2,3" />
              </svg>
              <span>👨‍👧 Parent/Child</span>
            </div>
            <div className="flex items-center gap-2">
              <svg width="16" height="16" style={{ minWidth: '16px' }}>
                <line x1="2" y1="8" x2="14" y2="8" stroke="#16a34a" strokeWidth="1" strokeDasharray="2,3" />
              </svg>
              <span>👯 Sibling</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => fitView({ padding: 0.2, duration: 500 })}
          className="w-full bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold flex items-center justify-center gap-2"
          title="Auto-center chart"
        >
          🎯 Center
        </button>
      </Panel>
      <Panel position="bottom-left" className="space-y-2">
        <div className="bg-white p-2 rounded-lg shadow text-xs font-semibold text-gray-600">
          <p>📊 Hierarchical view: Ancestors at top → Descendants at bottom</p>
        </div>
      </Panel>
    </>
  )
}

export default function FamilyChart(props: FamilyChartProps) {
  const { nodes: initialNodes, edges: initialEdges, isLoading, onNodeClick } = props
  const navigate = useNavigate()
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, , onEdgesChange] = useEdgesState(initialEdges)

  useEffect(() => {
    setNodes(initialNodes)
  }, [initialNodes, setNodes])

  const nodeTypes = useMemo(() => ({ personNode: PersonNode }), [])
  const edgeTypes = useMemo(() => ({ relationshipEdge: RelationshipEdge }), [])

  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      console.log('Node clicked:', node.id)
      if (onNodeClick) {
        onNodeClick(node.id)
      }
      navigate(`/person/${node.id}`, { replace: false })
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
      nodesDraggable={true}
      nodesConnectable={false}
      fitView
    >
      <FamilyChartContent />
    </ReactFlow>
  )
}
