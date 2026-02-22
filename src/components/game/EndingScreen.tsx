'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Scene, Story, GameSession } from '@/types/game.types'
import { getEndingConfig, type EndingType } from '@/lib/game-engine/endings'
import { Button } from '@/components/ui/Button'
import { useState } from 'react'

interface EndingScreenProps {
  scene: Scene
  story: Story
  session: GameSession
}

export function EndingScreen({ scene, story }: EndingScreenProps) {
  const router = useRouter()
  const config = getEndingConfig(scene.ending_type as EndingType | null)
  const [loading, setLoading] = useState(false)

  async function handleReplay() {
    setLoading(true)
    const res = await fetch(`/api/stories/${story.id}/start`, { method: 'POST' })
    const data = await res.json()
    setLoading(false)
    if (data.sessionId) {
      router.push(`/play/${data.sessionId}`)
    }
  }

  return (
    <div className={`rounded-2xl border ${config.borderClass} ${config.bgClass} p-8 text-center`}>
      <div className="mb-4 text-6xl">{config.emoji}</div>
      <h2 className={`mb-2 text-3xl font-bold ${config.colorClass}`}>{config.title}</h2>
      <p className="mb-2 text-gray-600">{config.message}</p>
      <h3 className="mb-4 text-lg font-semibold text-gray-800">{scene.title}</h3>
      <div className="mx-auto mb-8 max-w-prose text-gray-700">
        <p>{scene.content}</p>
      </div>

      <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Button onClick={handleReplay} loading={loading}>
          Rejouer
        </Button>
        <Link href="/stories">
          <Button variant="outline">Autres histoires</Button>
        </Link>
      </div>
    </div>
  )
}
