'use client'

import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ImagePlus, Trash2, X } from 'lucide-react'
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
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [imageUploading, setImageUploading] = useState(false)
  const [imageError, setImageError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
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
          visual_url: scene.visual_url ?? '',
          keywords_raw: keywordsToRaw(scene.keywords),
          required_keywords_raw: keywordsToRaw(scene.required_keywords),
          item_keywords_raw: keywordsToRaw(scene.item_keywords),
        }
      : { is_start: false, is_ending: false, visual_url: '', keywords_raw: '', required_keywords_raw: '', item_keywords_raw: '' },
  })

  useEffect(() => {
    if (scene) {
      reset({
        title: scene.title,
        content: scene.content,
        is_start: scene.is_start,
        is_ending: scene.is_ending,
        ending_type: scene.ending_type ?? null,
        visual_url: scene.visual_url ?? '',
        keywords_raw: keywordsToRaw(scene.keywords),
        required_keywords_raw: keywordsToRaw(scene.required_keywords),
        item_keywords_raw: keywordsToRaw(scene.item_keywords),
      })
    } else {
      reset({ is_start: false, is_ending: false, visual_url: '', keywords_raw: '', required_keywords_raw: '', item_keywords_raw: '' })
    }
  }, [scene, reset])

  const isEnding = watch('is_ending')
  const visualUrl = watch('visual_url')

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setImageError(null)
    setImageUploading(true)

    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `${crypto.randomUUID()}.${ext}`

    const { data, error } = await supabase.storage
      .from('scene-visuals')
      .upload(path, file, { upsert: true })

    if (error || !data) {
      setImageError(`Erreur upload : ${error?.message ?? 'inconnue'}`)
      setImageUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('scene-visuals')
      .getPublicUrl(data.path)

    setValue('visual_url', publicUrl, { shouldDirty: true })
    setImageUploading(false)

    // Reset le file input pour permettre de re-sélectionner le même fichier
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function removeVisual() {
    setValue('visual_url', '', { shouldDirty: true })
    setImageError(null)
  }

  async function onSubmit(data: SceneInput) {
    setSaveError(null)
    setSaveSuccess(false)

    const endingType = data.is_ending ? (data.ending_type ?? 'neutral') : null
    const keywords = parseKeywords(data.keywords_raw)
    const required_keywords = parseKeywords(data.required_keywords_raw)
    const item_keywords = parseKeywords(data.item_keywords_raw)

    const payload = {
      title: data.title,
      content: data.content,
      is_start: data.is_start ?? false,
      is_ending: data.is_ending ?? false,
      ending_type: endingType,
      visual_url: data.visual_url?.trim() || null,
      keywords,
      required_keywords,
      item_keywords,
    }

    if (scene) {
      const { data: updated, error } = await supabase
        .from('scenes')
        .update(payload)
        .eq('id', scene.id)
        .select()
        .single()
      if (error) {
        setSaveError(error.message)
        return
      }
      if (updated) {
        onSaved(updated)
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 2000)
      }
    } else {
      const { data: created, error } = await supabase
        .from('scenes')
        .insert({ story_id: storyId, ...payload })
        .select()
        .single()
      if (error) {
        setSaveError(error.message)
        return
      }
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

      {/* Visuel */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">Visuel (facultatif)</label>

        {visualUrl?.trim() ? (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={visualUrl.trim()}
              alt="Visuel de la scène"
              className="max-h-48 w-full rounded-lg object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
            <button
              type="button"
              onClick={removeVisual}
              className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
              title="Supprimer le visuel"
            >
              <X className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={imageUploading}
              className="mt-2 flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              <ImagePlus className="h-3.5 w-3.5" />
              {imageUploading ? 'Chargement…' : 'Remplacer'}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={imageUploading}
            className="flex h-24 w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 text-sm text-gray-500 hover:border-indigo-400 hover:text-indigo-600 disabled:opacity-50"
          >
            <ImagePlus className="h-5 w-5" />
            {imageUploading ? 'Chargement…' : 'Choisir une image'}
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />

        {imageError && (
          <p className="text-xs text-red-600">{imageError}</p>
        )}
      </div>

      {/* Section Journal */}
      <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Journal</p>
        <Input
          label="Mots-clés ajoutés automatiquement"
          hint="Séparés par des virgules — ajoutés au journal dès que le joueur visite la scène"
          {...register('keywords_raw')}
        />
        <Input
          label="Mots-clés requis pour accéder"
          hint="Le joueur doit posséder tous ces mots-clés (journal ou inventaire) pour accéder à la scène"
          {...register('required_keywords_raw')}
        />
        <Input
          label="Items à ramasser"
          hint="Séparés par des virgules — le joueur peut choisir de les ajouter à son inventaire"
          {...register('item_keywords_raw')}
        />
      </div>

      {saveError && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          Erreur : {saveError}
        </p>
      )}
      {saveSuccess && (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          Scène enregistrée.
        </p>
      )}

      <Button type="submit" loading={isSubmitting} disabled={!isDirty && !!scene}>
        {scene ? 'Enregistrer' : 'Créer la scène'}
      </Button>
    </form>
  )
}
