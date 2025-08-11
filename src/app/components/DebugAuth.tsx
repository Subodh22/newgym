'use client'

import { useState, useEffect } from 'react'
import { useSupabaseAuth } from '@/lib/hooks/useSupabaseAuth'
import { supabase } from '@/lib/supabase/supabase'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'

export function DebugAuth() {
  const { user } = useSupabaseAuth()
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [loading, setLoading] = useState(false)

  const runDiagnostics = async () => {
    setLoading(true)
    const info: any = {}
    
    try {
      // Check user authentication
      info.user = {
        id: user?.id,
        email: user?.email,
        authenticated: !!user
      }

      // Check if profile exists
      if (user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        info.profile = {
          exists: !!profile,
          data: profile,
          error: profileError?.message
        }

        // Try to create a profile if it doesn't exist
        if (!profile && !profileError) {
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email || '',
              full_name: user.user_metadata?.full_name || ''
            })
            .select()
            .single()

          info.profileCreation = {
            success: !!newProfile,
            data: newProfile,
            error: createError?.message
          }
        }

        // Test mesocycle permissions
        const { data: mesocycles, error: mesocycleError } = await supabase
          .from('mesocycles')
          .select('*')
          .eq('user_id', user.id)

        info.mesocycleAccess = {
          canRead: !mesocycleError,
          count: mesocycles?.length || 0,
          error: mesocycleError?.message
        }

        // Test mesocycle creation
        const testMesocycle = {
          user_id: user.id,
          name: 'Debug Test Mesocycle',
          number_of_weeks: 4
        }

        const { data: createdMesocycle, error: createMesocycleError } = await supabase
          .from('mesocycles')
          .insert(testMesocycle)
          .select()
          .single()

        info.mesocycleCreation = {
          success: !!createdMesocycle,
          data: createdMesocycle,
          error: createMesocycleError?.message
        }

        // Clean up test mesocycle
        if (createdMesocycle) {
          await supabase
            .from('mesocycles')
            .delete()
            .eq('id', createdMesocycle.id)
        }
      }

    } catch (error: any) {
      info.generalError = error.message
    }

    setDebugInfo(info)
    setLoading(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Authentication & Database Debug</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runDiagnostics} disabled={loading}>
          {loading ? 'Running Diagnostics...' : 'Run Diagnostics'}
        </Button>

        {Object.keys(debugInfo).length > 0 && (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium">User Authentication</h4>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                {JSON.stringify(debugInfo.user, null, 2)}
              </pre>
            </div>

            {debugInfo.profile && (
              <div>
                <h4 className="font-medium">Profile Status</h4>
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                  {JSON.stringify(debugInfo.profile, null, 2)}
                </pre>
              </div>
            )}

            {debugInfo.profileCreation && (
              <div>
                <h4 className="font-medium">Profile Creation</h4>
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                  {JSON.stringify(debugInfo.profileCreation, null, 2)}
                </pre>
              </div>
            )}

            {debugInfo.mesocycleAccess && (
              <div>
                <h4 className="font-medium">Mesocycle Read Access</h4>
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                  {JSON.stringify(debugInfo.mesocycleAccess, null, 2)}
                </pre>
              </div>
            )}

            {debugInfo.mesocycleCreation && (
              <div>
                <h4 className="font-medium">Mesocycle Creation Test</h4>
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                  {JSON.stringify(debugInfo.mesocycleCreation, null, 2)}
                </pre>
              </div>
            )}

            {debugInfo.generalError && (
              <div>
                <h4 className="font-medium text-red-600">General Error</h4>
                <pre className="text-xs bg-red-100 p-2 rounded overflow-auto">
                  {debugInfo.generalError}
                </pre>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
