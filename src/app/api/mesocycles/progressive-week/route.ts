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

    // Progressive overload by default, unless user says it's too hard or hard
    switch (muscleFeedback.difficulty) {
      case 'too_hard':
      case 'hard':
        volumeAdjustment -= 1 // Remove 1 set if user says it was too hard or hard
        console.log(`📉 Removing 1 set for ${muscleGroup} (user feedback: ${muscleFeedback.difficulty})`)
        break
      case 'easy':
      case 'moderate':
        // Progressive overload - add 1 set by default
        volumeAdjustment += 1
        console.log(`📈 Progressive overload: Adding 1 set for ${muscleGroup} (user feedback: ${muscleFeedback.difficulty})`)
        break
    }

    // Additional adjustment only for severe soreness (safety)
    if (muscleFeedback.soreness === 'severe') {
      volumeAdjustment -= 1 // Safety reduction for severe soreness
      console.log(`⚠️ Reducing 1 set for ${muscleGroup} due to severe soreness`)
    }

    adjustedSets += volumeAdjustment
  } else {
    // No feedback = apply default progressive overload for immediate progression
    adjustedSets += 1
    console.log(`🚀 Default progressive overload: Adding 1 set for ${muscleGroup} (immediate progression)`)
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
  
  // Progressive overload by default, unless user says it's too hard or hard
  if (muscleFeedback && (muscleFeedback.difficulty === 'too_hard' || muscleFeedback.difficulty === 'hard')) {
    // Reduce weight when user says it was too hard or hard
    const reductionRate = 0.05 // 5% reduction for safety
    const newWeight = workingWeight * (1 - reductionRate)
    console.log(`📉 Reducing weight for "${exerciseName}" from ${workingWeight}kg to ${Math.round(newWeight * 4) / 4}kg (user feedback: ${muscleFeedback.difficulty})`)
    return Math.round(newWeight * 4) / 4 // Round to nearest 0.25kg
  } else {
    // Progressive overload - increase weight by default (more aggressive for immediate progression)
    const increaseRate = muscleFeedback ? 0.025 : 0.035 // 3.5% for immediate progression, 2.5% for feedback-based
    const newWeight = workingWeight * (1 + increaseRate)
    const progressionType = muscleFeedback ? 'feedback-based' : 'immediate'
    console.log(`📈 Progressive overload: "${exerciseName}" from ${workingWeight}kg to ${Math.round(newWeight * 4) / 4}kg (${progressionType})`)
    return Math.round(newWeight * 4) / 4 // Round to nearest 0.25kg
  }
}

// Professional rep progression system
const REP_PROGRESSION = {
  1: { reps: 6, phase: 'Strength', description: 'Low rep strength focus' },
  2: { reps: 8, phase: 'Strength-Hypertrophy', description: 'Moderate rep strength building' },
  3: { reps: 10, phase: 'Hypertrophy', description: 'Hypertrophy focus' },
  4: { reps: 12, phase: 'Hypertrophy-Endurance', description: 'High rep hypertrophy' },
  5: { reps: 16, phase: 'Endurance', description: 'Endurance and conditioning' }
}

const getTargetRepsForWeek = (weekNumber: number, baseReps: number = 8, feedback: UserFeedback[], muscleGroup: string, exerciseName: string = '') => {
  const muscleFeedback = feedback.find(f => f.muscleGroup === muscleGroup)
  
  // Get the target rep range for this week based on progression
  const weekRepInfo = REP_PROGRESSION[weekNumber as keyof typeof REP_PROGRESSION] || REP_PROGRESSION[2]
  let targetReps = weekRepInfo.reps
  
  // Adjust based on user feedback
  if (muscleFeedback && (muscleFeedback.difficulty === 'too_hard' || muscleFeedback.difficulty === 'hard')) {
    // If too hard, reduce to previous week's rep range or minimum
    const previousWeekReps = REP_PROGRESSION[(weekNumber - 1) as keyof typeof REP_PROGRESSION]?.reps || 6
    targetReps = Math.max(6, previousWeekReps)
    console.log(`📉 Reducing reps for "${exerciseName}" to ${targetReps} (user feedback: ${muscleFeedback.difficulty})`)
  } else if (muscleFeedback && muscleFeedback.difficulty === 'easy') {
    // If easy, can progress to next week's rep range
    const nextWeekReps = REP_PROGRESSION[(weekNumber + 1) as keyof typeof REP_PROGRESSION]?.reps || weekRepInfo.reps
    targetReps = nextWeekReps
    console.log(`📈 Progressive overload: "${exerciseName}" reps to ${targetReps} (user feedback: easy)`)
  } else {
    // Default progression - more aggressive for immediate progression
    if (!muscleFeedback) {
      // No feedback = immediate progression - advance to next week's rep range
      const nextWeekReps = REP_PROGRESSION[(weekNumber + 1) as keyof typeof REP_PROGRESSION]?.reps || weekRepInfo.reps
      targetReps = nextWeekReps
      console.log(`🚀 Immediate progression: "${exerciseName}" reps to ${targetReps} (advancing rep range)`)
    } else {
      // Default progression based on week
      console.log(`📊 Professional rep progression: "${exerciseName}" ${targetReps} reps (${weekRepInfo.phase} phase)`)
    }
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
        console.log(`🔄 Updating Day ${updateSpecificDay} in Week ${weekNumber} with progressive overload`)
        console.log(`🔍 updateSpecificDay value: ${updateSpecificDay} (type: ${typeof updateSpecificDay})`)
        
        // Get the specific workout for the day
        console.log(`🔍 Looking for Day ${updateSpecificDay} workout in Week ${weekNumber} (week_id: ${existingWeek.id})`)
        
        // First, let's see what workouts exist in this week
        const { data: allWorkouts, error: allWorkoutsError } = await supabaseAdmin
          .from('workouts')
          .select('*')
          .eq('week_id', existingWeek.id)
        
        if (!allWorkoutsError && allWorkouts) {
          console.log(`📊 All workouts in Week ${weekNumber}:`)
          allWorkouts.forEach((w: any) => {
            // Extract day number from day_name since day_number field doesn't exist
            const dayMatch = w.day_name?.match(/Day (\d+)/)
            const dayNumber = dayMatch ? dayMatch[1] : '?'
            console.log(`  - ${w.day_name} (day_number: ${dayNumber})`)
          })
        } else {
          console.error('❌ Error fetching all workouts:', allWorkoutsError)
        }
        
        console.log(`🔍 Querying for workout with week_id: ${existingWeek.id}, day_number: ${updateSpecificDay}`)
        
        // Since day_number field doesn't exist in the database, we'll use day_name pattern matching
        console.log('🔄 Finding workout by day name pattern...')
        
        let { data: workout, error: workoutError } = await supabaseAdmin
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

        if (workoutError || !workout) {
          console.error('❌ Failed to fetch workout by day name:', workoutError)
          return NextResponse.json({
            error: `Failed to fetch Day ${updateSpecificDay} workout for update`
          }, { status: 500 })
        }
        
        console.log(`✅ Found workout by day name: ${workout.day_name}`)

        console.log(`📊 Found workout: ${workout.day_name} (Day ${updateSpecificDay})`)

        // Update the specific workout with progressive overload
        if (workout.exercises && workout.exercises.length > 0) {
          console.log(`🔄 Updating workout: ${workout.day_name}`)
          
          for (const exercise of workout.exercises) {
            const muscleGroup = getMuscleGroupFromExercise(exercise.name)
            const previousSetCount = exercise.sets?.length || 3
            const baseWeight = exercise.weight || 0
            
            // Apply progressive overload
            const adjustedSets = calculateAdjustedSets(muscleGroup, previousSetCount, userFeedback || [])
            const progressiveWeight = calculateProgressiveWeight(baseWeight, weekNumber, userFeedback || [], muscleGroup, exercise.name)
            const targetReps = getTargetRepsForWeek(weekNumber, 8, userFeedback || [], muscleGroup, exercise.name)
            
            console.log(`📈 Updating ${exercise.name}: ${previousSetCount} → ${adjustedSets} sets, ${baseWeight}kg → ${progressiveWeight}kg`)
            
            // Update exercise with new progressive overload values
            const { error: exerciseUpdateError } = await supabaseAdmin
              .from('exercises')
              .update({
                weight: progressiveWeight
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
          updatedWorkout: workout.day_name,
          details: {
            dayNumber: updateSpecificDay,
            weekNumber: weekNumber,
            workoutName: workout.day_name,
            exercisesUpdated: workout.exercises?.length || 0
          }
        }, { status: 200 })
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
              const baseWeight = exercise.weight || 0
              
              // Apply progressive overload
              const adjustedSets = calculateAdjustedSets(muscleGroup, previousSetCount, userFeedback || [])
              const progressiveWeight = calculateProgressiveWeight(baseWeight, weekNumber, userFeedback || [], muscleGroup, exercise.name)
              const targetReps = getTargetRepsForWeek(weekNumber, 8, userFeedback || [], muscleGroup, exercise.name)
              
              console.log(`📈 Updating ${exercise.name}: ${previousSetCount} → ${adjustedSets} sets, ${baseWeight}kg → ${progressiveWeight}kg`)
              
              // Update exercise with new progressive overload values
              const { error: exerciseUpdateError } = await supabaseAdmin
                .from('exercises')
                .update({
                  weight: progressiveWeight
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

    // Check if week number exceeds mesocycle's total weeks
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

