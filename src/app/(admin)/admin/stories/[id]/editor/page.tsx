import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { EditorShell } from '@/components/admin/SceneEditor/EditorShell'
import { PublishToggle } from '@/components/admin/PublishToggle'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditorPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Handle "new" story creation redirect
  if (id === 'new') {
    redirect('/admin/stories')
  }

  const { data: story, error: storyError } = await supabase
    .from('stories')
    .select('*')
    .eq('id', id)
    .eq('author_id', user.id)
    .single()

  if (storyError || !story) notFound()

  const [{ data: scenes }, { data: choices }] = await Promise.all([
    supabase
      .from('scenes')
      .select('*')
      .eq('story_id', id)
      .order('created_at', { ascending: true }),
    supabase
      .from('choices')
      .select('*')
      .eq('story_id', id)
      .order('order_index', { ascending: true }),
  ])

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/stories"
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Link>
          <span className="text-gray-300">/</span>
          <h1 className="text-lg font-semibold text-gray-900">{story.title}</h1>
        </div>
        <PublishToggle storyId={story.id} isPublished={story.is_published} />
      </header>

      <div className="flex-1 overflow-hidden">
        <EditorShell
          story={story}
          initialScenes={scenes ?? []}
          initialChoices={choices ?? []}
        />
      </div>
    </div>
  )
}
