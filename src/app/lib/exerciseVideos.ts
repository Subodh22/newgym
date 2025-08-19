// Simple helper to resolve a tutorial video URL for an exercise.
// For now, we default to the provided playlist, and include a few
// keyword-based mappings that can be expanded over time.

const PLAYLIST_ID = 'PLyqKj7LwU2RsCtKw3UlE85HYgPM3-xoO1'

type VideoRule = {
  keywords: string[]
  url: string
}

// Extendable keyword → URL rules. Keep everything lowercase.
const RULES: VideoRule[] = [
  { keywords: ['pull up', 'pull-up', 'pullups'], url: `https://www.youtube.com/playlist?list=${PLAYLIST_ID}` },
  { keywords: ['lat pulldown', 'pulldown'], url: `https://www.youtube.com/playlist?list=${PLAYLIST_ID}` },
  { keywords: ['barbell row', 'bent-over row', 'rows'], url: `https://www.youtube.com/playlist?list=${PLAYLIST_ID}` },
  { keywords: ['bench', 'press', 'chest'], url: `https://www.youtube.com/playlist?list=${PLAYLIST_ID}` },
  { keywords: ['overhead press', 'shoulder press'], url: `https://www.youtube.com/playlist?list=${PLAYLIST_ID}` },
  { keywords: ['lateral raise'], url: `https://www.youtube.com/playlist?list=${PLAYLIST_ID}` },
  { keywords: ['squat'], url: `https://www.youtube.com/playlist?list=${PLAYLIST_ID}` },
  { keywords: ['rdl', 'romanian deadlift', 'stiff-leg'], url: `https://www.youtube.com/playlist?list=${PLAYLIST_ID}` },
  { keywords: ['leg press'], url: `https://www.youtube.com/playlist?list=${PLAYLIST_ID}` },
  { keywords: ['leg extension'], url: `https://www.youtube.com/playlist?list=${PLAYLIST_ID}` },
  { keywords: ['calf raise'], url: `https://www.youtube.com/playlist?list=${PLAYLIST_ID}` },
  { keywords: ['hip thrust', 'glute bridge'], url: `https://www.youtube.com/playlist?list=${PLAYLIST_ID}` },
]

const PLAYLIST_URL = `https://www.youtube.com/playlist?list=${PLAYLIST_ID}`

export function getExerciseVideoUrl(exerciseName: string): string | null {
  const name = (exerciseName || '').toLowerCase()
  for (const rule of RULES) {
    if (rule.keywords.some(k => name.includes(k))) {
      return rule.url
    }
  }
  // Fallback to playlist if nothing matched
  return PLAYLIST_URL
}

export function toYouTubeEmbed(url: string): string {
  // Convert playlist page to embeddable playlist player
  const playlistMatch = url.match(/list=([a-zA-Z0-9_-]+)/)
  if (playlistMatch) {
    return `https://www.youtube.com/embed/videoseries?list=${playlistMatch[1]}`
  }
  // Default to given URL inside embed
  return url
}


