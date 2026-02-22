'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { storySchema, type StoryInput } from '@/lib/validations/story'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { Story } from '@/types/game.types'

interface StoryFormProps {
  story?: Story
  onSuccess?: (id: string) => void
}

export function StoryForm({ story, onSuccess }: StoryFormProps) {
  const router = useRouter()
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<StoryInput>({
    resolver: zodResolver(storySchema) as never,
    defaultValues: story
      ? { title: story.title, description: story.description ?? '', is_published: story.is_published }
      : { is_published: false },
  })

  async function onSubmit(data: StoryInput) {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    if (story) {
      await supabase
        .from('stories')
        .update({ title: data.title, description: data.description, is_published: data.is_published ?? false })
        .eq('id', story.id)
      onSuccess?.(story.id)
      router.refresh()
    } else {
      const { data: created } = await supabase
        .from('stories')
        .insert({ title: data.title, description: data.description, is_published: data.is_published ?? false, author_id: user.id })
        .select('id')
        .single()
      if (created) {
        router.push(`/admin/stories/${created.id}/editor`)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit as never)} className="space-y-4">
      <Input
        label="Titre"
        error={errors.title?.message}
        {...register('title')}
      />
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Description</label>
        <textarea
          className="min-h-24 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Description de l'histoire..."
          {...register('description')}
        />
        {errors.description && (
          <p className="text-xs text-red-600">{errors.description.message}</p>
        )}
      </div>
      <Button type="submit" loading={isSubmitting}>
        {story ? 'Enregistrer' : "Créer l'histoire"}
      </Button>
    </form>
  )
}
