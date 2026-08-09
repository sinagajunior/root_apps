// Auth types
export interface User {
  id: string
  email: string
  name: string
}

export interface AuthResponse {
  token: string
  user: User
}

// Person types
export interface Person {
  id: string
  full_name: string
  birth_date?: string
  death_date?: string
}

export interface CreatePersonRequest {
  full_name: string
  birth_date?: string
  death_date?: string
}

// Relationship types
export interface Relationship {
  id: string
  person_a_id: string
  person_b_id: string
  relationship_type: 'parent' | 'child' | 'spouse' | 'sibling'
  status: 'pending' | 'validated' | 'rejected'
}

export interface CreateRelationshipRequest {
  person_a_id?: string
  person_b_id: string
  relationship_type: string
}

// Validation request types
export interface ValidationRequest {
  id: string
  relationship_id: string
  requested_to_person_id: string
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
}

// Graph types
export interface SubgraphResponse {
  persons: Person[]
  relationships: Relationship[]
}
