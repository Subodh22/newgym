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

export default function Dashboard() {
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
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="space-y-1">
              <Target className="h-5 w-5 mx-auto text-blue-500" />
              <p className="text-lg font-medium">{mesocycles.length}</p>
              <p className="text-xs text-gray-500">Total Plans</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="space-y-1">
              <TrendingUp className="h-5 w-5 mx-auto text-green-500" />
              <p className="text-lg font-medium">
                {mesocycles.filter(m => m.is_active).length}
              </p>
              <p className="text-xs text-gray-500">Active Now</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          onClick={() => setViewState('create')}
          className="flex-1 h-16 flex-col gap-1"
        >
          <Zap className="h-5 w-5" />
          <span className="text-xs">Create Program</span>
        </Button>
        
        <Button
          variant="outline"
          onClick={() => setViewState('import')}
          className="flex-1 h-16 flex-col gap-1"
        >
          <Upload className="h-5 w-5" />
          <span className="text-xs">Import Data</span>
        </Button>
      </div>

      {/* Debug Button - Temporary */}
      <Button
        variant="outline"
        onClick={() => setViewState('debug')}
        className="w-full text-xs"
      >
        🔧 Debug Auth & Database
      </Button>

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
            <div className="flex gap-3 justify-center">
              <Button onClick={() => setViewState('create')}>
                <Zap className="h-4 w-4 mr-2" />
                Create Program
              </Button>
              <Button variant="outline" onClick={() => setViewState('import')}>
                <Upload className="h-4 w-4 mr-2" />
                Import Data
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
