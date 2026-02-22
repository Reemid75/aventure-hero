'use client'

import { useState } from 'react'
import type { Scene, Choice, Story } from '@/types/game.types'
import { SceneList } from './SceneList'
import { SceneForm } from './SceneForm'
import { ChoiceEditor } from './ChoiceEditor'

interface EditorShellProps {
  story: Story
  initialScenes: Scene[]
  initialChoices: Choice[]
}

export function EditorShell({ story, initialScenes, initialChoices }: EditorShellProps) {
  const [scenes, setScenes] = useState<Scene[]>(initialScenes)
  const [choices, setChoices] = useState<Choice[]>(initialChoices)
  const [selectedScene, setSelectedScene] = useState<Scene | null>(
    initialScenes.find((s) => s.is_start) ?? initialScenes[0] ?? null
  )
  const [creating, setCreating] = useState(false)

  const sceneChoices = selectedScene
    ? choices.filter((c) => c.from_scene_id === selectedScene.id)
    : []

  function handleSaved(scene: Scene) {
    setScenes((prev) => {
      const existing = prev.find((s) => s.id === scene.id)
      if (existing) {
        return prev.map((s) => (s.id === scene.id ? scene : s))
      }
      return [...prev, scene]
    })
    setSelectedScene(scene)
    setCreating(false)
  }

  function handleDeleted(sceneId: string) {
    setScenes((prev) => prev.filter((s) => s.id !== sceneId))
    setChoices((prev) =>
      prev.filter(
        (c) => c.from_scene_id !== sceneId && c.to_scene_id !== sceneId
      )
    )
    setSelectedScene(scenes.find((s) => s.id !== sceneId) ?? null)
  }

  function handleNew() {
    setSelectedScene(null)
    setCreating(true)
  }

  return (
    <div className="flex h-full">
      <SceneList
        scenes={scenes}
        selectedId={selectedScene?.id ?? null}
        onSelect={(scene) => {
          setSelectedScene(scene)
          setCreating(false)
        }}
        onNew={handleNew}
      />

      <div className="flex flex-1 flex-col overflow-y-auto">
        <div className="border-b border-gray-100 bg-white px-6 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            {story.title}
          </p>
          <p className="text-sm text-gray-700">
            {selectedScene
              ? `Scène : ${selectedScene.title}`
              : creating
              ? 'Nouvelle scène'
              : 'Sélectionnez une scène'}
          </p>
        </div>

        {(selectedScene || creating) ? (
          <>
            <SceneForm
              scene={creating ? null : selectedScene}
              storyId={story.id}
              onSaved={handleSaved}
              onDeleted={handleDeleted}
            />
            {selectedScene && !creating && (
              <ChoiceEditor
                scene={selectedScene}
                choices={sceneChoices}
                allScenes={scenes}
                onChoicesChange={(updated) => {
                  setChoices((prev) => {
                    const withoutScene = prev.filter(
                      (c) => c.from_scene_id !== selectedScene.id
                    )
                    return [...withoutScene, ...updated]
                  })
                }}
              />
            )}
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-sm text-gray-400">
            Sélectionnez une scène dans la liste
          </div>
        )}
      </div>
    </div>
  )
}
