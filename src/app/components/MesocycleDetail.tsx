'use client'

import { useState } from 'react'
import { X, Calendar, Clock, Play, Pause, ChevronRight } from 'lucide-react'
import { updateMesocycle } from '@/lib/supabase/database'
import { useSupabaseAuth } from '@/lib/hooks/useSupabaseAuth'
import { DayView } from './DayView'

interface MesocycleDetailProps {
  mesocycle: any
  onClose: () => void
  onUpdate: () => void
}

export default function MesocycleDetail({ mesocycle, onClose, onUpdate }: MesocycleDetailProps) {
  const [loading, setLoading] = useState(false)
  const [selectedWorkout, setSelectedWorkout] = useState<any>(null)
  const { user } = useSupabaseAuth()

  const handleWorkoutClick = (workout: any) => {
    if (user?.email === 'subodhmaharjan33@gmail.com') {
      setSelectedWorkout(workout)
    } else {
      // Do nothing for other users per requirement
    }
  }

  const toggleActive = async () => {
    setLoading(true)
    try {
      const { error } = await updateMesocycle(mesocycle.id, {
        is_active: !mesocycle.is_active
      })
      if (error) throw error
      onUpdate()
    } catch (error) {
      console.error('Error updating mesocycle:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/4 xl:w-2/3 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{mesocycle.name}</h2>
            <p className="text-sm text-gray-500 mt-1">
              {mesocycle.number_of_weeks} weeks • Created {new Date(mesocycle.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleActive}
              disabled={loading}
              className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md ${
                mesocycle.is_active
                  ? 'text-red-700 bg-red-100 hover:bg-red-200'
                  : 'text-green-700 bg-green-100 hover:bg-green-200'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50`}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
              ) : mesocycle.is_active ? (
                <Pause className="h-4 w-4 mr-1" />
              ) : (
                <Play className="h-4 w-4 mr-1" />
              )}
              {mesocycle.is_active ? 'Deactivate' : 'Activate'}
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm text-gray-500">
              {mesocycle.weeks?.length || 0} of {mesocycle.number_of_weeks} weeks
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all"
              style={{
                width: `${Math.min(((mesocycle.weeks?.length || 0) / mesocycle.number_of_weeks) * 100, 100)}%`
              }}
            ></div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {selectedWorkout ? (
            <div className="-mx-5 -mb-5">
              <DayView
                workout={selectedWorkout}
                onBack={() => setSelectedWorkout(null)}
                onUpdate={onUpdate}
              />
            </div>
          ) : (
            <>
              <h3 className="text-lg font-medium text-gray-900">Weeks</h3>
              {mesocycle.weeks && mesocycle.weeks.length > 0 ? (
                <div className="grid gap-4">
                  {mesocycle.weeks.map((week: any) => (
                    <div key={week.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">{week.name}</h4>
                        <span className="text-sm text-gray-500">Week {week.week_number}</span>
                      </div>
                      <div className="space-y-2">
                        {week.workouts && week.workouts.length > 0 ? (
                          week.workouts.map((workout: any) => (
                            <div
                              key={workout.id}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-md cursor-pointer hover:bg-gray-100 transition-colors"
                              onClick={() => handleWorkoutClick(workout)}
                            >
                              <div className="flex items-center">
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900">{workout.day_name}</p>
                                  <p className="text-xs text-gray-500">{workout.exercises?.length || 0} exercises</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                {workout.is_completed && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Completed</span>
                                )}
                                <ChevronRight className="h-4 w-4 text-gray-400" />
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500 italic">No workouts in this week</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No weeks found</h3>
                  <p className="mt-1 text-sm text-gray-500">This mesocycle doesn&apos;t have any weeks yet.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
