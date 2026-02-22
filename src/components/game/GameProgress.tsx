import { Clock } from 'lucide-react'
import type { GameSession, Story } from '@/types/game.types'
import { formatDate } from '@/lib/utils'

interface GameProgressProps {
  session: GameSession
  story: Story
  visitCount: number
}

export function GameProgress({ session, story, visitCount }: GameProgressProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
      <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
        Progression
      </h3>
      <p className="text-sm font-medium text-gray-800">{story.title}</p>
      <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          Débuté le {formatDate(session.started_at)}
        </span>
        <span>{visitCount} scène{visitCount > 1 ? 's' : ''} visitée{visitCount > 1 ? 's' : ''}</span>
      </div>
    </div>
  )
}
