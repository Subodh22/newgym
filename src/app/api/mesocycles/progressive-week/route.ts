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

// RIR (Reps in Reserve) progression system following RP methodology
const RIR_PROGRESSION = {
  1: { rir: 3, description: 'Week 1: 3 RIR - Building base volume' },
  2: { rir: 2, description: 'Week 2: 2 RIR - Moderate intensity' },
  3: { rir: 1, description: 'Week 3: 1 RIR - High intensity' },
  4: { rir: 0, description: 'Week 4: 0 RIR - Peak intensity' },
  5: { rir: 0, description: 'Week 5: 0 RIR - Overreaching (optional)' },
  deload: { rir: 3, description: 'Deload: 3-4 RIR - Active recovery' }
}

// Weight progression - only used when user explicitly says exercise was "easy"
const USER_REQUESTED_INCREASE = 0.025 // 2.5% increase when user says it was too easy

interface UserFeedback {
  muscleGroup: string
  difficulty: 'easy' | 'moderate' | 'hard' | 'too_hard'
  soreness: 'none' | 'light' | 'moderate' | 'severe'
  performance: 'improved' | 'maintained' | 'decreased'
  pumpQuality?: 1 | 2 | 3 | 4 | 5
  recovery?: 'poor' | 'fair' | 'good' | 'excellent'
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

    // Check if this week already exists
    const { data: existingWeek, error: checkError } = await supabaseAdmin
      .from('weeks')
      .select('*')
      .eq('mesocycle_id', mesocycleId)
      .eq('week_number', weekNumber)
      .single()

    if (existingWeek) {
      console.log(`⚠️ Week ${weekNumber} already exists for mesocycle ${mesocycleId}`)
      return NextResponse.json({
        success: false,
        error: `Week ${weekNumber} already exists`,
        existingWeek: existingWeek
      }, { status: 409 }) // Conflict status
    }

    // Create the week
    const weekName = `Week ${weekNumber}`
    console.log(`🔄 Creating new week: ${weekName} for mesocycle ${mesocycleId}`)
    
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

    // User-driven volume adjustments - ONLY change when user provides specific feedback
    const calculateAdjustedSets = (muscleGroup: string, previousSetCount: number, feedback: UserFeedback[]) => {
      const landmarks = VOLUME_LANDMARKS[muscleGroup as keyof typeof VOLUME_LANDMARKS]
      const minSets = landmarks?.MEV || 2
      const maxSets = landmarks?.MRV || 25
      
      // Start with previous week's set count - NO automatic progression
      let adjustedSets = previousSetCount || 3

      const muscleFeedback = feedback.find(f => f.muscleGroup === muscleGroup)
      if (muscleFeedback) {
        let volumeAdjustment = 0

        // ONLY adjust based on explicit user feedback
        switch (muscleFeedback.difficulty) {
          case 'easy':
            volumeAdjustment += 1 // Add 1 set if user says it was too easy
            console.log(`📈 Adding 1 set for ${muscleGroup} (user feedback: too easy)`)
            break
          case 'too_hard':
            volumeAdjustment -= 1 // Remove 1 set if user says it was too hard
            console.log(`📉 Removing 1 set for ${muscleGroup} (user feedback: too hard)`)
            break
          case 'hard':
          case 'moderate':
            // Keep same volume for moderate/hard - user didn't request change
            console.log(`🔄 Keeping same volume for ${muscleGroup} (user feedback: ${muscleFeedback.difficulty})`)
            break
        }

        // Additional adjustment only for severe soreness (safety)
        if (muscleFeedback.soreness === 'severe') {
          volumeAdjustment -= 1 // Safety reduction for severe soreness
          console.log(`⚠️ Reducing 1 set for ${muscleGroup} due to severe soreness`)
        }

        adjustedSets += volumeAdjustment
      } else {
        // No feedback = no changes
        console.log(`🔄 No feedback for ${muscleGroup}, keeping ${adjustedSets} sets`)
      }

      // Ensure we stay within safe limits
      return Math.max(minSets, Math.min(maxSets, adjustedSets))
    }

    // No baseline weights - user sets their own starting weights

    const calculateProgressiveWeight = (baseWeight: number, weekNumber: number, feedback: UserFeedback[], muscleGroup: string, exerciseName: string = '') => {
      // Use exactly what the previous week had - NO assumptions, NO baseline weights
      let workingWeight = baseWeight

      console.log(`🔄 Using previous weight for "${exerciseName}": ${workingWeight}kg (no automatic assumptions)`)

      const muscleFeedback = feedback.find(f => f.muscleGroup === muscleGroup)
      
      // ONLY adjust weight if user explicitly says it was too easy AND there's a weight to increase
      if (muscleFeedback && muscleFeedback.difficulty === 'easy' && workingWeight > 0) {
        // Small increase only when user says it was too easy
        const newWeight = workingWeight * (1 + USER_REQUESTED_INCREASE)
        console.log(`📈 Increasing weight for "${exerciseName}" from ${workingWeight}kg to ${Math.round(newWeight * 4) / 4}kg (user feedback: too easy)`)
        return Math.round(newWeight * 4) / 4 // Round to nearest 0.25kg
      }

      // For all cases including 0 weight, keep exactly what it was
      return workingWeight
    }

    const getTargetRepsForWeek = (weekNumber: number, baseReps: number = 8) => {
      // Keep the same reps as previous week - NO automatic changes
      // User can manually adjust reps in the UI if they want
      console.log(`🔄 Keeping same rep target: ${baseReps} (no automatic rep changes)`)
      return baseReps
    }

    // First, get the previous week's workouts to copy the actual exercises
    console.log(`🔍 Fetching previous week (${weekNumber - 1}) exercises...`)
    
    const { data: previousWeek, error: prevWeekError } = await supabaseAdmin
      .from('weeks')
      .select(`
        *,
        workouts (
          *,
          exercises (
            *,
            sets (*)
          )
        )
      `)
      .eq('mesocycle_id', mesocycleId)
      .eq('week_number', weekNumber - 1)
      .single()

    if (prevWeekError || !previousWeek) {
      console.warn(`⚠️ Could not find previous week, using default exercises`)
      // Fallback to default exercises if no previous week found
      const workoutTypes = Object.keys(defaultSelectedSplit)
      
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

          // Create basic sets with 0 weight - user will set their own weights
          for (let setNum = 1; setNum <= 3; setNum++) {
            const { error: setError } = await supabaseAdmin
              .from('sets')
              .insert({
                exercise_id: exercise.id,
                set_number: setNum,
                weight: 0, // Start with 0 - user sets their own weight
                reps: 8,
                is_completed: false
              })

            if (setError) {
              throw new Error(`Failed to create set: ${setError.message}`)
            }
          }
        }
      }
    } else {
      console.log(`✅ Found previous week with ${previousWeek.workouts?.length} workouts`)
      
      // Copy workouts and exercises from previous week with progressive overload
      for (const prevWorkout of previousWeek.workouts || []) {
        const { data: newWorkout, error: workoutError } = await supabaseAdmin
          .from('workouts')
          .insert({
            week_id: week.id,
            day_name: prevWorkout.day_name.replace(`Week ${weekNumber - 1}`, `Week ${weekNumber}`)
          })
          .select()
          .single()

        if (workoutError || !newWorkout) {
          throw new Error(`Failed to create workout: ${workoutError?.message}`)
        }

        console.log(`✅ Created workout: ${newWorkout.day_name}`)

        // Copy exercises from previous week with progressive overload
        for (const prevExercise of prevWorkout.exercises || []) {
          const { data: newExercise, error: exerciseError } = await supabaseAdmin
            .from('exercises')
            .insert({
              workout_id: newWorkout.id,
              name: prevExercise.name,
              exercise_order: prevExercise.exercise_order
            })
            .select()
            .single()

          if (exerciseError || !newExercise) {
            throw new Error(`Failed to create exercise: ${exerciseError?.message}`)
          }

          // Get muscle group for this exercise
          const muscleGroup = getMuscleGroupFromExercise(prevExercise.name)
          
          // Calculate adjusted sets based on user feedback
          const adjustedSets = calculateAdjustedSets(
            muscleGroup, 
            prevExercise.sets?.length || 3, // Use previous week's set count
            userFeedback || []
          )
          
          // Use previous week's set count as baseline, then apply autoregulation
          const prevSetCount = prevExercise.sets?.length || 3
          const setsToCreate = Math.max(2, adjustedSets || prevSetCount)
          
          // Get the last completed set from previous week for weight progression
          const lastCompletedSet = prevExercise.sets
            ?.filter((set: any) => set.is_completed && set.weight > 0)
            ?.sort((a: any, b: any) => b.set_number - a.set_number)[0]
          
          const baseWeight = lastCompletedSet?.weight || 0  // Use 0 if no previous data - no assumptions
          const progressiveWeight = calculateProgressiveWeight(baseWeight, weekNumber, userFeedback || [], muscleGroup, prevExercise.name)
          
          // Get target reps based on RIR progression  
          const targetReps = getTargetRepsForWeek(weekNumber, lastCompletedSet?.reps || 8)
          
          // Get RIR info for this week
          const rirInfo = RIR_PROGRESSION[weekNumber as keyof typeof RIR_PROGRESSION] || RIR_PROGRESSION[4]
          
          console.log(`📋 ${prevExercise.name}: ${prevSetCount} → ${setsToCreate} sets, ${baseWeight}kg → ${progressiveWeight}kg (user-driven only)`)
          
          for (let setNum = 1; setNum <= setsToCreate; setNum++) {
            const { error: setError } = await supabaseAdmin
              .from('sets')
              .insert({
                exercise_id: newExercise.id,
                set_number: setNum,
                weight: progressiveWeight,
                reps: targetReps,
                is_completed: false,
                notes: `Week ${weekNumber} - ${rirInfo.description}`
              })

            if (setError) {
              throw new Error(`Failed to create set: ${setError.message}`)
            }
          }
          
          console.log(`✅ Created exercise: ${prevExercise.name} with ${setsToCreate} sets`)
        }
      }
    }

    const totalTime = Date.now() - startTime
    const currentRirInfo = RIR_PROGRESSION[weekNumber as keyof typeof RIR_PROGRESSION] || RIR_PROGRESSION[4]
    
    console.log(`✅ Week ${weekNumber} created with user-driven progression in ${totalTime}ms`)
    console.log('🔄 Applied user-driven adjustments based on explicit feedback only')

    // Log detailed user-driven adjustments
    if (userFeedback && userFeedback.length > 0) {
      console.log('📊 User-driven adjustments applied:')
      userFeedback.forEach((feedback: UserFeedback) => {
        console.log(`  - ${feedback.muscleGroup}: ${feedback.difficulty} difficulty, ${feedback.soreness} soreness, ${feedback.performance} performance`)
        if (feedback.difficulty === 'easy') {
          console.log(`    ✅ Weight increased (user said it was too easy)`)
        } else if (feedback.difficulty === 'too_hard') {
          console.log(`    ✅ Volume reduced (user said it was too hard)`)
        } else {
          console.log(`    ✅ No changes (user didn't request adjustments)`)
        }
      })
    }

    return NextResponse.json({ 
      success: true, 
      week,
      method: 'rp-progressive-overload-database',
      message: `User-driven progressive week created! Week ${weekNumber} - Changes only when you request them`,
      progressionInfo: {
        weekNumber: weekNumber,
        weightProgression: 'Only increases when user says exercise was "easy"',
        volumeProgression: 'Only changes when user says exercise was "easy" or "too hard"',
        userDrivenApproach: true,
        adjustmentsApplied: userFeedback ? true : false
      },
      performance: {
        creationTime: totalTime,
        workoutsCreated: defaultTrainingDays,
        exercisesPerWorkout: 4, // Basic exercises per workout type
        userDrivenAdjustments: userFeedback ? true : false,
        approach: 'User-driven progression - no automatic assumptions'
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

