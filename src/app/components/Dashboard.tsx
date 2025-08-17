'use client'

import { useState, useEffect } from 'react'
import { useSupabaseAuth } from '@/lib/hooks/useSupabaseAuth'
import { getMesocycles } from '@/lib/supabase/database'
import MesocycleList from './MesocycleList'
import ImportData from './ImportData'
import { CreateMesocycle } from './CreateMesocycle'
import { DebugAuth } from './DebugAuth'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Target, TrendingUp, Plus, Upload, Zap } from 'lucide-react'

type ViewState = 'list' | 'import' | 'create' | 'debug'

interface DashboardProps {
  onSelectWorkout?: (workout: any) => void
}

export default function Dashboard({ onSelectWorkout }: DashboardProps = {}) {
  const { user } = useSupabaseAuth()
  const [mesocycles, setMesocycles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [viewState, setViewState] = useState<ViewState>('list')

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

  const handleSuccess = () => {
    setViewState('list')
    loadMesocycles()
  }

  if (loading) {
    return (
      <div className="space-y-6 pb-20">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-40 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (viewState === 'import') {
    return (
      <ImportData
        onClose={() => setViewState('list')}
        onSuccess={handleSuccess}
      />
    )
  }

  if (viewState === 'create') {
    return (
      <CreateMesocycle
        onBack={() => setViewState('list')}
        onSuccess={handleSuccess}
      />
    )
  }

  if (viewState === 'debug') {
    return (
      <div className="space-y-6 pb-20">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => setViewState('list')}>
            ← Back
          </Button>
          <h1 className="text-2xl font-bold">Debug Mode</h1>
        </div>
        <DebugAuth />
      </div>
    )
  }

  // Main dashboard view
  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Training Plans</h1>
        <p className="text-gray-500 text-sm">
          Manage your mesocycles and training phases
        </p>
      </div>

      {/* Overview Stats */}
      {(() => {
        const activeMesocycle = mesocycles.find(m => m.is_active)
        const allWorkouts = activeMesocycle?.weeks
          ?.flatMap((week: any) => week.workouts || []) || []
        const completedCount = allWorkouts.filter((w: any) => w.is_completed).length
        const totalCount = allWorkouts.length
        const successRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
        
        return (
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="space-y-1">
                  <Zap className="h-5 w-5 mx-auto text-orange-500" />
                  <p className="text-lg font-medium">6</p>
                  <p className="text-xs text-gray-500">Day Streak</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="space-y-1">
                  <Target className="h-5 w-5 mx-auto text-green-500" />
                  <p className="text-lg font-medium">{completedCount}</p>
                  <p className="text-xs text-gray-500">Completed</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="space-y-1">
                  <TrendingUp className="h-5 w-5 mx-auto text-blue-500" />
                  <p className="text-lg font-medium">{successRate}%</p>
                  <p className="text-xs text-gray-500">Success Rate</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      })()}

      {/* Next Workout Section */}
      {(() => {
        const activeMesocycle = mesocycles.find(m => m.is_active)
        
        // Get all workouts sorted by week and day
        const allWorkouts = activeMesocycle?.weeks
          ?.sort((a: any, b: any) => a.week_number - b.week_number)
          ?.flatMap((week: any) => 
            (week.workouts || []).map((workout: any) => ({
              ...workout,
              week: week,
              mesocycle: activeMesocycle
            }))
          ) || []

        // Find the next incomplete workout
        const nextWorkout = allWorkouts.find((workout: any) => !workout.is_completed)
        
        // Get completion stats
        const completedCount = allWorkouts.filter((w: any) => w.is_completed).length
        const totalCount = allWorkouts.length
        const isAllCompleted = completedCount === totalCount && totalCount > 0

        if (nextWorkout) {
          return (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Today Workout</CardTitle>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    Ready
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <h3 className="font-medium">{nextWorkout.day_name}</h3>
                  <p className="text-sm text-gray-500">
                    {nextWorkout.exercises?.length || 0} exercises planned
                  </p>
                  <div className="flex items-center text-xs text-gray-500">
                    <span>📅 Today</span>
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={() => {
                      if (onSelectWorkout) {
                        onSelectWorkout(nextWorkout)
                      } else {
                        // Fallback if no navigation callback provided
                        alert('Navigate to the "Plans" tab and select your active mesocycle to access this workout.')
                      }
                    }}
                  >
                    View Workout
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        } else if (isAllCompleted) {
          return (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Today Workout</CardTitle>
                  <Badge className="bg-green-100 text-green-800">All Complete</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <p className="text-sm text-gray-600 mb-2">🎉 All workouts completed!</p>
                  <p className="text-xs text-gray-400">Create a new mesocycle or deload week to continue training.</p>
                </div>
              </CardContent>
            </Card>
          )
        }
        
        return (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Today Workout</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <p className="text-sm text-gray-500 mb-3">No active workout found</p>
                <p className="text-xs text-gray-400">Create or activate a mesocycle to see your next workout</p>
              </div>
            </CardContent>
          </Card>
        )
      })()}

      {/* Action Buttons */}
      <div className="flex justify-center">
        <Button
          onClick={() => setViewState('create')}
          className="h-16 px-8 flex-col gap-1"
        >
          <Zap className="h-5 w-5" />
          <span className="text-xs">Create Program</span>
        </Button>
      </div>



      {/* Mesocycles by Status */}
      {mesocycles.length > 0 ? (
        <div className="space-y-6">
          {(['active', 'planned', 'completed'] as const).map(status => {
            const filtered = mesocycles.filter(m => {
              if (status === 'active') return m.is_active
              if (status === 'planned') return !m.is_active && !isCompleted(m)
              return isCompleted(m)
            })
            
            if (filtered.length === 0) return null

            return (
              <div key={status} className="space-y-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-medium capitalize">{status}</h2>
                  <Badge variant="secondary" className="text-xs">
                    {filtered.length}
                  </Badge>
                </div>
                
                <MesocycleList mesocycles={filtered} onUpdate={loadMesocycles} />
              </div>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Target className="h-12 w-12 mx-auto mb-4 text-gray-400 opacity-50" />
            <h3 className="font-medium mb-2">No training plans yet</h3>
            <p className="text-sm text-gray-500 mb-6">
              Create your first mesocycle to get started with structured training
            </p>
            <div className="flex justify-center">
              <Button onClick={() => setViewState('create')}>
                <Zap className="h-4 w-4 mr-2" />
                Create Program
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Helper function to check if mesocycle is completed
function isCompleted(mesocycle: any): boolean {
  if (!mesocycle.weeks || mesocycle.weeks.length === 0) return false
  
  return mesocycle.weeks.every((week: any) => 
    week.workouts && week.workouts.length > 0 && 
    week.workouts.every((workout: any) => workout.is_completed)
  )
}
