import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/Card'
import { ChangePasswordForm } from '@/components/auth/ChangePasswordForm'
import { User, Mail, KeyRound } from 'lucide-react'

export const metadata = { title: 'Mon compte — Aventure' }

export default async function AccountPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, role')
    .eq('id', user.id)
    .single()

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Mon compte</h1>

      {/* Informations */}
      <Card className="space-y-4 p-6">
        <h2 className="flex items-center gap-2 font-semibold text-gray-800">
          <User className="h-4 w-4 text-indigo-500" />
          Informations
        </h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3 rounded-lg bg-gray-50 px-4 py-3">
            <User className="h-4 w-4 shrink-0 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Nom d&apos;utilisateur</p>
              <p className="font-medium text-gray-900">{profile?.username ?? '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg bg-gray-50 px-4 py-3">
            <Mail className="h-4 w-4 shrink-0 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Adresse e-mail</p>
              <p className="font-medium text-gray-900">{user.email}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Changement de mot de passe */}
      <Card className="space-y-4 p-6">
        <h2 className="flex items-center gap-2 font-semibold text-gray-800">
          <KeyRound className="h-4 w-4 text-indigo-500" />
          Changer le mot de passe
        </h2>
        <ChangePasswordForm />
      </Card>
    </div>
  )
}
