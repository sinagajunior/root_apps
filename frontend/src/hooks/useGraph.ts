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
    gender?: string
    married?: boolean
    avatar_url?: string
    spouse?: string
    children?: string[]
    partner_status?: string
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
 * Calculate hierarchical layout for family tree
 */
function calculateNodePositions(
  persons: any[],
  relationships: any[]
): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>()

  // Build adjacency information
  const childrenOf = new Map<string, string[]>()
  const parentsOf = new Map<string, string[]>()
  const spouseOf = new Map<string, string | null>()

  persons.forEach((p) => {
    childrenOf.set(p.id, [])
    parentsOf.set(p.id, [])
    spouseOf.set(p.id, null)
  })

  relationships.forEach((rel) => {
    if (rel.relationship_type === 'parent') {
      childrenOf.get(rel.person_a_id)?.push(rel.person_b_id)
      parentsOf.get(rel.person_b_id)?.push(rel.person_a_id)
    } else if (rel.relationship_type === 'spouse') {
      spouseOf.set(rel.person_a_id, rel.person_b_id)
      spouseOf.set(rel.person_b_id, rel.person_a_id)
    }
  })

  // Find root person (person with no parents or the first one)
  let rootId = persons[0].id
  for (const person of persons) {
    if ((parentsOf.get(person.id) ?? []).length === 0) {
      rootId = person.id
      break
    }
  }

  // Hierarchical positioning: generations as levels
  const generationOf = new Map<string, number>()
  const visited = new Set<string>()

  function assignGeneration(personId: string, gen: number) {
    if (visited.has(personId)) return
    visited.add(personId)
    generationOf.set(personId, gen)

    const parents = parentsOf.get(personId) ?? []
    parents.forEach((pId) => assignGeneration(pId, gen + 1))

    const children = childrenOf.get(personId) ?? []
    children.forEach((cId) => assignGeneration(cId, gen - 1))
  }

  assignGeneration(rootId, 0)

  // Group persons by generation
  const byGeneration = new Map<number, string[]>()
  generationOf.forEach((gen, personId) => {
    if (!byGeneration.has(gen)) byGeneration.set(gen, [])
    byGeneration.get(gen)!.push(personId)
  })

  // Position nodes: y by generation, x spread within generation
  const spacing = 350  // Horizontal spacing between sibling couples
  const verticalSpacing = 320  // Vertical spacing between generations
  const coupleSpacing = 120  // Horizontal spacing within a couple (spouse next to spouse)

  byGeneration.forEach((personIds, gen) => {
    const y = gen * verticalSpacing

    // Group people into couples and singles
    const couples: Array<string[]> = []
    const singles: string[] = []
    const processed = new Set<string>()

    personIds.forEach((personId) => {
      if (!processed.has(personId)) {
        const spouse = spouseOf.get(personId)
        if (spouse && personIds.includes(spouse)) {
          couples.push([personId, spouse])
          processed.add(personId)
          processed.add(spouse)
        } else {
          singles.push(personId)
          processed.add(personId)
        }
      }
    })

    // Calculate total width needed
    const totalUnits = couples.length + singles.length
    const totalWidth = (totalUnits - 1) * spacing
    const startX = -totalWidth / 2

    let unitIndex = 0

    // Position couples
    couples.forEach((couple) => {
      const baseX = startX + unitIndex * spacing
      const coupleLeft = baseX - coupleSpacing / 2
      const coupleRight = baseX + coupleSpacing / 2

      positions.set(couple[0], { x: coupleLeft, y })
      positions.set(couple[1], { x: coupleRight, y })
      unitIndex++
    })

    // Position singles
    singles.forEach((personId) => {
      const x = startX + unitIndex * spacing
      positions.set(personId, { x, y })
      unitIndex++
    })
  })

  return positions
}

/**
 * Transform API response to react-flow format
 */
export function transformToFlowGraph(
  data: SubgraphResponse
): { nodes: FlowNode[]; edges: FlowEdge[] } {
  // Calculate hierarchical positions
  const positions = calculateNodePositions(data.persons, data.relationships)

  // Build lookup maps for relationships
  const spouseOf = new Map<string, string>()
  const childrenOf = new Map<string, string[]>()

  data.persons.forEach((p) => {
    childrenOf.set(p.id, [])
  })

  data.relationships.forEach((rel) => {
    if (rel.relationship_type === 'spouse') {
      spouseOf.set(rel.person_a_id, rel.person_b_id)
      spouseOf.set(rel.person_b_id, rel.person_a_id)
    } else if (rel.relationship_type === 'parent') {
      childrenOf.get(rel.person_a_id)?.push(rel.person_b_id)
    }
  })

  const nodes: FlowNode[] = data.persons.map((person: any) => ({
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
      spouse: spouseOf.get(person.id),
      children: childrenOf.get(person.id) || [],
      partner_status: person.partner_status,
    },
    position: positions.get(person.id) || { x: 0, y: 0 },
  }))

  const edges: FlowEdge[] = data.relationships.map((rel) => {
    // Get labels based on relationship type
    let label = 'Related'

    if (rel.relationship_type === 'spouse') {
      label = 'Spouse'
    } else if (rel.relationship_type === 'parent') {
      label = 'Parent'
    } else if (rel.relationship_type === 'child') {
      label = 'Child'
    } else if (rel.relationship_type === 'sibling') {
      label = 'Sibling'
    }

    return {
      id: rel.id,
      type: 'relationshipEdge',
      source: rel.person_a_id,
      target: rel.person_b_id,
      data: {
        label,
        status: rel.status as 'pending' | 'validated',
      },
      animated: rel.status === 'pending',
    }
  })

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
