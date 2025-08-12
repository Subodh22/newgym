import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/supabase-admin'

// Mike Israetel autoregulation logic
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

interface UserFeedback {
  muscleGroup: string
  difficulty: 'easy' | 'moderate' | 'hard' | 'too_hard'
  soreness: 'none' | 'light' | 'moderate' | 'severe'
  performance: 'improved' | 'maintained' | 'decreased'
}

// Helper function to get basic exercises for each workout type
const getBasicExercisesForWorkoutType = (workoutType: string): string[] => {
  switch (workoutType) {
    case 'Push':
      return ['Barbell Bench Press', 'Overhead Press', 'Incline Dumbbell Press', 'Dips']
    case 'Pull':
      return ['Barbell Rows', 'Pull-ups', 'Lat Pulldowns', 'Face Pulls']
    case 'Legs':
      return ['Squats', 'Romanian Deadlifts', 'Leg Press', 'Calf Raises']
    default:
      return ['General Exercise 1', 'General Exercise 2', 'General Exercise 3']
  }
}

// Helper function to get muscle group from exercise name
const getMuscleGroupFromExercise = (exerciseName: string): string => {
  const name = exerciseName.toLowerCase()
  if (name.includes('bench') || name.includes('press') || name.includes('chest')) return 'Chest'
  if (name.includes('row') || name.includes('pull') || name.includes('lat')) return 'Back'
  if (name.includes('squat') || name.includes('leg')) return 'Quadriceps'
  if (name.includes('curl')) return 'Biceps'
  if (name.includes('tricep') || name.includes('dip')) return 'Triceps'
  if (name.includes('shoulder') || name.includes('overhead')) return 'Shoulders'
  if (name.includes('deadlift') || name.includes('romanian')) return 'Hamstrings'
  if (name.includes('calf')) return 'Calves'
  return 'Other'
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('📥 Received request body:', JSON.stringify(body, null, 2))
    
    const { mesocycleId, weekNumber, userFeedback, trainingDays, selectedSplit, workoutPlans } = body
    
    if (!mesocycleId || !weekNumber) {
      console.error('❌ Missing required parameters:', { mesocycleId, weekNumber })
      return NextResponse.json(
        { error: 'Missing required parameters: mesocycleId and weekNumber are required' },
        { status: 400 }
      )
    }

    // Validate data types
    if (typeof mesocycleId !== 'number' || typeof weekNumber !== 'number') {
      console.error('❌ Invalid data types:', { mesocycleId, weekNumber })
      return NextResponse.json(
        { error: 'Invalid data types: mesocycleId and weekNumber must be numbers' },
        { status: 400 }
      )
    }

    // Set default values for missing parameters
    const defaultTrainingDays = trainingDays || 6
    const defaultSelectedSplit = selectedSplit || { 'Push': [], 'Pull': [], 'Legs': [] }
    const defaultWorkoutPlans = workoutPlans || {}

    console.log(`🚀 Creating Week ${weekNumber} with autoregulation...`)
    console.log(`📊 Parameters: trainingDays=${defaultTrainingDays}, split=${Object.keys(defaultSelectedSplit).join(',')}`)
    const startTime = Date.now()

    // Create the week directly without fetching the mesocycle
    const weekName = `Week ${weekNumber}`
    console.log(`🔄 Attempting to create week: ${weekName} for mesocycle ${mesocycleId}`)
    
    const { data: week, error: weekError } = await supabaseAdmin
      .from('weeks')
      .insert({
        mesocycle_id: mesocycleId,
        week_number: weekNumber,
        name: weekName
      })
      .select()
      .single()

    if (weekError || !week) {
      console.error('❌ Week creation failed:', weekError)
      throw new Error(`Failed to create week: ${weekError?.message}`)
    }

    console.log('✅ Week created successfully:', week.id)

    // Calculate adjusted volume based on user feedback
    const calculateAdjustedSets = (muscleGroup: string, baseWeek: number, feedback: UserFeedback[]) => {
      const landmarks = VOLUME_LANDMARKS[muscleGroup as keyof typeof VOLUME_LANDMARKS]
      if (!landmarks) return 3

      // Base progression from MEV to MRV
      const weeklyProgression = (landmarks.MRV - landmarks.MEV) / 4
      let baseSets = Math.max(landmarks.MEV, Math.round(landmarks.MEV + (weeklyProgression * (baseWeek - 1))))

      // Apply autoregulation based on feedback
      const muscleFeedback = feedback.find(f => f.muscleGroup === muscleGroup)
      if (muscleFeedback) {
        switch (muscleFeedback.difficulty) {
          case 'easy':
            baseSets = Math.min(landmarks.MRV, baseSets + 2) // Increase volume
            break
          case 'moderate':
            // Keep current volume
            break
          case 'hard':
            baseSets = Math.max(landmarks.MEV, baseSets - 1) // Slight decrease
            break
          case 'too_hard':
            baseSets = Math.max(landmarks.MEV, baseSets - 2) // Significant decrease
            break
        }

        // Adjust for soreness
        if (muscleFeedback.soreness === 'severe') {
          baseSets = Math.max(landmarks.MEV, baseSets - 1)
        }
      }

      // Deload week adjustment
      // This logic needs to be re-evaluated as the mesocycle is no longer fetched.
      // For now, we'll keep it simple and assume no deload if mesocycle is not available.
      // If a deload week is intended, this logic needs to be re-implemented based on mesocycle data.
      // For now, we'll remove the deload adjustment as it relies on mesocycle.number_of_weeks
      // and the mesocycle object is no longer fetched.
      // if (isDeload) {
      //   baseSets = Math.max(1, Math.round(baseSets * 0.6))
      // }

      return baseSets
    }

    // Create workouts for this week
    const workoutTypes = Object.keys(defaultSelectedSplit)
    const workoutsPerWeek = Math.ceil(defaultTrainingDays / workoutTypes.length)

    for (let day = 1; day <= defaultTrainingDays; day++) {
      const workoutTypeIndex = (day - 1) % workoutTypes.length
      const workoutType = workoutTypes[workoutTypeIndex]
      
      const { data: workout, error: workoutError } = await supabaseAdmin
        .from('workouts')
        .insert({
          week_id: week.id,
          day_name: `Day ${day} - ${workoutType}`
        })
        .select()
        .single()

      if (workoutError || !workout) {
        throw new Error(`Failed to create workout: ${workoutError?.message}`)
      }

      console.log(`✅ Created workout: ${workout.day_name}`)

      // Create basic exercises for this workout
      const basicExercises = getBasicExercisesForWorkoutType(workoutType)
      let exerciseOrder = 1

      for (const exerciseName of basicExercises) {
        const { data: exercise, error: exerciseError } = await supabaseAdmin
          .from('exercises')
          .insert({
            workout_id: workout.id,
            name: exerciseName,
            exercise_order: exerciseOrder++
          })
          .select()
          .single()

        if (exerciseError || !exercise) {
          throw new Error(`Failed to create exercise: ${exerciseError?.message}`)
        }

        // Get muscle group for this exercise
        const muscleGroup = getMuscleGroupFromExercise(exerciseName)
        
        // Calculate adjusted sets based on user feedback
        const adjustedSets = calculateAdjustedSets(
          muscleGroup, 
          weekNumber, 
          userFeedback || []
        )
        
        // Create sets with adjusted volume (default to 3 sets if calculation fails)
        const setsToCreate = Math.max(2, adjustedSets || 3)
        
        for (let setNum = 1; setNum <= setsToCreate; setNum++) {
          const { error: setError } = await supabaseAdmin
            .from('sets')
            .insert({
              exercise_id: exercise.id,
              set_number: setNum,
              weight: 0,
              reps: 8,
              is_completed: false
            })

          if (setError) {
            throw new Error(`Failed to create set: ${setError.message}`)
          }
        }
        
        console.log(`✅ Created exercise: ${exerciseName} with ${setsToCreate} sets`)
      }
    }

    const totalTime = Date.now() - startTime
    console.log(`✅ Week ${weekNumber} created with autoregulation in ${totalTime}ms`)

    return NextResponse.json({ 
      success: true, 
      week,
      performance: {
        creationTime: totalTime,
        setsCreated: 'calculated based on feedback',
        autoregulationApplied: userFeedback ? true : false
      }
    })

  } catch (error) {
    console.error('Progressive week creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create progressive week', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
