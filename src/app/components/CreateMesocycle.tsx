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
  'Calves': { MEV: 8, MAV: 16, MRV: 25 },
  'Cardio': { MEV: 2, MAV: 4, MRV: 6 } // Cardio sessions per week
}

// Exercise database organized by muscle group
const EXERCISE_DATABASE = {
  'Chest': [
    'Barbell Bench Press', 'Incline Barbell Press', 'Decline Barbell Bench',
    'Dumbbell Bench Press', 'Incline Dumbbell Press', 'Decline Dumbbell Bench',
    'Weighted Dips', 'Dips', 'Push-ups', 'Close-Grip Bench Press',
    'Cable Flyes', 'Low-to-High Cable Fly', 'High-to-Low Cable Fly', 'Pec Deck',
    'Machine Chest Press', 'Smith Machine Bench Press', 'Incline Barbell Bench Press',
    'Pec Deck Flyes'
  ],
  'Back': [
    'Deadlift', 'Rack Pulls', 'Pull-ups', 'Chin-ups', 'Lat Pulldown',
    'One-Arm Dumbbell Row', 'Barbell Rows', 'Pendlay Row', 'T-Bar Rows',
    'Chest-Supported Row', 'Machine Row', 'Cable Rows', 'Straight-Arm Pulldown',
    'Face Pulls', 'Shrugs', 'Weighted Pull-up', 'Wide-Grip Lat Pulldown',
    'Seated Face Pull', 'Cable Pull-Through', 'Bent-Over Barbell Rows',
    'Single-Arm Pulldown', 'Cable Lat Pulldown', 'Seated Cable Rows'
  ],
  'Shoulders': [
    'Overhead Press', 'Seated Barbell Press', 'Dumbbell Shoulder Press',
    'Arnold Press', 'Lateral Raises', 'Cable Lateral Raises', 'Machine Lateral Raise',
    'Rear Delt Flyes', 'Reverse Pec Deck', 'Face Pulls', 'Upright Rows'
  ],
  'Biceps': [
    'Barbell Curls', 'EZ-Bar Curls', 'Dumbbell Curls', 'Alternating DB Curls',
    'Incline Dumbbell Curls', 'Hammer Curls', 'Cable Curls', 'Rope Cable Curls',
    'Preacher Curls', 'Spider Curls', 'Concentration Curls', 'Dumbbell Hammer Curls'
  ],
  'Triceps': [
    'Close Grip Bench Press', 'Tricep Dips', 'Weighted Dips',
    'Overhead Tricep Extension', 'Dumbbell Overhead Extension',
    'Skull Crushers (EZ-Bar)', 'Cable Tricep Pushdown', 'Rope Pushdown',
    'Diamond Push-ups', 'Kickbacks', 'Triceps Pushdowns', 'Rope Pushdowns'
  ],
  'Quadriceps': [
    'Back Squat', 'Front Squat', 'High-Bar Squat', 'Hack Squat', 'Leg Press',
    'Bulgarian Split Squats', 'Leg Extensions', 'Lunges', 'Walking Lunges',
    'Step-ups', 'Sissy Squats', 'Pin Squat', 'Unilateral Leg Press',
    'Single-Leg Leg Extensions', 'Heel-Elevated Back Squats'
  ],
  'Hamstrings': [
    'Romanian Deadlift', 'Stiff-Leg Deadlift', 'Good Mornings', 'Single Leg RDL',
    'Lying Leg Curls', 'Seated Leg Curls', 'Nordic Curl', 'Glute Ham Raises',
    'Glute-Ham Raise', 'Nordic Ham Curl', 'Barbell RDL', 'Sliding Leg Curl',
    'Unilateral Leg Curl', 'Seated Hamstring Curls', 'Single-Leg Hamstring Curls',
    'Lying Hamstring Curls', 'Single-Leg Lying Hamstring Curls'
  ],
  'Glutes': [
    'Hip Thrusts', 'Barbell Hip Thrusts', 'Hip Thrust Machine',
    'Bulgarian Split Squats', 'Romanian Deadlift', 'Glute Bridges',
    'Cable Kickbacks', 'Step-ups', 'Sumo Squat', 'Cossack Squats'
  ],
  'Calves': [
    'Standing Calf Raises', 'Seated Calf Raises', 'Smith Machine Calf Raises',
    'Leg Press Calf Press', 'Single-Leg Calf Raises', 'Donkey Calf Raises',
    'Walking Calf Raises', 'Standing Calf Raise', 'Unilateral Standing Calf Raise'
  ],
  'Abs': [
    'Crunches', 'Planks', 'Russian Twists', 'Leg Raises', 'Bicycle Crunches',
    'Mountain Climbers', 'L-Sit Hold', 'Weighted Crunch', 'Cable Crunch',
    'Long-Lever Plank', 'Wall Slide', 'Hip Abduction'
  ],
  'Cardio': [
    'Treadmill Running', 'Stairmaster', 'Rowing Machine', 'Elliptical',
    'Stationary Bike', 'HIIT Training', 'Sprint Intervals', 'Jogging',
    'Cycling', 'Swimming', 'Jump Rope', 'Burpees', 'Mountain Climbers',
    'High Knees', 'Butt Kicks', 'Jumping Jacks', 'Box Jumps'
  ]
}

// Mike Israetel's Top 10 Exercises (Renaissance Periodization)
const MIKE_ISRAETEL_TOP_10 = {
  'High Bar Squats': { muscleGroup: 'Quadriceps', reps: '8-15', description: 'Less systemic fatigue than low bar, excellent quad development' },
  'Standing Overhead Barbell Press': { muscleGroup: 'Shoulders', reps: '6-10', description: 'Full shoulder development, core stability challenge' },
  'Barbell Skull Crushers': { muscleGroup: 'Triceps', reps: '10-20', description: 'Maximum tension at stretched position, superior to kickbacks' },
  'Pull-ups (Overhand)': { muscleGroup: 'Back', reps: '6-20', description: 'Bodyweight progression, lat-focused development' },
  'Barbell Bent-Over Rows (from Deficit)': { muscleGroup: 'Back', reps: '6-20', description: 'Stand on platform for deeper stretch, touch stomach' },
  'Stiff-Legged Deadlift': { muscleGroup: 'Hamstrings', reps: '70-85% 1RM', description: 'Dynamic movement for hamstrings, isometric for back' },
  'Incline Cambered Bar Bench Press': { muscleGroup: 'Chest', reps: '8-12', description: 'Cambered bar allows deeper stretch than chest level' },
  'Dips': { muscleGroup: 'Chest', reps: '8-12', description: 'Wide grip, lean forward, friend can hold feet for deeper stretch' },
  'Super ROM Lateral Raises': { muscleGroup: 'Shoulders', reps: '10-12', description: 'Extended range of motion, light weight, high reps' },
  'Seated Incline Dumbbell Curls': { muscleGroup: 'Biceps', reps: '8-15', description: 'Deep stretch position, tension throughout lengthened range' }
}

// Pre-made templates based on popular influencers
const PREMADE_TEMPLATES = {
  'Mike Israetel - RP Hypertrophy': {
    description: 'Dr. Mike Israetel\'s evidence-based 4-week mesocycle for optimal muscle growth',
    weeks: 4,
    trainingDays: 6,
    split: {
      'Push (Chest, Shoulders, Triceps)': {
        exercises: [
          'Incline Cambered Bar Bench Press',
          'Standing Overhead Barbell Press', 
          'Dips',
          'Super ROM Lateral Raises',
          'Barbell Skull Crushers',
          'Cable Tricep Pushdown'
        ],
        muscleGroups: ['Chest', 'Shoulders', 'Triceps']
      },
      'Pull (Back, Biceps)': {
        exercises: [
          'Pull-ups (Overhand)',
          'Barbell Bent-Over Rows (from Deficit)',
          'Lat Pulldown',
          'Face Pulls',
          'Seated Incline Dumbbell Curls',
          'EZ-Bar Curls'
        ],
        muscleGroups: ['Back', 'Biceps']
      },
      'Legs (Quads, Hamstrings, Glutes)': {
        exercises: [
          'High Bar Squats',
          'Stiff-Legged Deadlift',
          'Leg Press',
          'Romanian Deadlift',
          'Lying Leg Curls',
          'Standing Calf Raises'
        ],
        muscleGroups: ['Quadriceps', 'Hamstrings', 'Glutes', 'Calves']
      }
    },
    volumeLandmarks: {
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
  },
  'Jeff Nippard - Strength Program': {
    description: 'Jeff Nippard\'s evidence-based strength program with compound movements and progressive overload',
    weeks: 12,
    trainingDays: 4,
    split: {
      'Warmup': {
        exercises: [
          'Back Squat',
          'Barbell Bench Press',
          'Deadlift',
          'Hack Squat',
          'Pin Squat',
          'Barbell RDL'
        ],
        muscleGroups: ['Quadriceps', 'Chest', 'Hamstrings', 'Glutes']
      },
      'Main Compound': {
        exercises: [
          'Back Squat',
          'Barbell Bench Press',
          'Deadlift',
          'Front Squat',
          'Weighted Pull-up',
          'Barbell RDL'
        ],
        muscleGroups: ['Quadriceps', 'Chest', 'Back', 'Hamstrings', 'Glutes']
      },
      'Accessory': {
        exercises: [
          'Glute-Ham Raise',
          'Nordic Ham Curl',
          'Seated Face Pull',
          'Wide-Grip Lat Pulldown',
          'Leg Extension',
          'Leg Curl',
          'Standing Calf Raise',
          'Unilateral Standing Calf Raise'
        ],
        muscleGroups: ['Hamstrings', 'Back', 'Shoulders', 'Quadriceps', 'Calves']
      },
      'Core & Stability': {
        exercises: [
          'L-Sit Hold',
          'Weighted Crunch',
          'Cable Crunch',
          'Long-Lever Plank',
          'Wall Slide',
          'Hip Abduction'
        ],
        muscleGroups: ['Abs', 'Core', 'Glutes']
      }
    },
    volumeLandmarks: {
      'Quadriceps': { MEV: 6, MAV: 12, MRV: 18 },
      'Chest': { MEV: 6, MAV: 12, MRV: 18 },
      'Back': { MEV: 8, MAV: 16, MRV: 24 },
      'Hamstrings': { MEV: 4, MAV: 10, MRV: 16 },
      'Glutes': { MEV: 4, MAV: 10, MRV: 16 },
      'Calves': { MEV: 6, MAV: 12, MRV: 18 },
      'Abs': { MEV: 4, MAV: 10, MRV: 16 }
    }
  },
  'Athlean-X - Total Body': {
    description: 'Jeff Cavaliere\'s functional strength and muscle building program',
    weeks: 4,
    trainingDays: 4,
    split: {
      'Upper Body': {
        exercises: [
          'Barbell Bench Press',
          'Pull-ups',
          'Overhead Press',
          'Barbell Rows',
          'Lateral Raises',
          'Barbell Curls',
          'Skull Crushers (EZ-Bar)'
        ],
        muscleGroups: ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps']
      },
      'Lower Body': {
        exercises: [
          'Back Squat',
          'Romanian Deadlift',
          'Leg Press',
          'Lying Leg Curls',
          'Hip Thrusts',
          'Standing Calf Raises'
        ],
        muscleGroups: ['Quadriceps', 'Hamstrings', 'Glutes', 'Calves']
      }
    }
  },
  'John Meadows - Mountain Dog': {
    description: 'John Meadows\' bodybuilding-focused program with unique exercise variations',
    weeks: 4,
    trainingDays: 5,
    split: {
      'Chest & Triceps': {
        exercises: [
          'Incline Dumbbell Press',
          'Dips',
          'Cable Flyes',
          'Close-Grip Bench Press',
          'Overhead Tricep Extension',
          'Cable Tricep Pushdown'
        ],
        muscleGroups: ['Chest', 'Triceps']
      },
      'Back & Biceps': {
        exercises: [
          'Pull-ups',
          'Barbell Rows',
          'Lat Pulldown',
          'Face Pulls',
          'EZ-Bar Curls',
          'Hammer Curls'
        ],
        muscleGroups: ['Back', 'Biceps']
      },
      'Shoulders': {
        exercises: [
          'Overhead Press',
          'Lateral Raises',
          'Rear Delt Flyes',
          'Arnold Press',
          'Upright Rows'
        ],
        muscleGroups: ['Shoulders']
      },
      'Legs': {
        exercises: [
          'Back Squat',
          'Romanian Deadlift',
          'Leg Press',
          'Lying Leg Curls',
          'Hip Thrusts',
          'Standing Calf Raises'
        ],
        muscleGroups: ['Quadriceps', 'Hamstrings', 'Glutes', 'Calves']
      }
    }
  },
  'Sam Sulek - High Volume Bodybuilding': {
    description: 'Sam Sulek\'s intense 7-day high-volume bodybuilding program with failure-based training and minimal rest',
    weeks: 4,
    trainingDays: 7,
    split: {
      'Chest & Shoulders': {
        exercises: [
          'Incline Barbell Bench Press',
          'Machine Chest Press',
          'Pec Deck Flyes',
          'Cable Flyes',
          'Rear Delt Flyes',
          'Lateral Raises',
          'Overhead Press'
        ],
        muscleGroups: ['Chest', 'Shoulders']
      },
      'Back': {
        exercises: [
          'Bent-Over Barbell Rows',
          'Lat Pulldown',
          'Single-Arm Pulldown',
          'Cable Lat Pulldown',
          'Seated Cable Rows'
        ],
        muscleGroups: ['Back']
      },
      'Legs': {
        exercises: [
          'Seated Hamstring Curls',
          'Single-Leg Hamstring Curls',
          'Lying Hamstring Curls',
          'Single-Leg Lying Hamstring Curls',
          'Heel-Elevated Back Squats',
          'Single-Leg Leg Extensions',
          'Sissy Squats',
          'Standing Calf Raises',
          'Seated Calf Raises'
        ],
        muscleGroups: ['Quadriceps', 'Hamstrings', 'Glutes', 'Calves']
      },
      'Arms': {
        exercises: [
          'Triceps Pushdowns',
          'Dips',
          'Rope Pushdowns',
          'Dumbbell Hammer Curls',
          'Preacher Curls',
          'Cable Curls',
          'Concentration Curls'
        ],
        muscleGroups: ['Biceps', 'Triceps']
      }
    },
    volumeLandmarks: {
      'Chest': { MEV: 12, MAV: 20, MRV: 28 },
      'Shoulders': { MEV: 10, MAV: 18, MRV: 26 },
      'Back': { MEV: 12, MAV: 20, MRV: 28 },
      'Quadriceps': { MEV: 10, MAV: 18, MRV: 26 },
      'Hamstrings': { MEV: 8, MAV: 16, MRV: 24 },
      'Biceps': { MEV: 8, MAV: 16, MRV: 24 },
      'Triceps': { MEV: 8, MAV: 16, MRV: 24 },
      'Calves': { MEV: 12, MAV: 20, MRV: 28 }
    }
  }
}

// Curated recommendations (best starting options) per muscle group
const RECOMMENDED_EXERCISES: Record<string, string[]> = {
  Chest: ['Barbell Bench Press', 'Incline Dumbbell Press'],
  Back: ['Pull-ups', 'Barbell Rows'],
  Shoulders: ['Overhead Press', 'Lateral Raises'],
  Biceps: ['EZ-Bar Curls'],
  Triceps: ['Skull Crushers (EZ-Bar)', 'Cable Tricep Pushdown'],
  Quadriceps: ['Back Squat', 'Leg Press'],
  Hamstrings: ['Romanian Deadlift', 'Lying Leg Curls'],
  Glutes: ['Hip Thrusts', 'Romanian Deadlift'],
  Calves: ['Standing Calf Raises'],
  Cardio: ['Treadmill Running', 'Stairmaster', 'Rowing Machine']
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
  },
  'Push/Pull/Legs/Cardio': {
    'Push (Chest, Shoulders, Triceps)': ['Chest', 'Shoulders', 'Triceps'],
    'Pull (Back, Biceps)': ['Back', 'Biceps'],
    'Legs (Quads, Hamstrings, Glutes, Calves)': ['Quadriceps', 'Hamstrings', 'Glutes', 'Calves'],
    'Cardio': ['Cardio']
  },
  'Upper/Lower/Cardio': {
    'Upper Body': ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps'],
    'Lower Body': ['Quadriceps', 'Hamstrings', 'Glutes', 'Calves'],
    'Cardio': ['Cardio']
  }
}

export function CreateMesocycle({ onBack, onSuccess }: CreateMesocycleProps) {
  const { user } = useSupabaseAuth()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('Preparing your program...')
  
  // Mesocycle basic info
  const [mesocycleName, setMesocycleName] = useState('')
  const [weeks, setWeeks] = useState(4)
  const [selectedSplit, setSelectedSplit] = useState('Push/Pull/Legs')
  const [trainingDays, setTrainingDays] = useState(6)
  
  // Selected exercises for each workout
  const [workoutPlans, setWorkoutPlans] = useState<any>({})
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')

  const handleSplitChange = (split: string) => {
    setSelectedSplit(split)
    setWorkoutPlans({})
    
    // Set default training days based on split
    if (split === 'Push/Pull/Legs') setTrainingDays(6)
    else if (split === 'Upper/Lower') setTrainingDays(4)
    else if (split === 'Push/Pull/Legs/Cardio') setTrainingDays(7)
    else if (split === 'Upper/Lower/Cardio') setTrainingDays(6)
    else setTrainingDays(3)
  }

  const addExerciseToWorkout = (workoutType: string, exercise: string, muscleGroup: string) => {
    const isTimeBased = isTimeBasedExercise(exercise)
    
    setWorkoutPlans((prev: any) => ({
      ...prev,
      [workoutType]: {
        ...prev[workoutType],
        [exercise]: {
          muscleGroup,
          sets: 3, // Will be recalculated later based on total exercises
          reps: isTimeBased ? undefined : getDefaultReps(exercise),
          duration: isTimeBased ? getDefaultDuration(exercise) : undefined, // in minutes
          weight: 0
        }
      }
    }))
  }

  // Auto-fill helpers
  const autoFillMuscleGroup = (workoutType: string, muscleGroup: string) => {
    const recs = RECOMMENDED_EXERCISES[muscleGroup] || []
    recs.forEach((ex) => {
      // Only add if present in our database and not already selected
      const isInDatabase = (EXERCISE_DATABASE as any)[muscleGroup]?.includes(ex)
      const alreadySelected = !!(workoutPlans[workoutType] && (workoutPlans[workoutType] as any)[ex])
      if (isInDatabase && !alreadySelected) {
        addExerciseToWorkout(workoutType, ex, muscleGroup)
      }
    })
  }

  const autoFillWorkoutType = (workoutType: string) => {
    let muscleGroups: string[]
    
    if (selectedTemplate && selectedTemplate !== 'Custom' && PREMADE_TEMPLATES[selectedTemplate as keyof typeof PREMADE_TEMPLATES]) {
      const template = PREMADE_TEMPLATES[selectedTemplate as keyof typeof PREMADE_TEMPLATES]
      muscleGroups = template.split[workoutType]?.muscleGroups || []
    } else {
      muscleGroups = (TRAINING_SPLITS as any)[selectedSplit][workoutType]
    }
    
    muscleGroups.forEach((mg: string) => autoFillMuscleGroup(workoutType, mg))
  }

  const autoFillEntirePlan = () => {
    let workoutTypes: string[]
    
    if (selectedTemplate && selectedTemplate !== 'Custom' && PREMADE_TEMPLATES[selectedTemplate as keyof typeof PREMADE_TEMPLATES]) {
      const template = PREMADE_TEMPLATES[selectedTemplate as keyof typeof PREMADE_TEMPLATES]
      workoutTypes = Object.keys(template.split)
    } else {
      workoutTypes = Object.keys(TRAINING_SPLITS[selectedSplit as keyof typeof TRAINING_SPLITS])
    }
    
    workoutTypes.forEach((wt) => autoFillWorkoutType(wt))
  }

  const applyTemplate = (templateName: string) => {
    if (templateName === 'Custom') {
      setSelectedTemplate('Custom')
      setMesocycleName('')
      setWeeks(4)
      setTrainingDays(6)
      setWorkoutPlans({})
      return
    }

    const template = PREMADE_TEMPLATES[templateName as keyof typeof PREMADE_TEMPLATES]
    if (!template) return

    setSelectedTemplate(templateName)
    setMesocycleName(templateName)
    setWeeks(template.weeks)
    setTrainingDays(template.trainingDays)
    
    // Clear existing workout plans
    setWorkoutPlans({})
    
    // Apply template exercises
    Object.entries(template.split).forEach(([workoutType, workoutData]) => {
      const exercises = (workoutData as any).exercises || []
      exercises.forEach((exercise: string) => {
        const muscleGroup = (workoutData as any).muscleGroups.find((mg: string) => 
          EXERCISE_DATABASE[mg as keyof typeof EXERCISE_DATABASE]?.includes(exercise)
        ) || 'Other'
        addExerciseToWorkout(workoutType, exercise, muscleGroup)
      })
    })
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

    // RP Methodology: Start at MEV and progress gradually
    let totalWeeklySets: number
    
    if (week === 1) {
      // Week 1: Start at MEV (Minimum Effective Volume)
      totalWeeklySets = landmarks.MEV
    } else if (week === 2) {
      // Week 2: Slight increase from MEV
      totalWeeklySets = Math.round(landmarks.MEV + (landmarks.MAV - landmarks.MEV) * 0.25)
    } else if (week === 3) {
      // Week 3: Approach MAV
      totalWeeklySets = Math.round(landmarks.MEV + (landmarks.MAV - landmarks.MEV) * 0.5)
    } else if (week === 4) {
      // Week 4: Near MRV
      totalWeeklySets = Math.round(landmarks.MEV + (landmarks.MAV - landmarks.MEV) * 0.75)
    } else {
      // Week 5+: Deload or maintenance
      totalWeeklySets = Math.round(landmarks.MEV * 0.7) // 70% of MEV for deload
    }
    
    // Distribute sets across exercises (RP methodology: 3-4 sets per exercise is typical)
    const setsPerExercise = Math.max(3, Math.min(4, Math.round(totalWeeklySets / totalExercisesForMuscle)))
    
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

  // Helper function to determine if an exercise is time-based (cardio)
  const isTimeBasedExercise = (exerciseName: string): boolean => {
    const timeBasedKeywords = [
      'treadmill', 'stairmaster', 'rowing', 'elliptical', 'bike', 'cycling',
      'swimming', 'jump rope', 'burpees', 'mountain climbers', 'high knees',
      'butt kicks', 'jumping jacks', 'box jumps', 'hiit', 'sprint', 'jogging'
    ]
    
    const name = exerciseName.toLowerCase()
    return timeBasedKeywords.some(keyword => name.includes(keyword))
  }

  // Helper function to get default duration for time-based exercises (in minutes)
  const getDefaultDuration = (exerciseName: string): number => {
    const name = exerciseName.toLowerCase()
    
    // HIIT and sprint intervals - shorter duration
    if (name.includes('hiit') || name.includes('sprint') || name.includes('burpees') || name.includes('box jumps')) {
      return 5 // 5 minutes
    }
    
    // Moderate cardio - medium duration
    if (name.includes('jogging') || name.includes('cycling') || name.includes('elliptical')) {
      return 20 // 20 minutes
    }
    
    // Endurance cardio - longer duration
    if (name.includes('treadmill') || name.includes('stairmaster') || name.includes('rowing') || name.includes('swimming')) {
      return 30 // 30 minutes
    }
    
    // Default
    return 15 // 15 minutes
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
    setLoadingMessage('Creating your mesocycle...')
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
      setLoadingMessage('Creating mesocycle...')
      
      // Determine if we should auto-activate this mesocycle
      let shouldActivate = false
      try {
        const { data: existingActive } = await supabase
          .from('mesocycles')
          .select('id')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .limit(1)
        shouldActivate = !existingActive || existingActive.length === 0
      } catch (_) {
        // If the check fails, fall back to not activating to be safe
        shouldActivate = false
      }

      // Create mesocycle (auto-activate if none active)
      const { data: mesocycle, error: mesocycleError } = await createMesocycle({
        user_id: user.id,
        name: mesocycleName,
        number_of_weeks: weeks,
        is_active: shouldActivate
      })

      if (mesocycleError || !mesocycle) {
        throw new Error(`Failed to create mesocycle: ${mesocycleError?.message}`)
      }

      console.log('✅ Mesocycle created in', Date.now() - startTime, 'ms')
      console.log('⏱️ Creating Week 1 only...')
      setLoadingMessage('Creating Week 1...')

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
      let workoutTypes: string[]
      let workoutsPerWeek: number
      
      // Use template split if a template is selected, otherwise use default split
      if (selectedTemplate && selectedTemplate !== 'Custom' && PREMADE_TEMPLATES[selectedTemplate as keyof typeof PREMADE_TEMPLATES]) {
        const template = PREMADE_TEMPLATES[selectedTemplate as keyof typeof PREMADE_TEMPLATES]
        workoutTypes = Object.keys(template.split)
        workoutsPerWeek = Math.ceil(trainingDays / workoutTypes.length)
      } else {
        workoutTypes = Object.keys(TRAINING_SPLITS[selectedSplit as keyof typeof TRAINING_SPLITS])
        workoutsPerWeek = Math.ceil(trainingDays / workoutTypes.length)
      }

      setLoadingMessage('Generating workouts...')
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

        setLoadingMessage(`Adding exercises and sets for Day ${day}...`)
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
      
      {/* Mesocycle Setup - Now First */}
      <div>
        <div className="mb-6">
          <h3 className="text-xl font-bold mb-2">Basic Setup</h3>
          <p className="text-gray-600 text-sm">Configure your mesocycle parameters</p>
        </div>
        
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
            <div className="grid grid-cols-3 gap-2">
              {[4, 5, 6].map(w => (
                <Button
                  key={w}
                  variant={weeks === w ? "default" : "outline"}
                  onClick={() => setWeeks(w)}
                  className="text-xs sm:text-sm"
                >
                  <span className="hidden sm:inline">{w} weeks</span>
                  <span className="sm:hidden">{w}w</span>
                  {w === 5 || w === 6 && (
                    <span className="hidden sm:inline"> + Deload</span>
                  )}
                  {w === 5 || w === 6 && (
                    <span className="sm:hidden">+D</span>
                  )}
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

      {/* Enhanced Template Selection - Now Second */}
      <div>
        <div className="mb-6">
          <h3 className="text-xl font-bold mb-2">Choose Your Training Program</h3>
          <p className="text-gray-600 text-sm">Select from expert-designed templates or create your own</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
          {/* Custom Option */}
          <Card 
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] border-2 ${
              selectedTemplate === 'Custom' 
                ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg' 
                : 'border-gray-200 hover:border-blue-300'
            }`}
            onClick={() => applyTemplate('Custom')}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-gray-900">Custom Program</CardTitle>
                  <p className="text-xs text-blue-600 font-medium">Build from scratch</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">Create your own personalized training program with complete control over exercises, volume, and progression.</p>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <div className="text-xs font-semibold text-gray-900">4-6 weeks</div>
                  <div className="text-xs text-gray-500">Duration</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <div className="text-xs font-semibold text-gray-900">3-7 days</div>
                  <div className="text-xs text-gray-500">Frequency</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <div className="text-xs font-semibold text-gray-900">Flexible</div>
                  <div className="text-xs text-gray-500">Structure</div>
                </div>
              </div>
              {selectedTemplate === 'Custom' && (
                <div className="flex items-center justify-center gap-2 text-blue-600 font-medium">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">Selected</span>
                </div>
              )}
            </CardContent>
          </Card>
          
          {Object.entries(PREMADE_TEMPLATES).map(([templateName, template]) => {
            // Get template-specific styling
            const getTemplateStyle = (name: string) => {
              switch (name) {
                case 'Mike Israetel - RP Hypertrophy':
                  return { color: 'purple', icon: '🎯', bg: 'from-purple-50 to-purple-100', border: 'border-purple-500' }
                case 'Jeff Nippard - Strength Program':
                  return { color: 'green', icon: '💪', bg: 'from-green-50 to-green-100', border: 'border-green-500' }
                case 'Athlean-X - Total Body':
                  return { color: 'orange', icon: '🔥', bg: 'from-orange-50 to-orange-100', border: 'border-orange-500' }
                case 'John Meadows - Mountain Dog':
                  return { color: 'red', icon: '🏔️', bg: 'from-red-50 to-red-100', border: 'border-red-500' }
                case 'Sam Sulek - High Volume Bodybuilding':
                  return { color: 'indigo', icon: '⚡', bg: 'from-indigo-50 to-indigo-100', border: 'border-indigo-500' }
                default:
                  return { color: 'blue', icon: '💎', bg: 'from-blue-50 to-blue-100', border: 'border-blue-500' }
              }
            }
            
            const style = getTemplateStyle(templateName)
            const isSelected = selectedTemplate === templateName
            
            return (
              <Card 
                key={templateName} 
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] border-2 ${
                  isSelected 
                    ? `${style.border} bg-gradient-to-br ${style.bg} shadow-lg` 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => applyTemplate(templateName)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-10 h-10 bg-${style.color}-100 rounded-lg flex items-center justify-center text-lg`}>
                      {style.icon}
                    </div>
                    <div>
                      <CardTitle className="text-base font-bold text-gray-900">{templateName.split(' - ')[0]}</CardTitle>
                      <p className="text-xs text-gray-500 font-medium">{templateName.split(' - ')[1]}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{template.description}</p>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <div className="text-xs font-semibold text-gray-900">{template.weeks} weeks</div>
                      <div className="text-xs text-gray-500">Duration</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <div className="text-xs font-semibold text-gray-900">{template.trainingDays} days</div>
                      <div className="text-xs text-gray-500">Frequency</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <div className="text-xs font-semibold text-gray-900">{Object.keys(template.split).length}</div>
                      <div className="text-xs text-gray-500">Workouts</div>
                    </div>
                  </div>
                  
                  {/* Workout Types Preview */}
                  <div className="mb-3">
                    <div className="text-xs font-semibold text-gray-700 mb-1">Workout Types:</div>
                    <div className="flex flex-wrap gap-1">
                      {Object.keys(template.split).map((workout, index) => (
                        <span key={workout} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                          {workout.split(' ')[0]}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {isSelected && (
                    <div className={`flex items-center justify-center gap-2 text-${style.color}-600 font-medium`}>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm">Selected</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Template vs Custom Flow Indicator */}
      {selectedTemplate && selectedTemplate !== 'Custom' && (
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Template selected - exercises are pre-configured!</span>
          </div>
        </div>
      )}

      <Button
        onClick={() => {
          // If a template is selected (not Custom), go straight to creating the mesocycle
          if (selectedTemplate && selectedTemplate !== 'Custom') {
            createMesocycleInSupabase()
          } else {
            // If Custom is selected, go to exercise selection step
            setStep(2)
          }
        }}
        className="w-full"
        disabled={!mesocycleName.trim()}
      >
        {selectedTemplate && selectedTemplate !== 'Custom' ? 'Create Mesocycle' : 'Next: Select Exercises'}
      </Button>
    </div>
  )

  const renderStep2 = () => {
    // Use template split if a template is selected, otherwise use default split
    let workoutTypes: string[]
    let muscleGroupsMap: any
    
    if (selectedTemplate && selectedTemplate !== 'Custom' && PREMADE_TEMPLATES[selectedTemplate as keyof typeof PREMADE_TEMPLATES]) {
      const template = PREMADE_TEMPLATES[selectedTemplate as keyof typeof PREMADE_TEMPLATES]
      workoutTypes = Object.keys(template.split)
      muscleGroupsMap = template.split
    } else {
      workoutTypes = Object.keys(TRAINING_SPLITS[selectedSplit as keyof typeof TRAINING_SPLITS])
      muscleGroupsMap = TRAINING_SPLITS[selectedSplit as keyof typeof TRAINING_SPLITS]
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-medium">Exercise Selection</h3>
          {selectedTemplate && selectedTemplate !== 'Custom' && (
            <Badge variant="outline" className="ml-2">
              {selectedTemplate}
            </Badge>
          )}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={autoFillEntirePlan}>
            Auto-Fill Best Plan
          </Button>
        </div>

        {workoutTypes.map(workoutType => {
          const muscleGroups = muscleGroupsMap[workoutType]?.muscleGroups || muscleGroupsMap[workoutType]
          
          return (
            <Card key={workoutType}>
              <CardHeader>
                <CardTitle className="text-base">{workoutType}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {muscleGroups.map((muscleGroup: string) => (
                  <div key={muscleGroup}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{muscleGroup}</h4>
                      <Badge variant="outline" className="text-xs">
                        MEV: {VOLUME_LANDMARKS[muscleGroup as keyof typeof VOLUME_LANDMARKS]?.MEV} sets/week
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <Button variant="secondary" size="sm" onClick={() => autoFillMuscleGroup(workoutType, muscleGroup)}>
                        Auto-Fill Best {muscleGroup}
                      </Button>
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
                  {Object.entries(exercises as any).map(([exercise, data]) => {
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
    <div className="space-y-6 pb-20 relative">
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm">
          <div className="bg-white border rounded-xl shadow-lg p-6 w-72 text-center space-y-3 animate-in fade-in zoom-in-95">
            <div className="w-10 h-10 mx-auto border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-700">{loadingMessage}</p>
            <p className="text-xs text-gray-400">Loading up your plan...</p>
          </div>
        </div>
      )}
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
