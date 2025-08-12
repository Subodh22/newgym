// Test database connection and schema
const { createClient } = require('@supabase/supabase-js')

const testDatabaseConnection = async () => {
  try {
    console.log('🔍 Testing database connection...')
    
    const supabaseUrl = 'https://iwtzsfvtpscnomcdqqxc.supabase.co'
    const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3dHpzZnZ0cHNjbm9tY2RxcXhjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDU2MjYzNywiZXhwIjoyMDcwMTM4NjM3fQ.G67gUuwY'
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    
    // Test basic connection
    console.log('📡 Testing basic connection...')
    const { data: testData, error: testError } = await supabaseAdmin
      .from('profiles')
      .select('count')
      .limit(1)
    
    if (testError) {
      console.error('❌ Database connection failed:', testError)
      return
    }
    
    console.log('✅ Database connection successful')
    
    // Test if tables exist
    console.log('📋 Testing table access...')
    
    const tables = ['profiles', 'mesocycles', 'weeks', 'workouts', 'exercises', 'sets']
    
    for (const table of tables) {
      try {
        const { data, error } = await supabaseAdmin
          .from(table)
          .select('*')
          .limit(1)
        
        if (error) {
          console.error(`❌ Table ${table} access failed:`, error)
        } else {
          console.log(`✅ Table ${table} accessible`)
        }
      } catch (err) {
        console.error(`❌ Table ${table} error:`, err.message)
      }
    }
    
    // Test creating a simple record
    console.log('📝 Testing record creation...')
    
    // First, let's check if there are any mesocycles
    const { data: mesocycles, error: mesocyclesError } = await supabaseAdmin
      .from('mesocycles')
      .select('id')
      .limit(1)
    
    if (mesocyclesError) {
      console.error('❌ Cannot access mesocycles table:', mesocyclesError)
      return
    }
    
    if (mesocycles && mesocycles.length > 0) {
      const testMesocycleId = mesocycles[0].id
      console.log(`📊 Found mesocycle with ID: ${testMesocycleId}`)
      
      // Try to create a week
      const { data: week, error: weekError } = await supabaseAdmin
        .from('weeks')
        .insert({
          mesocycle_id: testMesocycleId,
          week_number: 999, // Use a high number to avoid conflicts
          name: 'Test Week'
        })
        .select()
        .single()
      
      if (weekError) {
        console.error('❌ Week creation failed:', weekError)
      } else {
        console.log('✅ Week creation successful:', week.id)
        
        // Clean up - delete the test week
        await supabaseAdmin
          .from('weeks')
          .delete()
          .eq('id', week.id)
        
        console.log('🧹 Test week cleaned up')
      }
    } else {
      console.log('⚠️ No mesocycles found in database')
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testDatabaseConnection()
