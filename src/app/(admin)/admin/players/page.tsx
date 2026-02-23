import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { User, BookOpen } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export const metadata = { title: 'Joueurs — Admin' }

export default async function AdminPlayersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Tous les joueurs
  const { data: players } = await supabase
    .from('profiles')
    .select('id, username, created_at')
    .eq('role', 'player')
    .order('username')

  if (!players?.length) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Joueurs</h1>
        <Card className="py-12 text-center">
          <User className="mx-auto mb-3 h-12 w-12 text-gray-300" />
          <p className="text-gray-500">Aucun joueur inscrit.</p>
        </Card>
      </div>
    )
  }

  const playerIds = players.map((p) => p.id)

  // Toutes les sessions de ces joueurs
  const { data: sessions } = await supabase
    .from('game_sessions')
    .select('id, player_id, story_id, status, completed_at, updated_at')
    .in('player_id', playerIds)
    .order('updated_at', { ascending: false })

  // Stories concernées
  const storyIds = [...new Set(sessions?.map((s) => s.story_id) ?? [])]
  const { data: stories } = storyIds.length
    ? await supabase.from('stories').select('id, title').in('id', storyIds)
    : { data: [] }

  const storyMap = new Map(stories?.map((s) => [s.id, s.title]) ?? [])

  // Grouper les sessions par joueur
  const sessionsByPlayer = new Map<string, typeof sessions>(
    players.map((p) => [p.id, []])
  )
  for (const session of sessions ?? []) {
    sessionsByPlayer.get(session.player_id)?.push(session)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Joueurs</h1>
        <p className="mt-1 text-gray-500">{players.length} compte{players.length > 1 ? 's' : ''} joueur</p>
      </div>

      <div className="space-y-4">
        {players.map((player) => {
          const playerSessions = sessionsByPlayer.get(player.id) ?? []
          const activeSessions = playerSessions.filter((s) => s.status === 'active')
          const completedSessions = playerSessions.filter((s) => s.status === 'completed')

          return (
            <Card key={player.id} padding="none">
              {/* En-tête joueur */}
              <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100">
                  <User className="h-4 w-4 text-indigo-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{player.username}</p>
                  <p className="text-xs text-gray-400">Inscrit le {formatDate(player.created_at)}</p>
                </div>
                <div className="ml-auto flex items-center gap-2 text-xs text-gray-500">
                  {activeSessions.length > 0 && (
                    <Badge variant="info">{activeSessions.length} en cours</Badge>
                  )}
                  {completedSessions.length > 0 && (
                    <Badge variant="default">{completedSessions.length} terminée{completedSessions.length > 1 ? 's' : ''}</Badge>
                  )}
                </div>
              </div>

              {/* Liste des sessions */}
              <div className="px-5 py-3">
                {playerSessions.length === 0 ? (
                  <p className="py-2 text-sm italic text-gray-400">Aucune partie jouée.</p>
                ) : (
                  <ul className="divide-y divide-gray-50">
                    {playerSessions.map((session) => {
                      const title = storyMap.get(session.story_id) ?? 'Histoire inconnue'
                      const isActive = session.status === 'active'
                      const isCompleted = session.status === 'completed'
                      return (
                        <li key={session.id} className="flex items-center gap-3 py-2.5">
                          <BookOpen className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                          <span className="flex-1 truncate text-sm text-gray-800">{title}</span>
                          <div className="flex shrink-0 items-center gap-2">
                            {isActive && <Badge variant="info">En cours</Badge>}
                            {isCompleted && (
                              <Badge variant="success">
                                Terminée le {formatDate(session.completed_at ?? session.updated_at)}
                              </Badge>
                            )}
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
