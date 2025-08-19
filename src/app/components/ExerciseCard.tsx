 'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Check, Plus, X } from 'lucide-react'
import { updateSet, createSet, deleteSet } from '@/lib/supabase/database'
import { ExerciseFeedback } from './ExerciseFeedback'
import { getExerciseVideoUrl, toYouTubeEmbed, setCustomExerciseVideoUrl } from '@/app/lib/exerciseVideos'

interface Set {
  id: number
  set_number: number
  weight: number | null
  reps: number | null
  duration: number | null
  distance: number | null
  is_completed: boolean
  notes?: string | null
}

interface Exercise {
  id: number
  name: string
  sets: Set[]
  notes?: string | null
  exercise_order: number
  target_rir?: number
  rir_description?: string
  progressive_weight?: number
  muscle_group?: string
}

interface ExerciseCardProps {
  exercise: Exercise
  onUpdateExercise: () => void
  onDeleteExercise?: (exerciseId: number) => void
}

// Helper function to determine if an exercise is time-based
const isTimeBasedExercise = (exerciseName: string): boolean => {
  const timeBasedExercises = [
    'Treadmill Running', 'Elliptical', 'Stairmaster', 'Rowing Machine', 'Cycling',
    'Jump Rope', 'Burpees', 'Mountain Climbers', 'High Knees', 'Jumping Jacks',
    'Battle Ropes', 'Assault Bike', 'Concept2 Rower', 'Stair Climber',
    'Incline Walking', 'Sprint Intervals', 'Steady State Cardio'
  ]
  return timeBasedExercises.includes(exerciseName)
}

export function ExerciseCard({ exercise, onUpdateExercise, onDeleteExercise }: ExerciseCardProps) {
  const [loading, setLoading] = useState(false)
  const [localSetValues, setLocalSetValues] = useState<{[key: number]: {weight?: number, reps?: number, duration?: number}}>({})
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackLoading, setFeedbackLoading] = useState(false)
  const [showRestTimer, setShowRestTimer] = useState(false)
  const [restDurationSeconds, setRestDurationSeconds] = useState<number>(90)
  const [restRemainingSeconds, setRestRemainingSeconds] = useState<number>(0)
  const restIntervalIdRef = useRef<number | null>(null)
  const [isRestPaused, setIsRestPaused] = useState(false)
  const restPausedRef = useRef(false)
  const [showVideo, setShowVideo] = useState(false)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)

  useEffect(() => {
    setVideoUrl(getExerciseVideoUrl(exercise.name))
  }, [exercise.name])

  useEffect(() => {
    restPausedRef.current = isRestPaused
  }, [isRestPaused])

  useEffect(() => {
    return () => {
      if (restIntervalIdRef.current) {
        clearInterval(restIntervalIdRef.current)
      }
    }
  }, [])

  const startRestTimer = (seconds: number = restDurationSeconds) => {
    if (restIntervalIdRef.current) clearInterval(restIntervalIdRef.current)
    setRestRemainingSeconds(seconds)
    setShowRestTimer(true)
    setIsRestPaused(false)
    const id = window.setInterval(() => {
      setRestRemainingSeconds(prev => {
        if (restPausedRef.current) return prev
        if (prev <= 1) {
          clearInterval(id)
          restIntervalIdRef.current = null
          setShowRestTimer(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    restIntervalIdRef.current = id
  }

  const addRestTime = (seconds: number) => {
    setRestRemainingSeconds(prev => prev + seconds)
  }

  const stopRestTimer = () => {
    if (restIntervalIdRef.current) clearInterval(restIntervalIdRef.current)
    restIntervalIdRef.current = null
    setShowRestTimer(false)
  }

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }

  const handleSetUpdate = async (setId: number, field: keyof Set, value: number | boolean) => {
    setLoading(true)
    try {
      const updates: any = { [field]: value }
      const { error } = await updateSet(setId, updates)
      if (error) throw error
      
      onUpdateExercise()
      
      // Check if all sets are now completed
      if (field === 'is_completed' && value === true) {
        const updatedSets = exercise.sets.map(set => 
          set.id === setId ? { ...set, is_completed: true } : set
        )
        const allCompleted = updatedSets.every(set => set.is_completed)
        if (allCompleted) {
          setShowFeedback(true)
        } else {
          startRestTimer()
        }
      }
    } catch (error) {
      console.error('Error updating set:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLocalUpdate = (setId: number, field: 'weight' | 'reps' | 'duration' | 'distance', value: number) => {
    setLocalSetValues(prev => ({
      ...prev,
      [setId]: {
        ...prev[setId],
        [field]: value
      }
    }))
  }

  const saveSetValue = async (setId: number, field: 'weight' | 'reps' | 'duration' | 'distance') => {
    const localValue = localSetValues[setId]?.[field]
    if (localValue !== undefined) {
      await handleSetUpdate(setId, field, localValue)
      // Clear local value after saving
      setLocalSetValues(prev => {
        const updated = { ...prev }
        if (updated[setId]) {
          delete updated[setId][field]
          if (Object.keys(updated[setId]).length === 0) {
            delete updated[setId]
          }
        }
        return updated
      })
    }
  }

  const getDisplayValue = (set: Set, field: 'weight' | 'reps' | 'duration' | 'distance') => {
    const localValue = localSetValues[set.id]?.[field]
    return localValue !== undefined ? localValue : (set[field] || 0)
  }

  const handleAddSet = async () => {
    setLoading(true)
    try {
      const lastSet = exercise.sets[exercise.sets.length - 1]
      const newSetNumber = exercise.sets.length + 1
      const isTimeBased = isTimeBasedExercise(exercise.name)
      
      const setData: any = {
        exercise_id: exercise.id,
        set_number: newSetNumber,
        is_completed: false
      }

      if (isTimeBased) {
        setData.duration = lastSet?.duration || 600 // 10 minutes default
        setData.distance = lastSet?.distance || 0
        setData.weight = null
        setData.reps = null
      } else {
        setData.weight = lastSet?.weight || 0
        setData.reps = lastSet?.reps || 8
        setData.duration = null
        setData.distance = null
      }
      
      const { error } = await createSet(setData)
      
      if (error) throw error
      onUpdateExercise()
    } catch (error) {
      console.error('Error adding set:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveSet = async (setId: number) => {
    setLoading(true)
    try {
      const { error } = await deleteSet(setId)
      if (error) throw error
      onUpdateExercise()
    } catch (error) {
      console.error('Error removing set:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFeedbackSubmit = async (feedback: any) => {
    setFeedbackLoading(true)
    try {
      // Store feedback for later use in progressive week creation
      console.log('Exercise feedback saved:', feedback)
      setShowFeedback(false)
    } catch (error) {
      console.error('Error saving feedback:', error)
    } finally {
      setFeedbackLoading(false)
    }
  }

  const handleFeedbackSkip = () => {
    setShowFeedback(false)
  }

  const getMuscleGroup = (exerciseName: string) => {
    const name = exerciseName.toLowerCase()
    if (name.includes('bench') || name.includes('chest') || name.includes('press')) return 'Chest'
    if (name.includes('row') || name.includes('pull') || name.includes('lat')) return 'Back'
    if (name.includes('squat') || name.includes('leg')) return 'Quadriceps'
    if (name.includes('curl')) return 'Biceps'
    if (name.includes('tricep') || name.includes('dip')) return 'Triceps'
    if (name.includes('shoulder') || name.includes('press')) return 'Shoulders'
    return 'Other'
  }

  const getSetStatusColor = (set: Set) => {
    if (set.is_completed) return 'text-green-600'
    return 'text-gray-500'
  }

  const sortedSets = [...exercise.sets].sort((a, b) => a.set_number - b.set_number)
  const embedUrl = videoUrl ? toYouTubeEmbed(videoUrl) : null

  const handleAttachVideo = () => {
    const url = window.prompt('Paste the YouTube video URL for this exercise:')
    if (url && url.trim()) {
      setCustomExerciseVideoUrl(exercise.name, url.trim())
      setVideoUrl(url.trim())
      setShowVideo(true)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="text-lg">{exercise.name}</CardTitle>
            <div className="flex gap-2">
              <Badge variant="secondary" className="text-xs">
                Exercise {exercise.exercise_order}
              </Badge>
              {exercise.target_rir !== undefined && (
                <Badge variant="outline" className="text-xs">
                  {exercise.target_rir} RIR
                </Badge>
              )}
              {exercise.muscle_group && (
                <Badge variant="outline" className="text-xs">
                  {exercise.muscle_group}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {embedUrl && (
              <Button variant="outline" size="sm" onClick={() => setShowVideo(true)} className="h-8 px-2">Play</Button>
            )}
            <Button variant="ghost" size="sm" onClick={handleAttachVideo} className="h-8 px-2">Attach Video</Button>
            {onDeleteExercise && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDeleteExercise(exercise.id)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        {exercise.rir_description && (
          <p className="text-sm text-blue-600 font-medium">{exercise.rir_description}</p>
        )}
        {exercise.progressive_weight && (
          <p className="text-sm text-green-600">Progressive weight: {exercise.progressive_weight} lbs</p>
        )}
        {exercise.notes && (
          <p className="text-sm text-gray-500">{exercise.notes}</p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="grid grid-cols-12 gap-2 text-sm font-medium text-gray-500 pb-2 border-b border-gray-200">
            <span className="col-span-2">Set</span>
            {isTimeBasedExercise(exercise.name) ? (
              <>
                <span className="col-span-3">Duration</span>
                <span className="col-span-3">Distance</span>
              </>
            ) : (
              <>
                <span className="col-span-3">Weight</span>
                <span className="col-span-3">Reps</span>
              </>
            )}
            <span className="col-span-4 text-right pr-5">Status</span>
          </div>
          
          {sortedSets.map((set) => (
            <div key={set.id} className="grid grid-cols-12 gap-2 items-center">
              <span className="col-span-2 text-sm font-medium">{set.set_number}</span>
              
              {isTimeBasedExercise(exercise.name) ? (
                <>
                  <div className="col-span-3 flex items-center">
                    <Input
                      type="number"
                      step="30"
                      placeholder="Seconds"
                      value={getDisplayValue(set, 'duration')}
                      onChange={(e) => handleLocalUpdate(set.id, 'duration', parseInt(e.target.value) || 0)}
                      onBlur={() => saveSetValue(set.id, 'duration')}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          saveSetValue(set.id, 'duration')
                          e.currentTarget.blur()
                        }
                      }}
                      className="h-8 text-center w-full border-dashed border-gray-300 hover:border-blue-400 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="col-span-3 flex items-center">
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="Meters"
                      value={getDisplayValue(set, 'distance')}
                      onChange={(e) => handleLocalUpdate(set.id, 'distance', parseFloat(e.target.value) || 0)}
                      onBlur={() => saveSetValue(set.id, 'distance')}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          saveSetValue(set.id, 'distance')
                          e.currentTarget.blur()
                        }
                      }}
                      className="h-8 text-center w-full border-dashed border-gray-300 hover:border-blue-400 focus:border-blue-500"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="col-span-3 flex items-center">
                    <Input
                      type="number"
                      step="0.5"
                      value={getDisplayValue(set, 'weight')}
                      onChange={(e) => handleLocalUpdate(set.id, 'weight', parseFloat(e.target.value) || 0)}
                      onBlur={() => saveSetValue(set.id, 'weight')}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          saveSetValue(set.id, 'weight')
                          e.currentTarget.blur()
                        }
                      }}
                      className="h-8 text-center w-full border-dashed border-gray-300 hover:border-blue-400 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="col-span-3 flex items-center">
                    <Input
                      type="number"
                      value={getDisplayValue(set, 'reps')}
                      onChange={(e) => handleLocalUpdate(set.id, 'reps', parseInt(e.target.value) || 0)}
                      onBlur={() => saveSetValue(set.id, 'reps')}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          saveSetValue(set.id, 'reps')
                          e.currentTarget.blur()
                        }
                      }}
                      className="h-8 text-center w-full border-dashed border-gray-300 hover:border-blue-400 focus:border-blue-500"
                    />
                  </div>
                </>
              )}
              
              <div className="col-span-4 flex items-center gap-1 justify-end pr-1">
                <Button
                  size="sm"
                  variant={set.is_completed ? "default" : "outline"}
                  onClick={() => handleSetUpdate(set.id, 'is_completed', !set.is_completed)}
                  className="h-8 w-8 p-0"
                  disabled={loading}
                >
                  {set.is_completed ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span className="text-xs">✓</span>
                  )}
                </Button>
                {exercise.sets.length > 1 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveSet(set.id)}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                    disabled={loading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddSet}
          className="w-full mt-3"
          disabled={loading}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Set
        </Button>
      </CardContent>
      
      {/* Exercise Feedback Modal */}
      {showFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <ExerciseFeedback
            exerciseName={exercise.name}
            muscleGroup={getMuscleGroup(exercise.name)}
            onSubmit={handleFeedbackSubmit}
            onSkip={handleFeedbackSkip}
            loading={feedbackLoading}
          />
        </div>
      )}

      {/* Tutorial Video Modal */}
      {showVideo && embedUrl && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowVideo(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="text-sm font-medium">Tutorial • {exercise.name}</h3>
              <button className="text-gray-500 hover:text-gray-700" onClick={() => setShowVideo(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="aspect-video w-full">
              <iframe
                className="w-full h-full"
                src={embedUrl}
                title={`Tutorial ${exercise.name}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      {/* Rest Timer - floating widget (non-blocking) */}
      {showRestTimer && (
        <div className="fixed bottom-24 right-4 z-50">
          <div className="bg-white rounded-lg shadow-lg border p-4 w-64 text-center space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Rest Timer</h3>
              <button onClick={stopRestTimer} className="text-xs text-gray-500 hover:text-gray-700">Dismiss</button>
            </div>
            <div className="text-4xl font-mono tracking-widest select-none">{formatTime(restRemainingSeconds)}</div>
            <div className="flex items-center justify-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsRestPaused(p => !p)}>
                {isRestPaused ? 'Resume' : 'Pause'}
              </Button>
              <Button variant="outline" size="sm" onClick={() => addRestTime(30)}>+30s</Button>
              <Button variant="ghost" size="sm" className="text-red-600" onClick={stopRestTimer}>Skip</Button>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
              <span>Preset:</span>
              {[60, 90, 120].map(preset => (
                <button
                  key={preset}
                  onClick={() => {
                    setRestDurationSeconds(preset)
                    startRestTimer(preset)
                  }}
                  className={`px-2 py-1 rounded border ${restDurationSeconds === preset ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-200'}`}
                >
                  {preset}s
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
