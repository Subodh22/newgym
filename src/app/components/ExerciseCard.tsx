 'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Check, Plus, X, Play, Move, GripVertical } from 'lucide-react'
import { updateSet, createSet, deleteSet } from '@/lib/supabase/database'
import { ExerciseFeedback } from './ExerciseFeedback'
import { getExerciseVideoUrl, getExerciseEmbedUrl } from '@/app/lib/exerciseVideos'

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
  dragAttributes?: any
  dragListeners?: any
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

export function ExerciseCard({ exercise, onUpdateExercise, onDeleteExercise, dragAttributes, dragListeners }: ExerciseCardProps) {
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
  const [timerPosition, setTimerPosition] = useState({ x: 20, y: 20 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null)
  const [isTimerComplete, setIsTimerComplete] = useState(false)

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

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.addEventListener('touchmove', handleTouchMove, { passive: false })
      document.addEventListener('touchend', handleTouchEnd)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.removeEventListener('touchmove', handleTouchMove)
        document.removeEventListener('touchend', handleTouchEnd)
      }
    }
  }, [isDragging, dragOffset])

  // Initialize audio context and request notification permission
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)()
      setAudioContext(context)
      
      // Request notification permission
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission()
      }
      
      return () => {
        context.close()
      }
    }
  }, [])

  // Play notification sound
  const playNotificationSound = () => {
    if (!audioContext) return

    try {
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1)
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2)

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.5)
    } catch (error) {
      console.error('Error playing notification sound:', error)
    }
  }

  // Vibrate device (mobile)
  const vibrateDevice = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200])
    }
  }

  // Show notification
  const showNotification = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Rest Timer Complete!', {
        body: 'Time to start your next set!',
        icon: '/favicon.ico',
        tag: 'rest-timer'
      })
    }
  }

  const startRestTimer = (seconds: number = restDurationSeconds) => {
    if (restIntervalIdRef.current) clearInterval(restIntervalIdRef.current)
    
    const startTime = Date.now()
    const endTime = startTime + (seconds * 1000)
    
    setRestRemainingSeconds(seconds)
    setShowRestTimer(true)
    setIsRestPaused(false)
    setIsTimerComplete(false)
    
    const id = window.setInterval(() => {
      if (restPausedRef.current) return
      
      const now = Date.now()
      const remaining = Math.max(0, Math.ceil((endTime - now) / 1000))
      
      setRestRemainingSeconds(remaining)
      
      if (remaining <= 0) {
        clearInterval(id)
        restIntervalIdRef.current = null
        setShowRestTimer(false)
        setIsTimerComplete(true)
        
        // Trigger notifications
        playNotificationSound()
        vibrateDevice()
        showNotification()
        
        // Reset completion state after a delay
        setTimeout(() => setIsTimerComplete(false), 3000)
      }
    }, 1000)
    
    restIntervalIdRef.current = id
  }

  const addRestTime = (seconds: number) => {
    setRestRemainingSeconds(prev => prev + seconds)
    // Extend the timer by updating the end time
    if (restIntervalIdRef.current) {
      const currentEndTime = Date.now() + (restRemainingSeconds * 1000)
      const newEndTime = currentEndTime + (seconds * 1000)
      // The timer will automatically adjust on the next interval
    }
  }

  const stopRestTimer = () => {
    if (restIntervalIdRef.current) clearInterval(restIntervalIdRef.current)
    restIntervalIdRef.current = null
    setShowRestTimer(false)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only start dragging if clicking on the timer header or background, not buttons
    if ((e.target as HTMLElement).closest('button')) {
      return
    }
    
    setIsDragging(true)
    const rect = e.currentTarget.getBoundingClientRect()
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    })
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    // Only start dragging if touching the timer header or background, not buttons
    if ((e.target as HTMLElement).closest('button')) {
      return
    }
    
    setIsDragging(true)
    const rect = e.currentTarget.getBoundingClientRect()
    const touch = e.touches[0]
    setDragOffset({
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    })
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragOffset.x
      const newY = e.clientY - dragOffset.y
      
      // Keep timer within viewport bounds
      const maxX = window.innerWidth - 256 // timer width
      const maxY = window.innerHeight - 200 // timer height
      
      setTimerPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      })
    }
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (isDragging) {
      e.preventDefault() // Prevent scrolling while dragging
      const touch = e.touches[0]
      const newX = touch.clientX - dragOffset.x
      const newY = touch.clientY - dragOffset.y
      
      // Keep timer within viewport bounds
      const maxX = window.innerWidth - 256 // timer width
      const maxY = window.innerHeight - 200 // timer height
      
      setTimerPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
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
          // Start rest timer AND show feedback
          startRestTimer()
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
    setLocalSetValues(prev => {
      const updated = { ...prev }
      
      // For weight field, propagate to all sets below (higher set numbers)
      if (field === 'weight') {
        const currentSet = exercise.sets.find(set => set.id === setId)
        if (currentSet) {
          // Update current set
          updated[setId] = {
            ...updated[setId],
            [field]: value
          }
          
          // Update all sets below (higher set numbers)
          exercise.sets.forEach(set => {
            if (set.set_number > currentSet.set_number) {
              updated[set.id] = {
                ...updated[set.id],
                [field]: value
              }
            }
          })
        }
      } else {
        // For other fields, only update the current set
        updated[setId] = {
          ...updated[setId],
          [field]: value
        }
      }
      
      return updated
    })
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
  const embedUrl = getExerciseEmbedUrl(exercise.name)


  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between group">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {dragAttributes && dragListeners && (
                <button
                  aria-label="Drag to reorder"
                  title="Drag to reorder"
                  type="button"
                  {...dragAttributes}
                  {...dragListeners}
                  className="mr-1 w-8 h-8 flex items-center justify-center rounded-full bg-transparent hover:bg-gray-100 cursor-grab active:cursor-grabbing transition focus:outline-none focus:ring-2 focus:ring-blue-500 opacity-100 md:opacity-0 md:group-hover:opacity-100"
                >
                  <GripVertical className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                </button>
              )}
              <CardTitle className="text-lg">{exercise.name}</CardTitle>
            </div>
            <div className="flex gap-2">
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
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowVideo(true)} 
                className="h-8 px-2"
              >
                <Play className="h-4 w-4" />
              </Button>
            )}
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

      {/* Rest Timer - draggable floating widget */}
      {showRestTimer && (
        <div 
          className="fixed z-50 cursor-move touch-none"
          style={{
            left: `${timerPosition.x}px`,
            top: `${timerPosition.y}px`,
            transform: isDragging ? 'scale(1.02)' : 'scale(1)',
            transition: isDragging ? 'none' : 'transform 0.2s ease'
          }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          <div className="bg-white rounded-lg shadow-lg border p-4 w-64 text-center space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Move className="h-4 w-4 text-gray-400" />
                <h3 className="text-sm font-semibold">Rest Timer</h3>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    if ('Notification' in window) {
                      Notification.requestPermission()
                    }
                  }} 
                  className="text-xs text-blue-500 hover:text-blue-700"
                  title="Enable notifications"
                >
                  🔔
                </button>
                <button onClick={stopRestTimer} className="text-xs text-gray-500 hover:text-gray-700">Dismiss</button>
              </div>
            </div>
            <div className={`text-4xl font-mono tracking-widest select-none ${isTimerComplete ? 'text-green-600 animate-pulse' : ''}`}>
              {isTimerComplete ? '00:00' : formatTime(restRemainingSeconds)}
            </div>
            {isTimerComplete && (
              <div className="text-sm text-green-600 font-medium text-center">
                Rest complete! Time for your next set! 💪
              </div>
            )}
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
