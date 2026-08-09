import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreatePerson, useUpdatePerson } from '../../hooks/usePersons'
import { Person } from '../../api/types'

const personSchema = z.object({
  full_name: z.string().min(1, 'Name is required').max(255),
  birth_date: z.string().optional(),
  death_date: z.string().optional(),
})

type PersonFormData = z.infer<typeof personSchema>

interface PersonFormProps {
  initialPerson?: Person
  onSuccess?: () => void
}

export default function PersonForm({ initialPerson, onSuccess }: PersonFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<PersonFormData>({
    resolver: zodResolver(personSchema),
    defaultValues: {
      full_name: initialPerson?.full_name || '',
      birth_date: initialPerson?.birth_date || '',
      death_date: initialPerson?.death_date || '',
    },
  })

  const createPerson = useCreatePerson()
  const updatePerson = useUpdatePerson()

  const onSubmit = async (data: PersonFormData) => {
    try {
      if (initialPerson) {
        await updatePerson.mutateAsync({ id: initialPerson.id, data })
      } else {
        await createPerson.mutateAsync(data)
      }
      onSuccess?.()
    } catch (error) {
      console.error('Error saving person:', error)
    }
  }

  const isLoading = createPerson.isPending || updatePerson.isPending

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Full Name *
        </label>
        <input
          {...register('full_name')}
          type="text"
          placeholder="Enter full name"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.full_name && (
          <p className="mt-1 text-sm text-red-600">{errors.full_name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Birth Date
        </label>
        <input
          {...register('birth_date')}
          type="date"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.birth_date && (
          <p className="mt-1 text-sm text-red-600">{errors.birth_date.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Death Date
        </label>
        <input
          {...register('death_date')}
          type="date"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.death_date && (
          <p className="mt-1 text-sm text-red-600">{errors.death_date.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
      >
        {isLoading ? 'Saving...' : initialPerson ? 'Update Person' : 'Add Person'}
      </button>
    </form>
  )
}
