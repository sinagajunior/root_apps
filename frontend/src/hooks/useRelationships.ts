import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { relationships as relationshipsApi } from '../api/endpoints'
import { CreateRelationshipRequest } from '../api/types'

export const useRelationshipsList = (limit = 20, offset = 0) => {
  return useQuery({
    queryKey: ['relationships', limit, offset],
    queryFn: async () => {
      const response = await relationshipsApi.list(limit, offset)
      return response.data
    },
  })
}

export const useRelationshipDetail = (id: string | undefined) => {
  return useQuery({
    queryKey: ['relationship', id],
    queryFn: async () => {
      if (!id) throw new Error('Relationship ID required')
      const response = await relationshipsApi.get(id)
      return response.data
    },
    enabled: !!id,
  })
}

export const useCreateRelationship = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateRelationshipRequest) => relationshipsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['relationships'] })
      queryClient.invalidateQueries({ queryKey: ['graph'] })
    },
  })
}

export const useDeleteRelationship = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => relationshipsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['relationships'] })
      queryClient.invalidateQueries({ queryKey: ['graph'] })
    },
  })
}
