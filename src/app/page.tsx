'use client'

import { useState } from 'react'
import { useSupabaseAuth } from "@/lib/hooks/useSupabaseAuth"
import AuthPage from "@/app/components/AuthPage"
import { CurrentWorkout } from "@/app/components/CurrentWorkout"
import { MobileNavigation } from "@/app/components/MobileNavigation"
import { UserProfile } from "@/app/components/UserProfile"
import { DayView } from "@/app/components/DayView"
import Dashboard from "@/app/components/Dashboard"

type ViewState = 
  | { type: 'tab', tab: 'current' | 'mesocycles' | 'profile' }
  | { type: 'workout', workout: any }

export default function Home() {
  const { user, loading } = useSupabaseAuth()
  const [viewState, setViewState] = useState<ViewState>({ type: 'tab', tab: 'current' })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return <AuthPage />
  }

  const handleSelectWorkout = (workoutData: any) => {
    // Handle both formats: direct workout object or wrapped workout data
    const workout = workoutData.workout || workoutData
    setViewState({ type: 'workout', workout: workout })
  }

  const handleBackFromWorkout = () => {
    setViewState({ type: 'tab', tab: 'current' })
  }

  const handleWorkoutUpdate = () => {
    // Force re-render by updating the view state
    setViewState(prev => ({ ...prev }))
  }

  const renderActiveView = () => {
    if (viewState.type === 'workout') {
      return (
        <DayView
          workout={viewState.workout}
          onBack={handleBackFromWorkout}
          onUpdate={handleWorkoutUpdate}
        />
      )
    }

    switch (viewState.tab) {
      case 'current':
        return <Dashboard key={`current-${Date.now()}`} onSelectWorkout={handleSelectWorkout} />
      case 'mesocycles':
        return <Dashboard key={`mesocycles-${Date.now()}`} onSelectWorkout={handleSelectWorkout} />
      case 'profile':
        return <UserProfile />
      default:
        return <Dashboard key={`default-${Date.now()}`} onSelectWorkout={handleSelectWorkout} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 max-w-md">
        {renderActiveView()}
      </div>

      {/* Bottom Navigation - only show when not in workout view */}
      {viewState.type === 'tab' && (
        <MobileNavigation 
          activeTab={viewState.tab} 
          onTabChange={(tab) => setViewState({ type: 'tab', tab })} 
        />
      )}
    </div>
  )
}
