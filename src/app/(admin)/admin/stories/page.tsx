import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { PublishToggle } from '@/components/admin/PublishToggle'
import { Modal } from '@/components/ui/Modal'
import { PenLine, Plus, Settings } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { CreateStoryButton } from '@/components/admin/CreateStoryButton'

export const metadata = { title: 'Histoires — Admin' }

export default async function AdminStoriesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: stories } = await supabase
    .from('stories')
    .select('*')
    .eq('author_id', user.id)
    .order('updated_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Histoires</h1>
          <p className="mt-1 text-gray-500">Créez et gérez vos histoires interactives.</p>
        </div>
        <CreateStoryButton />
      </div>

      {stories && stories.length > 0 ? (
        <div className="space-y-3">
          {stories.map((story) => (
            <Card key={story.id} className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900">{story.title}</p>
                  <Badge variant={story.is_published ? 'success' : 'default'}>
                    {story.is_published ? 'Publié' : 'Brouillon'}
                  </Badge>
                </div>
                {story.description && (
                  <p className="mt-0.5 text-sm text-gray-500 line-clamp-1">
                    {story.description}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-400">
                  Modifié le {formatDate(story.updated_at)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <PublishToggle
                  storyId={story.id}
                  isPublished={story.is_published}
                />
                <Link href={`/admin/stories/${story.id}/editor`}>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                    Éditeur
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="py-16 text-center">
          <PenLine className="mx-auto mb-3 h-12 w-12 text-gray-300" />
          <p className="text-gray-500">Aucune histoire. Créez-en une !</p>
        </Card>
      )}
    </div>
  )
}
