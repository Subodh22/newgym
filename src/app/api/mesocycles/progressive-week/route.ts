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

// Helper function to get muscle group from exercise name
const getMuscleGroupFromExercise = (exerciseName: string): string => {
  const name = exerciseName.toLowerCase()
  if (name.includes('bench') || name.includes('press') || name.includes('chest')) return 'Chest'
  if (name.includes('row') || name.includes('pull') || name.includes('lat') || name.includes('face pull')) return 'Back'
  if (name.includes('squat') || name.includes('leg') || name.includes('extension')) return 'Quadriceps'
  if (name.includes('curl')) return 'Biceps'
  if (name.includes('tricep') || name.includes('dip')) return 'Triceps'
  if (name.includes('shoulder') || name.includes('overhead')) return 'Shoulders'
  if (name.includes('deadlift') || name.includes('romanian') || name.includes('ham') || name.includes('nordic')) return 'Hamstrings'
  if (name.includes('calf')) return 'Calves'
  if (name.includes('crunch') || name.includes('plank') || name.includes('sit') || name.includes('abs')) return 'Abs'
  if (name.includes('glute') || name.includes('hip')) return 'Glutes'
  if (name.includes('treadmill') || name.includes('elliptical') || name.includes('stairmaster') || 
      name.includes('rowing') || name.includes('cycling') || name.includes('jump') || 
      name.includes('burpee') || name.includes('climber') || name.includes('knee') || 
      name.includes('jack') || name.includes('battle') || name.includes('assault') || 
      name.includes('concept') || name.includes('stair') || name.includes('incline') || 
      name.includes('sprint') || name.includes('steady') || name.includes('cardio')) return 'Cardio'
  return 'Other'
}

// Mike Israetel RP Volume Progression System
const calculateAdjustedSets = (muscleGroup: string, previousSetCount: number, feedback: UserFeedback[]) => {
  const landmarks = VOLUME_LANDMARKS[muscleGroup as keyof typeof VOLUME_LANDMARKS]
  const minSets = landmarks?.MEV || 2
  const maxSets = landmarks?.MRV || 25
  
  // Start with previous week's set count
  let adjustedSets = previousSetCount || 3
  let volumeAdjustment = 0 // Declare outside the if block

  const muscleFeedback = feedback.find(f => f.muscleGroup === muscleGroup)
  if (muscleFeedback) {
    // RP Volume Progression based on feedback
    switch (muscleFeedback.difficulty) {
      case 'too_hard':
        // Performance Rating 4: Reduce volume significantly
        volumeAdjustment = -2
        console.log(`📉 RP volume reduction: Removing 2 sets for ${muscleGroup} (too hard)`)
        break
      case 'hard':
        // Performance Rating 3: Reduce volume slightly
        volumeAdjustment = -1
        console.log(`📉 RP volume reduction: Removing 1 set for ${muscleGroup} (hard)`)
        break
      case 'moderate':
        // Performance Rating 2: Standard progression
        volumeAdjustment = 1
        console.log(`📈 RP volume progression: Adding 1 set for ${muscleGroup} (moderate)`)
        break
      case 'easy':
        // Performance Rating 1: Aggressive progression
        volumeAdjustment = 2
        console.log(`📈 RP volume progression: Adding 2 sets for ${muscleGroup} (easy)`)
        break
    }

    // Recovery-based volume adjustments
    if (muscleFeedback.recovery === 'poor' && muscleFeedback.pumpQuality && muscleFeedback.pumpQuality <= 2) {
      // Poor pump + poor recovery: Reduce volume
      volumeAdjustment = Math.min(volumeAdjustment, -1)
      console.log(`⚠️ RP recovery adjustment: Reducing volume for ${muscleGroup} due to poor recovery/pump`)
    } else if (muscleFeedback.recovery === 'excellent' && muscleFeedback.pumpQuality && muscleFeedback.pumpQuality >= 4) {
      // Excellent pump + recovery: Increase volume
      volumeAdjustment = Math.max(volumeAdjustment, 1)
      console.log(`🚀 RP recovery adjustment: Increasing volume for ${muscleGroup} due to excellent recovery/pump`)
    }
  } else {
    // No feedback - apply conservative RP progression
    volumeAdjustment = 1
    console.log(`📈 RP conservative progression: Adding 1 set for ${muscleGroup} (no feedback)`)
  }

  adjustedSets += volumeAdjustment

  // Ensure we stay within RP volume landmarks
  return Math.max(minSets, Math.min(maxSets, adjustedSets))
}

// Mike Israetel RP Weight Progression System
const calculateProgressiveWeight = (baseWeight: number, weekNumber: number, feedback: UserFeedback[], muscleGroup: string, exerciseName: string = '') => {
  let workingWeight = baseWeight
  console.log(`🔄 Using previous weight for "${exerciseName}": ${workingWeight}kg (RP methodology)`)

  const muscleFeedback = feedback.find(f => f.muscleGroup === muscleGroup)
  
  // Determine progression rate based on muscle group (RP methodology)
  let progressionRate = 0.025 // Default 2.5%
  
  if (exerciseName.toLowerCase().includes('bench') || exerciseName.toLowerCase().includes('squat') || exerciseName.toLowerCase().includes('deadlift')) {
    progressionRate = 0.05 // 5% for compound movements
  } else if (['Biceps', 'Triceps', 'Shoulders'].includes(muscleGroup)) {
    progressionRate = 0.025 // 2.5% for small muscles
  } else if (['Chest', 'Back', 'Quadriceps', 'Hamstrings'].includes(muscleGroup)) {
    progressionRate = 0.04 // 4% for large muscles
  }

  // Apply feedback-based adjustments
  if (muscleFeedback) {
    switch (muscleFeedback.difficulty) {
      case 'too_hard':
        // Performance Rating 4: Reduce weight 10%
        workingWeight *= 0.90
        console.log(`📉 RP adjustment: "${exerciseName}" reduced by 10% to ${Math.round(workingWeight * 4) / 4}kg (too hard)`)
        break
      case 'hard':
        // Performance Rating 3: Reduce weight 5%
        workingWeight *= 0.95
        console.log(`📉 RP adjustment: "${exerciseName}" reduced by 5% to ${Math.round(workingWeight * 4) / 4}kg (hard)`)
        break
      case 'easy':
        // Performance Rating 1: Increase weight 5%
        workingWeight *= (1 + progressionRate + 0.025) // Extra 2.5% for easy
        console.log(`📈 RP adjustment: "${exerciseName}" increased by ${Math.round((progressionRate + 0.025) * 100)}% to ${Math.round(workingWeight * 4) / 4}kg (easy)`)
        break
      case 'moderate':
        // Performance Rating 2: Standard progression
        workingWeight *= (1 + progressionRate)
        console.log(`📈 RP progression: "${exerciseName}" increased by ${Math.round(progressionRate * 100)}% to ${Math.round(workingWeight * 4) / 4}kg (moderate)`)
        break
    }

    // Recovery-based adjustments
    if (muscleFeedback.recovery === 'poor' && muscleFeedback.pumpQuality && muscleFeedback.pumpQuality <= 2) {
      // Poor pump + poor recovery: Reduce intensity
      workingWeight *= 0.95
      console.log(`⚠️ RP recovery adjustment: "${exerciseName}" reduced by 5% due to poor recovery/pump`)
    } else if (muscleFeedback.recovery === 'excellent' && muscleFeedback.pumpQuality && muscleFeedback.pumpQuality >= 4) {
      // Excellent pump + recovery: Increase intensity
      workingWeight *= (1 + progressionRate + 0.02)
      console.log(`🚀 RP recovery adjustment: "${exerciseName}" increased by ${Math.round((progressionRate + 0.02) * 100)}% due to excellent recovery/pump`)
    }
  } else {
    // No feedback - apply standard RP progression
    workingWeight *= (1 + progressionRate)
    console.log(`📈 RP standard progression: "${exerciseName}" increased by ${Math.round(progressionRate * 100)}% to ${Math.round(workingWeight * 4) / 4}kg`)
  }

  // Equipment constraint handling (RP methodology)
  const weightJump = Math.abs(workingWeight - baseWeight)
  const jumpPercentage = (weightJump / baseWeight) * 100
  
  if (jumpPercentage > 10) {
    // Weight jump too large - keep same weight, will use rep progression instead
    console.log(`⚖️ RP equipment constraint: Weight jump ${Math.round(jumpPercentage)}% too large, keeping ${baseWeight}kg for rep progression`)
    return baseWeight
  }

  return Math.round(workingWeight * 4) / 4 // Round to nearest 0.25kg
}

// Mike Israetel RP Rep Progression System
const REP_PROGRESSION = {
  1: { reps: 8, rir: 3, phase: 'MEV', description: 'Week 1: Building base volume' },
  2: { reps: 10, rir: 2, phase: 'MAV', description: 'Week 2: Moderate intensity' },
  3: { reps: 12, rir: 1, phase: 'MAV', description: 'Week 3: High intensity' },
  4: { reps: 12, rir: 0, phase: 'MRV', description: 'Week 4: Peak intensity' },
  5: { reps: 8, rir: 3, phase: 'Deload', description: 'Week 5: Active recovery' }
}

const getTargetRepsForWeek = (weekNumber: number, baseReps: number = 8, feedback: UserFeedback[], muscleGroup: string, exerciseName: string = '') => {
  const muscleFeedback = feedback.find(f => f.muscleGroup === muscleGroup)
  
  // Get the target rep range for this week based on RP progression
  const weekRepInfo = REP_PROGRESSION[weekNumber as keyof typeof REP_PROGRESSION] || REP_PROGRESSION[2]
  let targetReps = weekRepInfo.reps
  
  // RP Rep-Match Load Progression System
  if (muscleFeedback) {
    switch (muscleFeedback.difficulty) {
      case 'too_hard':
        // Performance Rating 4: Reduce reps by 2, add weight reduction
        targetReps = Math.max(6, targetReps - 2)
        console.log(`📉 RP rep adjustment: "${exerciseName}" reduced to ${targetReps} reps (too hard)`)
        break
      case 'hard':
        // Performance Rating 3: Reduce reps by 1, add weight reduction
        targetReps = Math.max(6, targetReps - 1)
        console.log(`📉 RP rep adjustment: "${exerciseName}" reduced to ${targetReps} reps (hard)`)
        break
      case 'easy':
        // Performance Rating 1: Increase reps by 1-2
        targetReps = Math.min(20, targetReps + 2)
        console.log(`📈 RP rep progression: "${exerciseName}" increased to ${targetReps} reps (easy)`)
        break
      case 'moderate':
        // Performance Rating 2: Standard progression
        console.log(`📊 RP standard progression: "${exerciseName}" ${targetReps} reps (${weekRepInfo.phase} phase)`)
        break
    }

    // Recovery-based rep adjustments
    if (muscleFeedback.recovery === 'poor' && muscleFeedback.pumpQuality && muscleFeedback.pumpQuality <= 2) {
      // Poor pump + poor recovery: Reduce reps
      targetReps = Math.max(6, targetReps - 1)
      console.log(`⚠️ RP recovery adjustment: "${exerciseName}" reduced to ${targetReps} reps due to poor recovery/pump`)
    } else if (muscleFeedback.recovery === 'excellent' && muscleFeedback.pumpQuality && muscleFeedback.pumpQuality >= 4) {
      // Excellent pump + recovery: Increase reps
      targetReps = Math.min(20, targetReps + 1)
      console.log(`🚀 RP recovery adjustment: "${exerciseName}" increased to ${targetReps} reps due to excellent recovery/pump`)
    }
  } else {
    // No feedback - apply standard RP progression
    console.log(`📊 RP standard progression: "${exerciseName}" ${targetReps} reps (${weekRepInfo.phase} phase)`)
  }

  // Exercise-specific rep ranges (RP methodology)
  const exerciseNameLower = exerciseName.toLowerCase()
  if (exerciseNameLower.includes('bench') || exerciseNameLower.includes('squat') || exerciseNameLower.includes('deadlift')) {
    // Compound movements: 6-12 rep range
    targetReps = Math.max(6, Math.min(12, targetReps))
  } else if (exerciseNameLower.includes('curl') || exerciseNameLower.includes('lateral') || exerciseNameLower.includes('tricep')) {
    // Isolation movements: 8-20 rep range
    targetReps = Math.max(8, Math.min(20, targetReps))
  }
  
  return targetReps
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('📥 Received request body:', JSON.stringify(body, null, 2))
    
    const { mesocycleId, weekNumber, userFeedback, trainingDays, selectedSplit, workoutPlans, updateRemainingWorkouts, updateSpecificDay } = body
    
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

    // Check if week number exceeds mesocycle's total weeks FIRST
    const { data: mesocycle, error: mesocycleError } = await supabaseAdmin
      .from('mesocycles')
      .select('number_of_weeks, name')
      .eq('id', mesocycleId)
      .single()

    if (mesocycleError || !mesocycle) {
      console.error('❌ Failed to fetch mesocycle:', mesocycleError)
      return NextResponse.json({
        error: 'Failed to fetch mesocycle information'
      }, { status: 500 })
    }

    if (weekNumber > mesocycle.number_of_weeks) {
      console.log(`🎉 Mesocycle "${mesocycle.name}" completed! Week ${weekNumber} exceeds total weeks (${mesocycle.number_of_weeks})`)
      return NextResponse.json({
        success: true,
        completed: true,
        message: `Congratulations! You've completed all ${mesocycle.number_of_weeks} weeks of your "${mesocycle.name}" mesocycle!`,
        mesocycleName: mesocycle.name,
        totalWeeks: mesocycle.number_of_weeks,
        completedWeeks: weekNumber - 1
      }, { status: 200 })
    }

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
      console.log(`🔍 Found existing week: Week ${weekNumber}`)
      if (updateSpecificDay) {
        console.log(`🎯 SPECIFIC DAY UPDATE: Creating/updating only Day ${updateSpecificDay} in Week ${weekNumber}`)
        
        // First, check if the specific day already exists in this week
        let { data: existingWorkout, error: workoutCheckError } = await supabaseAdmin
          .from('workouts')
          .select(`
            *,
            exercises (
              *,
              sets (*)
            )
          `)
          .eq('week_id', existingWeek.id)
          .ilike('day_name', `%Day ${updateSpecificDay}%`)
          .single()

        if (workoutCheckError || !existingWorkout) {
          console.log(`📝 Day ${updateSpecificDay} doesn't exist in Week ${weekNumber}, creating it...`)
          
          // Get the previous week to copy the specific day from
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
            console.error('❌ Could not find previous week to copy from')
            return NextResponse.json({
              error: `Could not find previous week to copy Day ${updateSpecificDay} from`
            }, { status: 500 })
          }
          
          // Find the specific day in the previous week
          const prevWorkout = previousWeek.workouts?.find((w: any) => {
            const dayMatch = w.day_name?.match(/Day (\d+)/)
            return dayMatch && parseInt(dayMatch[1]) === updateSpecificDay
          })

          if (!prevWorkout) {
            console.error(`❌ Could not find Day ${updateSpecificDay} in previous week`)
            return NextResponse.json({
              error: `Could not find Day ${updateSpecificDay} in previous week`
            }, { status: 500 })
          }

          console.log(`📋 Copying Day ${updateSpecificDay} from previous week: ${prevWorkout.day_name}`)
          console.log(`🔍 Previous workout details:`, {
            dayName: prevWorkout.day_name,
            exerciseCount: prevWorkout.exercises?.length || 0,
            exercises: prevWorkout.exercises?.map((ex: any) => ex.name) || []
          })

          // Create the specific day in the current week
          const { data: newWorkout, error: createWorkoutError } = await supabaseAdmin
            .from('workouts')
            .insert({
              week_id: existingWeek.id,
              day_name: prevWorkout.day_name
            })
            .select()
            .single()

          if (createWorkoutError || !newWorkout) {
            console.error('❌ Failed to create workout:', createWorkoutError)
            return NextResponse.json({
              error: `Failed to create Day ${updateSpecificDay} workout`
            }, { status: 500 })
          }

          console.log(`✅ Created workout: ${newWorkout.day_name}`)

          // Copy exercises with progressive overload
          for (const prevExercise of prevWorkout.exercises || []) {
            const muscleGroup = getMuscleGroupFromExercise(prevExercise.name)
            const previousSetCount = prevExercise.sets?.length || 3
            const baseWeight = prevExercise.sets?.[0]?.weight || 0
            
            // Apply progressive overload
            const adjustedSets = calculateAdjustedSets(muscleGroup, previousSetCount, userFeedback || [])
            const progressiveWeight = calculateProgressiveWeight(baseWeight, weekNumber, userFeedback || [], muscleGroup, prevExercise.name)
            const targetReps = getTargetRepsForWeek(weekNumber, 8, userFeedback || [], muscleGroup, prevExercise.name)
            
            console.log(`📈 Progressive overload for ${prevExercise.name}: ${previousSetCount} → ${adjustedSets} sets, ${baseWeight}kg → ${progressiveWeight}kg`)

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
              console.error(`❌ Failed to create exercise: ${exerciseError?.message}`)
              continue
            }

            // Create sets with progressive overload
            for (let setNum = 1; setNum <= adjustedSets; setNum++) {
              const { error: setError } = await supabaseAdmin
                .from('sets')
                .insert({
                  exercise_id: newExercise.id,
                  set_number: setNum,
                  weight: progressiveWeight,
                  reps: targetReps,
                  is_completed: false
                })

              if (setError) {
                console.error(`❌ Failed to create set: ${setError.message}`)
              }
            }
          }

          console.log(`✅ Day ${updateSpecificDay} in Week ${weekNumber} created with progressive overload!`)
          return NextResponse.json({
            success: true,
            message: `Day ${updateSpecificDay} in Week ${weekNumber} created with progressive overload`,
            updatedWorkout: newWorkout.day_name,
            details: {
              dayNumber: updateSpecificDay,
              weekNumber: weekNumber,
              workoutName: newWorkout.day_name,
              exercisesUpdated: prevWorkout.exercises?.length || 0
            }
          }, { status: 200 })

        } else {
          console.log(`🔄 Day ${updateSpecificDay} already exists in Week ${weekNumber}, updating with progressive overload`)
          
          // Update existing workout with progressive overload
          if (existingWorkout.exercises && existingWorkout.exercises.length > 0) {
            console.log(`🔄 Updating workout: ${existingWorkout.day_name}`)
            
            for (const exercise of existingWorkout.exercises) {
            const muscleGroup = getMuscleGroupFromExercise(exercise.name)
            const previousSetCount = exercise.sets?.length || 3
              const baseWeight = exercise.sets?.[0]?.weight || 0
            
            // Apply progressive overload
            const adjustedSets = calculateAdjustedSets(muscleGroup, previousSetCount, userFeedback || [])
            const progressiveWeight = calculateProgressiveWeight(baseWeight, weekNumber, userFeedback || [], muscleGroup, exercise.name)
            const targetReps = getTargetRepsForWeek(weekNumber, 8, userFeedback || [], muscleGroup, exercise.name)
            
            console.log(`📈 Updating ${exercise.name}: ${previousSetCount} → ${adjustedSets} sets, ${baseWeight}kg → ${progressiveWeight}kg`)
            
            // Update exercise with new progressive overload values
            const { error: exerciseUpdateError } = await supabaseAdmin
              .from('exercises')
              .update({
                  // weight: progressiveWeight // Removed - weight is stored in sets table
              })
              .eq('id', exercise.id)

            if (exerciseUpdateError) {
              console.error(`❌ Failed to update exercise ${exercise.name}:`, exerciseUpdateError)
            }

            // Update sets with new rep targets
            if (exercise.sets && exercise.sets.length > 0) {
              for (const set of exercise.sets) {
                const { error: setUpdateError } = await supabaseAdmin
                  .from('sets')
                  .update({
                    reps: targetReps
                  })
                  .eq('id', set.id)

                if (setUpdateError) {
                  console.error(`❌ Failed to update set for ${exercise.name}:`, setUpdateError)
                }
              }
            }
          }
        }

        console.log(`✅ Day ${updateSpecificDay} in Week ${weekNumber} updated with progressive overload!`)
        return NextResponse.json({
          success: true,
          message: `Day ${updateSpecificDay} in Week ${weekNumber} updated with progressive overload`,
            updatedWorkout: existingWorkout.day_name,
          details: {
            dayNumber: updateSpecificDay,
            weekNumber: weekNumber,
              workoutName: existingWorkout.day_name,
              exercisesUpdated: existingWorkout.exercises?.length || 0
          }
        }, { status: 200 })
        }
      } else if (updateRemainingWorkouts) {
        console.log(`🔄 Updating remaining workouts in Week ${weekNumber} with progressive overload`)
        
        // Get all workouts in the current week
        const { data: workouts, error: workoutsError } = await supabaseAdmin
          .from('workouts')
          .select(`
            *,
            exercises (
              *,
              sets (*)
            )
          `)
          .eq('week_id', existingWeek.id)
          .order('created_at', { ascending: true })

        if (workoutsError || !workouts) {
          console.error('❌ Failed to fetch workouts:', workoutsError)
          return NextResponse.json({
            error: 'Failed to fetch workouts for update'
          }, { status: 500 })
        }

        console.log(`📊 Found ${workouts.length} workouts in Week ${weekNumber}`)

        // Update each workout with progressive overload
        for (const workout of workouts) {
          if (workout.exercises && workout.exercises.length > 0) {
            console.log(`🔄 Updating workout: ${workout.day_name}`)
            
            for (const exercise of workout.exercises) {
              const muscleGroup = getMuscleGroupFromExercise(exercise.name)
              const previousSetCount = exercise.sets?.length || 3
              const baseWeight = exercise.sets?.[0]?.weight || 0
              
              // Apply progressive overload
              const adjustedSets = calculateAdjustedSets(muscleGroup, previousSetCount, userFeedback || [])
              const progressiveWeight = calculateProgressiveWeight(baseWeight, weekNumber, userFeedback || [], muscleGroup, exercise.name)
              const targetReps = getTargetRepsForWeek(weekNumber, 8, userFeedback || [], muscleGroup, exercise.name)
              
              console.log(`📈 Updating ${exercise.name}: ${previousSetCount} → ${adjustedSets} sets, ${baseWeight}kg → ${progressiveWeight}kg`)
              
              // Update exercise with new progressive overload values
              const { error: exerciseUpdateError } = await supabaseAdmin
                .from('exercises')
                .update({
                  // weight: progressiveWeight // Removed - weight is stored in sets table
                })
                .eq('id', exercise.id)

              if (exerciseUpdateError) {
                console.error(`❌ Failed to update exercise ${exercise.name}:`, exerciseUpdateError)
              }

              // Update sets with new rep targets
              if (exercise.sets && exercise.sets.length > 0) {
                for (const set of exercise.sets) {
                  const { error: setUpdateError } = await supabaseAdmin
                    .from('sets')
                    .update({
                      reps: targetReps
                    })
                    .eq('id', set.id)

                  if (setUpdateError) {
                    console.error(`❌ Failed to update set for ${exercise.name}:`, setUpdateError)
                  }
                }
              }
            }
          }
        }

        console.log('✅ Remaining workouts updated with progressive overload!')
        return NextResponse.json({
          success: true,
          message: `Remaining workouts in Week ${weekNumber} updated with progressive overload`,
          updatedWorkouts: workouts.length
        }, { status: 200 })
      } else {
        console.log(`⚠️ Week ${weekNumber} already exists for mesocycle ${mesocycleId}`)
        return NextResponse.json({
          success: false,
          error: `Week ${weekNumber} already exists`,
          existingWeek: existingWeek
        }, { status: 409 }) // Conflict status
      }
    }

    // If we reach here, the week doesn't exist and we need to create it
    // But if updateSpecificDay is provided, we should only create that specific day
    if (updateSpecificDay) {
      console.log(`🎯 CREATING NEW WEEK: Creating Week ${weekNumber} with only Day ${updateSpecificDay}`)
      
      // Create the week first
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
        console.error('❌ Failed to create week:', weekError)
        return NextResponse.json({
          error: `Failed to create week: ${weekError?.message}`
        }, { status: 500 })
      }

      console.log(`✅ Week created successfully: ${week.id}`)

      // Get the previous week to copy the specific day from
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
        console.error('❌ Could not find previous week to copy from')
        return NextResponse.json({
          error: `Could not find previous week to copy Day ${updateSpecificDay} from`
        }, { status: 500 })
      }

      // Find the specific day in the previous week
      const prevWorkout = previousWeek.workouts?.find((w: any) => {
        const dayMatch = w.day_name?.match(/Day (\d+)/)
        return dayMatch && parseInt(dayMatch[1]) === updateSpecificDay
      })

      if (!prevWorkout) {
        console.error(`❌ Could not find Day ${updateSpecificDay} in previous week`)
        return NextResponse.json({
          error: `Could not find Day ${updateSpecificDay} in previous week`
        }, { status: 500 })
      }

      console.log(`📋 Creating only Day ${updateSpecificDay} from previous week: ${prevWorkout.day_name}`)
      console.log(`🔍 Previous workout details:`, {
        dayName: prevWorkout.day_name,
        exerciseCount: prevWorkout.exercises?.length || 0,
        exercises: prevWorkout.exercises?.map((ex: any) => ex.name) || []
      })

      // Create only the specific day in the new week
      const { data: newWorkout, error: createWorkoutError } = await supabaseAdmin
        .from('workouts')
        .insert({
          week_id: week.id,
          day_name: prevWorkout.day_name
        })
        .select()
        .single()

      if (createWorkoutError || !newWorkout) {
        console.error('❌ Failed to create workout:', createWorkoutError)
        return NextResponse.json({
          error: `Failed to create Day ${updateSpecificDay} workout`
        }, { status: 500 })
      }

      console.log(`✅ Created workout: ${newWorkout.day_name}`)

      // Calculate total sets per muscle group first (RP methodology)
      const muscleGroupSets: { [key: string]: number } = {}
      const exercisesByMuscleGroup: { [key: string]: any[] } = {}
      
      // Group exercises by muscle group and calculate total sets needed
      for (const prevExercise of prevWorkout.exercises || []) {
        const muscleGroup = getMuscleGroupFromExercise(prevExercise.name)
        if (!exercisesByMuscleGroup[muscleGroup]) {
          exercisesByMuscleGroup[muscleGroup] = []
        }
        exercisesByMuscleGroup[muscleGroup].push(prevExercise)
      }
      
      // Calculate total sets per muscle group
      for (const [muscleGroup, exercises] of Object.entries(exercisesByMuscleGroup)) {
        const totalPreviousSets = exercises.reduce((sum, ex) => sum + (ex.sets?.length || 3), 0)
        const totalAdjustedSets = calculateAdjustedSets(muscleGroup, totalPreviousSets, userFeedback || [])
        muscleGroupSets[muscleGroup] = totalAdjustedSets
        console.log(`📊 RP volume calculation: ${muscleGroup} - ${totalPreviousSets} → ${totalAdjustedSets} total sets`)
      }
      
      // Copy exercises with progressive overload
      for (const prevExercise of prevWorkout.exercises || []) {
        const muscleGroup = getMuscleGroupFromExercise(prevExercise.name)
        const baseWeight = prevExercise.sets?.[0]?.weight || 0
        
        // Distribute sets across exercises for this muscle group (RP methodology: 3-4 sets per exercise)
        const exercisesInGroup = exercisesByMuscleGroup[muscleGroup].length
        const setsPerExercise = Math.max(3, Math.min(4, Math.round(muscleGroupSets[muscleGroup] / exercisesInGroup)))
        
        const progressiveWeight = calculateProgressiveWeight(baseWeight, weekNumber, userFeedback || [], muscleGroup, prevExercise.name)
        const targetReps = getTargetRepsForWeek(weekNumber, 8, userFeedback || [], muscleGroup, prevExercise.name)
        
        console.log(`📈 RP exercise progression: ${prevExercise.name} - ${setsPerExercise} sets, ${baseWeight}kg → ${progressiveWeight}kg`)

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
          console.error(`❌ Failed to create exercise: ${exerciseError?.message}`)
          continue
        }

        // Create sets with progressive overload
        for (let setNum = 1; setNum <= setsPerExercise; setNum++) {
          const isTimeBased = isTimeBasedExercise(prevExercise.name)
          
          const setData: any = {
            exercise_id: newExercise.id,
            set_number: setNum,
            is_completed: false
          }

          if (isTimeBased) {
            // For time-based exercises, use duration with progressive overload
            const baseDuration = prevExercise.sets?.[0]?.duration || 600 // 10 minutes default
            const progressiveDuration = Math.round(baseDuration * (1 + (weekNumber - 1) * 0.05)) // 5% increase per week
            setData.duration = progressiveDuration
            setData.weight = null
            setData.reps = null
            console.log(`⏱️ Time-based progression: ${prevExercise.name} - ${baseDuration}s → ${progressiveDuration}s`)
          } else {
            // For regular exercises, use weight and reps
            setData.weight = progressiveWeight
            setData.reps = targetReps
            setData.duration = null
          }

          const { error: setError } = await supabaseAdmin
            .from('sets')
            .insert(setData)

          if (setError) {
            console.error(`❌ Failed to create set: ${setError.message}`)
          }
        }
      }

      const endTime = Date.now()
      console.log(`✅ Week ${weekNumber} created with only Day ${updateSpecificDay} and progressive overload in ${endTime - startTime}ms`)
      return NextResponse.json({
        success: true,
        message: `Week ${weekNumber} created with only Day ${updateSpecificDay} and progressive overload`,
        weekId: week.id,
        createdWorkout: newWorkout.day_name,
        details: {
          dayNumber: updateSpecificDay,
          weekNumber: weekNumber,
          workoutName: newWorkout.day_name,
          exercisesCreated: prevWorkout.exercises?.length || 0
        }
      }, { status: 200 })
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

    // Helper functions are now defined at the top of the file

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
          
          // Get the last set from previous week for weight progression (completed or not)
          const lastSet = prevExercise.sets
            ?.sort((a: any, b: any) => b.set_number - a.set_number)[0]
          
          const baseWeight = lastSet?.weight || 0  // Use 0 if no previous data - no assumptions
          const progressiveWeight = calculateProgressiveWeight(baseWeight, weekNumber, userFeedback || [], muscleGroup, prevExercise.name)
          
          // Get target reps based on progressive overload
          const targetReps = getTargetRepsForWeek(weekNumber, lastSet?.reps || 8, userFeedback || [], muscleGroup, prevExercise.name)
          
          // Get RIR info for this week
          const rirInfo = RIR_PROGRESSION[weekNumber as keyof typeof RIR_PROGRESSION] || RIR_PROGRESSION[4]
          
          const weekRepInfo = REP_PROGRESSION[weekNumber as keyof typeof REP_PROGRESSION] || REP_PROGRESSION[2]
          console.log(`📋 ${prevExercise.name}: ${prevSetCount} → ${setsToCreate} sets, ${baseWeight}kg → ${progressiveWeight}kg, ${lastSet?.reps || 8} → ${targetReps} reps (${weekRepInfo.phase} phase)`)
          
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
    
    console.log(`✅ Week ${weekNumber} created with progressive overload in ${totalTime}ms`)
    console.log('🔄 Applied progressive overload - increases by default, reduces when too hard')

    // Log detailed progressive overload adjustments
    if (userFeedback && userFeedback.length > 0) {
      console.log('📊 Progressive overload adjustments applied:')
      userFeedback.forEach((feedback: UserFeedback) => {
        console.log(`  - ${feedback.muscleGroup}: ${feedback.difficulty} difficulty, ${feedback.soreness} soreness, ${feedback.performance} performance`)
        if (feedback.difficulty === 'too_hard' || feedback.difficulty === 'hard') {
          console.log(`    ✅ Weight and volume reduced (user said it was ${feedback.difficulty})`)
        } else {
          console.log(`    ✅ Progressive overload applied (weight and volume increased)`)
        }
      })
    }

    return NextResponse.json({ 
      success: true, 
      week,
              method: 'rp-progressive-overload-database',
        message: `Fast progressive overload week created! Week ${weekNumber} - Immediate progression with optimized volume and intensity increases`,
      progressionInfo: {
        weekNumber: weekNumber,
        weightProgression: 'Increases by 2.5% by default, reduces when too hard or hard',
        repsProgression: 'Professional progression: 6→8→10→12→16 reps by week, adjusts based on feedback',
        volumeProgression: 'Adds 1 set by default, reduces when too hard or hard',
        repPhase: REP_PROGRESSION[weekNumber as keyof typeof REP_PROGRESSION]?.phase || 'Strength-Hypertrophy',
        progressiveOverload: true,
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

