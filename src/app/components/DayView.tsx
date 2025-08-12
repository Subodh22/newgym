'use client'

import { useState, useEffect } from 'react'
import { ExerciseCard } from './ExerciseCard'
import { WeekFeedback } from './WeekFeedback'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { ArrowLeft, Clock, Calendar, Plus, CheckCircle2 } from 'lucide-react'
import { updateWorkout, getMesocycles } from '@/lib/supabase/database'
import { useSupabaseAuth } from '@/lib/hooks/useSupabaseAuth'

interface DayViewProps {
  workout: any
  onBack: () => void
  onUpdate: () => void
}

export function DayView({ workout: initialWorkout, onBack, onUpdate }: DayViewProps) {
  const { user } = useSupabaseAuth()
  const [workout, setWorkout] = useState(initialWorkout)
  const [loading, setLoading] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackLoading, setFeedbackLoading] = useState(false)

  const refreshWorkout = async () => {
    if (!user) return
    
    try {
      const { data, error } = await getMesocycles(user.id)
      if (error) throw error
      
      // Find the updated workout
      for (const mesocycle of data || []) {
        for (const week of mesocycle.weeks || []) {
          for (const w of week.workouts || []) {
            if (w.id === workout.id) {
              setWorkout({ ...w, week, mesocycle })
              return
            }
          }
        }
      }
    } catch (error) {
      console.error('Error refreshing workout:', error)
    }
  }

  const getMesocycleId = () => {
    // Try multiple ways to get the mesocycle ID
    if (workout.week?.mesocycle_id) return workout.week.mesocycle_id
    if (workout.mesocycle?.id) return workout.mesocycle.id
    
    // If we can't find it, we need to fetch it
    console.warn('Mesocycle ID not found in workout data, attempting to fetch...')
    return null
  }

  const getWeekNumber = () => {
    if (workout.week?.week_number) return workout.week.week_number
    return 1 // Default to week 1
  }

  const handleCompleteWorkout = async () => {
    setLoading(true)
    try {
      const allSetsCompleted = workout.exercises?.every((exercise: any) => 
        exercise.sets?.every((set: any) => set.is_completed)
      ) || false
      
      const { error } = await updateWorkout(workout.id, { 
        is_completed: allSetsCompleted,
        workout_date: allSetsCompleted ? new Date().toISOString().split('T')[0] : workout.workout_date
      })
      
      if (error) throw error
      
      setWorkout({ ...workout, is_completed: allSetsCompleted })
      
      // Check if this is the last workout of the week
      if (allSetsCompleted) {
        // For now, show feedback after completing any workout
        // In a full implementation, you'd check if all workouts in the week are complete
        setShowFeedback(true)
      }
      
      onUpdate()
    } catch (error) {
      console.error('Error completing workout:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFeedbackSubmit = async (feedback: any) => {
    setFeedbackLoading(true)
    try {
      // Extract unique muscle groups from the workout
      const muscleGroups = Array.from(new Set(
        workout.exercises?.map((exercise: any) => {
          // Map exercise names to muscle groups (simplified)
          const exerciseName = exercise.name.toLowerCase()
          if (exerciseName.includes('bench') || exerciseName.includes('press') || exerciseName.includes('chest')) return 'Chest'
          if (exerciseName.includes('deadlift') || exerciseName.includes('row') || exerciseName.includes('pull')) return 'Back'
          if (exerciseName.includes('squat') || exerciseName.includes('leg')) return 'Quadriceps'
          if (exerciseName.includes('curl')) return 'Biceps'
          if (exerciseName.includes('tricep') || exerciseName.includes('dip')) return 'Triceps'
          if (exerciseName.includes('shoulder') || exerciseName.includes('press')) return 'Shoulders'
          return 'Other'
        }) || []
      ))

      // Get mesocycle ID and week number
      const mesocycleId = getMesocycleId()
      const currentWeekNumber = getWeekNumber()
      
      if (!mesocycleId) {
        throw new Error('Could not determine mesocycle ID. Please try refreshing the page.')
      }

      console.log('🔍 Debug info:', {
        mesocycleId,
        currentWeekNumber,
        workoutId: workout.id,
        workoutData: workout
      })

      // Call the progressive week creation API
      const requestBody = {
        mesocycleId: mesocycleId,
        weekNumber: currentWeekNumber + 1,
        userFeedback: feedback,
        trainingDays: 6,
        selectedSplit: { 'Push': [], 'Pull': [], 'Legs': [] },
        workoutPlans: {}
      }
      
      console.log('📤 Sending request to progressive week API:', requestBody)
      
      // Use mock API while database issues are resolved
      const response = await fetch('/api/mesocycles/progressive-week-mock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('❌ Progressive week API error:', errorData)
        throw new Error(`Failed to create next week: ${errorData.error || response.statusText}`)
      }

      const result = await response.json()
      console.log('✅ Next week created with autoregulation:', result)
      
      setShowFeedback(false)
      onUpdate() // Refresh the data
    } catch (error) {
      console.error('Error creating next week:', error)
      alert(`Failed to create next week: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setFeedbackLoading(false)
    }
  }

  const handleFeedbackSkip = () => {
    setShowFeedback(false)
  }

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long', 
      day: 'numeric' 
    })
  }

  const calculateProgress = () => {
    if (!workout.exercises || workout.exercises.length === 0) return 0
    
    const totalSets = workout.exercises.reduce((total: number, exercise: any) => 
      total + (exercise.sets?.length || 0), 0
    )
    const completedSets = workout.exercises.reduce((total: number, exercise: any) => 
      total + (exercise.sets?.filter((set: any) => set.is_completed).length || 0), 0
    )
    
    return totalSets > 0 ? (completedSets / totalSets) * 100 : 0
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={onBack} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            {workout.is_completed && (
              <Badge variant="default" className="bg-green-500">
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Completed
              </Badge>
            )}
          </div>
          
          <div className="space-y-2">
            <CardTitle className="text-2xl">{workout.day_name}</CardTitle>
            <div className="flex items-center gap-4 text-gray-500">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(workout.workout_date || workout.created_at)}</span>
              </div>
              {workout.notes && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Notes available</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-4">
            <div className="space-y-1">
              <p className="text-sm text-gray-500">
                Progress: {Math.round(calculateProgress())}% complete
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${calculateProgress()}%` }}
                />
              </div>
            </div>
            
            {!workout.is_completed && (
              <Button 
                onClick={handleCompleteWorkout} 
                className="ml-4"
                disabled={loading}
              >
                Complete Workout
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Exercises */}
      <div className="space-y-4">
        {workout.exercises && workout.exercises.length > 0 ? (
          workout.exercises
            .sort((a: any, b: any) => a.exercise_order - b.exercise_order)
            .map((exercise: any) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                onUpdateExercise={refreshWorkout}
              />
            ))
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Plus className="h-12 w-12 mx-auto mb-4 text-gray-400 opacity-50" />
              <h3 className="font-medium mb-2">No exercises yet</h3>
              <p className="text-sm text-gray-500 mb-4">
                This workout doesn&apos;t have any exercises planned
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Workout Notes */}
      {workout.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Workout Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700">{workout.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Week Feedback Modal */}
      {showFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-4xl">
            <WeekFeedback
              weekNumber={workout.week?.week_number || 1}
              muscleGroups={Array.from(new Set(
                workout.exercises?.map((exercise: any) => {
                  const exerciseName = exercise.name.toLowerCase()
                  if (exerciseName.includes('bench') || exerciseName.includes('press') || exerciseName.includes('chest')) return 'Chest'
                  if (exerciseName.includes('deadlift') || exerciseName.includes('row') || exerciseName.includes('pull')) return 'Back'
                  if (exerciseName.includes('squat') || exerciseName.includes('leg')) return 'Quadriceps'
                  if (exerciseName.includes('curl')) return 'Biceps'
                  if (exerciseName.includes('tricep') || exerciseName.includes('dip')) return 'Triceps'
                  if (exerciseName.includes('shoulder') || exerciseName.includes('press')) return 'Shoulders'
                  return 'Other'
                }) || []
              ))}
              onSubmit={handleFeedbackSubmit}
              onSkip={handleFeedbackSkip}
              loading={feedbackLoading}
            />
          </div>
        </div>
      )}
    </div>
  )
}
