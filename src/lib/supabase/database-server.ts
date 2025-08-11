import { supabaseAdmin } from './supabase-admin'
import { Database } from './database.types'

type Tables = Database['public']['Tables']

// Server-side database functions that use admin client
// These should only be used in API routes or server components

// Mesocycle functions
export const createMesocycleServer = async (mesocycle: Tables['mesocycles']['Insert']) => {
  const { data, error } = await supabaseAdmin
    .from('mesocycles')
    .insert(mesocycle)
    .select()
    .single()
  
  return { data, error }
}

// Week functions
export const createWeekServer = async (week: Tables['weeks']['Insert']) => {
  const { data, error } = await supabaseAdmin
    .from('weeks')
    .insert(week)
    .select()
    .single()
  
  return { data, error }
}

// Workout functions
export const createWorkoutServer = async (workout: Tables['workouts']['Insert']) => {
  const { data, error } = await supabaseAdmin
    .from('workouts')
    .insert(workout)
    .select()
    .single()
  
  return { data, error }
}

// Exercise functions
export const createExerciseServer = async (exercise: Tables['exercises']['Insert']) => {
  const { data, error } = await supabaseAdmin
    .from('exercises')
    .insert(exercise)
    .select()
    .single()
  
  return { data, error }
}

// Set functions
export const createSetServer = async (set: Tables['sets']['Insert']) => {
  const { data, error } = await supabaseAdmin
    .from('sets')
    .insert(set)
    .select()
    .single()
  
  return { data, error }
}

// Import mesocycle data function (server-side)
export const importMesocycleDataServer = async (mesocycleData: any, userId: string) => {
  try {
    // Create mesocycle
    const { data: mesocycle, error: mesocycleError } = await createMesocycleServer({
      user_id: userId,
      name: mesocycleData.Name,
      number_of_weeks: mesocycleData.NumberOfWeeks,
      is_active: true
    })

    if (mesocycleError || !mesocycle) {
      throw new Error(`Failed to create mesocycle: ${mesocycleError?.message}`)
    }

    // Create weeks
    for (const weekData of mesocycleData.Weeks) {
      const { data: week, error: weekError } = await createWeekServer({
        mesocycle_id: mesocycle.id,
        week_number: weekData.id,
        name: weekData.Name
      })

      if (weekError || !week) {
        throw new Error(`Failed to create week: ${weekError?.message}`)
      }

      // Create workouts (days)
      for (const dayData of weekData.Days) {
        const { data: workout, error: workoutError } = await createWorkoutServer({
          week_id: week.id,
          day_name: dayData.DayName
        })

        if (workoutError || !workout) {
          throw new Error(`Failed to create workout: ${workoutError?.message}`)
        }

        // Create exercises
        for (const exerciseData of dayData.Exercises) {
          const { data: exercise, error: exerciseError } = await createExerciseServer({
            workout_id: workout.id,
            name: exerciseData.Name,
            exercise_order: exerciseData.id
          })

          if (exerciseError || !exercise) {
            throw new Error(`Failed to create exercise: ${exerciseError?.message}`)
          }

          // Create sets
          for (const setData of exerciseData.Sets) {
            const { error: setError } = await createSetServer({
              exercise_id: exercise.id,
              set_number: setData.id,
              weight: setData.Weight,
              reps: setData.Reps
            })

            if (setError) {
              throw new Error(`Failed to create set: ${setError.message}`)
            }
          }
        }
      }
    }

    return { success: true, mesocycle }
  } catch (error) {
    console.error('Import failed:', error)
    return { success: false, error }
  }
}
