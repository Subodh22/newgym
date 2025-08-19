'use client'

import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent } from './ui/card'

interface AddExerciseFormProps {
  workoutId: number
  onExerciseAdded: () => void
  onCancel: () => void
}

const commonExercises = [
  // Push exercises
  'Barbell Bench Press',
  'Dumbbell Bench Press',
  'Incline Bench Press',
  'Decline Bench Press',
  'Overhead Press',
  'Dumbbell Shoulder Press',
  'Lateral Raises',
  'Tricep Dips',
  'Tricep Pushdowns',
  'Close Grip Bench Press',
  
  // Pull exercises
  'Deadlift',
  'Barbell Rows',
  'Dumbbell Rows',
  'Pull-ups',
  'Lat Pulldowns',
  'Bicep Curls',
  'Hammer Curls',
  'Preacher Curls',
  'Face Pulls',
  
  // Leg exercises
  'Back Squat',
  'Front Squat',
  'Leg Press',
  'Romanian Deadlift',
  'Leg Extensions',
  'Leg Curls',
  'Calf Raises',
  'Hip Thrusts',
  'Lunges',
  'Step-ups',
  
  // Cardio exercises
  'Treadmill Running',
  'Elliptical',
  'Stairmaster',
  'Rowing Machine',
  'Cycling',
  'Jump Rope',
  'Burpees',
  'Mountain Climbers',
  'High Knees',
  'Jumping Jacks',
  'Battle Ropes',
  'Assault Bike',
  'Concept2 Rower',
  'Stair Climber',
  'Incline Walking',
  'Sprint Intervals',
  'Steady State Cardio'
]

export function AddExerciseForm({ workoutId, onExerciseAdded, onCancel }: AddExerciseFormProps) {
  const [exerciseName, setExerciseName] = useState('')
  const [customExercise, setCustomExercise] = useState('')
  const [loading, setLoading] = useState(false)
  const [showCustom, setShowCustom] = useState(false)

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
          <div>
            <label htmlFor="exercise-select" className="block text-sm font-medium text-gray-700 mb-2">Choose Exercise</label>
                         <select
               id="exercise-select"
               value={exerciseName}
               onChange={(e) => setExerciseName(e.target.value)}
               className="w-full p-2 border border-gray-300 rounded-md"
             >
               <option value="">Select an exercise...</option>
               <optgroup label="Push Exercises">
                 {commonExercises.slice(0, 10).map(exercise => (
                   <option key={exercise} value={exercise}>{exercise}</option>
                 ))}
               </optgroup>
               <optgroup label="Pull Exercises">
                 {commonExercises.slice(10, 19).map(exercise => (
                   <option key={exercise} value={exercise}>{exercise}</option>
                 ))}
               </optgroup>
               <optgroup label="Leg Exercises">
                 {commonExercises.slice(19, 29).map(exercise => (
                   <option key={exercise} value={exercise}>{exercise}</option>
                 ))}
               </optgroup>
               <optgroup label="Cardio Exercises">
                 {commonExercises.slice(29).map(exercise => (
                   <option key={exercise} value={exercise}>{exercise}</option>
                 ))}
               </optgroup>
             </select>
          </div>
          
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
          <label htmlFor="custom-exercise" className="block text-sm font-medium text-gray-700 mb-2">Exercise Name</label>
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
            Choose from List
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
