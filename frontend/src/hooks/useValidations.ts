import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { validations as validationsApi } from '../api/endpoints'

export const useValidationInbox = (limit = 20, offset = 0) => {
  return useQuery({
    queryKey: ['validations', 'inbox', limit, offset],
    queryFn: async () => {
      const response = await validationsApi.listInbox(limit, offset)
      return response.data
    },
    // Poll for new validations every 30 seconds
    refetchInterval: 30000,
  })
}

export const useAcceptValidation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => validationsApi.accept(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['validations', 'inbox'] })
      queryClient.invalidateQueries({ queryKey: ['relationships'] })
      queryClient.invalidateQueries({ queryKey: ['graph'] })
    },
  })
}

export const useRejectValidation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => validationsApi.reject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['validations', 'inbox'] })
      queryClient.invalidateQueries({ queryKey: ['relationships'] })
      queryClient.invalidateQueries({ queryKey: ['graph'] })
    },
  })
}
