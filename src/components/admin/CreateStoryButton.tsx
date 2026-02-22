'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { StoryForm } from './StoryForm'

export function CreateStoryButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Nouvelle histoire
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Nouvelle histoire">
        <StoryForm onSuccess={() => setOpen(false)} />
      </Modal>
    </>
  )
}
