'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { CheckCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface ExerciseFeedbackProps {
  exerciseName: string
  muscleGroup: string
  onSubmit: (feedback: ExerciseFeedbackData) => void
  onSkip: () => void
  loading?: boolean
}

interface ExerciseFeedbackData {
  exerciseName: string
  muscleGroup: string
  difficulty: 'easy' | 'moderate' | 'hard' | 'too_hard'
  soreness: 'none' | 'light' | 'moderate' | 'severe'
  performance: 'improved' | 'maintained' | 'decreased'
}

export function ExerciseFeedback({ exerciseName, muscleGroup, onSubmit, onSkip, loading }: ExerciseFeedbackProps) {
  const [feedback, setFeedback] = useState<ExerciseFeedbackData>({
    exerciseName,
    muscleGroup,
    difficulty: 'moderate',
    soreness: 'light',
    performance: 'maintained'
  })

  const handleFeedbackChange = (field: keyof ExerciseFeedbackData, value: any) => {
    setFeedback(prev => ({ ...prev, [field]: value }))
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
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          Exercise Feedback
        </CardTitle>
        <p className="text-sm text-gray-600">
          How did <strong>{exerciseName}</strong> feel? This helps optimize your training.
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Difficulty */}
        <div>
          <label className="block text-sm font-medium mb-2">How difficult was this exercise?</label>
          <div className="grid grid-cols-4 gap-2">
            {(['easy', 'moderate', 'hard', 'too_hard'] as const).map((difficulty) => (
              <Button
                key={difficulty}
                variant={feedback.difficulty === difficulty ? "default" : "outline"}
                size="sm"
                onClick={() => handleFeedbackChange('difficulty', difficulty)}
                className="text-xs"
              >
                {difficulty.replace('_', ' ')}
              </Button>
            ))}
          </div>
        </div>

        {/* Soreness */}
        <div>
          <label className="block text-sm font-medium mb-2">How sore are you now?</label>
          <div className="grid grid-cols-4 gap-2">
            {(['none', 'light', 'moderate', 'severe'] as const).map((soreness) => (
              <Button
                key={soreness}
                variant={feedback.soreness === soreness ? "default" : "outline"}
                size="sm"
                onClick={() => handleFeedbackChange('soreness', soreness)}
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
                variant={feedback.performance === performance ? "default" : "outline"}
                size="sm"
                onClick={() => handleFeedbackChange('performance', performance)}
                className="text-xs flex items-center gap-1"
              >
                {getPerformanceIcon(performance)}
                {performance}
              </Button>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="flex gap-2 flex-wrap">
          <Badge className={getDifficultyColor(feedback.difficulty)}>
            {feedback.difficulty.replace('_', ' ')}
          </Badge>
          <Badge className={getSorenessColor(feedback.soreness)}>
            {feedback.soreness} soreness
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            {getPerformanceIcon(feedback.performance)}
            {feedback.performance}
          </Badge>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onSkip}
            disabled={loading}
            className="flex-1"
          >
            Skip
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1"
          >
            {loading ? 'Saving...' : 'Save Feedback'}
          </Button>
        </div>

        <div className="text-xs text-gray-500 text-center">
          <p>💡 This feedback helps adjust your next workout's volume and intensity.</p>
        </div>
      </CardContent>
    </Card>
  )
}
