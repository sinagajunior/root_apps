import { useQuery } from '@tanstack/react-query'
import { graph as graphApi } from '../api/endpoints'
import { SubgraphResponse } from '../api/types'

export interface FlowNode {
  id: string
  data: {
    label: string
    status: 'pending' | 'validated'
    birthDate?: string
    deathDate?: string
  }
  position: { x: number; y: number }
}

export interface FlowEdge {
  id: string
  source: string
  target: string
  data: {
    label: string
    status: 'pending' | 'validated'
  }
  animated?: boolean
}

/**
 * Transform API response to react-flow format
 */
export function transformToFlowGraph(
  data: SubgraphResponse
): { nodes: FlowNode[]; edges: FlowEdge[] } {
  const nodes: FlowNode[] = data.persons.map((person, index) => ({
    id: person.id,
    type: 'personNode',
    data: {
      label: person.full_name,
      status: 'validated' as const,
      birthDate: person.birth_date,
      deathDate: person.death_date,
      gender: person.gender,
      married: person.married,
      avatar_url: person.avatar_url,
    },
    position: {
      x: (index % 5) * 250,
      y: Math.floor(index / 5) * 250,
    },
  }))

  const edges: FlowEdge[] = data.relationships.map((rel) => ({
    id: rel.id,
    type: 'relationshipEdge',
    source: rel.person_a_id,
    target: rel.person_b_id,
    data: {
      label: rel.relationship_type.charAt(0).toUpperCase() + rel.relationship_type.slice(1),
      status: rel.status as 'pending' | 'validated',
    },
    animated: rel.status === 'pending',
  }))

  return { nodes, edges }
}

export const useGraph = (personId: string | undefined, degrees = 3) => {
  const query = useQuery({
    queryKey: ['graph', personId, degrees],
    queryFn: async () => {
      if (!personId) throw new Error('Person ID required')
      const response = await graphApi.getSubgraph(personId, degrees)
      return response.data
    },
    enabled: !!personId,
  })

  return {
    ...query,
    flowData: query.data ? transformToFlowGraph(query.data) : null,
  }
}
