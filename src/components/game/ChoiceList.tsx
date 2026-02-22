'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Lock } from 'lucide-react'
import type { Choice, SceneRequirements } from '@/types/game.types'

interface ChoiceListProps {
  choices: Choice[]
  sessionId: string
  journal: string[]
  sceneRequirements: SceneRequirements
}

export function ChoiceList({ choices, sessionId, journal, sceneRequirements }: ChoiceListProps) {
  const router = useRouter()
  const [pending, setPending] = useState<string | null>(null)

  const sorted = [...choices].sort((a, b) => a.order_index - b.order_index)

  function getMissingKeywords(choice: Choice): string[] {
    const required = sceneRequirements[choice.to_scene_id] ?? []
    return required.filter((kw) => !journal.includes(kw))
  }

  async function handleChoice(choiceId: string) {
    setPending(choiceId)

    const res = await fetch(`/api/sessions/${sessionId}/navigate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ choiceId }),
    })

    const data = await res.json()

    if (!res.ok) {
      setPending(null)
      alert(data.error ?? 'Une erreur est survenue')
      return
    }

    if (data.isEnding) {
      router.push(`/play/${sessionId}/end`)
    } else {
      setPending(null)
      router.refresh()
    }
  }

  if (sorted.length === 0) {
    return (
      <p className="text-sm text-gray-500 italic">
        Il n&apos;y a pas de suite à cette scène.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
        Que faites-vous ?
      </p>
      {sorted.map((choice) => {
        const missing = getMissingKeywords(choice)
        const isLocked = missing.length > 0
        const isLoading = pending === choice.id

        return (
          <button
            key={choice.id}
            onClick={() => !isLocked && handleChoice(choice.id)}
            disabled={pending !== null || isLocked}
            className={[
              'group flex w-full items-start justify-between rounded-xl border px-5 py-4 text-left text-sm font-medium transition',
              isLocked
                ? 'cursor-not-allowed border-gray-200 bg-gray-50 opacity-70'
                : 'cursor-pointer border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50 disabled:opacity-60',
            ].join(' ')}
          >
            <div className="flex-1 space-y-1">
              <span className={isLocked ? 'text-gray-400' : 'text-gray-800'}>
                {choice.label}
              </span>
              {isLocked && (
                <p className="flex flex-wrap gap-1 text-xs text-gray-400">
                  Nécessite :
                  {missing.map((kw) => (
                    <span
                      key={kw}
                      className="rounded-full bg-gray-200 px-2 py-0.5 font-medium text-gray-500"
                    >
                      {kw}
                    </span>
                  ))}
                </p>
              )}
            </div>
            <span className="ml-3 mt-0.5 flex-shrink-0">
              {isLoading ? (
                <svg className="h-4 w-4 animate-spin text-indigo-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : isLocked ? (
                <Lock className="h-4 w-4 text-gray-400" />
              ) : (
                <ArrowRight className="h-4 w-4 text-gray-400 transition group-hover:text-indigo-500" />
              )}
            </span>
          </button>
        )
      })}
    </div>
  )
}
