import { BookOpen } from 'lucide-react'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { Card } from '@/components/ui/Card'

export const metadata = { title: 'Inscription — Aventure' }

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 to-gray-50 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600">
            <BookOpen className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Aventure</h1>
          <p className="mt-1 text-sm text-gray-500">Créez votre compte gratuit</p>
        </div>
        <Card>
          <RegisterForm />
        </Card>
      </div>
    </div>
  )
}
