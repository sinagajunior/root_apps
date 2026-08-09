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

// Hierarchical layout algorithm to arrange nodes with descendants below parents
function calculateHierarchicalLayout(nodes: Node[], edges: Edge[]): Node[] {
  if (nodes.length === 0) return nodes

  // Build parent-child relationships
  const parentMap = new Map<string, Set<string>>()
  const childMap = new Map<string, Set<string>>()
  const depthMap = new Map<string, number>()

  nodes.forEach((node) => {
    parentMap.set(node.id, new Set())
    childMap.set(node.id, new Set())
  })

  // Identify parent-child edges (person A is parent of person B)
  // Only process parent relationships, ignore siblings and spouses
  edges.forEach((edge) => {
    // Check if this is a parent-child relationship
    if (edge.data?.type === 'parent' || edge.data?.relationshipType === 'parent') {
      const source = edge.source as string
      const target = edge.target as string

      const targetParents = parentMap.get(target)
      const sourceChildren = childMap.get(source)
      if (targetParents) targetParents.add(source)
      if (sourceChildren) sourceChildren.add(target)
    }
  })

  // Calculate depth for each node based on ancestors
  function calculateDepth(nodeId: string, visited = new Set<string>()): number {
    if (depthMap.has(nodeId)) {
      return depthMap.get(nodeId)!
    }

    if (visited.has(nodeId)) {
      return 0 // Prevent infinite loops
    }

    visited.add(nodeId)
    const parentsSet = parentMap.get(nodeId) || new Set<string>()
    const parents: string[] = Array.from(parentsSet)

    if (parents.length === 0) {
      depthMap.set(nodeId, 0) // Root ancestor
      return 0
    }

    const maxParentDepth = Math.max(0, ...parents.map((p: string) => calculateDepth(p, new Set(visited))))
    const depth = maxParentDepth + 1
    depthMap.set(nodeId, depth)
    return depth
  }

  // Calculate depths for all nodes
  nodes.forEach((node) => {
    calculateDepth(node.id)
  })

  // Group nodes by depth level
  const depthGroups = new Map<number, string[]>()
  nodes.forEach((node) => {
    const depth = depthMap.get(node.id) || 0
    if (!depthGroups.has(depth)) {
      depthGroups.set(depth, [])
    }
    depthGroups.get(depth)!.push(node.id)
  })

  // Calculate positions with proper hierarchy
  const horizontalSpacing = 380    // Space between siblings
  const verticalSpacing = 280      // Space between generations
  const startX = -800              // Start position for centering
  const startY = 0                 // Top position

  const layoutNodes = nodes.map((node) => {
    const depth = depthMap.get(node.id) || 0
    const depthGroup = depthGroups.get(depth) || []
    const indexInGroup = depthGroup.indexOf(node.id)
    const groupSize = depthGroup.length

    // Calculate horizontal position within group
    // Center the group of nodes at this depth level
    const totalGroupWidth = (groupSize - 1) * horizontalSpacing
    const groupStartX = startX + (totalGroupWidth / 2) // Center the group
    const x = groupStartX - (indexInGroup * horizontalSpacing)

    // Calculate vertical position based on depth (generation level)
    // Each generation is positioned lower
    const y = startY + (depth * verticalSpacing)

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
                <line x1="2" y1="8" x2="14" y2="8" stroke="#0066cc" strokeWidth="1" strokeDasharray="2,3" />
              </svg>
              <span>👨‍👧 Parent-Child</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => fitView({ padding: 0.3, duration: 500 })}
          className="w-full bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold flex items-center justify-center gap-2"
          title="Auto-center chart and arrange nodes to show hierarchy clearly"
        >
          🎯 Center & Arrange
        </button>
      </Panel>
      <Panel position="bottom-left" className="space-y-2">
        <div className="bg-white p-2 rounded-lg shadow text-xs font-semibold text-gray-600">
          <p>📊 Hierarchy: Level 0 (Root) → Descendants by Level</p>
        </div>
      </Panel>
    </>
  )
}

export default function FamilyChart(props: FamilyChartProps) {
  const { nodes: initialNodes, edges: initialEdges, isLoading, onNodeClick } = props
  const navigate = useNavigate()

  // Filter out sibling and spouse edges - only keep parent-child relationships
  const filteredEdges = useMemo(
    () =>
      initialEdges.filter(
        (edge) =>
          edge.data?.type === 'parent' ||
          edge.data?.relationshipType === 'parent'
      ),
    [initialEdges]
  )

  // Apply hierarchical layout to initial nodes
  const layoutedNodes = useMemo(
    () => calculateHierarchicalLayout(initialNodes, filteredEdges),
    [initialNodes, filteredEdges]
  )

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes)
  const [edges, , onEdgesChange] = useEdgesState(filteredEdges)

  useEffect(() => {
    const arranged = calculateHierarchicalLayout(initialNodes, filteredEdges)
    setNodes(arranged)
  }, [initialNodes, filteredEdges, setNodes])

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
