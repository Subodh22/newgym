'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { 
  User, 
  Trophy, 
  Calendar, 
  Target, 
  Settings, 
  Bell, 
  Moon, 
  Shield, 
  HelpCircle,
  LogOut,
  Edit3,
  TrendingUp,
  Zap,
  Award
} from 'lucide-react'
import { useSupabaseAuth } from '@/lib/hooks/useSupabaseAuth'
import { getMesocycles } from '@/lib/supabase/database'

export function UserProfile() {
  const { user, signOut } = useSupabaseAuth()
  const [mesocycles, setMesocycles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadMesocycles()
    }
  }, [user])

  const loadMesocycles = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const { data, error } = await getMesocycles(user.id)
      if (error) throw error
      setMesocycles(data || [])
    } catch (error) {
      console.error('Error loading mesocycles:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate user stats
  const calculateUserStats = () => {
    const totalWorkouts = mesocycles.reduce((total, mesocycle) => 
      total + (mesocycle.weeks?.reduce((weekTotal: number, week: any) => 
        weekTotal + (week.workouts?.length || 0), 0) || 0), 0
    )
    
    const completedWorkouts = mesocycles.reduce((total, mesocycle) => 
      total + (mesocycle.weeks?.reduce((weekTotal: number, week: any) => 
        weekTotal + (week.workouts?.filter((w: any) => w.is_completed).length || 0), 0) || 0), 0
    )
    
    const activeMesocycles = mesocycles.filter(m => m.is_active).length
    const completedMesocycles = mesocycles.filter(m => 
      m.weeks?.every((w: any) => w.workouts?.every((wo: any) => wo.is_completed))
    ).length
    
    return {
      totalWorkouts,
      completedWorkouts,
      activeMesocycles,
      completedMesocycles,
      successRate: totalWorkouts > 0 ? Math.round((completedWorkouts / totalWorkouts) * 100) : 0
    }
  }

  const stats = calculateUserStats()
  
  // User data from Supabase auth
  const userData = {
    name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User',
    email: user?.email || '',
    memberSince: user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently',
    level: stats.completedWorkouts >= 50 ? 'Advanced' : stats.completedWorkouts >= 20 ? 'Intermediate' : 'Beginner',
    currentStreak: calculateStreak()
  }

  function calculateStreak() {
    // Simple streak calculation - consecutive days with completed workouts
    const allWorkouts = mesocycles.flatMap(m => 
      m.weeks?.flatMap((w: any) => w.workouts || []) || []
    ).sort((a, b) => new Date(b.workout_date || b.created_at).getTime() - 
                     new Date(a.workout_date || a.created_at).getTime())
    
    let streak = 0
    for (const workout of allWorkouts) {
      if (workout.is_completed) {
        streak++
      } else {
        break
      }
    }
    return streak
  }

  const achievements = [
    { id: 1, name: '7 Day Streak', icon: Zap, color: 'text-orange-500', earned: userData.currentStreak >= 7 },
    { id: 2, name: 'First Mesocycle', icon: Target, color: 'text-blue-500', earned: mesocycles.length > 0 },
    { id: 3, name: '50 Workouts', icon: Trophy, color: 'text-yellow-500', earned: stats.completedWorkouts >= 50 },
    { id: 4, name: '100 Workouts', icon: Award, color: 'text-purple-500', earned: stats.completedWorkouts >= 100 },
  ]

  const menuSections = [
    {
      title: 'Account',
      items: [
        { icon: Edit3, label: 'Edit Profile', onClick: () => {} },
        { icon: Bell, label: 'Notifications', onClick: () => {} },
        { icon: Moon, label: 'Dark Mode', onClick: () => {} },
      ]
    },
    {
      title: 'Support',
      items: [
        { icon: HelpCircle, label: 'Help & FAQ', onClick: () => {} },
        { icon: Shield, label: 'Privacy Policy', onClick: () => {} },
        { icon: Settings, label: 'Settings', onClick: () => {} },
      ]
    }
  ]

  if (loading) {
    return (
      <div className="space-y-6 pb-20">
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg font-medium">
              {userData.name.charAt(0).toUpperCase()}
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-medium">{userData.name}</h2>
              <p className="text-sm text-gray-500">{userData.email}</p>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{userData.level}</Badge>
                <Badge variant="outline" className="text-xs">
                  Member since {userData.memberSince}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Training Stats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1 text-center">
              <p className="text-2xl font-medium">{stats.completedWorkouts}</p>
              <p className="text-xs text-gray-500">Workouts Done</p>
            </div>
            <div className="space-y-1 text-center">
              <p className="text-2xl font-medium">{userData.currentStreak}</p>
              <p className="text-xs text-gray-500">Day Streak</p>
            </div>
            <div className="space-y-1 text-center">
              <p className="text-2xl font-medium">{stats.successRate}%</p>
              <p className="text-xs text-gray-500">Success Rate</p>
            </div>
            <div className="space-y-1 text-center">
              <p className="text-2xl font-medium">{mesocycles.length}</p>
              <p className="text-xs text-gray-500">Total Plans</p>
            </div>
          </div>
          
          <div className="pt-4 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <p className="font-medium">{mesocycles.length}</p>
                <p className="text-gray-500">Total Plans</p>
              </div>
              <div>
                <p className="font-medium">{stats.activeMesocycles}</p>
                <p className="text-gray-500">Active Plans</p>
              </div>
              <div>
                <p className="font-medium">{stats.completedMesocycles}</p>
                <p className="text-gray-500">Completed</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {achievements.map((achievement) => {
              const IconComponent = achievement.icon
              return (
                <div
                  key={achievement.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                    achievement.earned 
                      ? 'bg-gray-50 border-gray-200' 
                      : 'bg-gray-100 border-gray-200 opacity-60'
                  }`}
                >
                  <IconComponent 
                    className={`h-5 w-5 ${achievement.earned ? achievement.color : 'text-gray-400'}`} 
                  />
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">{achievement.name}</p>
                    {achievement.earned && (
                      <p className="text-xs text-green-600">Earned!</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Menu Sections */}
      {menuSections.map((section) => (
        <Card key={section.title}>
          <CardHeader>
            <CardTitle className="text-lg">{section.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {section.items.map((item, index) => {
              const IconComponent = item.icon
              return (
                <Button
                  key={index}
                  variant="ghost"
                  className="w-full justify-start h-12"
                  onClick={item.onClick}
                >
                  <IconComponent className="h-5 w-5 mr-3" />
                  {item.label}
                </Button>
              )
            })}
          </CardContent>
        </Card>
      ))}

      {/* Logout */}
      <Card>
        <CardContent className="p-4">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-red-600 hover:text-red-700"
            onClick={signOut}
          >
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
