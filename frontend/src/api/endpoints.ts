import axiosInstance from './client'
import {
  User,
  Person,
  Relationship,
  ValidationRequest,
  SubgraphResponse,
  CreatePersonRequest,
  CreateRelationshipRequest,
} from './types'

// Auth endpoints
export const auth = {
  getMe: () => axiosInstance.get<User>('/auth/me'),
  googleCallback: (code: string) =>
    axiosInstance.post<{ token: string; user: User }>('/auth/google/callback', { code }),
  facebookCallback: (code: string) =>
    axiosInstance.post<{ token: string; user: User }>('/auth/facebook/callback', { code }),
}

// Persons endpoints
export const persons = {
  list: (limit = 20, offset = 0) =>
    axiosInstance.get<{ data: Person[]; total: number }>('/persons', {
      params: { limit, offset },
    }),
  create: (data: CreatePersonRequest) => axiosInstance.post<Person>('/persons', data),
  get: (id: string) => axiosInstance.get<Person>(`/persons/${id}`),
  update: (id: string, data: Partial<CreatePersonRequest>) =>
    axiosInstance.put<Person>(`/persons/${id}`, data),
  delete: (id: string) => axiosInstance.delete(`/persons/${id}`),
  search: (q: string, limit = 20) =>
    axiosInstance.get<{ data: Person[]; total: number }>('/persons/search', {
      params: { q, limit },
    }),
}

// Relationships endpoints
export const relationships = {
  list: (limit = 20, offset = 0) =>
    axiosInstance.get<{ data: Relationship[]; total: number }>('/relationships', {
      params: { limit, offset },
    }),
  create: (data: CreateRelationshipRequest) =>
    axiosInstance.post<Relationship>('/relationships', data),
  get: (id: string) => axiosInstance.get<Relationship>(`/relationships/${id}`),
  delete: (id: string) => axiosInstance.delete(`/relationships/${id}`),
}

// Validations endpoints
export const validations = {
  listInbox: (limit = 20, offset = 0) =>
    axiosInstance.get<{ data: ValidationRequest[]; total: number }>('/validations/inbox', {
      params: { limit, offset },
    }),
  accept: (id: string) => axiosInstance.post(`/validations/${id}/accept`),
  reject: (id: string) => axiosInstance.post(`/validations/${id}/reject`),
}

// Graph endpoints
export const graph = {
  getSubgraph: (personId: string, degrees = 3) =>
    axiosInstance.get<SubgraphResponse>(`/graph/${personId}`, {
      params: { degrees },
    }),
}
