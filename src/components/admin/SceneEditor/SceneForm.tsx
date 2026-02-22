'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Trash2 } from 'lucide-react'
import { sceneSchema, parseKeywords, type SceneInput } from '@/lib/validations/scene'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { Scene } from '@/types/game.types'

interface SceneFormProps {
  scene: Scene | null
  storyId: string
  onSaved: (scene: Scene) => void
  onDeleted: (sceneId: string) => void
}

function keywordsToRaw(kws: string[] | undefined): string {
  return (kws ?? []).join(', ')
}

export function SceneForm({ scene, storyId, onSaved, onDeleted }: SceneFormProps) {
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<SceneInput>({
    resolver: zodResolver(sceneSchema) as never,
    defaultValues: scene
      ? {
          title: scene.title,
          content: scene.content,
          is_start: scene.is_start,
          is_ending: scene.is_ending,
          ending_type: scene.ending_type ?? null,
          keywords_raw: keywordsToRaw(scene.keywords),
          required_keywords_raw: keywordsToRaw(scene.required_keywords),
        }
      : { is_start: false, is_ending: false, keywords_raw: '', required_keywords_raw: '' },
  })

  useEffect(() => {
    if (scene) {
      reset({
        title: scene.title,
        content: scene.content,
        is_start: scene.is_start,
        is_ending: scene.is_ending,
        ending_type: scene.ending_type ?? null,
        keywords_raw: keywordsToRaw(scene.keywords),
        required_keywords_raw: keywordsToRaw(scene.required_keywords),
      })
    } else {
      reset({ is_start: false, is_ending: false, keywords_raw: '', required_keywords_raw: '' })
    }
  }, [scene, reset])

  const isEnding = watch('is_ending')

  async function onSubmit(data: SceneInput) {
    const endingType = data.is_ending ? (data.ending_type ?? 'neutral') : null
    const keywords = parseKeywords(data.keywords_raw)
    const required_keywords = parseKeywords(data.required_keywords_raw)

    const payload = {
      title: data.title,
      content: data.content,
      is_start: data.is_start ?? false,
      is_ending: data.is_ending ?? false,
      ending_type: endingType,
      keywords,
      required_keywords,
    }

    if (scene) {
      const { data: updated } = await supabase
        .from('scenes')
        .update(payload)
        .eq('id', scene.id)
        .select()
        .single()
      if (updated) onSaved(updated)
    } else {
      const { data: created } = await supabase
        .from('scenes')
        .insert({ story_id: storyId, ...payload })
        .select()
        .single()
      if (created) onSaved(created)
    }
  }

  async function handleDelete() {
    if (!scene) return
    if (!confirm(`Supprimer la scène "${scene.title}" ?`)) return
    const { error } = await supabase.from('scenes').delete().eq('id', scene.id)
    if (!error) onDeleted(scene.id)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit as never)} className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">
          {scene ? 'Modifier la scène' : 'Nouvelle scène'}
        </h3>
        {scene && (
          <Button type="button" variant="danger" size="sm" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Input label="Titre" error={errors.title?.message} {...register('title')} />

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Contenu</label>
        <textarea
          className="min-h-40 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Rédigez le texte de la scène..."
          {...register('content')}
        />
        {errors.content && <p className="text-xs text-red-600">{errors.content.message}</p>}
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" className="rounded" {...register('is_start')} />
          Scène de départ
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" className="rounded" {...register('is_ending')} />
          Scène de fin
        </label>
      </div>

      {isEnding && (
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Type de fin</label>
          <select
            className="h-10 rounded-lg border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            {...register('ending_type')}
          >
            <option value="neutral">Neutre</option>
            <option value="victory">Victoire</option>
            <option value="defeat">Défaite</option>
          </select>
        </div>
      )}

      {/* Section Journal */}
      <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Journal</p>
        <Input
          label="Mots-clés ajoutés au journal"
          hint="Séparés par des virgules — ex : clé_grenier, lettre_rouge"
          {...register('keywords_raw')}
        />
        <Input
          label="Mots-clés requis pour accéder"
          hint="Le joueur doit posséder tous ces mots-clés dans son journal"
          {...register('required_keywords_raw')}
        />
      </div>

      <Button type="submit" loading={isSubmitting} disabled={!isDirty && !!scene}>
        {scene ? 'Enregistrer' : 'Créer la scène'}
      </Button>
    </form>
  )
}
