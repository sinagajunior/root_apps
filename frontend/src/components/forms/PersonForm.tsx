import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreatePerson, useUpdatePerson } from '../../hooks/usePersons'
import { Person } from '../../api/types'

const personSchema = z.object({
  full_name: z.string().min(1, 'Name is required').max(255),
  birth_date: z.string().optional(),
  death_date: z.string().optional(),
  gender: z.string().optional(),
  married: z.boolean().optional(),
  avatar_url: z.string().optional(),
})

type PersonFormData = z.infer<typeof personSchema>

interface PersonFormProps {
  initialPerson?: Person
  onSuccess?: () => void
}

export default function PersonForm({ initialPerson, onSuccess }: PersonFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors }, watch } = useForm<PersonFormData>({
    resolver: zodResolver(personSchema),
    defaultValues: {
      full_name: initialPerson?.full_name || '',
      birth_date: initialPerson?.birth_date || '',
      death_date: initialPerson?.death_date || '',
      gender: initialPerson?.gender || '',
      married: initialPerson?.married || false,
      avatar_url: initialPerson?.avatar_url || '',
    },
  })

  const avatarUrl = watch('avatar_url')

  const createPerson = useCreatePerson()
  const updatePerson = useUpdatePerson()

  const onSubmit = async (data: PersonFormData) => {
    try {
      setSubmitError(null)
      setSubmitSuccess(null)

      // Convert empty strings to undefined for optional fields
      const cleanData = {
        full_name: data.full_name,
        birth_date: data.birth_date || undefined,
        death_date: data.death_date || undefined,
        gender: data.gender || undefined,
        married: data.married || undefined,
        avatar_url: data.avatar_url || undefined,
      }

      if (initialPerson) {
        await updatePerson.mutateAsync({ id: initialPerson.id, data: cleanData })
        setSubmitSuccess('Person updated successfully!')
      } else {
        await createPerson.mutateAsync(cleanData)
        setSubmitSuccess('Person created successfully!')
      }

      // Wait a bit before calling onSuccess to show the success message
      setTimeout(() => {
        onSuccess?.()
      }, 500)
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error || error?.message || 'An error occurred'
      setSubmitError(errorMessage)
      console.error('Error saving person:', error)
    }
  }

  const isLoading = createPerson.isPending || updatePerson.isPending

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {submitError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {submitError}
        </div>
      )}

      {submitSuccess && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
          {submitSuccess}
        </div>
      )}

      {/* Avatar Section */}
      <div className="flex flex-col items-center">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg mb-4">
          {avatarUrl || previewAvatar ? (
            <img
              src={avatarUrl || previewAvatar}
              alt="Avatar"
              className="w-full h-full object-cover"
              onError={() => (
                <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                  {(initialPerson?.full_name || '')[0]?.toUpperCase()}
                </div>
              )}
            />
          ) : (
            <div className="text-white text-2xl font-bold">
              {(watch('full_name') || ' ')[0]?.toUpperCase()}
            </div>
          )}
        </div>
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Avatar URL
          </label>
          <input
            {...register('avatar_url')}
            type="url"
            placeholder="https://example.com/avatar.jpg"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          {errors.avatar_url && (
            <p className="mt-1 text-sm text-red-600">{errors.avatar_url.message}</p>
          )}
        </div>
      </div>

      {/* Name Field */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2">
          Full Name *
        </label>
        <input
          {...register('full_name')}
          type="text"
          placeholder="Enter full name"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        />
        {errors.full_name && (
          <p className="mt-1 text-sm text-red-600">{errors.full_name.message}</p>
        )}
      </div>

      {/* Two Column Layout for Date Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Birth Date
          </label>
          <input
            {...register('birth_date')}
            type="date"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
          {errors.birth_date && (
            <p className="mt-1 text-sm text-red-600">{errors.birth_date.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Death Date
          </label>
          <input
            {...register('death_date')}
            type="date"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
          {errors.death_date && (
            <p className="mt-1 text-sm text-red-600">{errors.death_date.message}</p>
          )}
        </div>
      </div>

      {/* Gender and Status Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Gender
          </label>
          <select
            {...register('gender')}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          >
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Status
          </label>
          <div className="flex items-center mt-3">
            <label className="flex items-center cursor-pointer">
              <input
                {...register('married')}
                type="checkbox"
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Married</span>
            </label>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 transition shadow-md"
      >
        {isLoading ? 'Saving...' : initialPerson ? 'Update Person' : 'Create Person'}
      </button>
    </form>
  )
}
