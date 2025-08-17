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
import MesocycleCompletion from './MesocycleCompletion'

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
  const [showCompletion, setShowCompletion] = useState(false)
  const [completionData, setCompletionData] = useState<any>(null)

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
    if (workout.mesocycle_id) return workout.mesocycle_id
    
    // Try to extract from nested week structure
    if (workout.week?.mesocycle?.id) return workout.week.mesocycle.id
    
    // For mock data, use a default mesocycle ID
    console.warn('Mesocycle ID not found in workout data, using mock ID for testing')
    return 'mock-mesocycle-1' // This allows testing to continue
  }

  const getWeekNumber = () => {
    if (workout.week?.week_number) return workout.week.week_number
    return 1 // Default to week 1
  }

  const checkIfWeekCompleted = async () => {
    if (!user) return
    
    try {
      // Get all workouts in the current week
      const { data, error } = await getMesocycles(user.id)
      if (error) throw error
      
      // Find the current workout's week
      let currentWeek = null
      for (const mesocycle of data || []) {
        for (const week of mesocycle.weeks || []) {
          for (const w of week.workouts || []) {
            if (w.id === workout.id) {
              currentWeek = week
              break
            }
          }
          if (currentWeek) break
        }
        if (currentWeek) break
      }
      
      if (!currentWeek) {
        console.warn('Could not find current week')
        return
      }
      
      // Check if ALL workouts in this week are completed
      const allWorkoutsCompleted = currentWeek.workouts?.every((w: any) => w.is_completed) || false
      
      console.log(`📊 Week ${currentWeek.week_number} completion status:`)
      console.log(`Total workouts: ${currentWeek.workouts?.length || 0}`)
      console.log(`Completed workouts: ${currentWeek.workouts?.filter((w: any) => w.is_completed).length || 0}`)
      console.log(`All workouts completed: ${allWorkoutsCompleted}`)
      
      if (allWorkoutsCompleted) {
        console.log('🎉 Entire week completed! Showing feedback form...')
        setShowFeedback(true)
      } else {
        console.log('⏳ Week not yet complete, continuing...')
        // Just refresh the data, don't show feedback
        onUpdate()
      }
      
    } catch (error) {
      console.error('Error checking week completion:', error)
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
      
      // Check if this is the last workout of the week
      if (allSetsCompleted) {
        // Check if all workouts in the current week are now completed
        await checkIfWeekCompleted()
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
      
      console.log('🔍 Debug info:', {
        mesocycleId,
        currentWeekNumber,
        workoutId: workout.id,
        workoutStructure: {
          hasWeek: !!workout.week,
          hasMesocycle: !!workout.mesocycle,
          weekMesocycleId: workout.week?.mesocycle_id,
          mesocycleId: workout.mesocycle?.id,
          directMesocycleId: workout.mesocycle_id
        }
      })
      
      if (!mesocycleId) {
        console.error('❌ Mesocycle ID debugging:', {
          workout: workout,
          workoutKeys: Object.keys(workout),
          weekKeys: workout.week ? Object.keys(workout.week) : null,
          mesocycleKeys: workout.mesocycle ? Object.keys(workout.mesocycle) : null
        })
        throw new Error('Could not determine mesocycle ID. Please check the workout data structure.')
      }

      // Call the progressive week creation API
      const requestBody = {
        mesocycleId: mesocycleId,
        weekNumber: currentWeekNumber + 1,
        userFeedback: feedback,
        trainingDays: 6,
        selectedSplit: { 'Push': [], 'Pull': [], 'Legs': [] },
        workoutPlans: {}
      }
      
      console.log('🎯 PROGRESSIVE OVERLOAD DATA ANALYSIS')
      console.log('=====================================')
      console.log('📊 User Feedback Received:', JSON.stringify(feedback, null, 2))
      console.log('📈 Mesocycle ID:', mesocycleId)
      console.log('📅 Current Week Number:', currentWeekNumber)
      console.log('🔢 Next Week Number:', currentWeekNumber + 1)
      console.log('💪 Training Days:', 6)
      console.log('🏋️ Split Configuration:', { 'Push': [], 'Pull': [], 'Legs': [] })
      
      console.log('\n🧬 RP METHODOLOGY APPLICATION:')
      console.log('=====================================')
      
      // Show what the RP system will do with this feedback
      feedback.forEach((muscleFeedback, index) => {
        console.log(`\n${index + 1}. ${muscleFeedback.muscleGroup} Analysis:`)
        console.log(`   Difficulty: ${muscleFeedback.difficulty}`)
        console.log(`   Soreness: ${muscleFeedback.soreness}`)
        console.log(`   Performance: ${muscleFeedback.performance}`)
        console.log(`   Pump Quality: ${muscleFeedback.pumpQuality}⭐`)
        console.log(`   Recovery: ${muscleFeedback.recovery}`)
        
        // Show what adjustments will be made
        let volumeAdjustment = 0
        let reasoning = []
        
        switch (muscleFeedback.difficulty) {
          case 'easy':
            volumeAdjustment += 2
            reasoning.push('+2 sets (too easy)')
            break
          case 'hard':
            volumeAdjustment -= 1
            reasoning.push('-1 set (hard)')
            break
          case 'too_hard':
            volumeAdjustment -= 3
            reasoning.push('-3 sets (too hard)')
            break
        }
        
        switch (muscleFeedback.soreness) {
          case 'severe':
            volumeAdjustment -= 1
            reasoning.push('-1 set (severe soreness)')
            break
          case 'none':
            volumeAdjustment += 1
            reasoning.push('+1 set (no soreness)')
            break
        }
        
        switch (muscleFeedback.performance) {
          case 'improved':
            volumeAdjustment += 1
            reasoning.push('+1 set (performance improved)')
            break
          case 'decreased':
            volumeAdjustment -= 2
            reasoning.push('-2 sets (performance decreased)')
            break
        }
        
        if (muscleFeedback.pumpQuality && muscleFeedback.pumpQuality <= 2) {
          volumeAdjustment += 1
          reasoning.push('+1 set (poor pump quality)')
        } else if (muscleFeedback.pumpQuality && muscleFeedback.pumpQuality >= 4) {
          volumeAdjustment -= 1
          reasoning.push('-1 set (great pump quality)')
        }
        
        if (muscleFeedback.recovery === 'poor') {
          volumeAdjustment -= 2
          reasoning.push('-2 sets (poor recovery)')
        } else if (muscleFeedback.recovery === 'excellent') {
          volumeAdjustment += 1
          reasoning.push('+1 set (excellent recovery)')
        }
        
        console.log(`   📊 Volume Adjustment: ${volumeAdjustment >= 0 ? '+' : ''}${volumeAdjustment} sets`)
        console.log(`   🔍 Reasoning: ${reasoning.join(', ') || 'No adjustments needed'}`)
        
        // Show RIR progression
        const nextWeek = currentWeekNumber + 1
        const rirProgression = {
          1: { rir: 3, description: 'Week 1: 3 RIR - Building base volume' },
          2: { rir: 2, description: 'Week 2: 2 RIR - Moderate intensity' },
          3: { rir: 1, description: 'Week 3: 1 RIR - High intensity' },
          4: { rir: 0, description: 'Week 4: 0 RIR - Peak intensity' },
          5: { rir: 0, description: 'Week 5: 0 RIR - Overreaching (optional)' }
        }
        const rirInfo = rirProgression[nextWeek as keyof typeof rirProgression] || rirProgression[4]
        console.log(`   🎯 Next Week RIR: ${rirInfo.rir} (${rirInfo.description})`)
        
        // Show weight progression
        let progressionRate = 0.025 // 2.5% base
        switch (muscleFeedback.difficulty) {
          case 'easy': progressionRate = 0.035; break // 3.5%
          case 'hard': progressionRate = 0.015; break // 1.5%
          case 'too_hard': progressionRate = 0.0; break // 0%
        }
        
        if (muscleFeedback.performance === 'improved') {
          progressionRate *= 1.2 // 20% bonus
        } else if (muscleFeedback.performance === 'decreased') {
          progressionRate *= 0.5 // 50% reduction
        }
        
        console.log(`   ⚖️ Weight Progression: ${(progressionRate * 100).toFixed(1)}% increase`)
      })
      
      console.log('\n📤 Sending request to progressive week API:', requestBody)
      
      // Use real database API
      const response = await fetch('/api/mesocycles/progressive-week', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        
        // Handle duplicate week error gracefully
        if (response.status === 409 && errorData.error?.includes('already exists')) {
          console.warn('⚠️ Week already exists, skipping creation')
          alert(`Week ${currentWeekNumber + 1} has already been created! 🎉\n\nYour progressive overload training continues with the existing week.`)
          setShowFeedback(false)
          onUpdate()
          onBack()
          return
        }
        
        console.error('❌ Progressive week API error:', errorData)
        throw new Error(`Failed to create next week: ${errorData.error || response.statusText}`)
      }

      const result = await response.json()
      console.log('✅ Progressive week response:', result)
      
      setShowFeedback(false)
      
      // Check if mesocycle is completed
      if (result.completed) {
        console.log('🎉 Mesocycle completed!', result)
        setCompletionData(result)
        setShowCompletion(true)
        return
      }
      
      // Show success message with RP details
      const rirInfo = result.progressionInfo?.rirDescription || `Week ${result.progressionInfo?.weekNumber} progression`
      alert(`🎉 Next week created successfully!\n\n${rirInfo}\n\nAutoregulation applied based on your feedback. The system has adjusted volume and intensity for optimal results.`)
      
      onUpdate() // Refresh the data
      onBack() // Go back to show the updated mesocycle with new week
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

      {/* Mesocycle Completion Page */}
      {showCompletion && completionData && (
        <MesocycleCompletion
          mesocycleName={completionData.mesocycleName}
          totalWeeks={completionData.totalWeeks}
          completedWeeks={completionData.completedWeeks}
          onBack={() => {
            setShowCompletion(false)
            setCompletionData(null)
            onBack()
          }}
          onCreateNewMesocycle={() => {
            setShowCompletion(false)
            setCompletionData(null)
            // Navigate to create new mesocycle - you'll need to implement this
            window.location.href = '/'
          }}
        />
      )}
    </div>
  )
}
