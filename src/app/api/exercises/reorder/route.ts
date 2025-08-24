import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/supabase-admin'

export async function POST(request: NextRequest) {
  try {
    const { exerciseIds } = await request.json()
    
    if (!exerciseIds || !Array.isArray(exerciseIds)) {
      return NextResponse.json({ error: 'Invalid exercise IDs' }, { status: 400 })
    }

    const supabase = supabaseAdmin

    // Update exercise_order for each exercise
    const updates = exerciseIds.map((exerciseId: number, index: number) => ({
      id: exerciseId,
      exercise_order: index + 1
    }))

    // Perform batch update
    for (const update of updates) {
      const { error } = await supabase
        .from('exercises')
        .update({ exercise_order: update.exercise_order })
        .eq('id', update.id)

      if (error) {
        console.error('Error updating exercise order:', error)
        return NextResponse.json({ error: 'Failed to update exercise order' }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in reorder exercises:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 