import { supabase } from './supabase'
import { supabaseAdmin } from './supabase-admin'

export async function ensureUserProfile(user: any) {
  if (!user) return null

  // Check if profile exists
  const { data: existingProfile, error: fetchError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (existingProfile && !fetchError) {
    return existingProfile
  }

  // Create profile if it doesn't exist using admin client to bypass RLS
  const { data: newProfile, error: createError } = await supabaseAdmin
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
    throw createError
  }

  return newProfile
}

export async function testDatabaseConnection(user: any) {
  if (!user) return { success: false, error: 'No user provided' }

  try {
    // Ensure profile exists
    await ensureUserProfile(user)

    // Test basic read access
    const { data, error } = await supabase
      .from('mesocycles')
      .select('count')
      .eq('user_id', user.id)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
