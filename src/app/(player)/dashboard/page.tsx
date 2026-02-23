import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { StopSessionButton } from '@/components/game/StopSessionButton'
import { BookOpen, Play, Trophy, Skull } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { Story } from '@/types/game.types'

export const metadata = { title: 'Tableau de bord — Aventure' }

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: sessions }, { data: profile }] = await Promise.all([
    supabase
      .from('game_sessions')
      .select('id, story_id, current_scene_id, status, started_at, completed_at, updated_at')
      .eq('player_id', user.id)
      .order('updated_at', { ascending: false }),
    supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .single(),
  ])

  const activeSessions = sessions?.filter((s) => s.status === 'active') ?? []
  const completedSessions = sessions?.filter((s) => s.status === 'completed') ?? []

  // Fetch stories and scenes (title + ending_type) for all sessions
  const storyIds = [...new Set(sessions?.map((s) => s.story_id) ?? [])]
  const sceneIds = [...new Set(sessions?.map((s) => s.current_scene_id) ?? [])]

  const [{ data: stories }, { data: scenes }] = await Promise.all([
    storyIds.length
      ? supabase.from('stories').select('id, title, description').in('id', storyIds)
      : Promise.resolve({ data: [] }),
    sceneIds.length
      ? supabase.from('scenes').select('id, title, ending_type').in('id', sceneIds)
      : Promise.resolve({ data: [] }),
  ])

  const storyMap = new Map<string, Pick<Story, 'id' | 'title' | 'description'>>(
    stories?.map((s) => [s.id, s]) ?? []
  )
  const sceneMap = new Map<string, { title: string; ending_type: string | null }>(
    scenes?.map((s) => [s.id, { title: s.title, ending_type: s.ending_type }]) ?? []
  )

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Bonjour, {profile?.username ?? 'Aventurier'} !
        </h1>
        <p className="mt-1 text-gray-500">
          Continuez votre aventure ou explorez de nouvelles histoires.
        </p>
      </div>

      {/* Parties en cours */}
      {activeSessions.length > 0 ? (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-gray-800">Parties en cours</h2>
          <div className="space-y-3">
            {activeSessions.map((session) => {
              const story = storyMap.get(session.story_id)
              const scene = sceneMap.get(session.current_scene_id)
              return (
                <Card key={session.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-100">
                      <BookOpen className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-gray-900">{story?.title ?? 'Histoire'}</p>
                      {scene && (
                        <p className="truncate text-xs font-medium text-indigo-600">
                          Scène : {scene.title}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        Mis à jour le {formatDate(session.updated_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2 flex-wrap">
                    <Badge variant="info">En cours</Badge>
                    <Link href={`/play/${session.id}`}>
                      <Button size="sm">
                        <Play className="h-3.5 w-3.5" />
                        Continuer
                      </Button>
                    </Link>
                    <StopSessionButton sessionId={session.id} />
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      ) : (
        completedSessions.length === 0 && (
          <Card className="py-12 text-center">
            <BookOpen className="mx-auto mb-3 h-12 w-12 text-gray-300" />
            <p className="text-gray-500">Aucune partie en cours.</p>
            <Link href="/stories" className="mt-4 inline-block">
              <Button>Découvrir les histoires</Button>
            </Link>
          </Card>
        )
      )}

      {/* Parties terminées */}
      {completedSessions.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-gray-800">Parties terminées</h2>
          <div className="space-y-3">
            {completedSessions.map((session) => {
              const story = storyMap.get(session.story_id)
              const scene = sceneMap.get(session.current_scene_id)
              const endingType = scene?.ending_type
              const isVictory = endingType === 'victory'
              const isDefeat = endingType === 'defeat'
              return (
                <Card key={session.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                        isVictory ? 'bg-green-100' : isDefeat ? 'bg-red-100' : 'bg-gray-100'
                      }`}
                    >
                      {isVictory ? (
                        <Trophy className="h-5 w-5 text-green-600" />
                      ) : isDefeat ? (
                        <Skull className="h-5 w-5 text-red-500" />
                      ) : (
                        <BookOpen className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-gray-900">{story?.title ?? 'Histoire'}</p>
                      <p className="text-xs text-gray-500">
                        Terminée le {formatDate(session.completed_at ?? session.updated_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2 flex-wrap">
                    {isVictory && <Badge variant="success">Victoire</Badge>}
                    {isDefeat && <Badge variant="danger">Échec</Badge>}
                    {!isVictory && !isDefeat && <Badge variant="default">Terminée</Badge>}
                    <StopSessionButton sessionId={session.id} />
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      <div className="text-center">
        <Link href="/stories">
          <Button variant="outline">
            <BookOpen className="h-4 w-4" />
            Toutes les histoires
          </Button>
        </Link>
      </div>
    </div>
  )
}
