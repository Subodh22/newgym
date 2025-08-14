// Clean up duplicate Week 2s in the database
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://iwtzsfvtpscnomcdqqxc.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3dHpzZnZ0cHNjbm9tY2RxcXhjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDU2MjYzNywiZXhwIjoyMDcwMTM4NjM3fQ.G67gUuwYYVVG8827viYi675FFP740JbN8O7JG5KqSY4'

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function cleanupDuplicateWeeks() {
  try {
    console.log('🧹 Cleaning up duplicate Week 2s...')
    
    // Find all Week 2s
    const { data: week2s, error: findError } = await supabase
      .from('weeks')
      .select('*')
      .eq('week_number', 2)
      .order('created_at', { ascending: true })

    if (findError) {
      console.error('Error finding Week 2s:', findError)
      return
    }

    console.log(`Found ${week2s?.length || 0} Week 2s`)

    if (!week2s || week2s.length <= 1) {
      console.log('✅ No duplicate Week 2s to clean up')
      return
    }

    // Group by mesocycle_id
    const weeksByMesocycle = week2s.reduce((acc, week) => {
      if (!acc[week.mesocycle_id]) {
        acc[week.mesocycle_id] = []
      }
      acc[week.mesocycle_id].push(week)
      return acc
    }, {})

    for (const [mesocycleId, weeks] of Object.entries(weeksByMesocycle)) {
      if (weeks.length > 1) {
        console.log(`\n📋 Mesocycle ${mesocycleId} has ${weeks.length} Week 2s`)
        
        // Keep the first one (oldest), delete the rest
        const [keepWeek, ...deleteWeeks] = weeks
        console.log(`✅ Keeping Week 2 (ID: ${keepWeek.id}, created: ${keepWeek.created_at})`)
        
        for (const weekToDelete of deleteWeeks) {
          console.log(`🗑️ Deleting duplicate Week 2 (ID: ${weekToDelete.id}, created: ${weekToDelete.created_at})`)
          
          // Delete associated workouts, exercises, and sets first
          const { data: workouts } = await supabase
            .from('workouts')
            .select('id')
            .eq('week_id', weekToDelete.id)

          if (workouts && workouts.length > 0) {
            for (const workout of workouts) {
              // Delete sets first
              await supabase
                .from('sets')
                .delete()
                .in('exercise_id', 
                  (await supabase
                    .from('exercises')
                    .select('id')
                    .eq('workout_id', workout.id)
                  ).data?.map(e => e.id) || []
                )
              
              // Delete exercises
              await supabase
                .from('exercises')
                .delete()
                .eq('workout_id', workout.id)
            }
            
            // Delete workouts
            await supabase
              .from('workouts')
              .delete()
              .eq('week_id', weekToDelete.id)
          }
          
          // Delete the week
          const { error: deleteError } = await supabase
            .from('weeks')
            .delete()
            .eq('id', weekToDelete.id)
          
          if (deleteError) {
            console.error(`Error deleting week ${weekToDelete.id}:`, deleteError)
          } else {
            console.log(`✅ Deleted duplicate Week 2 (ID: ${weekToDelete.id})`)
          }
        }
      }
    }
    
    console.log('\n🎉 Cleanup completed!')
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error)
  }
}

cleanupDuplicateWeeks()
