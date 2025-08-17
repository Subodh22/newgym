'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Trophy, Calendar, Target, TrendingUp } from 'lucide-react'

interface MesocycleCompletionProps {
  mesocycleName: string
  totalWeeks: number
  completedWeeks: number
  onBack: () => void
  onCreateNewMesocycle: () => void
}

export default function MesocycleCompletion({
  mesocycleName,
  totalWeeks,
  completedWeeks,
  onBack,
  onCreateNewMesocycle
}: MesocycleCompletionProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-4">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">
            Mesocycle Complete!
          </CardTitle>
          <CardDescription className="text-gray-600">
            Congratulations on finishing your training block!
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Mesocycle Details */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
            <h3 className="font-semibold text-lg text-gray-800 mb-2">
              {mesocycleName}
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{completedWeeks} of {totalWeeks} weeks completed</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                <span>100% completion rate</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span>Progressive overload achieved</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Progress</span>
              <span className="font-semibold text-green-600">100%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-500"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            <Button 
              onClick={onCreateNewMesocycle}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3"
            >
              Start New Mesocycle
            </Button>
            <Button 
              onClick={onBack}
              variant="outline" 
              className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Back to Dashboard
            </Button>
          </div>

          {/* Celebration Message */}
          <div className="text-center pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              🎉 You&apos;ve successfully completed your training mesocycle! 
              Time to plan your next block or take a well-deserved deload week.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
