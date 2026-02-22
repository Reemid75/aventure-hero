'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen, Play } from 'lucide-react'
import type { Story } from '@/types/game.types'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

interface StoryCardProps {
  story: Story & { scenes_count?: number }
  hasActiveSession?: boolean
  sessionId?: string
}

export function StoryCard({ story, hasActiveSession, sessionId }: StoryCardProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handlePlay() {
    if (hasActiveSession && sessionId) {
      router.push(`/play/${sessionId}`)
      return
    }
    setLoading(true)
    const res = await fetch(`/api/stories/${story.id}/start`, { method: 'POST' })
    const data = await res.json()
    setLoading(false)
    if (data.sessionId) {
      router.push(`/play/${data.sessionId}`)
    }
  }

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex h-32 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100">
        <BookOpen className="h-12 w-12 text-indigo-400" />
      </div>
      <div className="flex-1 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-900">{story.title}</h3>
          {hasActiveSession && (
            <Badge variant="info" className="shrink-0">En cours</Badge>
          )}
        </div>
        {story.description && (
          <p className="text-sm text-gray-500 line-clamp-2">{story.description}</p>
        )}
      </div>
      <Button onClick={handlePlay} loading={loading} className="w-full">
        <Play className="h-4 w-4" />
        {hasActiveSession ? 'Continuer' : 'Jouer'}
      </Button>
    </Card>
  )
}
