import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, Eye, PenLine } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export const metadata = { title: 'Admin — Aventure' }

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [
    { count: totalStories },
    { count: publishedStories },
    { count: totalSessions },
  ] = await Promise.all([
    supabase
      .from('stories')
      .select('*', { count: 'exact', head: true })
      .eq('author_id', user.id),
    supabase
      .from('stories')
      .select('*', { count: 'exact', head: true })
      .eq('author_id', user.id)
      .eq('is_published', true),
    supabase
      .from('game_sessions')
      .select('*, story:stories!inner(author_id)', { count: 'exact', head: true }),
  ])

  const stats = [
    { label: 'Histoires créées', value: totalStories ?? 0, icon: BookOpen },
    { label: 'Histoires publiées', value: publishedStories ?? 0, icon: Eye },
    { label: 'Parties jouées', value: totalSessions ?? 0, icon: PenLine },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="mt-1 text-gray-500">Gérez vos histoires et suivez les statistiques.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100">
                <Icon className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-sm text-gray-500">{label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex gap-3">
        <Link href="/admin/stories">
          <Button>
            <BookOpen className="h-4 w-4" />
            Gérer les histoires
          </Button>
        </Link>
        <Link href="/admin/stories/new/editor">
          <Button variant="outline">
            <PenLine className="h-4 w-4" />
            Nouvelle histoire
          </Button>
        </Link>
      </div>
    </div>
  )
}
