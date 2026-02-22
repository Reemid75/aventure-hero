import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { StoryCard } from '@/components/stories/StoryCard'
import { BookOpen } from 'lucide-react'

export const metadata = { title: 'Histoires — Aventure' }

export default async function StoriesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: stories }, { data: sessions }] = await Promise.all([
    supabase
      .from('stories')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false }),
    supabase
      .from('game_sessions')
      .select('id, story_id, status')
      .eq('player_id', user.id)
      .eq('status', 'active'),
  ])

  const activeSessionMap = new Map(
    sessions?.map((s) => [s.story_id, s.id]) ?? []
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Histoires</h1>
        <p className="mt-1 text-gray-500">
          {stories?.length ?? 0} histoire{(stories?.length ?? 0) > 1 ? 's' : ''} disponible
          {(stories?.length ?? 0) > 1 ? 's' : ''}
        </p>
      </div>

      {stories && stories.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {stories.map((story) => (
            <StoryCard
              key={story.id}
              story={story}
              hasActiveSession={activeSessionMap.has(story.id)}
              sessionId={activeSessionMap.get(story.id)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 py-20 text-center">
          <BookOpen className="mb-3 h-12 w-12 text-gray-300" />
          <p className="text-gray-500">Aucune histoire disponible pour le moment.</p>
        </div>
      )}
    </div>
  )
}
