'use client'

import { useState } from 'react'
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import type { Choice, Scene } from '@/types/game.types'

interface ChoiceEditorProps {
  scene: Scene
  choices: Choice[]
  allScenes: Scene[]
  onChoicesChange: (choices: Choice[]) => void
}

interface EditState {
  label: string
  to_scene_id: string
}

export function ChoiceEditor({
  scene,
  choices,
  allScenes,
  onChoicesChange,
}: ChoiceEditorProps) {
  const supabase = createClient()
  const otherScenes = allScenes.filter((s) => s.id !== scene.id)

  // État pour l'ajout d'un nouveau choix
  const [adding, setAdding] = useState(false)
  const [newLabel, setNewLabel] = useState('')
  const [newTarget, setNewTarget] = useState('')
  const [addSaving, setAddSaving] = useState(false)

  // État pour l'édition d'un choix existant (id du choix en cours d'édition)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editState, setEditState] = useState<EditState>({ label: '', to_scene_id: '' })
  const [editSaving, setEditSaving] = useState(false)

  // État pour la suppression en cours
  const [deletingId, setDeletingId] = useState<string | null>(null)

  function startEdit(choice: Choice) {
    setEditingId(choice.id)
    setEditState({ label: choice.label, to_scene_id: choice.to_scene_id })
    setAdding(false)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditState({ label: '', to_scene_id: '' })
  }

  async function saveEdit(choiceId: string) {
    if (!editState.label.trim() || !editState.to_scene_id) return
    setEditSaving(true)
    const { data, error } = await supabase
      .from('choices')
      .update({ label: editState.label.trim(), to_scene_id: editState.to_scene_id })
      .eq('id', choiceId)
      .select()
      .single()
    setEditSaving(false)
    if (!error && data) {
      onChoicesChange(choices.map((c) => (c.id === choiceId ? data : c)))
      cancelEdit()
    }
  }

  async function deleteChoice(id: string) {
    setDeletingId(id)
    const { error } = await supabase.from('choices').delete().eq('id', id)
    setDeletingId(null)
    if (!error) {
      onChoicesChange(choices.filter((c) => c.id !== id))
    }
  }

  async function addChoice() {
    if (!newLabel.trim() || !newTarget) return
    setAddSaving(true)
    const { data, error } = await supabase
      .from('choices')
      .insert({
        story_id: scene.story_id,
        from_scene_id: scene.id,
        to_scene_id: newTarget,
        label: newLabel.trim(),
        order_index: choices.length,
      })
      .select()
      .single()
    setAddSaving(false)
    if (!error && data) {
      onChoicesChange([...choices, data])
      setNewLabel('')
      setNewTarget('')
      setAdding(false)
    }
  }

  if (scene.is_ending) {
    return (
      <p className="p-4 text-sm italic text-gray-400">
        Les scènes de fin n&apos;ont pas de choix.
      </p>
    )
  }

  return (
    <div className="space-y-3 border-t border-gray-100 p-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-700">
          Choix ({choices.length})
        </h4>
        {!adding && !editingId && (
          <Button size="sm" variant="ghost" onClick={() => setAdding(true)}>
            <Plus className="h-4 w-4" />
            Ajouter
          </Button>
        )}
      </div>

      {choices.map((choice) => {
        const isEditing = editingId === choice.id
        const isDeleting = deletingId === choice.id
        const target = allScenes.find((s) => s.id === choice.to_scene_id)

        if (isEditing) {
          return (
            <div
              key={choice.id}
              className="space-y-2 rounded-lg border border-indigo-200 bg-indigo-50 p-3"
            >
              <input
                className="h-9 w-full rounded-md border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Label du choix"
                value={editState.label}
                onChange={(e) => setEditState((s) => ({ ...s, label: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && saveEdit(choice.id)}
                autoFocus
              />
              <select
                className="h-9 w-full rounded-md border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={editState.to_scene_id}
                onChange={(e) => setEditState((s) => ({ ...s, to_scene_id: e.target.value }))}
              >
                {otherScenes.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => saveEdit(choice.id)}
                  loading={editSaving}
                  disabled={!editState.label.trim() || !editState.to_scene_id}
                >
                  <Check className="h-3.5 w-3.5" />
                  Enregistrer
                </Button>
                <Button size="sm" variant="ghost" onClick={cancelEdit} disabled={editSaving}>
                  <X className="h-3.5 w-3.5" />
                  Annuler
                </Button>
              </div>
            </div>
          )
        }

        return (
          <div
            key={choice.id}
            className="flex items-center justify-between gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-gray-800">{choice.label}</p>
              <p className="truncate text-xs text-gray-500">
                → {target?.title ?? 'Scène inconnue'}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button
                onClick={() => startEdit(choice)}
                disabled={!!editingId || !!deletingId}
                className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-indigo-600 disabled:opacity-40"
                title="Modifier"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => deleteChoice(choice.id)}
                disabled={!!editingId || isDeleting}
                className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-red-500 disabled:opacity-40"
                title="Supprimer"
              >
                {isDeleting ? (
                  <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>
        )
      })}

      {adding && (
        <div className="space-y-2 rounded-lg border border-indigo-200 bg-indigo-50 p-3">
          <input
            className="h-9 w-full rounded-md border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Label du choix"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            autoFocus
          />
          <select
            className="h-9 w-full rounded-md border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={newTarget}
            onChange={(e) => setNewTarget(e.target.value)}
          >
            <option value="">Scène de destination...</option>
            {otherScenes.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={addChoice}
              loading={addSaving}
              disabled={!newLabel.trim() || !newTarget}
            >
              Ajouter
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => { setAdding(false); setNewLabel(''); setNewTarget('') }}
              disabled={addSaving}
            >
              Annuler
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
