// Test database write permissions
const { createClient } = require('@supabase/supabase-js')

// Use the environment variables directly from your .env file
const supabaseUrl = 'https://iwtzsfvtpscnomcdqqxc.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3dHpzZnZ0cHNjbm9tY2RxcXhjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDU2MjYzNywiZXhwIjoyMDcwMTM4NjM3fQ.G67gUuwYYVVG8827viYi675FFP740JbN8O7JG5KqSY4'

console.log('🔍 Testing Supabase Database Write Permissions')
console.log('==============================================')
console.log('URL:', supabaseUrl)
console.log('Service Key:', supabaseServiceKey ? `${supabaseServiceKey.substring(0, 20)}...` : 'MISSING')

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function testDatabaseWrite() {
  try {
    console.log('\n📝 Testing week creation...')
    
    // Try to create a test week
    const { data: week, error: weekError } = await supabase
      .from('weeks')
      .insert({
        mesocycle_id: 5, // Using existing mesocycle ID from your database
        week_number: 999, // Test week number
        name: 'Test Week - DELETE ME'
      })
      .select()
      .single()

    if (weekError) {
      console.error('❌ Week creation failed:', weekError)
      return false
    }

    console.log('✅ Week created successfully:', week)

    // Clean up - delete the test week
    const { error: deleteError } = await supabase
      .from('weeks')
      .delete()
      .eq('id', week.id)

    if (deleteError) {
      console.warn('⚠️ Could not clean up test week:', deleteError)
    } else {
      console.log('🧹 Test week cleaned up')
    }

    return true

  } catch (error) {
    console.error('❌ Database test failed:', error)
    return false
  }
}

testDatabaseWrite().then(success => {
  if (success) {
    console.log('\n✅ Database write permissions are working!')
    console.log('The progressive week API should work now.')
  } else {
    console.log('\n❌ Database write permissions are NOT working.')
    console.log('You need to run the fix-database-permissions.sql in Supabase.')
  }
})
