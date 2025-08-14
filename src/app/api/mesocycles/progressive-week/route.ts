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

// Weight progression percentages based on week and feedback
const WEIGHT_PROGRESSION = {
  base: 0.025, // 2.5% base increase per week
  easy: 0.035, // 3.5% increase if too easy
  moderate: 0.025, // 2.5% standard increase
  hard: 0.015, // 1.5% smaller increase if hard
  too_hard: 0.0 // No increase if too hard
}

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

    // Enhanced RP-style autoregulation with comprehensive feedback
    const calculateAdjustedSets = (muscleGroup: string, baseWeek: number, feedback: UserFeedback[]) => {
      const landmarks = VOLUME_LANDMARKS[muscleGroup as keyof typeof VOLUME_LANDMARKS]
      if (!landmarks) return 3

      // Progressive volume increase from MEV towards MRV over 4-5 weeks
      const weeklyProgression = (landmarks.MRV - landmarks.MEV) / 4
      let baseSets = Math.max(landmarks.MEV, Math.round(landmarks.MEV + (weeklyProgression * (baseWeek - 1))))

      const muscleFeedback = feedback.find(f => f.muscleGroup === muscleGroup)
      if (muscleFeedback) {
        // RP-style autoregulation based on comprehensive feedback
        let volumeAdjustment = 0

        // Primary adjustment based on difficulty
        switch (muscleFeedback.difficulty) {
          case 'easy':
            volumeAdjustment += 2 // Add 2 sets if too easy
            break
          case 'hard':
            volumeAdjustment -= 1 // Remove 1 set if hard
            break
          case 'too_hard':
            volumeAdjustment -= 3 // Significant reduction if too hard
            break
        }

        // Secondary adjustments based on soreness
        switch (muscleFeedback.soreness) {
          case 'severe':
            volumeAdjustment -= 1 // Reduce volume for severe soreness
            break
          case 'none':
            volumeAdjustment += 1 // Can handle more volume if no soreness
            break
        }

        // Performance-based adjustments
        switch (muscleFeedback.performance) {
          case 'improved':
            volumeAdjustment += 1 // Reward improvement with more volume
            break
          case 'decreased':
            volumeAdjustment -= 2 // Reduce volume if performance declined
            break
        }

        // Pump quality adjustments (if available)
        if (muscleFeedback.pumpQuality) {
          if (muscleFeedback.pumpQuality <= 2) {
            volumeAdjustment += 1 // Poor pump = need more volume
          } else if (muscleFeedback.pumpQuality >= 4) {
            volumeAdjustment -= 1 // Great pump = volume is sufficient
          }
        }

        // Recovery-based adjustments (if available)
        if (muscleFeedback.recovery) {
          switch (muscleFeedback.recovery) {
            case 'poor':
              volumeAdjustment -= 2
              break
            case 'excellent':
              volumeAdjustment += 1
              break
          }
        }

        baseSets += volumeAdjustment
      }

      // Ensure we stay within physiological limits
      return Math.max(landmarks.MEV, Math.min(landmarks.MRV, baseSets))
    }

    const calculateProgressiveWeight = (baseWeight: number, weekNumber: number, feedback: UserFeedback[], muscleGroup: string) => {
      if (baseWeight === 0) return 0

      const muscleFeedback = feedback.find(f => f.muscleGroup === muscleGroup)
      let progressionRate = WEIGHT_PROGRESSION.moderate

      if (muscleFeedback) {
        switch (muscleFeedback.difficulty) {
          case 'easy':
            progressionRate = WEIGHT_PROGRESSION.easy
            break
          case 'hard':
            progressionRate = WEIGHT_PROGRESSION.hard
            break
          case 'too_hard':
            progressionRate = WEIGHT_PROGRESSION.too_hard
            break
          default:
            progressionRate = WEIGHT_PROGRESSION.moderate
        }

        // Additional adjustments based on performance
        if (muscleFeedback.performance === 'improved') {
          progressionRate *= 1.2 // 20% bonus for improved performance
        } else if (muscleFeedback.performance === 'decreased') {
          progressionRate *= 0.5 // 50% reduction for decreased performance
        }
      }

      // Apply weekly progression
      const newWeight = baseWeight * (1 + progressionRate)
      return Math.round(newWeight * 4) / 4 // Round to nearest 0.25
    }

    const getTargetRepsForWeek = (weekNumber: number, baseReps: number = 8) => {
      const rirInfo = RIR_PROGRESSION[weekNumber as keyof typeof RIR_PROGRESSION] || RIR_PROGRESSION[4]
      
      // Adjust rep ranges based on RIR
      switch (rirInfo.rir) {
        case 3:
          return Math.max(6, baseReps - 1) // Slightly lower reps, more weight
        case 2:
          return baseReps
        case 1:
          return baseReps + 1 // Push for extra rep
        case 0:
          return baseReps + 2 // Push to failure, aim for more reps
        default:
          return baseReps
      }
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

          // Create basic sets
          for (let setNum = 1; setNum <= 3; setNum++) {
            const { error: setError } = await supabaseAdmin
              .from('sets')
              .insert({
                exercise_id: exercise.id,
                set_number: setNum,
                weight: 100,
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
            weekNumber, 
            userFeedback || []
          )
          
          // Use previous week's set count as baseline, then apply autoregulation
          const prevSetCount = prevExercise.sets?.length || 3
          const setsToCreate = Math.max(2, adjustedSets || prevSetCount)
          
          // Get the last completed set from previous week for weight progression
          const lastCompletedSet = prevExercise.sets
            ?.filter(set => set.is_completed && set.weight > 0)
            ?.sort((a, b) => b.set_number - a.set_number)[0]
          
          const baseWeight = lastCompletedSet?.weight || 100
          const progressiveWeight = calculateProgressiveWeight(baseWeight, weekNumber, userFeedback || [], muscleGroup)
          
          // Get target reps based on RIR progression  
          const targetReps = getTargetRepsForWeek(weekNumber, lastCompletedSet?.reps || 8)
          
          // Get RIR info for this week
          const rirInfo = RIR_PROGRESSION[weekNumber as keyof typeof RIR_PROGRESSION] || RIR_PROGRESSION[4]
          
          console.log(`📋 ${prevExercise.name}: ${prevSetCount} → ${setsToCreate} sets, ${baseWeight}lbs → ${progressiveWeight}lbs`)
          
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
    
    console.log(`✅ Week ${weekNumber} created with RP autoregulation in ${totalTime}ms`)
    console.log(`🎯 RIR Progression: ${currentRirInfo.description}`)
    console.log('🔄 Applied RP-style autoregulation based on user feedback')

    // Log detailed autoregulation
    if (userFeedback && userFeedback.length > 0) {
      console.log('📊 Autoregulation applied:')
      userFeedback.forEach((feedback: UserFeedback) => {
        const landmarks = VOLUME_LANDMARKS[feedback.muscleGroup as keyof typeof VOLUME_LANDMARKS]
        const adjustedSets = calculateAdjustedSets(feedback.muscleGroup, weekNumber, userFeedback)
        console.log(`  - ${feedback.muscleGroup}: ${feedback.difficulty} difficulty, ${feedback.soreness} soreness, ${feedback.performance} performance`)
        console.log(`    Volume adjusted to ${adjustedSets} sets (MEV: ${landmarks?.MEV}, MRV: ${landmarks?.MRV})`)
      })
    }

    return NextResponse.json({ 
      success: true, 
      week,
      method: 'rp-progressive-overload-database',
      message: `RP-style progressive week created with autoregulation! Week ${weekNumber} - ${currentRirInfo.description}`,
      progressionInfo: {
        weekNumber: weekNumber,
        rir: currentRirInfo.rir,
        rirDescription: currentRirInfo.description,
        weightProgression: '2.5% base increase (adjusted by feedback)',
        autoregulationApplied: userFeedback ? true : false
      },
      performance: {
        creationTime: totalTime,
        workoutsCreated: defaultTrainingDays,
        exercisesPerWorkout: 4, // Basic exercises per workout type
        autoregulationApplied: userFeedback ? true : false,
        rir_system: 'Mike Israetel RP methodology'
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

