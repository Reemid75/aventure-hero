import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { StopSessionButton } from '@/components/game/StopSessionButton'
import { BookOpen, Play } from 'lucide-react'
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
      .select('id, story_id, current_scene_id, status, started_at, updated_at')
      .eq('player_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(5),
    supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .single(),
  ])

  // Fetch stories and current scenes in parallel
  const storyIds = [...new Set(sessions?.map((s) => s.story_id) ?? [])]
  const sceneIds = [...new Set(
    sessions?.filter((s) => s.status === 'active').map((s) => s.current_scene_id) ?? []
  )]

  const [{ data: stories }, { data: scenes }] = await Promise.all([
    storyIds.length
      ? supabase.from('stories').select('id, title, description').in('id', storyIds)
      : Promise.resolve({ data: [] }),
    sceneIds.length
      ? supabase.from('scenes').select('id, title').in('id', sceneIds)
      : Promise.resolve({ data: [] }),
  ])

  const storyMap = new Map<string, Pick<Story, 'id' | 'title' | 'description'>>(
    stories?.map((s) => [s.id, s]) ?? []
  )
  const sceneMap = new Map<string, string>(
    scenes?.map((s) => [s.id, s.title]) ?? []
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

      {sessions && sessions.length > 0 ? (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-gray-800">Parties en cours</h2>
          <div className="space-y-3">
            {sessions.map((session) => {
              const story = storyMap.get(session.story_id)
              return (
                <Card key={session.id} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
                      <BookOpen className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{story?.title ?? 'Histoire'}</p>
                      {session.status === 'active' && sceneMap.get(session.current_scene_id) && (
                        <p className="text-xs text-indigo-600 font-medium">
                          Scène : {sceneMap.get(session.current_scene_id)}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        Mis à jour le {formatDate(session.updated_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        session.status === 'active'
                          ? 'info'
                          : session.status === 'completed'
                          ? 'success'
                          : 'default'
                      }
                    >
                      {session.status === 'active'
                        ? 'En cours'
                        : session.status === 'completed'
                        ? 'Terminé'
                        : 'Abandonné'}
                    </Badge>
                    {session.status === 'active' && (
                      <Link href={`/play/${session.id}`}>
                        <Button size="sm">
                          <Play className="h-3.5 w-3.5" />
                          Continuer
                        </Button>
                      </Link>
                    )}
                    <StopSessionButton sessionId={session.id} />
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      ) : (
        <Card className="py-12 text-center">
          <BookOpen className="mx-auto mb-3 h-12 w-12 text-gray-300" />
          <p className="text-gray-500">Aucune partie en cours.</p>
          <Link href="/stories" className="mt-4 inline-block">
            <Button>Découvrir les histoires</Button>
          </Link>
        </Card>
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
