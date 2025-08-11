export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          created_at: string
          email: string
          full_name: string | null
          avatar_url: string | null
        }
        Insert: {
          id: string
          created_at?: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
        }
      }
      mesocycles: {
        Row: {
          id: number
          created_at: string
          user_id: string
          name: string
          number_of_weeks: number
          start_date: string | null
          end_date: string | null
          is_active: boolean
        }
        Insert: {
          id?: number
          created_at?: string
          user_id: string
          name: string
          number_of_weeks: number
          start_date?: string | null
          end_date?: string | null
          is_active?: boolean
        }
        Update: {
          id?: number
          created_at?: string
          user_id?: string
          name?: string
          number_of_weeks?: number
          start_date?: string | null
          end_date?: string | null
          is_active?: boolean
        }
      }
      weeks: {
        Row: {
          id: number
          created_at: string
          mesocycle_id: number
          week_number: number
          name: string
          start_date: string | null
          end_date: string | null
        }
        Insert: {
          id?: number
          created_at?: string
          mesocycle_id: number
          week_number: number
          name: string
          start_date?: string | null
          end_date?: string | null
        }
        Update: {
          id?: number
          created_at?: string
          mesocycle_id?: number
          week_number?: number
          name?: string
          start_date?: string | null
          end_date?: string | null
        }
      }
      workouts: {
        Row: {
          id: number
          created_at: string
          week_id: number
          day_name: string
          workout_date: string | null
          is_completed: boolean
          notes: string | null
        }
        Insert: {
          id?: number
          created_at?: string
          week_id: number
          day_name: string
          workout_date?: string | null
          is_completed?: boolean
          notes?: string | null
        }
        Update: {
          id?: number
          created_at?: string
          week_id?: number
          day_name?: string
          workout_date?: string | null
          is_completed?: boolean
          notes?: string | null
        }
      }
      exercises: {
        Row: {
          id: number
          created_at: string
          workout_id: number
          name: string
          exercise_order: number
          notes: string | null
        }
        Insert: {
          id?: number
          created_at?: string
          workout_id: number
          name: string
          exercise_order: number
          notes?: string | null
        }
        Update: {
          id?: number
          created_at?: string
          workout_id?: number
          name?: string
          exercise_order?: number
          notes?: string | null
        }
      }
      sets: {
        Row: {
          id: number
          created_at: string
          exercise_id: number
          set_number: number
          weight: number | null
          reps: number | null
          duration: number | null
          distance: number | null
          rest_time: number | null
          is_completed: boolean
          notes: string | null
        }
        Insert: {
          id?: number
          created_at?: string
          exercise_id: number
          set_number: number
          weight?: number | null
          reps?: number | null
          duration?: number | null
          distance?: number | null
          rest_time?: number | null
          is_completed?: boolean
          notes?: string | null
        }
        Update: {
          id?: number
          created_at?: string
          exercise_id?: number
          set_number?: number
          weight?: number | null
          reps?: number | null
          duration?: number | null
          distance?: number | null
          rest_time?: number | null
          is_completed?: boolean
          notes?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
