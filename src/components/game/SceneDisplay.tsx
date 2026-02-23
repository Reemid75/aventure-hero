import type { SceneWithChoices } from '@/types/game.types'

interface SceneDisplayProps {
  scene: SceneWithChoices
}

export function SceneDisplay({ scene }: SceneDisplayProps) {
  return (
    <div>
      {scene.visual_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={scene.visual_url}
          alt={scene.title}
          className="w-full rounded-t-xl object-cover"
          style={{ aspectRatio: '16/9' }}
        />
      )}
      <div className="space-y-4 p-6">
        <h2 className="text-xl font-bold text-gray-900">{scene.title}</h2>
        <div
          className="prose prose-gray max-w-none text-gray-700"
          dangerouslySetInnerHTML={{ __html: scene.content.replace(/\n/g, '<br/>') }}
        />
      </div>
    </div>
  )
}
