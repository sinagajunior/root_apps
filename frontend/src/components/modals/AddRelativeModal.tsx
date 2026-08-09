import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQueryClient } from '@tanstack/react-query'
import { useCreateRelationship } from '../../hooks/useRelationships'
import { usePersonSearch } from '../../hooks/usePersons'
import PersonForm from '../forms/PersonForm'

const relationshipSchema = z.object({
  relationship_type: z.enum(['parent', 'child', 'spouse', 'sibling']),
  person_b_id: z.string().uuid('Invalid person selected'),
})

type RelationshipFormData = z.infer<typeof relationshipSchema>

interface AddRelativeModalProps {
  personAId: string
  isOpen: boolean
  onClose: () => void
}

export default function AddRelativeModal({ personAId, isOpen, onClose }: AddRelativeModalProps) {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<RelationshipFormData>({
    resolver: zodResolver(relationshipSchema),
    defaultValues: { relationship_type: 'parent' },
  })

  const createRelationship = useCreateRelationship()
  const searchPersons = usePersonSearch(searchQuery)

  const onSubmit = async (data: RelationshipFormData) => {
    try {
      await createRelationship.mutateAsync({
        person_a_id: personAId,
        person_b_id: data.person_b_id,
        relationship_type: data.relationship_type,
      })
      onClose()
    } catch (error) {
      console.error('Error creating relationship:', error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Add Family Member</h2>

        {!showCreateForm ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Relationship Type *
              </label>
              <select
                {...register('relationship_type')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="parent">Parent</option>
                <option value="child">Child</option>
                <option value="spouse">Spouse</option>
                <option value="sibling">Sibling</option>
              </select>
              {errors.relationship_type && (
                <p className="mt-1 text-sm text-red-600">{errors.relationship_type.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select or Search Person *
              </label>
              <input
                type="text"
                placeholder="Search for a person..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {searchQuery && searchPersons.data && (
                <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                  {searchPersons.data.data.map((person) => (
                    <button
                      key={person.id}
                      type="button"
                      onClick={() => {
                        setValue('person_b_id', person.id)
                        setSearchQuery(person.full_name)
                      }}
                      className="w-full text-left p-2 hover:bg-blue-100 rounded border border-gray-200"
                    >
                      {person.full_name}
                      {person.birth_date && ` (born ${person.birth_date})`}
                    </button>
                  ))}
                  {searchPersons.data.data.length === 0 && (
                    <p className="text-gray-500 text-sm">No persons found</p>
                  )}
                </div>
              )}

              {errors.person_b_id && (
                <p className="mt-1 text-sm text-red-600">{errors.person_b_id.message}</p>
              )}
            </div>

            <div className="text-center text-sm text-gray-600">
              or{' '}
              <button
                type="button"
                onClick={() => setShowCreateForm(true)}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                create new person
              </button>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createRelationship.isPending}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                {createRelationship.isPending ? 'Adding...' : 'Add Relative'}
              </button>
            </div>
          </form>
        ) : (
          <div>
            <p className="text-sm text-gray-600 mb-4">Create a new family member to add</p>
            <PersonForm
              onSuccess={() => {
                // Invalidate persons and graph queries so data refreshes
                queryClient.invalidateQueries({ queryKey: ['persons'] })
                queryClient.invalidateQueries({ queryKey: ['graph'] })
                setShowCreateForm(false)
              }}
            />
            <button
              onClick={() => setShowCreateForm(false)}
              className="mt-4 w-full text-center text-sm text-gray-600 hover:text-gray-700"
            >
              Back to search
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
