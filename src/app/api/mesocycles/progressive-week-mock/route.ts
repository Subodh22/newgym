import { NextRequest, NextResponse } from 'next/server'

// Mock API that simulates progressive week creation without database writes
// This allows you to test the UI while the database issue is being resolved

interface UserFeedback {
  muscleGroup: string
  difficulty: 'easy' | 'moderate' | 'hard' | 'too_hard'
  soreness: 'none' | 'light' | 'moderate' | 'severe'
  performance: 'improved' | 'maintained' | 'decreased'
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
    console.log('🎭 MOCK API - Simulating progressive week creation:', JSON.stringify(body, null, 2))
    
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

      const weeklyProgression = (landmarks.MRV - landmarks.MEV) / 4
      let baseSets = Math.max(landmarks.MEV, Math.round(landmarks.MEV + (weeklyProgression * (baseWeek - 1))))

      const muscleFeedback = feedback.find(f => f.muscleGroup === muscleGroup)
      if (muscleFeedback) {
        switch (muscleFeedback.difficulty) {
          case 'easy':
            baseSets = Math.min(landmarks.MRV, baseSets + 2)
            break
          case 'hard':
            baseSets = Math.max(landmarks.MEV, baseSets - 1)
            break
          case 'too_hard':
            baseSets = Math.max(landmarks.MEV, baseSets - 2)
            break
        }

        if (muscleFeedback.soreness === 'severe') {
          baseSets = Math.max(landmarks.MEV, baseSets - 1)
        }
      }

      return baseSets
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

      // Create mock exercises
      const basicExercises = getBasicExercisesForWorkoutType(workoutType)
      let exerciseOrder = 1

      for (const exerciseName of basicExercises) {
        const muscleGroup = getMuscleGroupFromExercise(exerciseName)
        const adjustedSets = calculateAdjustedSets(muscleGroup, weekNumber, userFeedback || [])
        const setsToCreate = Math.max(2, adjustedSets || 3)
        totalSetsCreated += setsToCreate

        const mockExercise = {
          id: Math.floor(Math.random() * 1000) + exerciseOrder * 10000,
          workout_id: mockWorkout.id,
          name: exerciseName,
          exercise_order: exerciseOrder++,
          muscle_group: muscleGroup,
          sets_count: setsToCreate,
          sets: Array.from({ length: setsToCreate }, (_, i) => ({
            id: Math.floor(Math.random() * 1000) + i * 100000,
            set_number: i + 1,
            weight: 0,
            reps: 8,
            is_completed: false
          }))
        }

        mockWorkout.exercises.push(mockExercise)
      }

      mockWorkouts.push(mockWorkout)
    }

    console.log(`🎭 MOCK: Created Week ${weekNumber} with ${mockWorkouts.length} workouts and ${totalSetsCreated} total sets`)
    console.log('🎯 Applied autoregulation based on user feedback')

    // Log autoregulation details
    if (userFeedback && userFeedback.length > 0) {
      console.log('📊 Autoregulation applied:')
      userFeedback.forEach(feedback => {
        console.log(`  - ${feedback.muscleGroup}: ${feedback.difficulty} difficulty, ${feedback.soreness} soreness`)
      })
    }

    return NextResponse.json({ 
      success: true, 
      week: mockWeek,
      workouts: mockWorkouts,
      method: 'mock-simulation',
      message: `Mock progressive week created! This simulates the functionality while database issues are resolved.`,
      stats: {
        workouts_created: mockWorkouts.length,
        total_exercises: mockWorkouts.reduce((sum, w) => sum + w.exercises.length, 0),
        total_sets: totalSetsCreated,
        autoregulation_applied: userFeedback ? true : false
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

