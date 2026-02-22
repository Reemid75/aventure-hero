import type { SceneWithChoices } from '@/types/game.types'

interface SceneDisplayProps {
  scene: SceneWithChoices
}

export function SceneDisplay({ scene }: SceneDisplayProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900">{scene.title}</h2>
      <div
        className="prose prose-gray max-w-none text-gray-700"
        dangerouslySetInnerHTML={{ __html: scene.content.replace(/\n/g, '<br/>') }}
      />
    </div>
  )
}
