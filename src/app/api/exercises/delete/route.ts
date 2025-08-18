import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/supabase-admin'

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { exerciseId } = body
    
    if (!exerciseId || isNaN(exerciseId)) {
      return NextResponse.json(
        { error: 'Valid exercise ID is required' },
        { status: 400 }
      )
    }

    // Delete the exercise (this will cascade delete all sets due to foreign key constraints)
    const { error } = await supabaseAdmin
      .from('exercises')
      .delete()
      .eq('id', exerciseId)

    if (error) {
      console.error('Error deleting exercise:', error)
      return NextResponse.json(
        { error: 'Failed to delete exercise' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, message: 'Exercise deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in DELETE /api/exercises/delete:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
