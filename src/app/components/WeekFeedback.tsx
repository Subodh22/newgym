'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { CheckCircle, AlertCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface WeekFeedbackProps {
  weekNumber: number
  muscleGroups: string[]
  onSubmit: (feedback: any) => void
  onSkip: () => void
  loading?: boolean
}

interface MuscleGroupFeedback {
  muscleGroup: string
  difficulty: 'easy' | 'moderate' | 'hard' | 'too_hard'
  soreness: 'none' | 'light' | 'moderate' | 'severe'
  performance: 'improved' | 'maintained' | 'decreased'
  pumpQuality?: 1 | 2 | 3 | 4 | 5
  recovery?: 'poor' | 'fair' | 'good' | 'excellent'
}

export function WeekFeedback({ weekNumber, muscleGroups, onSubmit, onSkip, loading }: WeekFeedbackProps) {
  const [feedback, setFeedback] = useState<MuscleGroupFeedback[]>(
    muscleGroups.map(group => ({
      muscleGroup: group,
      difficulty: 'moderate',
      soreness: 'light',
      performance: 'maintained',
      pumpQuality: 3,
      recovery: 'good'
    }))
  )

  const handleFeedbackChange = (muscleGroup: string, field: keyof MuscleGroupFeedback, value: any) => {
    setFeedback(prev => 
      prev.map(f => 
        f.muscleGroup === muscleGroup 
          ? { ...f, [field]: value }
          : f
      )
    )
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100'
      case 'moderate': return 'text-blue-600 bg-blue-100'
      case 'hard': return 'text-orange-600 bg-orange-100'
      case 'too_hard': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getSorenessColor = (soreness: string) => {
    switch (soreness) {
      case 'none': return 'text-green-600 bg-green-100'
      case 'light': return 'text-blue-600 bg-blue-100'
      case 'moderate': return 'text-orange-600 bg-orange-100'
      case 'severe': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getPerformanceIcon = (performance: string) => {
    switch (performance) {
      case 'improved': return <TrendingUp className="h-4 w-4" />
      case 'maintained': return <Minus className="h-4 w-4" />
      case 'decreased': return <TrendingDown className="h-4 w-4" />
      default: return <Minus className="h-4 w-4" />
    }
  }

  const handleSubmit = () => {
    onSubmit(feedback)
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          Week {weekNumber} Feedback
        </CardTitle>
        <p className="text-sm text-gray-600">
          Help us optimize your next week&apos;s training by providing feedback on how this week felt.
          This will help adjust volume and intensity for better results.
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {feedback.map((muscleFeedback) => (
          <div key={muscleFeedback.muscleGroup} className="space-y-4 p-4 border rounded-lg">
            <h3 className="font-medium text-lg">{muscleFeedback.muscleGroup}</h3>
            
            {/* Difficulty */}
            <div>
              <label className="block text-sm font-medium mb-2">How difficult was this week?</label>
              <div className="grid grid-cols-4 gap-2">
                {(['easy', 'moderate', 'hard', 'too_hard'] as const).map((difficulty) => (
                  <Button
                    key={difficulty}
                    variant={muscleFeedback.difficulty === difficulty ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleFeedbackChange(muscleFeedback.muscleGroup, 'difficulty', difficulty)}
                    className="text-xs"
                  >
                    {difficulty.replace('_', ' ')}
                  </Button>
                ))}
              </div>
            </div>

            {/* Soreness */}
            <div>
              <label className="block text-sm font-medium mb-2">How sore were you?</label>
              <div className="grid grid-cols-4 gap-2">
                {(['none', 'light', 'moderate', 'severe'] as const).map((soreness) => (
                  <Button
                    key={soreness}
                    variant={muscleFeedback.soreness === soreness ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleFeedbackChange(muscleFeedback.muscleGroup, 'soreness', soreness)}
                    className="text-xs"
                  >
                    {soreness}
                  </Button>
                ))}
              </div>
            </div>

            {/* Performance */}
            <div>
              <label className="block text-sm font-medium mb-2">How was your performance?</label>
              <div className="grid grid-cols-3 gap-2">
                {(['improved', 'maintained', 'decreased'] as const).map((performance) => (
                  <Button
                    key={performance}
                    variant={muscleFeedback.performance === performance ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleFeedbackChange(muscleFeedback.muscleGroup, 'performance', performance)}
                    className="text-xs flex items-center gap-1"
                  >
                    {getPerformanceIcon(performance)}
                    {performance}
                  </Button>
                ))}
              </div>
            </div>

            {/* Pump Quality */}
            <div>
              <label className="block text-sm font-medium mb-2">Pump Quality (RP-style feedback)</label>
              <div className="grid grid-cols-5 gap-2">
                {([1, 2, 3, 4, 5] as const).map((quality) => (
                  <Button
                    key={quality}
                    variant={muscleFeedback.pumpQuality === quality ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleFeedbackChange(muscleFeedback.muscleGroup, 'pumpQuality', quality)}
                    className="text-xs"
                  >
                    {quality}⭐
                  </Button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">1 = Poor pump, 5 = Amazing pump</p>
            </div>

            {/* Recovery */}
            <div>
              <label className="block text-sm font-medium mb-2">Recovery Status</label>
              <div className="grid grid-cols-4 gap-2">
                {(['poor', 'fair', 'good', 'excellent'] as const).map((recovery) => (
                  <Button
                    key={recovery}
                    variant={muscleFeedback.recovery === recovery ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleFeedbackChange(muscleFeedback.muscleGroup, 'recovery', recovery)}
                    className="text-xs"
                  >
                    {recovery}
                  </Button>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="flex flex-wrap gap-2">
              <Badge className={getDifficultyColor(muscleFeedback.difficulty)}>
                {muscleFeedback.difficulty.replace('_', ' ')}
              </Badge>
              <Badge className={getSorenessColor(muscleFeedback.soreness)}>
                {muscleFeedback.soreness} soreness
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                {getPerformanceIcon(muscleFeedback.performance)}
                {muscleFeedback.performance}
              </Badge>
              <Badge variant="secondary">
                Pump: {muscleFeedback.pumpQuality}⭐
              </Badge>
              <Badge variant="secondary">
                Recovery: {muscleFeedback.recovery}
              </Badge>
            </div>
          </div>
        ))}

        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onSkip}
            disabled={loading}
            className="flex-1"
          >
            Skip Feedback
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1"
          >
            {loading ? 'Creating Next Week...' : 'Create Next Week'}
          </Button>
        </div>

        <div className="text-xs text-gray-500 text-center">
          <p>🧬 <strong>RP Autoregulation:</strong> Based on your feedback, we&apos;ll apply:</p>
          <p>• <strong>Volume adjustments</strong> using MEV/MAV/MRV landmarks</p>
          <p>• <strong>RIR progression</strong> (3→2→1→0 RIR across weeks)</p>
          <p>• <strong>Weight increases</strong> of 2.5% (adjusted by difficulty)</p>
          <p>• <strong>Pump & recovery feedback</strong> for optimal periodization</p>
          <p className="mt-2 font-medium">Following Dr. Mike Israetel&apos;s RP methodology</p>
        </div>
      </CardContent>
    </Card>
  )
}
