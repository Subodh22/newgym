import { NextRequest, NextResponse } from 'next/server'
import { importMesocycleDataServer } from '@/lib/supabase/database-server'
import { supabase } from '@/lib/supabase/supabase'

export async function POST(request: NextRequest) {
  try {
    const { mesocycleData, userId } = await request.json()

    if (!mesocycleData || !userId) {
      return NextResponse.json(
        { error: 'Missing mesocycleData or userId' },
        { status: 400 }
      )
    }

    // Verify the user exists and is authenticated
    const { data: user, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user || user.user.id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const result = await importMesocycleDataServer(mesocycleData, userId)

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        mesocycle: result.mesocycle 
      })
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Import API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
