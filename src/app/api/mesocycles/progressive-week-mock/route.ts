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

// Weight progression - only used when user explicitly says exercise was "easy"
const USER_REQUESTED_INCREASE = 0.025 // 2.5% increase when user says it was too easy

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
        const USER_REQUESTED_INCREASE = 0.025 // 2.5% increase
        const newWeight = workingWeight * (1 + USER_REQUESTED_INCREASE)
        console.log(`📈 Increasing weight for "${exerciseName}" from ${workingWeight}kg to ${Math.round(newWeight * 4) / 4}kg (user feedback: too easy)`)
        return Math.round(newWeight * 4) / 4 // Round to nearest 0.25kg
      }

      // For all cases including 0 weight, keep exactly what it was
      return workingWeight
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

    const mockWorkouts: any[] = []
    let totalSetsCreated = 0

    // Create mock workouts
    for (let day = 1; day <= defaultTrainingDays; day++) {
      const workoutTypeIndex = (day - 1) % workoutTypes.length
      const workoutType = workoutTypes[workoutTypeIndex]
      
      const mockWorkout: any = {
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
        
        const adjustedSets = calculateAdjustedSets(muscleGroup, 3, userFeedback || []) // Use default 3 sets for new workouts
        const setsToCreate = Math.max(2, adjustedSets || 3)
        totalSetsCreated += setsToCreate
        
        console.log(`🔢 Calculated Sets: ${adjustedSets} → Final Sets: ${setsToCreate}`)

        // Progressive weight calculation - start with 0 (no assumptions)
        const baseWeight = 0 // User sets their own starting weights
        const progressiveWeight = calculateProgressiveWeight(baseWeight, weekNumber, userFeedback || [], muscleGroup, exerciseName)
        
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
      const workoutSets = workout.exercises.reduce((sum: number, ex: any) => sum + ex.sets.length, 0)
      console.log(`${workout.day_name}: ${workout.exercises.length} exercises, ${workoutSets} sets`)
    })

    // Log detailed autoregulation
    if (userFeedback && userFeedback.length > 0) {
      console.log('📊 Autoregulation applied:')
      userFeedback.forEach((feedback: UserFeedback) => {
        const landmarks = VOLUME_LANDMARKS[feedback.muscleGroup as keyof typeof VOLUME_LANDMARKS]
        const adjustedSets = calculateAdjustedSets(feedback.muscleGroup, 3, userFeedback) // Use 3 as default for logging
        console.log(`  - ${feedback.muscleGroup}: ${feedback.difficulty} difficulty, ${feedback.soreness} soreness, ${feedback.performance} performance`)
        console.log(`    Volume adjusted to ${adjustedSets} sets (MEV: ${landmarks?.MEV}, MRV: ${landmarks?.MRV})`)
      })
    }

    return NextResponse.json({ 
      success: true, 
      week: mockWeek,
      workouts: mockWorkouts,
      method: 'rp-progressive-overload-simulation',
      message: `User-driven progressive week created! Week ${weekNumber} - Changes only when you request them`,
      progressionInfo: {
        weekNumber: weekNumber,
        rir: currentRirInfo.rir,
        rirDescription: currentRirInfo.description,
        weightProgression: 'Only increases when user says exercise was "easy"',
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

