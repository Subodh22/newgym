'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Check, Plus, X } from 'lucide-react'
import { updateSet, createSet, deleteSet } from '@/lib/supabase/database'
import { ExerciseFeedback } from './ExerciseFeedback'

interface Set {
  id: number
  set_number: number
  weight: number | null
  reps: number | null
  is_completed: boolean
  notes?: string | null
}

interface Exercise {
  id: number
  name: string
  sets: Set[]
  notes?: string | null
  exercise_order: number
  target_rir?: number
  rir_description?: string
  progressive_weight?: number
  muscle_group?: string
}

interface ExerciseCardProps {
  exercise: Exercise
  onUpdateExercise: () => void
}

export function ExerciseCard({ exercise, onUpdateExercise }: ExerciseCardProps) {
  const [loading, setLoading] = useState(false)
  const [localSetValues, setLocalSetValues] = useState<{[key: number]: {weight?: number, reps?: number}}>({})
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackLoading, setFeedbackLoading] = useState(false)

  const handleSetUpdate = async (setId: number, field: keyof Set, value: number | boolean) => {
    setLoading(true)
    try {
      const updates: any = { [field]: value }
      const { error } = await updateSet(setId, updates)
      if (error) throw error
      
      onUpdateExercise()
      
      // Check if all sets are now completed
      if (field === 'is_completed' && value === true) {
        const updatedSets = exercise.sets.map(set => 
          set.id === setId ? { ...set, is_completed: true } : set
        )
        const allCompleted = updatedSets.every(set => set.is_completed)
        if (allCompleted) {
          setShowFeedback(true)
        }
      }
    } catch (error) {
      console.error('Error updating set:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLocalUpdate = (setId: number, field: 'weight' | 'reps', value: number) => {
    setLocalSetValues(prev => ({
      ...prev,
      [setId]: {
        ...prev[setId],
        [field]: value
      }
    }))
  }

  const saveSetValue = async (setId: number, field: 'weight' | 'reps') => {
    const localValue = localSetValues[setId]?.[field]
    if (localValue !== undefined) {
      await handleSetUpdate(setId, field, localValue)
      // Clear local value after saving
      setLocalSetValues(prev => {
        const updated = { ...prev }
        if (updated[setId]) {
          delete updated[setId][field]
          if (Object.keys(updated[setId]).length === 0) {
            delete updated[setId]
          }
        }
        return updated
      })
    }
  }

  const getDisplayValue = (set: Set, field: 'weight' | 'reps') => {
    const localValue = localSetValues[set.id]?.[field]
    return localValue !== undefined ? localValue : (set[field] || 0)
  }

  const handleAddSet = async () => {
    setLoading(true)
    try {
      const lastSet = exercise.sets[exercise.sets.length - 1]
      const newSetNumber = exercise.sets.length + 1
      
      const { error } = await createSet({
        exercise_id: exercise.id,
        set_number: newSetNumber,
        weight: lastSet?.weight || 0,
        reps: lastSet?.reps || 8,
        is_completed: false
      })
      
      if (error) throw error
      onUpdateExercise()
    } catch (error) {
      console.error('Error adding set:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveSet = async (setId: number) => {
    setLoading(true)
    try {
      const { error } = await deleteSet(setId)
      if (error) throw error
      onUpdateExercise()
    } catch (error) {
      console.error('Error removing set:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFeedbackSubmit = async (feedback: any) => {
    setFeedbackLoading(true)
    try {
      // Store feedback for later use in progressive week creation
      console.log('Exercise feedback saved:', feedback)
      setShowFeedback(false)
    } catch (error) {
      console.error('Error saving feedback:', error)
    } finally {
      setFeedbackLoading(false)
    }
  }

  const handleFeedbackSkip = () => {
    setShowFeedback(false)
  }

  const getMuscleGroup = (exerciseName: string) => {
    const name = exerciseName.toLowerCase()
    if (name.includes('bench') || name.includes('chest') || name.includes('press')) return 'Chest'
    if (name.includes('row') || name.includes('pull') || name.includes('lat')) return 'Back'
    if (name.includes('squat') || name.includes('leg')) return 'Quadriceps'
    if (name.includes('curl')) return 'Biceps'
    if (name.includes('tricep') || name.includes('dip')) return 'Triceps'
    if (name.includes('shoulder') || name.includes('press')) return 'Shoulders'
    return 'Other'
  }

  const getSetStatusColor = (set: Set) => {
    if (set.is_completed) return 'text-green-600'
    return 'text-gray-500'
  }

  const sortedSets = [...exercise.sets].sort((a, b) => a.set_number - b.set_number)

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="text-lg">{exercise.name}</CardTitle>
            <div className="flex gap-2">
              <Badge variant="secondary" className="text-xs">
                Exercise {exercise.exercise_order}
              </Badge>
              {exercise.target_rir !== undefined && (
                <Badge variant="outline" className="text-xs">
                  {exercise.target_rir} RIR
                </Badge>
              )}
              {exercise.muscle_group && (
                <Badge variant="outline" className="text-xs">
                  {exercise.muscle_group}
                </Badge>
              )}
            </div>
          </div>
        </div>
        {exercise.rir_description && (
          <p className="text-sm text-blue-600 font-medium">{exercise.rir_description}</p>
        )}
        {exercise.progressive_weight && (
          <p className="text-sm text-green-600">Progressive weight: {exercise.progressive_weight} lbs</p>
        )}
        {exercise.notes && (
          <p className="text-sm text-gray-500">{exercise.notes}</p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="grid grid-cols-4 gap-2 text-sm font-medium text-gray-500 pb-2 border-b border-gray-200">
            <span>Set</span>
            <span>Reps</span>
            <span>Weight</span>
            <span>Status</span>
          </div>
          
          {sortedSets.map((set) => (
            <div key={set.id} className="grid grid-cols-4 gap-2 items-center">
              <span className="text-sm font-medium">{set.set_number}</span>
              
              <div className="flex items-center">
                <Input
                  type="number"
                  value={getDisplayValue(set, 'reps')}
                  onChange={(e) => handleLocalUpdate(set.id, 'reps', parseInt(e.target.value) || 0)}
                  onBlur={() => saveSetValue(set.id, 'reps')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      saveSetValue(set.id, 'reps')
                      e.currentTarget.blur()
                    }
                  }}
                  className="h-8 text-center w-16 border-dashed border-gray-300 hover:border-blue-400 focus:border-blue-500"
                />
              </div>
              
              <div className="flex items-center">
                <Input
                  type="number"
                  step="0.5"
                  value={getDisplayValue(set, 'weight')}
                  onChange={(e) => handleLocalUpdate(set.id, 'weight', parseFloat(e.target.value) || 0)}
                  onBlur={() => saveSetValue(set.id, 'weight')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      saveSetValue(set.id, 'weight')
                      e.currentTarget.blur()
                    }
                  }}
                  className="h-8 text-center w-16 border-dashed border-gray-300 hover:border-blue-400 focus:border-blue-500"
                />
              </div>
              
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant={set.is_completed ? "default" : "outline"}
                  onClick={() => handleSetUpdate(set.id, 'is_completed', !set.is_completed)}
                  className="h-8 w-8 p-0"
                  disabled={loading}
                >
                  {set.is_completed ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span className="text-xs">✓</span>
                  )}
                </Button>
                {exercise.sets.length > 1 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveSet(set.id)}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                    disabled={loading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddSet}
          className="w-full mt-3"
          disabled={loading}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Set
        </Button>
      </CardContent>
      
      {/* Exercise Feedback Modal */}
      {showFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <ExerciseFeedback
            exerciseName={exercise.name}
            muscleGroup={getMuscleGroup(exercise.name)}
            onSubmit={handleFeedbackSubmit}
            onSkip={handleFeedbackSkip}
            loading={feedbackLoading}
          />
        </div>
      )}
    </Card>
  )
}
