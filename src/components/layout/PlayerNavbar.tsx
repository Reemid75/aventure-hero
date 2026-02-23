'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { BookOpen, Home, LogOut, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { Profile } from '@/types/game.types'

interface PlayerNavbarProps {
  profile: Profile | null
}

export function PlayerNavbar({ profile }: PlayerNavbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const links = [
    { href: '/dashboard', label: 'Accueil', icon: Home },
    { href: '/stories', label: 'Histoires', icon: BookOpen },
  ]

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-5xl px-4">

        {/* Ligne principale */}
        <div className="flex h-14 items-center justify-between gap-4">

          {/* Gauche : logo + liens nav (desktop) */}
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex shrink-0 items-center gap-2">
              <BookOpen className="h-6 w-6 text-indigo-600" />
              <span className="text-lg font-bold text-gray-900">Aventure</span>
            </Link>
            <div className="hidden items-center gap-1 sm:flex">
              {links.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    pathname === href
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Droite : compte + admin + déconnexion */}
          <div className="flex shrink-0 items-center gap-1">
            {profile && (
              <Link
                href="/account"
                className={cn(
                  'flex items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-medium transition-colors sm:px-3',
                  pathname === '/account'
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100'
                )}
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{profile.username}</span>
              </Link>
            )}
            {profile?.role === 'admin' && (
              <Link
                href="/admin"
                className="rounded-lg px-2 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 sm:px-3"
              >
                <span className="hidden sm:inline">Admin</span>
                <span className="sm:hidden">⚙</span>
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 sm:px-3"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        </div>

        {/* Liens nav — mobile uniquement, sous la ligne principale */}
        <div className="flex gap-1 border-t border-gray-100 py-2 sm:hidden">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                pathname === href
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </div>

      </div>
    </nav>
  )
}
