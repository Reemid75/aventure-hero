import Link from 'next/link'
import { BookOpen, ChevronRight, Star } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-indigo-950 via-indigo-900 to-purple-900">
      <nav className="flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-2 text-white">
          <BookOpen className="h-6 w-6" />
          <span className="text-xl font-bold">Aventure</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" className="text-white hover:bg-white/10">
              Connexion
            </Button>
          </Link>
          <Link href="/register">
            <Button className="bg-white text-indigo-900 hover:bg-gray-100">
              Commencer
            </Button>
          </Link>
        </div>
      </nav>

      <main className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        <div className="mb-6 flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-indigo-200">
          <Star className="h-4 w-4" />
          Jeu d&apos;aventures interactif
        </div>
        <h1 className="mb-6 text-5xl font-bold text-white sm:text-6xl">
          Dont vous êtes
          <br />
          <span className="text-indigo-300">le héros</span>
        </h1>
        <p className="mb-10 max-w-xl text-lg text-indigo-200">
          Plongez dans des histoires interactives où chaque choix façonne votre
          destin. Explorez, décidez, survivez.
        </p>
        <div className="flex items-center gap-4">
          <Link href="/register">
            <Button size="lg" className="bg-white text-indigo-900 hover:bg-gray-100">
              Jouer gratuitement
              <ChevronRight className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/login">
            <Button
              size="lg"
              variant="ghost"
              className="border border-white/30 text-white hover:bg-white/10"
            >
              Se connecter
            </Button>
          </Link>
        </div>
      </main>

      <footer className="py-6 text-center text-sm text-indigo-400">
        © {new Date().getFullYear()} Aventure — Dont vous êtes le héros
      </footer>
    </div>
  )
}
