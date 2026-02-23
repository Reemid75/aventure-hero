'use client'

import { useState } from 'react'
import { StopCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { stopSession } from '@/app/(player)/dashboard/actions'

export function StopSessionButton({ sessionId }: { sessionId: string }) {
  const [loading, setLoading] = useState(false)

  async function handleStop() {
    if (
      !confirm(
        'Stopper l\'aventure ?\n\nVotre journal sera effacé et vous pourrez recommencer depuis le début.'
      )
    )
      return
    setLoading(true)
    await stopSession(sessionId)
  }

  return (
    <Button size="sm" variant="danger" loading={loading} onClick={handleStop}>
      <StopCircle className="h-3.5 w-3.5" />
      Stopper
    </Button>
  )
}
