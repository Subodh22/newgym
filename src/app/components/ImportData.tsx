'use client'

import { useState } from 'react'
import { useSupabaseAuth } from '@/lib/hooks/useSupabaseAuth'
import { X, Upload, FileText } from 'lucide-react'

interface ImportDataProps {
  onClose: () => void
  onSuccess: () => void
}

export default function ImportData({ onClose, onSuccess }: ImportDataProps) {
  const { user } = useSupabaseAuth()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [jsonData, setJsonData] = useState('')

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string
          setJsonData(content)
          setMessage('')
        } catch (error) {
          setMessage('Error reading file')
        }
      }
      reader.readAsText(file)
    }
  }

  const handleImport = async () => {
    if (!user || !jsonData) return

    setLoading(true)
    setMessage('')

    try {
      const data = JSON.parse(jsonData)
      
      // Check if it's the full mesocycle data structure
      const mesocycles = data.Mesocycles || [data]
      
      let importedCount = 0
      for (const mesocycleData of mesocycles) {
        const response = await fetch('/api/mesocycles/import', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            mesocycleData,
            userId: user.id
          })
        })

        const result = await response.json()
        
        if (result.success) {
          importedCount++
        } else {
          console.error('Import failed for mesocycle:', mesocycleData.Name, result.error)
        }
      }
      
      setMessage(`Successfully imported ${importedCount} mesocycle(s)!`)
      setTimeout(() => {
        onSuccess()
      }, 1500)
      
    } catch (error: any) {
      setMessage(`Import failed: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const loadSampleData = () => {
    // Load the sample mesocycle data structure
    const sampleData = `{
  "Name": "Sample Mesocycle",
  "NumberOfWeeks": 4,
  "Weeks": [
    {
      "id": 1,
      "Name": "Week 1",
      "Days": [
        {
          "id": 1,
          "DayName": "Monday - Push",
          "Exercises": [
            {
              "id": 1,
              "Name": "Bench Press",
              "Sets": [
                {
                  "id": 1,
                  "Weight": 135,
                  "Reps": 10,
                  "SetName": "Set 1"
                },
                {
                  "id": 2,
                  "Weight": 155,
                  "Reps": 8,
                  "SetName": "Set 2"
                },
                {
                  "id": 3,
                  "Weight": 175,
                  "Reps": 6,
                  "SetName": "Set 3"
                }
              ]
            },
            {
              "id": 2,
              "Name": "Shoulder Press",
              "Sets": [
                {
                  "id": 4,
                  "Weight": 95,
                  "Reps": 10,
                  "SetName": "Set 1"
                },
                {
                  "id": 5,
                  "Weight": 105,
                  "Reps": 8,
                  "SetName": "Set 2"
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}`
    setJsonData(sampleData)
    setMessage('Sample data loaded! You can edit it or click Import to proceed.')
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Import Mesocycle Data</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload JSON File
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <button
                onClick={loadSampleData}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FileText className="h-4 w-4 mr-1" />
                Load Sample
              </button>
            </div>
          </div>

          {/* JSON Editor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              JSON Data (you can edit this)
            </label>
            <textarea
              value={jsonData}
              onChange={(e) => setJsonData(e.target.value)}
              placeholder="Paste your mesocycle JSON data here..."
              className="w-full h-64 p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
            />
          </div>

          {/* Message */}
          {message && (
            <div className={`text-sm ${message.includes('Success') || message.includes('loaded') ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={loading || !jsonData}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              Import Data
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
