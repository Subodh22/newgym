import { supabase } from './supabase'
import { Database } from './database.types'

type Tables = Database['public']['Tables']
type Mesocycle = Tables['mesocycles']['Row']
type Week = Tables['weeks']['Row']
type Workout = Tables['workouts']['Row']
type Exercise = Tables['exercises']['Row']
type Set = Tables['sets']['Row']

// Mesocycle functions
export const createMesocycle = async (mesocycle: Tables['mesocycles']['Insert']) => {
  const { data, error } = await supabase
    .from('mesocycles')
    .insert(mesocycle)
    .select()
    .single()
  
  return { data, error }
}

export const getMesocycles = async (userId: string) => {
  const { data, error } = await supabase
    .from('mesocycles')
    .select(`
      *,
      weeks (
        *,
        workouts (
          *,
          exercises (
            *,
            sets (*)
          )
        )
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  return { data, error }
}

export const updateMesocycle = async (id: number, updates: Tables['mesocycles']['Update']) => {
  const { data, error } = await supabase
    .from('mesocycles')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  return { data, error }
}

export const deleteMesocycle = async (id: number) => {
  const { error } = await supabase
    .from('mesocycles')
    .delete()
    .eq('id', id)
  
  return { error }
}

// Week functions
export const createWeek = async (week: Tables['weeks']['Insert']) => {
  const { data, error } = await supabase
    .from('weeks')
    .insert(week)
    .select()
    .single()
  
  return { data, error }
}

// Workout functions
export const createWorkout = async (workout: Tables['workouts']['Insert']) => {
  const { data, error } = await supabase
    .from('workouts')
    .insert(workout)
    .select()
    .single()
  
  return { data, error }
}

export const updateWorkout = async (id: number, updates: Tables['workouts']['Update']) => {
  const { data, error } = await supabase
    .from('workouts')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  return { data, error }
}

// Exercise functions
export const createExercise = async (exercise: Tables['exercises']['Insert']) => {
  const { data, error } = await supabase
    .from('exercises')
    .insert(exercise)
    .select()
    .single()
  
  return { data, error }
}

export const updateExercise = async (id: number, updates: Tables['exercises']['Update']) => {
  const { data, error } = await supabase
    .from('exercises')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  return { data, error }
}

// Set functions
export const createSet = async (set: Tables['sets']['Insert']) => {
  const { data, error } = await supabase
    .from('sets')
    .insert(set)
    .select()
    .single()
  
  return { data, error }
}

export const updateSet = async (id: number, updates: Tables['sets']['Update']) => {
  const { data, error } = await supabase
    .from('sets')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  return { data, error }
}

export const deleteSet = async (id: number) => {
  const { error } = await supabase
    .from('sets')
    .delete()
    .eq('id', id)
  
  return { error }
}


