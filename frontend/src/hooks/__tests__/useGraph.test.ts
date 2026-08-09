import { describe, it, expect } from 'vitest'
import { transformToFlowGraph } from '../useGraph'
import { SubgraphResponse } from '../../api/types'

describe('useGraph transformToFlowGraph', () => {
  it('should transform empty response to empty nodes and edges', () => {
    const data: SubgraphResponse = {
      persons: [],
      relationships: [],
    }

    const result = transformToFlowGraph(data)

    expect(result.nodes).toEqual([])
    expect(result.edges).toEqual([])
  })

  it('should transform single person to single node', () => {
    const data: SubgraphResponse = {
      persons: [
        {
          id: 'person-1',
          full_name: 'John Doe',
          birth_date: '1990-01-15',
          death_date: undefined,
        },
      ],
      relationships: [],
    }

    const result = transformToFlowGraph(data)

    expect(result.nodes).toHaveLength(1)
    expect(result.nodes[0]).toMatchObject({
      id: 'person-1',
      data: {
        label: 'John Doe',
        birthDate: '1990-01-15',
      },
    })
  })

  it('should transform relationship to edge with correct status', () => {
    const data: SubgraphResponse = {
      persons: [
        { id: 'person-1', full_name: 'John Doe' },
        { id: 'person-2', full_name: 'Alice Doe' },
      ],
      relationships: [
        {
          id: 'rel-1',
          person_a_id: 'person-1',
          person_b_id: 'person-2',
          relationship_type: 'parent',
          status: 'validated',
        },
      ],
    }

    const result = transformToFlowGraph(data)

    expect(result.edges).toHaveLength(1)
    expect(result.edges[0]).toMatchObject({
      id: 'rel-1',
      source: 'person-1',
      target: 'person-2',
      label: 'parent',
      status: 'validated',
    })
  })

  it('should set animated flag for pending relationships', () => {
    const data: SubgraphResponse = {
      persons: [
        { id: 'person-1', full_name: 'John Doe' },
        { id: 'person-2', full_name: 'Alice Doe' },
      ],
      relationships: [
        {
          id: 'rel-1',
          person_a_id: 'person-1',
          person_b_id: 'person-2',
          relationship_type: 'spouse',
          status: 'pending',
        },
      ],
    }

    const result = transformToFlowGraph(data)

    expect(result.edges[0].animated).toBe(true)
  })

  it('should position nodes in grid layout', () => {
    const data: SubgraphResponse = {
      persons: [
        { id: 'person-1', full_name: 'Person 1' },
        { id: 'person-2', full_name: 'Person 2' },
        { id: 'person-3', full_name: 'Person 3' },
        { id: 'person-4', full_name: 'Person 4' },
        { id: 'person-5', full_name: 'Person 5' },
        { id: 'person-6', full_name: 'Person 6' },
      ],
      relationships: [],
    }

    const result = transformToFlowGraph(data)

    expect(result.nodes).toHaveLength(6)
    // Check grid layout positioning (5 columns)
    expect(result.nodes[0].position.x).toBe(0)
    expect(result.nodes[0].position.y).toBe(0)
    expect(result.nodes[4].position.x).toBe(0)
    expect(result.nodes[4].position.y).toBe(250)
  })

  it('should handle complex family tree', () => {
    const data: SubgraphResponse = {
      persons: [
        { id: 'parent', full_name: 'Parent', birth_date: '1960-01-01' },
        { id: 'child1', full_name: 'Child 1', birth_date: '1990-01-01' },
        { id: 'child2', full_name: 'Child 2', birth_date: '1992-01-01' },
        { id: 'grandchild', full_name: 'Grandchild', birth_date: '2015-01-01' },
      ],
      relationships: [
        {
          id: 'rel-1',
          person_a_id: 'parent',
          person_b_id: 'child1',
          relationship_type: 'parent',
          status: 'validated',
        },
        {
          id: 'rel-2',
          person_a_id: 'parent',
          person_b_id: 'child2',
          relationship_type: 'parent',
          status: 'validated',
        },
        {
          id: 'rel-3',
          person_a_id: 'child1',
          person_b_id: 'grandchild',
          relationship_type: 'parent',
          status: 'pending',
        },
      ],
    }

    const result = transformToFlowGraph(data)

    expect(result.nodes).toHaveLength(4)
    expect(result.edges).toHaveLength(3)
    expect(result.edges[0].status).toBe('validated')
    expect(result.edges[2].animated).toBe(true) // pending edge
  })
})
