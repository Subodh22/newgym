'use client'

import { useState, useEffect } from 'react'
import { ExerciseCard } from './ExerciseCard'
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
              setWorkout(w)
              return
            }
          }
        }
      }
    } catch (error) {
      console.error('Error refreshing workout:', error)
    }
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
      onUpdate()
    } catch (error) {
      console.error('Error completing workout:', error)
    } finally {
      setLoading(false)
    }
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
                This workout doesn't have any exercises planned
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
    </div>
  )
}
