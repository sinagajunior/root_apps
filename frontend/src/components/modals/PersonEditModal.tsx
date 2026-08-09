import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Person, CreatePersonRequest } from '../../api/types'
import { persons } from '../../api/endpoints'

const editPersonSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  birth_date: z.string().optional(),
  death_date: z.string().optional(),
  gender: z.string().optional(),
  married: z.boolean().optional(),
  avatar_url: z.string().optional(),
})

type EditPersonFormData = z.infer<typeof editPersonSchema>

interface PersonEditModalProps {
  person: Person
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export default function PersonEditModal({
  person,
  isOpen,
  onClose,
  onSave,
}: PersonEditModalProps) {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState('')
  const [previewAvatar, setPreviewAvatar] = useState<string>(person.avatar_url || '')

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<EditPersonFormData>({
    resolver: zodResolver(editPersonSchema),
    defaultValues: {
      full_name: person.full_name,
      birth_date: person.birth_date || '',
      death_date: person.death_date || '',
      gender: person.gender || '',
      married: person.married || false,
      avatar_url: person.avatar_url || '',
    },
  })

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result as string
      setPreviewAvatar(base64)
      setValue('avatar_url', base64)
    }
    reader.readAsDataURL(file)
  }

  const updateMutation = useMutation({
    mutationFn: async (data: EditPersonFormData) => {
      const payload: CreatePersonRequest = {
        full_name: data.full_name,
        birth_date: data.birth_date || undefined,
        death_date: data.death_date || undefined,
        gender: data.gender || undefined,
        married: data.married || undefined,
        avatar_url: data.avatar_url || undefined,
      }
      const response = await persons.update(person.id, payload)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['person', person.id] })
      queryClient.invalidateQueries({ queryKey: ['persons'] })
      onSave()
    },
    onError: (err: any) => {
      setError(err.message || 'Failed to update person')
    },
  })

  const onSubmit = async (data: EditPersonFormData) => {
    setError('')
    updateMutation.mutate(data)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Edit {person.full_name}</h2>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Avatar Upload */}
          <div className="text-center">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="mx-auto w-32 h-32 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all overflow-hidden"
            >
              {previewAvatar ? (
                <img
                  src={previewAvatar}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center">
                  <div className="text-3xl mb-2">📷</div>
                  <div className="text-xs text-gray-600">Click to upload</div>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
            <p className="text-xs text-gray-500 mt-2">Click avatar to change photo</p>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              {...register('full_name')}
              type="text"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="Enter full name"
            />
            {errors.full_name && (
              <p className="text-red-500 text-sm mt-1">{errors.full_name.message}</p>
            )}
          </div>

          {/* Birth Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Birth Date
            </label>
            <input
              {...register('birth_date')}
              type="date"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
            {errors.birth_date && (
              <p className="text-red-500 text-sm mt-1">{errors.birth_date.message}</p>
            )}
          </div>

          {/* Death Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Death Date (Optional)
            </label>
            <input
              {...register('death_date')}
              type="date"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
            {errors.death_date && (
              <p className="text-red-500 text-sm mt-1">{errors.death_date.message}</p>
            )}
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Gender
            </label>
            <select
              {...register('gender')}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="">Not specified</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Married Status */}
          <div className="flex items-center gap-3">
            <input
              {...register('married')}
              type="checkbox"
              id="married"
              className="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded cursor-pointer"
            />
            <label htmlFor="married" className="text-sm font-semibold text-gray-700">
              💍 Married
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg border-2 border-gray-300 hover:bg-gray-50 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-semibold disabled:opacity-50"
            >
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
