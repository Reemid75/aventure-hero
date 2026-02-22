'use client'

import { Plus, Star, Trophy, Skull, BookOpen } from 'lucide-react'
import type { Scene } from '@/types/game.types'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

interface SceneListProps {
  scenes: Scene[]
  selectedId: string | null
  onSelect: (scene: Scene) => void
  onNew: () => void
}

export function SceneList({ scenes, selectedId, onSelect, onNew }: SceneListProps) {
  return (
    <aside className="flex h-full w-64 flex-col border-r border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-100 p-4">
        <h2 className="text-sm font-semibold text-gray-700">Scènes</h2>
        <Button size="sm" onClick={onNew} variant="ghost">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {scenes.length === 0 && (
          <p className="p-4 text-xs text-gray-400">
            Aucune scène. Créez-en une !
          </p>
        )}
        {scenes.map((scene) => (
          <button
            key={scene.id}
            onClick={() => onSelect(scene)}
            className={cn(
              'flex w-full items-start gap-2 px-4 py-3 text-left transition hover:bg-gray-50',
              selectedId === scene.id && 'bg-indigo-50 border-r-2 border-indigo-500'
            )}
          >
            <span className="mt-0.5 flex-shrink-0">
              {scene.is_start ? (
                <Star className="h-4 w-4 text-yellow-500" />
              ) : scene.is_ending && scene.ending_type === 'victory' ? (
                <Trophy className="h-4 w-4 text-green-500" />
              ) : scene.is_ending && scene.ending_type === 'defeat' ? (
                <Skull className="h-4 w-4 text-red-500" />
              ) : (
                <BookOpen className="h-4 w-4 text-gray-400" />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-800">
                {scene.title}
              </p>
              <div className="mt-0.5 flex gap-1">
                {scene.is_start && (
                  <Badge variant="warning" className="text-[10px] px-1.5 py-0">Départ</Badge>
                )}
                {scene.is_ending && (
                  <Badge
                    variant={
                      scene.ending_type === 'victory'
                        ? 'success'
                        : scene.ending_type === 'defeat'
                        ? 'danger'
                        : 'default'
                    }
                    className="text-[10px] px-1.5 py-0"
                  >
                    Fin
                  </Badge>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </aside>
  )
}
