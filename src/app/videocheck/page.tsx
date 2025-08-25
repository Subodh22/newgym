'use client'

import { useState, useEffect } from 'react'
import { getAllExercises, getExerciseEmbedUrl, getMuscleGroups } from '@/app/lib/exerciseVideos'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Badge } from '@/app/components/ui/badge'
import { Input } from '@/app/components/ui/input'
import { Play, X, Check, Edit, Eye } from 'lucide-react'

interface ExerciseWithVideo {
  name: string
  muscleGroup: string
  hasVideo: boolean
  videoUrl: string | null
  embedUrl: string | null
  status: 'keep' | 'remove' | 'change' | 'add' | null
  newVideoUrl?: string
}

// Stored override shape
interface StoredOverride {
  status: 'keep' | 'remove' | 'change' | 'add'
  videoUrl: string | null
  embedUrl: string | null
  updatedAt: number
}

const STORAGE_KEY = 'videocheck_overrides_v1'

// Convert common YouTube URL formats to embed URL
function toEmbed(url: string): string | null {
  if (!url) return null
  try {
    const u = new URL(url)
    const host = u.hostname.replace('www.', '')

    // youtube.com/watch?v=VIDEOID
    if (host.includes('youtube.com') && u.searchParams.get('v')) {
      const id = u.searchParams.get('v') || ''
      return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&showinfo=0&controls=1&disablekb=1&fs=1&iv_load_policy=3&cc_load_policy=0&autoplay=0`
    }

    // youtu.be/VIDEOID
    if (host === 'youtu.be') {
      const id = u.pathname.split('/').filter(Boolean)[0]
      if (id) {
        return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&showinfo=0&controls=1&disablekb=1&fs=1&iv_load_policy=3&cc_load_policy=0&autoplay=0`
      }
    }

    // youtube.com/shorts/VIDEOID
    if (host.includes('youtube.com') && u.pathname.startsWith('/shorts/')) {
      const id = u.pathname.split('/').filter(Boolean)[1]
      if (id) {
        return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&showinfo=0&controls=1&disablekb=1&fs=1&iv_load_policy=3&cc_load_policy=0&autoplay=0`
      }
    }
  } catch (_) {
    return null
  }
  return null
}

export default function VideoCheckPage() {
  const [exercises, setExercises] = useState<ExerciseWithVideo[]>(() => {
    const allExercises = getAllExercises()
    
    // Create a comprehensive list of all exercises with their video status
    const exerciseList: ExerciseWithVideo[] = []
    
    // Add exercises from database
    allExercises.forEach(exercise => {
      const embedUrl = getExerciseEmbedUrl(exercise.name)
      exerciseList.push({
        name: exercise.name,
        muscleGroup: exercise.muscleGroup,
        hasVideo: !!embedUrl,
        videoUrl: exercise.videoUrl,
        embedUrl,
        status: null
      })
    })
    
    // Add exercises from VIDEO_MAPPINGS that might not be in database
    const videoMappings = [
      'Barbell Bench Press', 'Bench Press', 'Flat Barbell Bench Press',
      'Incline Barbell Bench Press', 'Decline Barbell Bench Press',
      'Dumbbell Bench Press', 'Incline Dumbbell Bench Press',
      'Decline Dumbbell Bench Press', 'Cable Flye', 'Dumbbell Flye',
      'Incline Dumbbell Flye', 'Decline Dumbbell Flye', 'Push Up',
      'Pushup', 'Diamond Push Up', 'Wide Push Up', 'Close Grip Bench Press',
      'Pull Up', 'Pullup', 'Pull-up', 'Chin Up', 'Lat Pulldown',
      'Barbell Row', 'Dumbbell Row', 'Cable Row', 'T-Bar Row',
      'Bent Over Row', 'Pendlay Row', 'Yates Row', 'Single Arm Dumbbell Row',
      'Cable Single Arm Row', 'Machine Row', 'Overhead Press',
      'Military Press', 'Standing Barbell Shoulder Press',
      'Standing Dumbbell Shoulder Press', 'Dumbbell Lateral Raise',
      'Cable Lateral Raise', 'Face Pull', 'Squat', 'Romanian Deadlift',
      'Leg Curl', 'Standing Calf Raise', 'Seated Calf Raise',
      'Curl', 'Bicep Curl', 'Biceps Curl', 'Dumbbell Curl',
      'Tricep Pushdown', 'Dips', 'Cable Flye', 'Cable Bent Flye',
      'Cable Underhand Flye', 'Cambered Bar Bench Press', 'Deficit Pushup',
      'Flat Dumbbell Bench Press', 'Flat Dumbbell Flye', 'Flat Dumbbell Press Flye',
      'Flat Hammer Machine Press', 'Hammer Machine Chest Press',
      'High Incline Dumbbell Press', 'Incline Dumbbell Flye',
      'Incline Dumbbell Press', 'Incline Dumbbell Press Flye',
      'Incline Machine Chest Press', 'Incline Medium Grip Bench Press',
      'Incline Narrow Grip Bench Press', 'Incline Wide Grip Bench Press',
      'Low Incline Dumbbell Press', 'Machine Chest Press', 'Machine Flye',
      'Medium Grip Bench Press', 'Narrow Pushup', 'Narrow Grip Bench Press',
      'Pec Deck Flye', 'Smith Machine Bench Press', 'Smith Machine Incline Press',
      'Smith Machine Narrow Grip Bench Press', 'Smith Machine Narrow Grip Incline Press',
      'Smith Machine Wide Grip Bench Press', 'Smith Machine Wide Grip Incline Press',
      'Wide Grip Bench Press', 'Assisted Normal Grip Pullup', 'Assisted Parallel Pullup',
      'Assisted Underhand Pullup', 'Assisted Wide Grip Pullup', 'Barbell Bent Over Row',
      'Barbell Row to Chest', 'Cambered Bar Row', 'Chest Supported Row',
      'Dumbbell Pullover', 'Hammer High Row', 'Hammer Low Row',
      'Incline Dumbbell Row', 'Inverted Row', 'Machine Chest Supported Row',
      'Machine Pullover', 'Normal Grip Pulldown', 'Normal Grip Pullup',
      'Parallel Pulldown', 'Parallel Grip Pullup', 'Seal Row',
      'Seated Cable Row', 'Two Arm Dumbbell Row', 'Single Arm Supported Dumbbell Row',
      'Smith Machine Row', 'Straight Arm Pulldown', 'T Bar Row',
      'Underhand EZ Bar Row', 'Underhand Pulldown', 'Wide Grip Pulldown',
      'Wide Grip Pullup', 'Underhand Pullup', 'Barbell Flexion Row'
    ]
    
    videoMappings.forEach(exerciseName => {
      const embedUrl = getExerciseEmbedUrl(exerciseName)
      if (!exerciseList.find(ex => ex.name === exerciseName)) {
        exerciseList.push({
          name: exerciseName,
          muscleGroup: 'Unknown',
          hasVideo: !!embedUrl,
          videoUrl: null,
          embedUrl,
          status: null
        })
      }
    })
    
    return exerciseList.sort((a, b) => a.name.localeCompare(b.name))
  })
  
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>('All')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedExercise, setSelectedExercise] = useState<ExerciseWithVideo | null>(null)
  const [showVideo, setShowVideo] = useState(false)
  const [editingVideo, setEditingVideo] = useState<string>('')
  const [newVideoUrl, setNewVideoUrl] = useState('')

  const muscleGroups = ['All', ...getMuscleGroups()]

  // Load overrides once on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const overrides = JSON.parse(raw) as Record<string, StoredOverride>
      setExercises(prev => prev.map(ex => {
        const ov = overrides[ex.name]
        if (!ov) return ex
        return {
          ...ex,
          status: ov.status,
          hasVideo: ov.status !== 'remove' && !!ov.embedUrl,
          videoUrl: ov.videoUrl,
          embedUrl: ov.embedUrl
        }
      }))
    } catch {}
  }, [])

  const saveOverrides = (list: ExerciseWithVideo[]) => {
    const map: Record<string, StoredOverride> = {}
    list.forEach(ex => {
      if (ex.status) {
        map[ex.name] = {
          status: ex.status,
          videoUrl: ex.videoUrl,
          embedUrl: ex.embedUrl,
          updatedAt: Date.now()
        }
      }
    })
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
  }

  const updateExercises = (updater: (arr: ExerciseWithVideo[]) => ExerciseWithVideo[]) => {
    setExercises(prev => {
      const next = updater(prev)
      saveOverrides(next)
      return next
    })
  }

  const filteredExercises = exercises.filter(exercise => {
    const matchesMuscleGroup = selectedMuscleGroup === 'All' || exercise.muscleGroup === selectedMuscleGroup
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesMuscleGroup && matchesSearch
  })

  const handleKeepVideo = (exerciseName: string) => {
    updateExercises(prev => prev.map(ex => 
      ex.name === exerciseName 
        ? { ...ex, status: 'keep' as const }
        : ex
    ))
  }

  const handleRemoveVideo = (exerciseName: string) => {
    updateExercises(prev => prev.map(ex => 
      ex.name === exerciseName 
        ? { ...ex, status: 'remove' as const, hasVideo: false, embedUrl: null, videoUrl: null }
        : ex
    ))
    if (selectedExercise?.name === exerciseName) {
      setSelectedExercise({ ...selectedExercise, hasVideo: false, embedUrl: null, videoUrl: null })
    }
  }

  const handleChangeVideo = (exerciseName: string) => {
    if (!newVideoUrl.trim()) return
    const embedUrl = toEmbed(newVideoUrl.trim())
    updateExercises(prev => prev.map(ex => 
      ex.name === exerciseName 
        ? { 
            ...ex, 
            status: 'change' as const, 
            newVideoUrl: newVideoUrl.trim(),
            hasVideo: !!embedUrl,
            videoUrl: newVideoUrl.trim(),
            embedUrl: embedUrl
          }
        : ex
    ))
    if (selectedExercise?.name === exerciseName) {
      setSelectedExercise({
        ...selectedExercise,
        hasVideo: !!embedUrl,
        videoUrl: newVideoUrl.trim(),
        embedUrl: embedUrl
      })
    }
    setNewVideoUrl('')
    setEditingVideo('')
  }

  const handleAddVideo = (exerciseName: string) => {
    if (!newVideoUrl.trim()) return
    const embedUrl = toEmbed(newVideoUrl.trim())
    updateExercises(prev => prev.map(ex => 
      ex.name === exerciseName 
        ? { 
            ...ex, 
            status: 'add' as const, 
            newVideoUrl: newVideoUrl.trim(),
            hasVideo: !!embedUrl,
            videoUrl: newVideoUrl.trim(),
            embedUrl: embedUrl
          }
        : ex
    ))
    if (selectedExercise?.name === exerciseName) {
      setSelectedExercise({
        ...selectedExercise,
        hasVideo: !!embedUrl,
        videoUrl: newVideoUrl.trim(),
        embedUrl: embedUrl
      })
    }
    setNewVideoUrl('')
    setEditingVideo('')
  }

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'keep': return 'bg-green-100 text-green-800 border-green-200'
      case 'remove': return 'bg-red-100 text-red-800 border-red-200'
      case 'change': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'add': return 'bg-purple-100 text-purple-800 border-purple-200'
      default: return ''
    }
  }

  const getMuscleGroupColor = (muscleGroup: string) => {
    const colors: Record<string, string> = {
      'Chest': 'bg-red-100 text-red-800',
      'Back': 'bg-blue-100 text-blue-800',
      'Shoulders': 'bg-green-100 text-green-800',
      'Legs': 'bg-purple-100 text-purple-800',
      'Arms': 'bg-yellow-100 text-yellow-800',
      'Abs': 'bg-pink-100 text-pink-800',
      'Forearms': 'bg-gray-100 text-gray-800',
      'Unknown': 'bg-gray-100 text-gray-800'
    }
    return colors[muscleGroup] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Exercise Video Check</h1>
          <p className="text-gray-600">Review all exercises and their videos. Decide which to keep, remove, or change.</p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Search exercises..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <select
            value={selectedMuscleGroup}
            onChange={(e) => setSelectedMuscleGroup(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {muscleGroups.map(group => (
              <option key={group} value={group}>{group}</option>
            ))}
          </select>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{filteredExercises.length}</div>
              <div className="text-sm text-gray-600">Total Exercises</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {filteredExercises.filter(ex => ex.hasVideo).length}
              </div>
              <div className="text-sm text-gray-600">With Videos</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">
                {filteredExercises.filter(ex => !ex.hasVideo).length}
              </div>
              <div className="text-sm text-gray-600">Without Videos</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round((filteredExercises.filter(ex => ex.hasVideo).length / filteredExercises.length) * 100)}%
              </div>
              <div className="text-sm text-gray-600">Video Coverage</div>
            </CardContent>
          </Card>
        </div>

        {/* Exercise List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredExercises.map((exercise) => (
            <Card key={exercise.name} className={`hover:shadow-lg transition-shadow ${getStatusColor(exercise.status)}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      {exercise.name}
                    </CardTitle>
                    <Badge className={`mt-2 ${getMuscleGroupColor(exercise.muscleGroup)}`}>
                      {exercise.muscleGroup}
                    </Badge>
                    {exercise.status && (
                      <Badge className={`mt-1 ${getStatusColor(exercise.status)}`}>
                        {exercise.status === 'keep' && '✅ Keep'}
                        {exercise.status === 'remove' && '❌ Remove'}
                        {exercise.status === 'change' && '🔄 Change'}
                        {exercise.status === 'add' && '➕ Add'}
                      </Badge>
                    )}
                  </div>
                  <div className="ml-2">
                    {exercise.hasVideo ? (
                      <Badge className="bg-green-100 text-green-800">Has Video</Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-800">No Video</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {exercise.hasVideo && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedExercise(exercise)
                          setShowVideo(true)
                        }}
                        className="flex-1"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Preview Video
                      </Button>
                    </div>
                  )}
                  
                  {editingVideo !== exercise.name && (
                    <div className="flex gap-2">
                      {exercise.hasVideo ? (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleKeepVideo(exercise.name)}
                            className="flex-1 bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                            disabled={exercise.status === 'keep'}
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Keep Video
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRemoveVideo(exercise.name)}
                            className="flex-1 bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                            disabled={exercise.status === 'remove'}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Remove Video
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingVideo(exercise.name)}
                            className="flex-1 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Change
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingVideo(exercise.name)}
                          className="flex-1 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Add Video
                        </Button>
                      )}
                    </div>
                  )}

                  {editingVideo === exercise.name && (
                    <div className="space-y-2">
                      <Input
                        placeholder="Enter YouTube URL..."
                        value={newVideoUrl}
                        onChange={(e) => setNewVideoUrl(e.target.value)}
                        className="text-sm"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => exercise.hasVideo 
                            ? handleChangeVideo(exercise.name)
                            : handleAddVideo(exercise.name)
                          }
                          className="flex-1"
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingVideo('')
                            setNewVideoUrl('')
                          }}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Video Modal */}
        {showVideo && selectedExercise && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold">
                  {selectedExercise.name} - Video Preview
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowVideo(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="p-4">
                {selectedExercise.embedUrl ? (
                  <div className="aspect-video w-full">
                    <iframe
                      src={selectedExercise.embedUrl}
                      title={selectedExercise.name}
                      className="w-full h-full rounded"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="aspect-video w-full bg-gray-100 flex items-center justify-center">
                    <p className="text-gray-500">No video available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 