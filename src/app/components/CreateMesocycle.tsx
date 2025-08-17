'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { ArrowLeft, Plus, Trash2, Info } from 'lucide-react'
import { createMesocycle, createWeek, createWorkout, createExercise, createSet } from '@/lib/supabase/database'
import { useSupabaseAuth } from '@/lib/hooks/useSupabaseAuth'
import { supabase } from '@/lib/supabase/supabase'
// Removed direct import of auth-helpers to avoid client-side admin imports
import { IsraetelInfo } from './IsraetelInfo'

interface CreateMesocycleProps {
  onBack: () => void
  onSuccess: () => void
}

// Volume landmarks based on Mike Israetel's research
const VOLUME_LANDMARKS = {
  'Chest': { MEV: 10, MAV: 16, MRV: 22 },
  'Back': { MEV: 10, MAV: 18, MRV: 25 },
  'Shoulders': { MEV: 8, MAV: 19, MRV: 26 },
  'Biceps': { MEV: 6, MAV: 17, MRV: 20 },
  'Triceps': { MEV: 8, MAV: 17, MRV: 20 },
  'Quadriceps': { MEV: 8, MAV: 15, MRV: 20 },
  'Hamstrings': { MEV: 6, MAV: 13, MRV: 20 },
  'Glutes': { MEV: 6, MAV: 12, MRV: 16 },
  'Calves': { MEV: 8, MAV: 16, MRV: 25 }
}

// Exercise database organized by muscle group
const EXERCISE_DATABASE = {
  'Chest': [
    'Barbell Bench Press', 'Incline Barbell Press', 'Dumbbell Bench Press', 
    'Incline Dumbbell Press', 'Dips', 'Cable Flyes', 'Pec Deck'
  ],
  'Back': [
    'Deadlift', 'Pull-ups', 'Lat Pulldown', 'Barbell Rows', 'T-Bar Rows',
    'Cable Rows', 'Face Pulls', 'Shrugs'
  ],
  'Shoulders': [
    'Overhead Press', 'Dumbbell Shoulder Press', 'Lateral Raises',
    'Rear Delt Flyes', 'Upright Rows', 'Arnold Press'
  ],
  'Biceps': [
    'Barbell Curls', 'Dumbbell Curls', 'Hammer Curls', 'Cable Curls',
    'Preacher Curls', 'Concentration Curls'
  ],
  'Triceps': [
    'Close Grip Bench Press', 'Tricep Dips', 'Overhead Tricep Extension',
    'Cable Tricep Pushdown', 'Diamond Push-ups'
  ],
  'Quadriceps': [
    'Back Squat', 'Front Squat', 'Leg Press', 'Bulgarian Split Squats',
    'Leg Extensions', 'Lunges'
  ],
  'Hamstrings': [
    'Romanian Deadlift', 'Leg Curls', 'Good Mornings', 'Single Leg RDL',
    'Glute Ham Raises'
  ],
  'Glutes': [
    'Hip Thrusts', 'Bulgarian Split Squats', 'Romanian Deadlift',
    'Glute Bridges', 'Cossack Squats'
  ],
  'Calves': [
    'Standing Calf Raises', 'Seated Calf Raises', 'Calf Press',
    'Walking Calf Raises'
  ]
}

const TRAINING_SPLITS = {
  'Push/Pull/Legs': {
    'Push (Chest, Shoulders, Triceps)': ['Chest', 'Shoulders', 'Triceps'],
    'Pull (Back, Biceps)': ['Back', 'Biceps'],
    'Legs (Quads, Hamstrings, Glutes, Calves)': ['Quadriceps', 'Hamstrings', 'Glutes', 'Calves']
  },
  'Upper/Lower': {
    'Upper Body': ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps'],
    'Lower Body': ['Quadriceps', 'Hamstrings', 'Glutes', 'Calves']
  },
  'Full Body': {
    'Full Body': ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Quadriceps', 'Hamstrings', 'Glutes', 'Calves']
  }
}

export function CreateMesocycle({ onBack, onSuccess }: CreateMesocycleProps) {
  const { user } = useSupabaseAuth()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  
  // Mesocycle basic info
  const [mesocycleName, setMesocycleName] = useState('')
  const [weeks, setWeeks] = useState(4)
  const [selectedSplit, setSelectedSplit] = useState('Push/Pull/Legs')
  const [trainingDays, setTrainingDays] = useState(6)
  
  // Selected exercises for each workout
  const [workoutPlans, setWorkoutPlans] = useState<any>({})

  const handleSplitChange = (split: string) => {
    setSelectedSplit(split)
    setWorkoutPlans({})
    
    // Set default training days based on split
    if (split === 'Push/Pull/Legs') setTrainingDays(6)
    else if (split === 'Upper/Lower') setTrainingDays(4)
    else setTrainingDays(3)
  }

  const addExerciseToWorkout = (workoutType: string, exercise: string, muscleGroup: string) => {
    setWorkoutPlans((prev: any) => ({
      ...prev,
      [workoutType]: {
        ...prev[workoutType],
        [exercise]: {
          muscleGroup,
          sets: 3, // Will be recalculated later based on total exercises
          reps: getDefaultReps(exercise),
          weight: 0
        }
      }
    }))
  }

  const removeExerciseFromWorkout = (workoutType: string, exercise: string) => {
    setWorkoutPlans((prev: any) => {
      const updated = { ...prev }
      if (updated[workoutType]) {
        delete updated[workoutType][exercise]
      }
      return updated
    })
  }

  const calculateSetsForWeek = (muscleGroup: string, week: number, totalExercisesForMuscle: number = 1) => {
    const landmarks = VOLUME_LANDMARKS[muscleGroup as keyof typeof VOLUME_LANDMARKS]
    if (!landmarks) return 3

    // Calculate total weekly sets for the muscle group based on Mike Israetel's progression
    const weeklyProgression = (landmarks.MRV - landmarks.MEV) / 4
    const totalWeeklySets = Math.max(landmarks.MEV, Math.round(landmarks.MEV + (weeklyProgression * (week - 1))))
    
    // Distribute total weekly sets across exercises for this muscle group
    // Each exercise gets a portion of the total weekly sets
    const setsPerExercise = Math.max(2, Math.round(totalWeeklySets / totalExercisesForMuscle))
    
    return setsPerExercise
  }

  const calculateTotalExercisesForMuscleGroup = (workoutPlans: any, muscleGroup: string) => {
    let totalExercises = 0
    Object.values(workoutPlans).forEach((exercises: any) => {
      Object.values(exercises).forEach((exerciseData: any) => {
        if (exerciseData.muscleGroup === muscleGroup) {
          totalExercises++
        }
      })
    })
    return Math.max(1, totalExercises)
  }

  const getDefaultReps = (exercise: string) => {
    // Compound movements get lower reps, isolation gets higher reps
    const compoundExercises = [
      'Deadlift', 'Squat', 'Bench Press', 'Overhead Press', 'Barbell Rows'
    ]
    
    const isCompound = compoundExercises.some(compound => 
      exercise.toLowerCase().includes(compound.toLowerCase())
    )
    
    return isCompound ? '6-8' : '8-12'
  }

  const getRIRForWeek = (week: number) => {
    switch (week) {
      case 1: return 4
      case 2: return 3
      case 3: return 2
      case 4: return 1
      case 5: return 5 // Deload
      default: return 3
    }
  }

  const createMesocycleInSupabase = async () => {
    if (!user) return

    setLoading(true)
    const startTime = Date.now()
    
    try {
      // Get the current session to pass access token
      const { data: { session } } = await supabase.auth.getSession()
      
      // Try to ensure user profile exists via API route
      try {
        const profileResponse = await fetch('/api/user/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            user,
            accessToken: session?.access_token 
          })
        })
        
        if (!profileResponse.ok) {
          const errorData = await profileResponse.json()
          console.warn('Profile creation failed, but continuing:', errorData)
        }
      } catch (profileError) {
        console.warn('Profile creation failed, but continuing:', profileError)
      }
      
      console.log('🚀 Starting optimized mesocycle creation...')
      console.log('⏱️ Creating mesocycle...')
      
      // Create mesocycle
      const { data: mesocycle, error: mesocycleError } = await createMesocycle({
        user_id: user.id,
        name: mesocycleName,
        number_of_weeks: weeks,
        is_active: false
      })

      if (mesocycleError || !mesocycle) {
        throw new Error(`Failed to create mesocycle: ${mesocycleError?.message}`)
      }

      console.log('✅ Mesocycle created in', Date.now() - startTime, 'ms')
      console.log('⏱️ Creating Week 1 only...')

      // Create ONLY Week 1 initially (much faster)
      const { data: week, error: weekError } = await createWeek({
        mesocycle_id: mesocycle.id,
        week_number: 1,
        name: 'Week 1'
      })

      if (weekError || !week) {
        throw new Error(`Failed to create week: ${weekError?.message}`)
      }

      // Create workouts for Week 1 only
      const workoutTypes = Object.keys(TRAINING_SPLITS[selectedSplit as keyof typeof TRAINING_SPLITS])
      const workoutsPerWeek = Math.ceil(trainingDays / workoutTypes.length)

      for (let day = 1; day <= trainingDays; day++) {
        const workoutTypeIndex = (day - 1) % workoutTypes.length
        const workoutType = workoutTypes[workoutTypeIndex]
        
        const { data: workout, error: workoutError } = await createWorkout({
          week_id: week.id,
          day_name: `Day ${day} - ${workoutType}`
        })

        if (workoutError || !workout) {
          throw new Error(`Failed to create workout: ${workoutError?.message}`)
        }

        // Create exercises for this workout
        const exercisesForWorkout = workoutPlans[workoutType] || {}
        let exerciseOrder = 1

        for (const [exerciseName, exerciseData] of Object.entries(exercisesForWorkout)) {
          const { data: exercise, error: exerciseError } = await createExercise({
            workout_id: workout.id,
            name: exerciseName,
            exercise_order: exerciseOrder++
          })

          if (exerciseError || !exercise) {
            throw new Error(`Failed to create exercise: ${exerciseError?.message}`)
          }

          // Calculate sets for Week 1 only
          const totalExercisesForMuscle = calculateTotalExercisesForMuscleGroup(workoutPlans, (exerciseData as any).muscleGroup)
          const setsCount = calculateSetsForWeek((exerciseData as any).muscleGroup, 1, totalExercisesForMuscle)

          // Create sets for Week 1 only
          for (let setNum = 1; setNum <= setsCount; setNum++) {
            const { error: setError } = await createSet({
              exercise_id: exercise.id,
              set_number: setNum,
              weight: (exerciseData as any).weight || 0,
              reps: parseInt((exerciseData as any).reps.split('-')[0]) || 8,
              is_completed: false
            })

            if (setError) {
              throw new Error(`Failed to create set: ${setError.message}`)
            }
          }
        }
      }

      const totalTime = Date.now() - startTime
      console.log('✅ Week 1 created successfully in', totalTime, 'ms')
      console.log('📊 Performance: ~', Math.round(totalTime / 1000), 'seconds for Week 1')

      onSuccess()
    } catch (error) {
      console.error('Error creating mesocycle:', error)
      alert('Failed to create mesocycle. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      {/* Information Card */}
      <IsraetelInfo />
      
      <div>
        <h3 className="text-lg font-medium mb-4">Mesocycle Setup</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Mesocycle Name</label>
            <Input
              value={mesocycleName}
              onChange={(e) => setMesocycleName(e.target.value)}
              placeholder="e.g., Hypertrophy Phase 1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Duration (Weeks)</label>
            <div className="flex gap-2">
              {[4, 5, 6].map(w => (
                <Button
                  key={w}
                  variant={weeks === w ? "default" : "outline"}
                  onClick={() => setWeeks(w)}
                  className="flex-1"
                >
                  {w} weeks {w === 5 || w === 6 ? '+ Deload' : ''}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Training Split</label>
            <div className="space-y-2">
              {Object.keys(TRAINING_SPLITS).map(split => (
                <Button
                  key={split}
                  variant={selectedSplit === split ? "default" : "outline"}
                  onClick={() => handleSplitChange(split)}
                  className="w-full justify-start"
                >
                  {split}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Training Days per Week</label>
            <Input
              type="number"
              min="3"
              max="7"
              value={trainingDays}
              onChange={(e) => setTrainingDays(parseInt(e.target.value) || 6)}
            />
          </div>
        </div>
      </div>

      <Button
        onClick={() => setStep(2)}
        className="w-full"
        disabled={!mesocycleName.trim()}
      >
        Next: Select Exercises
      </Button>
    </div>
  )

  const renderStep2 = () => {
    const workoutTypes = Object.keys(TRAINING_SPLITS[selectedSplit as keyof typeof TRAINING_SPLITS])

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-medium">Exercise Selection</h3>
        </div>

        {workoutTypes.map(workoutType => {
          const muscleGroups = TRAINING_SPLITS[selectedSplit as keyof typeof TRAINING_SPLITS][workoutType as keyof typeof TRAINING_SPLITS[typeof selectedSplit]]
          
          return (
            <Card key={workoutType}>
              <CardHeader>
                <CardTitle className="text-base">{workoutType}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {muscleGroups.map(muscleGroup => (
                  <div key={muscleGroup}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{muscleGroup}</h4>
                      <Badge variant="outline" className="text-xs">
                        MEV: {VOLUME_LANDMARKS[muscleGroup as keyof typeof VOLUME_LANDMARKS]?.MEV} sets/week
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {EXERCISE_DATABASE[muscleGroup as keyof typeof EXERCISE_DATABASE]?.map(exercise => (
                        <Button
                          key={exercise}
                          variant="outline"
                          size="sm"
                          onClick={() => addExerciseToWorkout(workoutType, exercise, muscleGroup)}
                          className="text-xs justify-start"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          {exercise}
                        </Button>
                      ))}
                    </div>

                    {/* Selected exercises for this muscle group */}
                    <div className="space-y-2">
                      {Object.entries(workoutPlans[workoutType] || {})
                        .filter(([_, data]) => (data as any).muscleGroup === muscleGroup)
                        .map(([exercise, data]) => (
                          <div key={exercise} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                            <span className="text-sm">{exercise}</span>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">
                                {calculateSetsForWeek(muscleGroup, 1, calculateTotalExercisesForMuscleGroup(workoutPlans, muscleGroup))} sets
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeExerciseFromWorkout(workoutType, exercise)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )
        })}

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setStep(3)} className="flex-1">
            Preview Program
          </Button>
          <Button
            onClick={createMesocycleInSupabase}
            disabled={loading || Object.keys(workoutPlans).length === 0}
            className="flex-1"
          >
            {loading ? 'Creating...' : 'Create Mesocycle'}
          </Button>
        </div>
      </div>
    )
  }

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="sm" onClick={() => setStep(2)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-lg font-medium">Program Preview</h3>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{mesocycleName}</CardTitle>
          <div className="flex gap-2">
            <Badge>{weeks} weeks</Badge>
            <Badge variant="outline">{selectedSplit}</Badge>
            <Badge variant="outline">{trainingDays} days/week</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Info className="h-4 w-4 text-blue-600" />
                <h4 className="font-medium text-blue-900">Mike Israetel Progression</h4>
              </div>
              <div className="text-sm text-blue-800 space-y-1">
                <p>Week 1: Start at MEV (4 RIR)</p>
                <p>Week 2: Volume increase (3 RIR)</p>
                <p>Week 3: Approach MRV (2 RIR)</p>
                <p>Week 4: Peak volume (1 RIR)</p>
                {weeks > 4 && <p>Week {weeks}: Deload (5 RIR, 60% volume)</p>}
              </div>
            </div>

            {Object.entries(workoutPlans).map(([workoutType, exercises]) => (
              <div key={workoutType}>
                <h4 className="font-medium mb-2">{workoutType}</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  {Object.entries(exercises).map(([exercise, data]) => {
                    const totalExercisesForMuscle = calculateTotalExercisesForMuscleGroup(workoutPlans, (data as any).muscleGroup)
                    return (
                      <div key={exercise} className="flex justify-between">
                        <span>{exercise}</span>
                        <span>{calculateSetsForWeek((data as any).muscleGroup, 1, totalExercisesForMuscle)}-{calculateSetsForWeek((data as any).muscleGroup, 4, totalExercisesForMuscle)} sets</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={createMesocycleInSupabase}
        disabled={loading}
        className="w-full"
      >
        {loading ? 'Creating Mesocycle...' : 'Create Mesocycle'}
      </Button>
    </div>
  )

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-bold">Create New Mesocycle</h2>
      </div>

      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
    </div>
  )
}
