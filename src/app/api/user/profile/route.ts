import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { user, accessToken } = await request.json()
    
    if (!user || !user.id) {
      return NextResponse.json(
        { error: 'User data is required' },
        { status: 400 }
      )
    }

    // Check if we have valid environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !anonKey || 
        supabaseUrl.includes('placeholder') || anonKey.includes('placeholder')) {
      console.error('Missing or invalid Supabase environment variables')
      return NextResponse.json(
        { 
          error: 'Supabase not configured', 
          details: 'Please set up your Supabase environment variables in .env.local' 
        },
        { status: 500 }
      )
    }

    // Create a Supabase client with the user's session
    const supabase = createClient(supabaseUrl, anonKey)
    
    // If we have an access token, set the session
    if (accessToken) {
      await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: '' // We only need access token for this operation
      })
    }

    // Check if profile exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (existingProfile && !fetchError) {
      return NextResponse.json({ success: true, profile: existingProfile })
    }

    // If fetch error is not "not found", and it's not an auth issue, return it
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching profile:', fetchError)
    }

    // Try to create profile using the user's session (should work with RLS)
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email || '',
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || ''
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating profile:', createError)
      
      // If it's a permission error, the profile might already exist due to the trigger
      // Let's try to fetch it again
      if (createError.code === '42501') {
        const { data: triggerProfile, error: triggerFetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
          
        if (triggerProfile && !triggerFetchError) {
          return NextResponse.json({ success: true, profile: triggerProfile })
        }
      }
      
      return NextResponse.json(
        { 
          error: 'Failed to create profile', 
          details: createError.message,
          code: createError.code,
          suggestion: 'Profile might already exist due to database trigger, or database schema needs to be set up'
        },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, profile: newProfile })
  } catch (error) {
    console.error('Profile creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
