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

// Hierarchical layout algorithm to arrange nodes and prevent overlap
function calculateHierarchicalLayout(nodes: Node[], edges: Edge[]): Node[] {
  if (nodes.length === 0) return nodes

  // Build adjacency map for hierarchy
  const parentMap = new Map<string, Set<string>>()
  const childMap = new Map<string, Set<string>>()
  const visitedForDepth = new Set<string>()
  const depthMap = new Map<string, number>()

  nodes.forEach((node) => {
    parentMap.set(node.id, new Set())
    childMap.set(node.id, new Set())
  })

  edges.forEach((edge) => {
    const source = edge.source
    const target = edge.target
    if (edge.data?.type === 'parent') {
      parentMap.get(target)?.add(source)
      childMap.get(source)?.add(target)
    }
  })

  // Calculate depth (generation level) for each node using BFS
  function calculateDepth(nodeId: string): number {
    if (visitedForDepth.has(nodeId)) {
      return depthMap.get(nodeId) || 0
    }

    visitedForDepth.add(nodeId)
    const parents = parentMap.get(nodeId) || new Set()

    if (parents.size === 0) {
      depthMap.set(nodeId, 0)
      return 0
    }

    const maxParentDepth = Math.max(
      ...Array.from(parents).map((p) => calculateDepth(p))
    )
    const depth = maxParentDepth + 1
    depthMap.set(nodeId, depth)
    return depth
  }

  nodes.forEach((node) => {
    calculateDepth(node.id)
  })

  // Group nodes by depth
  const depthGroups = new Map<number, string[]>()
  depthMap.forEach((depth, nodeId) => {
    if (!depthGroups.has(depth)) {
      depthGroups.set(depth, [])
    }
    depthGroups.get(depth)!.push(nodeId)
  })

  // Calculate layout positions with increased spacing for edge labels
  // Increased spacing to prevent edge label overlap
  const horizontalSpacing = 380  // Increased from 280 to 380
  const verticalSpacing = 280    // Increased from 200 to 280
  const minX = -600              // Adjusted to center better with larger spacing

  const layoutNodes = nodes.map((node) => {
    const depth = depthMap.get(node.id) || 0
    const depthGroup = depthGroups.get(depth) || []
    const indexInGroup = depthGroup.indexOf(node.id)
    const groupSize = depthGroup.length

    // Center nodes horizontally within their group
    // Extra spacing ensures edge labels have room to display
    const groupWidth = Math.max(groupSize * horizontalSpacing - horizontalSpacing, 0)
    const x = minX + (indexInGroup * horizontalSpacing) + groupWidth / (groupSize || 1)

    // Position vertically by depth
    // Increased spacing prevents vertical label overlap
    const y = depth * verticalSpacing

    return {
      ...node,
      position: { x, y },
      data: {
        ...node.data,
        label: node.data?.label || node.id,
      },
    }
  })

  return layoutNodes
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
          onClick={() => {
            fitView({ padding: 0.3, duration: 500 })
          }}
          className="w-full bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold flex items-center justify-center gap-2"
          title="Auto-center chart and arrange nodes to show hierarchy clearly"
        >
          🎯 Center & Arrange
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

  // Apply hierarchical layout to initial nodes
  const layoutedNodes = useMemo(
    () => calculateHierarchicalLayout(initialNodes, initialEdges),
    [initialNodes, initialEdges]
  )

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes)
  const [edges, , onEdgesChange] = useEdgesState(initialEdges)

  useEffect(() => {
    const arranged = calculateHierarchicalLayout(initialNodes, initialEdges)
    setNodes(arranged)
  }, [initialNodes, initialEdges, setNodes])

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
