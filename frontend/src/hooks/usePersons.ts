import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { persons as personsApi } from '../api/endpoints'
import { CreatePersonRequest } from '../api/types'

export const usePersonsList = (limit = 20, offset = 0) => {
  return useQuery({
    queryKey: ['persons', limit, offset],
    queryFn: async () => {
      const response = await personsApi.list(limit, offset)
      return response.data
    },
  })
}

export const usePersonDetail = (id: string | undefined) => {
  return useQuery({
    queryKey: ['person', id],
    queryFn: async () => {
      if (!id) throw new Error('Person ID required')
      const response = await personsApi.get(id)
      return response.data
    },
    enabled: !!id,
  })
}

export const usePersonSearch = (query: string, limit = 20) => {
  return useQuery({
    queryKey: ['persons-search', query, limit],
    queryFn: async () => {
      const response = await personsApi.search(query, limit)
      return response.data
    },
    enabled: query.length > 0,
  })
}

export const useCreatePerson = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreatePersonRequest) => personsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['persons'] })
    },
  })
}

export const useUpdatePerson = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreatePersonRequest> }) =>
      personsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['person', id] })
      queryClient.invalidateQueries({ queryKey: ['persons'] })
    },
  })
}

export const useDeletePerson = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => personsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['persons'] })
    },
  })
}
