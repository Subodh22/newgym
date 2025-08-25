'use client'

import { useState, useMemo } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent } from './ui/card'
import { getAllExercisesUnified, getMuscleGroups, searchExercises, type ExerciseData } from '@/app/lib/exerciseVideos'

interface AddExerciseFormProps {
  workoutId: number
  onExerciseAdded: () => void
  onCancel: () => void
}

export function AddExerciseForm({ workoutId, onExerciseAdded, onCancel }: AddExerciseFormProps) {
  const [exerciseName, setExerciseName] = useState('')
  const [customExercise, setCustomExercise] = useState('')
  const [loading, setLoading] = useState(false)
  const [showCustom, setShowCustom] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>('')

  // Get all exercises and muscle groups
  const allExercises = useMemo(() => getAllExercisesUnified(), [])
  const muscleGroups = useMemo(() => getMuscleGroups(), [])

  // Filter exercises based on search and muscle group
  const filteredExercises = useMemo(() => {
    let exercises = allExercises

    if (selectedMuscleGroup) {
      exercises = exercises.filter(ex => ex.muscleGroup === selectedMuscleGroup)
    }

    if (searchQuery) {
      const setFiltered = new Set(searchExercises(searchQuery).map(e => e.name))
      exercises = exercises.filter(ex => setFiltered.has(ex.name))
    }

    return exercises
  }, [allExercises, selectedMuscleGroup, searchQuery])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const finalExerciseName = showCustom ? customExercise : exerciseName
      
      if (!finalExerciseName.trim()) {
        alert('Please enter an exercise name')
        return
      }

      // Get the next exercise order
      const response = await fetch(`/api/workouts/exercises`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: finalExerciseName,
          workoutId: workoutId,
          sets: 3, // Default 3 sets
          weight: 0, // Default weight
          reps: 8 // Default reps
        })
      })

      if (!response.ok) {
        throw new Error('Failed to add exercise')
      }

      onExerciseAdded()
    } catch (error) {
      console.error('Error adding exercise:', error)
      alert('Failed to add exercise')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!showCustom ? (
        <div className="space-y-4">
          {/* Muscle Group Filter */}
          <div>
            <label htmlFor="muscle-group-select" className="block text-sm font-medium text-gray-700 mb-2">
              Muscle Group
            </label>
            <select
              id="muscle-group-select"
              value={selectedMuscleGroup}
              onChange={(e) => setSelectedMuscleGroup(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">All Muscle Groups</option>
              {muscleGroups.map(group => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div>
            <label htmlFor="exercise-search" className="block text-sm font-medium text-gray-700 mb-2">
              Search Exercises
            </label>
            <Input
              id="exercise-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search exercises..."
              className="w-full"
            />
          </div>

          {/* Exercise Selection */}
          <div>
            <label htmlFor="exercise-select" className="block text-sm font-medium text-gray-700 mb-2">
              Choose Exercise ({filteredExercises.length} available)
            </label>
            <select
              id="exercise-select"
              value={exerciseName}
              onChange={(e) => setExerciseName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md max-h-60"
              size={Math.min(filteredExercises.length + 1, 10)}
            >
              <option value="">Select an exercise...</option>
              {filteredExercises.map(exercise => (
                <option key={exercise.name} value={exercise.name}>
                  {exercise.name} ({exercise.muscleGroup})
                </option>
              ))}
            </select>
          </div>

          {/* Exercise Info Display */}
          {exerciseName && (
            <div className="p-3 bg-gray-50 rounded-md">
              <h4 className="font-medium text-sm text-gray-900">{exerciseName}</h4>
              {(() => {
                const exercise = allExercises.find(ex => ex.name === exerciseName)
                if (exercise) {
                  return (
                    <div className="text-xs text-gray-600 mt-1">
                      <p><strong>Muscle Group:</strong> {exercise.muscleGroup}</p>
                      <p><strong>Category:</strong> {exercise.category}</p>
                      <p><strong>Equipment:</strong> {exercise.equipment.join(', ')}</p>
                    </div>
                  )
                }
                return null
              })()}
            </div>
          )}
          
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowCustom(true)}
            className="w-full"
          >
            Add Custom Exercise
          </Button>
        </div>
      ) : (
        <div>
          <label htmlFor="custom-exercise" className="block text-sm font-medium text-gray-700 mb-2">
            Exercise Name
          </label>
          <Input
            id="custom-exercise"
            value={customExercise}
            onChange={(e) => setCustomExercise(e.target.value)}
            placeholder="Enter exercise name..."
            className="mt-1"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowCustom(false)}
            className="w-full mt-2"
          >
            Choose from Database
          </Button>
        </div>
      )}

      <div className="flex gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading || (!exerciseName && !customExercise)}
          className="flex-1"
        >
          {loading ? 'Adding...' : 'Add Exercise'}
        </Button>
      </div>
    </form>
  )
}
