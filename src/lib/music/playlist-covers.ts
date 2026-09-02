/**
 * Returns a deterministic gradient CSS string based on playlist name.
 * Used as fallback (or replacement) for remote cover images that may fail.
 */
export function getPlaylistGradient(name: string): string {
  const gradients: Record<string, string> = {
    'Peaceful Piano': 'linear-gradient(135deg, #a78bfa 0%, #818cf8 50%, #6366f1 100%)',
    'Deep Focus':     'linear-gradient(135deg, #1e293b 0%, #334155 50%, #0f172a 100%)',
    'Lofi Beats':     'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #92400e 100%)',
    'Beast Mode Workout': 'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #991b1b 100%)',
    'Morning Acoustic':   'linear-gradient(135deg, #fde68a 0%, #fb923c 50%, #f97316 100%)',
    'Mindfulness & Meditation': 'linear-gradient(135deg, #6ee7b7 0%, #34d399 50%, #059669 100%)',
  }
  return gradients[name] ?? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
}

/**
 * Returns an emoji icon for the playlist.
 */
export function getPlaylistEmoji(name: string): string {
  const icons: Record<string, string> = {
    'Peaceful Piano': '🎹',
    'Deep Focus':     '🌌',
    'Lofi Beats':     '🎧',
    'Beast Mode Workout': '🏋️',
    'Morning Acoustic':   '🌅',
    'Mindfulness & Meditation': '🧘',
  }
  return icons[name] ?? '🎵'
}
