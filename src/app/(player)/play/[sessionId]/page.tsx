import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SceneDisplay } from '@/components/game/SceneDisplay'
import { ChoiceList } from '@/components/game/ChoiceList'
import { GameProgress } from '@/components/game/GameProgress'
import { Card } from '@/components/ui/Card'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import type { SceneWithChoices, SceneRequirements, Story } from '@/types/game.types'

interface Props {
  params: Promise<{ sessionId: string }>
}

export default async function PlayPage({ params }: Props) {
  const { sessionId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: session } = await supabase
    .from('game_sessions')
    .select('id, player_id, story_id, current_scene_id, status, journal, started_at, completed_at, updated_at')
    .eq('id', sessionId)
    .eq('player_id', user.id)
    .single()

  if (!session) notFound()
  if (session.status === 'completed') redirect(`/play/${sessionId}/end`)

  const [{ data: story }, { data: scene }, { count: visitCount }] = await Promise.all([
    supabase.from('stories').select('id, title, description, author_id, is_published, cover_image, created_at, updated_at').eq('id', session.story_id).single(),
    supabase.from('scenes').select('id, story_id, title, content, is_start, is_ending, ending_type, keywords, required_keywords, position_x, position_y, created_at, updated_at').eq('id', session.current_scene_id).single(),
    supabase.from('scene_visits').select('*', { count: 'exact', head: true }).eq('session_id', sessionId),
  ])

  if (!story || !scene) notFound()

  const { data: choices } = await supabase
    .from('choices')
    .select('id, story_id, from_scene_id, to_scene_id, label, order_index, created_at')
    .eq('from_scene_id', scene.id)
    .order('order_index')

  // Charger les required_keywords de chaque scène de destination
  const destinationIds = [...new Set(choices?.map((c) => c.to_scene_id) ?? [])]
  const { data: destinationScenes } = destinationIds.length
    ? await supabase.from('scenes').select('id, required_keywords').in('id', destinationIds)
    : { data: [] }

  const sceneRequirements: SceneRequirements = Object.fromEntries(
    destinationScenes?.map((s) => [s.id, s.required_keywords ?? []]) ?? []
  )

  const sceneWithChoices: SceneWithChoices = { ...scene, choices: choices ?? [] }
  const journal: string[] = session.journal ?? []

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/stories" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-4 w-4" />
          Histoires
        </Link>
      </div>

      <GameProgress session={session} story={story as Story} visitCount={visitCount ?? 0} />

      <Card>
        <SceneDisplay scene={sceneWithChoices} />
      </Card>

      {/* Afficher le journal si non vide */}
      {journal.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-700">
            Journal
          </p>
          <div className="flex flex-wrap gap-1.5">
            {journal.map((kw) => (
              <span
                key={kw}
                className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {!scene.is_ending && (
        <ChoiceList
          choices={choices ?? []}
          sessionId={sessionId}
          journal={journal}
          sceneRequirements={sceneRequirements}
        />
      )}
    </div>
  )
}
