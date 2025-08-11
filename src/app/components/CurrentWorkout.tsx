'use client'

import { useState, useMemo } from 'react'
import { useSupabaseAuth } from '@/lib/hooks/useSupabaseAuth'
import { getMesocycles } from '@/lib/supabase/database'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Calendar, Clock, TrendingUp, Zap, CheckCircle2 } from 'lucide-react'
import { useEffect } from 'react'

interface CurrentWorkoutProps {
  onSelectWorkout?: (workout: any) => void
}

export function CurrentWorkout({ onSelectWorkout }: CurrentWorkoutProps) {
  const { user } = useSupabaseAuth()
  const [mesocycles, setMesocycles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadMesocycles()
    }
  }, [user])

  const loadMesocycles = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const { data, error } = await getMesocycles(user.id)
      if (error) throw error
      setMesocycles(data || [])
    } catch (error) {
      console.error('Error loading mesocycles:', error)
    } finally {
      setLoading(false)
    }
  }

  // Find today's workout or next upcoming workout
  const currentWorkout = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const activeMesocycle = mesocycles.find(m => m.is_active)
    if (!activeMesocycle) return null

    // Look for today's workout first
    for (const week of activeMesocycle.weeks || []) {
      for (const workout of week.workouts || []) {
        if (workout.workout_date) {
          const workoutDate = new Date(workout.workout_date)
          workoutDate.setHours(0, 0, 0, 0)
          
          if (workoutDate.getTime() === today.getTime()) {
            return { mesocycle: activeMesocycle, week, workout }
          }
        }
      }
    }

    // If no workout today, find the next upcoming incomplete workout
    for (const week of activeMesocycle.weeks || []) {
      for (const workout of week.workouts || []) {
        if (!workout.is_completed) {
          return { mesocycle: activeMesocycle, week, workout }
        }
      }
    }

    return null
  }, [mesocycles])

  // Get recent completed workouts
  const recentWorkouts = useMemo(() => {
    const completed: any[] = []
    
    mesocycles.forEach(mesocycle => {
      mesocycle.weeks?.forEach((week: any) => {
        week.workouts?.forEach((workout: any) => {
          if (workout.is_completed) {
            completed.push({ mesocycle, week, workout })
          }
        })
      })
    })

    return completed
      .sort((a, b) => new Date(b.workout.workout_date || b.workout.created_at).getTime() - 
                      new Date(a.workout.workout_date || a.workout.created_at).getTime())
      .slice(0, 3)
  }, [mesocycles])

  const formatDate = (date: string | Date) => {
    const d = new Date(date)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    if (d.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (d.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow'
    } else {
      return d.toLocaleDateString('en-US', { 
        weekday: 'short',
        month: 'short', 
        day: 'numeric' 
      })
    }
  }

  const getTotalStats = () => {
    const totalWorkouts = mesocycles.reduce((total, mesocycle) => 
      total + (mesocycle.weeks?.reduce((weekTotal: number, week: any) => 
        weekTotal + (week.workouts?.length || 0), 0) || 0), 0
    )
    const completedWorkouts = mesocycles.reduce((total, mesocycle) => 
      total + (mesocycle.weeks?.reduce((weekTotal: number, week: any) => 
        weekTotal + (week.workouts?.filter((w: any) => w.is_completed).length || 0), 0) || 0), 0
    )
    const currentStreak = calculateStreak()
    
    return { totalWorkouts, completedWorkouts, currentStreak }
  }

  const calculateStreak = () => {
    // Simple streak calculation - consecutive days with completed workouts
    const allWorkouts = mesocycles.flatMap(m => 
      m.weeks?.flatMap((w: any) => w.workouts || []) || []
    ).sort((a, b) => new Date(b.workout_date || b.created_at).getTime() - 
                     new Date(a.workout_date || a.created_at).getTime())
    
    let streak = 0
    for (const workout of allWorkouts) {
      if (workout.is_completed) {
        streak++
      } else {
        break
      }
    }
    return streak
  }

  if (loading) {
    return (
      <div className="space-y-6 pb-20">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-40 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  const stats = getTotalStats()

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Current Workout</h1>
        <p className="text-gray-500 text-sm">
          Stay consistent and track your progress
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="space-y-1">
              <Zap className="h-5 w-5 mx-auto text-orange-500" />
              <p className="text-lg font-medium">{stats.currentStreak}</p>
              <p className="text-xs text-gray-500">Day Streak</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="space-y-1">
              <CheckCircle2 className="h-5 w-5 mx-auto text-green-500" />
              <p className="text-lg font-medium">{stats.completedWorkouts}</p>
              <p className="text-xs text-gray-500">Completed</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="space-y-1">
              <TrendingUp className="h-5 w-5 mx-auto text-blue-500" />
              <p className="text-lg font-medium">
                {stats.totalWorkouts > 0 ? Math.round((stats.completedWorkouts / stats.totalWorkouts) * 100) : 0}%
              </p>
              <p className="text-xs text-gray-500">Success Rate</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current/Next Workout */}
      {currentWorkout ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {formatDate(currentWorkout.workout.workout_date || new Date())} Workout
              </CardTitle>
              {currentWorkout.workout.is_completed ? (
                <Badge className="bg-green-500">Completed</Badge>
              ) : (
                <Badge variant="outline">Scheduled</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium">{currentWorkout.workout.day_name}</h3>
              <p className="text-sm text-gray-500">
                {currentWorkout.workout.exercises?.length || 0} exercises planned
              </p>
              
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(currentWorkout.workout.workout_date || new Date())}</span>
                </div>
                {currentWorkout.workout.notes && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>Notes available</span>
                  </div>
                )}
              </div>
            </div>
            
            <Button 
              className="w-full" 
              onClick={() => onSelectWorkout?.(currentWorkout)}
            >
              {currentWorkout.workout.is_completed ? 'View Workout' : 'Start Workout'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400 opacity-50" />
            <h3 className="font-medium mb-2">No workout scheduled</h3>
            <p className="text-sm text-gray-500 mb-4">
              Check your mesocycles to plan your next workout
            </p>
          </CardContent>
        </Card>
      )}

      {/* Recent Workouts */}
      <div className="space-y-4">
        <h2 className="text-lg font-medium">Recent Workouts</h2>
        
        {recentWorkouts.length > 0 ? (
          <div className="space-y-3">
            {recentWorkouts.map((workout, index) => (
              <Card 
                key={`${workout.mesocycle.id}-${workout.workout.id}`}
                className="cursor-pointer hover:shadow-md transition-all duration-200"
                onClick={() => onSelectWorkout?.(workout)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h4 className="font-medium text-sm">{workout.workout.day_name}</h4>
                      <p className="text-xs text-gray-500">
                        {formatDate(workout.workout.workout_date || workout.workout.created_at)} • {workout.workout.exercises?.length || 0} exercises
                      </p>
                    </div>
                    <Badge variant="secondary" className="bg-green-500 text-white">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Done
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-3 text-gray-400 opacity-50" />
              <p className="text-sm text-gray-500">
                Complete your first workout to see it here
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
