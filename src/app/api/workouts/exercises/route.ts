import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/supabase-admin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, workoutId, sets = 3, weight = 0, reps = 8 } = body

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Exercise name is required' },
        { status: 400 }
      )
    }

    if (!workoutId || isNaN(workoutId)) {
      return NextResponse.json(
        { error: 'Valid workout ID is required' },
        { status: 400 }
      )
    }

    // Get the next exercise order
    const { data: existingExercises } = await supabaseAdmin
      .from('exercises')
      .select('exercise_order')
      .eq('workout_id', workoutId)
      .order('exercise_order', { ascending: false })
      .limit(1)

    const nextOrder = existingExercises && existingExercises.length > 0 
      ? existingExercises[0].exercise_order + 1 
      : 1

    // Create the exercise
    const { data: exercise, error: exerciseError } = await supabaseAdmin
      .from('exercises')
      .insert({
        workout_id: workoutId,
        name: name.trim(),
        exercise_order: nextOrder
      })
      .select()
      .single()

    if (exerciseError || !exercise) {
      console.error('Error creating exercise:', exerciseError)
      return NextResponse.json(
        { error: 'Failed to create exercise' },
        { status: 500 }
      )
    }

    // Create the default sets
    for (let i = 1; i <= sets; i++) {
      const { error: setError } = await supabaseAdmin
        .from('sets')
        .insert({
          exercise_id: exercise.id,
          set_number: i,
          weight: weight,
          reps: reps,
          is_completed: false
        })

      if (setError) {
        console.error('Error creating set:', setError)
        // Continue creating other sets even if one fails
      }
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Exercise added successfully',
        exercise: exercise
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error in POST /api/workouts/exercises:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
