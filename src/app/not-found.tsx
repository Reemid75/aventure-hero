import Link from 'next/link'
import { BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gray-50 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100">
        <BookOpen className="h-8 w-8 text-indigo-600" />
      </div>
      <div>
        <h1 className="text-4xl font-bold text-gray-900">404</h1>
        <p className="mt-2 text-gray-500">Cette page n&apos;existe pas.</p>
      </div>
      <Link href="/">
        <Button>Retour à l&apos;accueil</Button>
      </Link>
    </div>
  )
}
