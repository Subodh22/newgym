import { NextRequest, NextResponse } from 'next/server'

// Mock API that simulates progressive week creation without database writes
// This allows you to test the UI while the database issue is being resolved

interface UserFeedback {
  muscleGroup: string
  difficulty: 'easy' | 'moderate' | 'hard' | 'too_hard'
  soreness: 'none' | 'light' | 'moderate' | 'severe'
  performance: 'improved' | 'maintained' | 'decreased'
  pumpQuality?: 1 | 2 | 3 | 4 | 5
  recovery?: 'poor' | 'fair' | 'good' | 'excellent'
}

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
    console.log('\n🎭 MOCK API - PROCESSING PROGRESSIVE OVERLOAD')
    console.log('=============================================')
    console.log('📥 Raw Request Data:', JSON.stringify(body, null, 2))
    
    console.log('\n📊 VOLUME LANDMARKS REFERENCE:')
    console.log('================================')
    Object.entries(VOLUME_LANDMARKS).forEach(([muscle, landmarks]) => {
      console.log(`${muscle}: MEV=${landmarks.MEV}, MAV=${landmarks.MAV}, MRV=${landmarks.MRV}`)
    })
    
    const { mesocycleId, weekNumber, userFeedback, trainingDays, selectedSplit } = body
    
    if (!mesocycleId || !weekNumber) {
      return NextResponse.json(
        { error: 'Missing required parameters: mesocycleId and weekNumber' },
        { status: 400 }
      )
    }

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000))

    const defaultTrainingDays = trainingDays || 6
    const defaultSelectedSplit = selectedSplit || { 'Push': [], 'Pull': [], 'Legs': [] }
    const workoutTypes = Object.keys(defaultSelectedSplit)

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

    // Exercise-specific baseline weights (in kg) for when no previous data exists
    const BASELINE_WEIGHTS = {
      // Chest exercises
      'Dumbbell Bench Press': 25,
      'Barbell Bench Press': 60,
      'Incline Dumbbell Press': 22.5,
      'Push-ups': 0, // Bodyweight
      'Chest Flyes': 15,
      'Cable Flyes': 20,
      
      // Shoulder exercises
      'Shoulder Press': 20,
      'Lateral Raises': 10,
      'Front Raises': 12.5,
      'Rear Delt Flyes': 10,
      
      // Triceps exercises
      'Tricep Dips': 0, // Bodyweight
      'Overhead Tricep Extension': 25,
      'Tricep Pushdowns': 30,
      
      // Back exercises
      'Pull-ups': 0, // Bodyweight
      'Lat Pulldowns': 40,
      'Seated Rows': 35,
      'Barbell Rows': 45,
      'T-Bar Rows': 40,
      
      // Biceps exercises
      'Bicep Curls': 15,
      'Hammer Curls': 17.5,
      'Preacher Curls': 12.5,
      
      // Leg exercises
      'Squats': 60,
      'Deadlifts': 80,
      'Leg Press': 100,
      'Leg Curls': 30,
      'Leg Extensions': 35,
      'Calf Raises': 40,
      
      // Default fallback
      'default': 20
    }

    const calculateProgressiveWeight = (baseWeight: number, weekNumber: number, feedback: UserFeedback[], muscleGroup: string, exerciseName: string = '') => {
      let workingWeight = baseWeight

      // If baseWeight is 0 or very low, use baseline weight for the exercise
      if (baseWeight === 0 || baseWeight < 5) {
        workingWeight = BASELINE_WEIGHTS[exerciseName] || BASELINE_WEIGHTS['default']
        console.log(`🏋️ Using baseline weight for "${exerciseName}": ${workingWeight}kg (previous was ${baseWeight}kg)`)
      }

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
      const newWeight = workingWeight * (1 + progressionRate)
      return Math.round(newWeight * 4) / 4 // Round to nearest 0.25kg
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

    // Create mock week structure
    const mockWeek = {
      id: Math.floor(Math.random() * 1000) + 1000, // Random mock ID
      mesocycle_id: mesocycleId,
      week_number: weekNumber,
      name: `Week ${weekNumber}`,
      created_at: new Date().toISOString()
    }

    const mockWorkouts = []
    let totalSetsCreated = 0

    // Create mock workouts
    for (let day = 1; day <= defaultTrainingDays; day++) {
      const workoutTypeIndex = (day - 1) % workoutTypes.length
      const workoutType = workoutTypes[workoutTypeIndex]
      
      const mockWorkout = {
        id: Math.floor(Math.random() * 1000) + day * 1000,
        week_id: mockWeek.id,
        day_name: `Day ${day} - ${workoutType}`,
        exercises: []
      }

      // Create mock exercises with progressive overload
      const basicExercises = getBasicExercisesForWorkoutType(workoutType)
      let exerciseOrder = 1

      console.log(`\n🏋️ Creating exercises for ${workoutType} workout (Day ${day}):`)
      console.log('================================================')
      
      for (const exerciseName of basicExercises) {
        const muscleGroup = getMuscleGroupFromExercise(exerciseName)
        
        console.log(`\n📋 Exercise: ${exerciseName}`)
        console.log(`🎯 Primary Muscle Group: ${muscleGroup}`)
        
        // Show volume landmarks for this muscle
        const landmarks = VOLUME_LANDMARKS[muscleGroup as keyof typeof VOLUME_LANDMARKS]
        if (landmarks) {
          console.log(`📊 Volume Landmarks - MEV: ${landmarks.MEV}, MAV: ${landmarks.MAV}, MRV: ${landmarks.MRV}`)
        }
        
        const adjustedSets = calculateAdjustedSets(muscleGroup, weekNumber, userFeedback || [])
        const setsToCreate = Math.max(2, adjustedSets || 3)
        totalSetsCreated += setsToCreate
        
        console.log(`🔢 Calculated Sets: ${adjustedSets} → Final Sets: ${setsToCreate}`)

        // Progressive weight calculation (assuming previous week's weight was stored)
        const baseWeight = 0 // Changed to 0 to trigger baseline weight logic
        const progressiveWeight = calculateProgressiveWeight(baseWeight, weekNumber, userFeedback || [], muscleGroup, exercise.name)
        
        const progressionPercentage = baseWeight > 0 ? ((progressiveWeight - baseWeight) / baseWeight * 100).toFixed(1) : 'baseline'
        console.log(`⚖️ Weight Progression: ${baseWeight}kg → ${progressiveWeight}kg (${progressionPercentage}% change)`)
        
        // Get target reps based on RIR progression
        const targetReps = getTargetRepsForWeek(weekNumber)
        
        // Get RIR info for this week
        const rirInfo = RIR_PROGRESSION[weekNumber as keyof typeof RIR_PROGRESSION] || RIR_PROGRESSION[4]
        
        console.log(`🎯 Target Reps: ${targetReps} (based on ${rirInfo.rir} RIR)`)
        console.log(`📝 RIR Description: ${rirInfo.description}`)

        const mockExercise = {
          id: Math.floor(Math.random() * 1000) + exerciseOrder * 10000,
          workout_id: mockWorkout.id,
          name: exerciseName,
          exercise_order: exerciseOrder++,
          muscle_group: muscleGroup,
          sets_count: setsToCreate,
          target_rir: rirInfo.rir,
          rir_description: rirInfo.description,
          progressive_weight: progressiveWeight,
          sets: Array.from({ length: setsToCreate }, (_, i) => ({
            id: Math.floor(Math.random() * 1000) + i * 100000,
            set_number: i + 1,
            weight: progressiveWeight,
            reps: targetReps,
            target_reps: targetReps,
            target_rir: rirInfo.rir,
            is_completed: false,
            notes: `Week ${weekNumber} - ${rirInfo.description}`
          }))
        }

        mockWorkout.exercises.push(mockExercise)
      }

      mockWorkouts.push(mockWorkout)
    }

    // Get current week's RIR info for logging
    const currentRirInfo = RIR_PROGRESSION[weekNumber as keyof typeof RIR_PROGRESSION] || RIR_PROGRESSION[4]
    
    console.log('\n✅ PROGRESSIVE OVERLOAD WEEK CREATION COMPLETE!')
    console.log('===============================================')
    console.log(`🎭 MOCK: Created Week ${weekNumber} with ${mockWorkouts.length} workouts and ${totalSetsCreated} total sets`)
    console.log(`🎯 RIR Progression: ${currentRirInfo.description}`)
    console.log('🔄 Applied RP-style autoregulation based on user feedback')
    
    console.log('\n📈 WEEK SUMMARY:')
    console.log('================')
    console.log(`Week Number: ${weekNumber}`)
    console.log(`RIR Target: ${currentRirInfo.rir}`)
    console.log(`Total Workouts: ${mockWorkouts.length}`)
    console.log(`Total Sets: ${totalSetsCreated}`)
    console.log(`Average Sets per Workout: ${Math.round(totalSetsCreated / mockWorkouts.length)}`)
    
    console.log('\n🎯 PER-WORKOUT BREAKDOWN:')
    console.log('========================')
    mockWorkouts.forEach((workout, index) => {
      const workoutSets = workout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0)
      console.log(`${workout.day_name}: ${workout.exercises.length} exercises, ${workoutSets} sets`)
    })

    // Log detailed autoregulation
    if (userFeedback && userFeedback.length > 0) {
      console.log('📊 Autoregulation applied:')
      userFeedback.forEach(feedback => {
        const landmarks = VOLUME_LANDMARKS[feedback.muscleGroup as keyof typeof VOLUME_LANDMARKS]
        const adjustedSets = calculateAdjustedSets(feedback.muscleGroup, weekNumber, userFeedback)
        console.log(`  - ${feedback.muscleGroup}: ${feedback.difficulty} difficulty, ${feedback.soreness} soreness, ${feedback.performance} performance`)
        console.log(`    Volume adjusted to ${adjustedSets} sets (MEV: ${landmarks?.MEV}, MRV: ${landmarks?.MRV})`)
      })
    }

    return NextResponse.json({ 
      success: true, 
      week: mockWeek,
      workouts: mockWorkouts,
      method: 'rp-progressive-overload-simulation',
      message: `RP-style progressive week created with autoregulation! Week ${weekNumber} - ${currentRirInfo.description}`,
      progressionInfo: {
        weekNumber: weekNumber,
        rir: currentRirInfo.rir,
        rirDescription: currentRirInfo.description,
        weightProgression: '2.5% base increase (adjusted by feedback)',
        autoregulationApplied: userFeedback ? true : false
      },
      stats: {
        workouts_created: mockWorkouts.length,
        total_exercises: mockWorkouts.reduce((sum, w) => sum + w.exercises.length, 0),
        total_sets: totalSetsCreated,
        average_sets_per_exercise: Math.round((totalSetsCreated / mockWorkouts.reduce((sum, w) => sum + w.exercises.length, 0)) * 10) / 10,
        volume_landmarks_used: Object.keys(VOLUME_LANDMARKS).length,
        rir_system: 'Mike Israetel RP methodology'
      }
    })

  } catch (error) {
    console.error('❌ Mock API error:', error)
    return NextResponse.json(
      { error: 'Failed to create mock progressive week', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

