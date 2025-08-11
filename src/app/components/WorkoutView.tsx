'use client'

import { useState } from 'react'
import { X, CheckCircle, Circle, Plus, Minus, Save } from 'lucide-react'
import { updateWorkout, updateSet, createSet, deleteSet } from '@/lib/supabase/database'

interface WorkoutViewProps {
  workout: any
  onClose: () => void
  onUpdate: () => void
}

export default function WorkoutView({ workout, onClose, onUpdate }: WorkoutViewProps) {
  const [loading, setLoading] = useState(false)
  const [exercises, setExercises] = useState(workout.exercises || [])
  const [workoutCompleted, setWorkoutCompleted] = useState(workout.is_completed)

  const updateSetValue = (exerciseIndex: number, setIndex: number, field: string, value: any) => {
    const newExercises = [...exercises]
    newExercises[exerciseIndex].sets[setIndex][field] = value
    setExercises(newExercises)
  }

  const toggleSetCompleted = async (exerciseIndex: number, setIndex: number) => {
    const set = exercises[exerciseIndex].sets[setIndex]
    const newCompleted = !set.is_completed
    
    try {
      const { error } = await updateSet(set.id, { is_completed: newCompleted })
      if (error) throw error
      
      updateSetValue(exerciseIndex, setIndex, 'is_completed', newCompleted)
    } catch (error) {
      console.error('Error updating set:', error)
    }
  }

  const saveSet = async (exerciseIndex: number, setIndex: number) => {
    const set = exercises[exerciseIndex].sets[setIndex]
    setLoading(true)
    
    try {
      const { error } = await updateSet(set.id, {
        weight: set.weight,
        reps: set.reps,
        notes: set.notes
      })
      if (error) throw error
    } catch (error) {
      console.error('Error saving set:', error)
    } finally {
      setLoading(false)
    }
  }

  const addSet = async (exerciseIndex: number) => {
    const exercise = exercises[exerciseIndex]
    const newSetNumber = exercise.sets.length + 1
    
    try {
      const { data, error } = await createSet({
        exercise_id: exercise.id,
        set_number: newSetNumber,
        weight: 0,
        reps: 0,
        is_completed: false
      })
      
      if (error) throw error
      if (data) {
        const newExercises = [...exercises]
        newExercises[exerciseIndex].sets.push(data)
        setExercises(newExercises)
      }
    } catch (error) {
      console.error('Error adding set:', error)
    }
  }

  const removeSet = async (exerciseIndex: number, setIndex: number) => {
    const set = exercises[exerciseIndex].sets[setIndex]
    
    try {
      const { error } = await deleteSet(set.id)
      if (error) throw error
      
      const newExercises = [...exercises]
      newExercises[exerciseIndex].sets.splice(setIndex, 1)
      setExercises(newExercises)
    } catch (error) {
      console.error('Error removing set:', error)
    }
  }

  const toggleWorkoutCompleted = async () => {
    const newCompleted = !workoutCompleted
    setLoading(true)
    
    try {
      const { error } = await updateWorkout(workout.id, { 
        is_completed: newCompleted,
        workout_date: newCompleted ? new Date().toISOString().split('T')[0] : null
      })
      if (error) throw error
      
      setWorkoutCompleted(newCompleted)
      onUpdate()
    } catch (error) {
      console.error('Error updating workout:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-5 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/4 xl:w-2/3 shadow-lg rounded-md bg-white max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{workout.day_name}</h2>
            <p className="text-sm text-gray-500 mt-1">
              {exercises.length} exercises • {workout.workout_date ? `Completed on ${new Date(workout.workout_date).toLocaleDateString()}` : 'Not completed'}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleWorkoutCompleted}
              disabled={loading}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md ${
                workoutCompleted
                  ? 'text-green-700 bg-green-100 hover:bg-green-200'
                  : 'text-blue-700 bg-blue-100 hover:bg-blue-200'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50`}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
              ) : workoutCompleted ? (
                <CheckCircle className="h-4 w-4 mr-2" />
              ) : (
                <Circle className="h-4 w-4 mr-2" />
              )}
              {workoutCompleted ? 'Completed' : 'Mark Complete'}
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Exercises */}
        <div className="space-y-6">
          {exercises.map((exercise: any, exerciseIndex: number) => (
            <div key={exercise.id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">{exercise.name}</h3>
                <button
                  onClick={() => addSet(exerciseIndex)}
                  className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Set
                </button>
              </div>

              {/* Sets Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Set
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Weight (lbs)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reps
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {exercise.sets?.map((set: any, setIndex: number) => (
                      <tr key={set.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {setIndex + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            value={set.weight || ''}
                            onChange={(e) => updateSetValue(exerciseIndex, setIndex, 'weight', parseFloat(e.target.value) || 0)}
                            onBlur={() => saveSet(exerciseIndex, setIndex)}
                            className="w-20 px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            value={set.reps || ''}
                            onChange={(e) => updateSetValue(exerciseIndex, setIndex, 'reps', parseInt(e.target.value) || 0)}
                            onBlur={() => saveSet(exerciseIndex, setIndex)}
                            className="w-20 px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => toggleSetCompleted(exerciseIndex, setIndex)}
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              set.is_completed
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                            }`}
                          >
                            {set.is_completed ? (
                              <CheckCircle className="h-3 w-3 mr-1" />
                            ) : (
                              <Circle className="h-3 w-3 mr-1" />
                            )}
                            {set.is_completed ? 'Done' : 'Pending'}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => removeSet(exerciseIndex, setIndex)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
