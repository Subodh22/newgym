'use client'

import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Info, TrendingUp, Target, Calendar } from 'lucide-react'

export function IsraetelInfo() {
  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Info className="h-5 w-5 text-blue-600" />
          <CardTitle className="text-blue-900">Mike Israetel's Renaissance Periodization</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-blue-800">
        <div>
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Volume Progression Strategy
          </h4>
          <div className="text-sm space-y-1">
            <p><strong>Week 1:</strong> Start at MEV (Minimum Effective Volume) - 3-4 RIR</p>
            <p><strong>Week 2:</strong> Add 1-2 sets per muscle group - 3 RIR</p>
            <p><strong>Week 3:</strong> Continue volume increase - 2 RIR</p>
            <p><strong>Week 4:</strong> Peak volume near MRV - 1 RIR</p>
            <p><strong>Week 5:</strong> Deload to maintenance volume - 4-5 RIR</p>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Target className="h-4 w-4" />
            Volume Landmarks (Sets per Week)
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="space-y-1">
              <p><strong>Chest:</strong> 10 → 16 → 22 sets</p>
              <p><strong>Back:</strong> 10 → 18 → 25 sets</p>
              <p><strong>Shoulders:</strong> 8 → 19 → 26 sets</p>
              <p><strong>Biceps:</strong> 6 → 17 → 20 sets</p>
            </div>
            <div className="space-y-1">
              <p><strong>Triceps:</strong> 8 → 17 → 20 sets</p>
              <p><strong>Quads:</strong> 8 → 15 → 20 sets</p>
              <p><strong>Hamstrings:</strong> 6 → 13 → 20 sets</p>
              <p><strong>Glutes:</strong> 6 → 12 → 16 sets</p>
            </div>
          </div>
          <p className="text-xs mt-2 opacity-80">
            MEV → MAV (Maximum Adaptive Volume) → MRV (Maximum Recoverable Volume)
          </p>
        </div>

        <div>
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Key Principles
          </h4>
          <div className="text-sm space-y-1">
            <p>• <strong>Progressive Overload:</strong> Prioritize volume increases over weight</p>
            <p>• <strong>Autoregulation:</strong> Adjust based on recovery indicators</p>
            <p>• <strong>Deload Necessity:</strong> Prevent overreaching with planned recovery</p>
            <p>• <strong>RIR Management:</strong> Control intensity through reps in reserve</p>
          </div>
        </div>

        <div className="bg-white/50 p-3 rounded-md">
          <p className="text-xs">
            <strong>Note:</strong> This program automatically calculates progressive volume increases 
            based on your muscle group selections and applies the scientifically-backed RP methodology 
            for optimal hypertrophy results.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
