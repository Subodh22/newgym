'use client'

import { useState } from 'react'
import { Calendar, Clock, Play, CheckCircle } from 'lucide-react'
import MesocycleDetail from './MesocycleDetail'

interface MesocycleListProps {
  mesocycles: any[]
  onUpdate: () => void
}

export default function MesocycleList({ mesocycles, onUpdate }: MesocycleListProps) {
  const [selectedMesocycle, setSelectedMesocycle] = useState<any>(null)

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mesocycles.map((mesocycle) => (
          <div
            key={mesocycle.id}
            className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setSelectedMesocycle(mesocycle)}
          >
            <div className="p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 truncate">
                  {mesocycle.name}
                </h3>
                {mesocycle.is_active && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <Play className="h-3 w-3 mr-1" />
                    Active
                  </span>
                )}
              </div>
              
              <div className="mt-4 space-y-2">
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-2" />
                  {mesocycle.number_of_weeks} weeks
                </div>
                
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-2" />
                  {mesocycle.weeks?.length || 0} weeks created
                </div>
                
                {mesocycle.start_date && (
                  <div className="flex items-center text-sm text-gray-500">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Started: {new Date(mesocycle.start_date).toLocaleDateString()}
                  </div>
                )}
              </div>
              
              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{Math.round(((mesocycle.weeks?.length || 0) / mesocycle.number_of_weeks) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.min(((mesocycle.weeks?.length || 0) / mesocycle.number_of_weeks) * 100, 100)}%`
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mesocycle Detail Modal */}
      {selectedMesocycle && (
        <MesocycleDetail
          mesocycle={selectedMesocycle}
          onClose={() => setSelectedMesocycle(null)}
          onUpdate={onUpdate}
        />
      )}
    </>
  )
}
