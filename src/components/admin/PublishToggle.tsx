'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'

interface PublishToggleProps {
  storyId: string
  isPublished: boolean
}

export function PublishToggle({ storyId, isPublished }: PublishToggleProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [published, setPublished] = useState(isPublished)

  async function toggle() {
    setLoading(true)
    const newValue = !published
    const { error } = await supabase
      .from('stories')
      .update({ is_published: newValue })
      .eq('id', storyId)

    if (!error) {
      setPublished(newValue)
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <Button
      variant={published ? 'secondary' : 'primary'}
      size="sm"
      onClick={toggle}
      loading={loading}
    >
      {published ? (
        <>
          <EyeOff className="h-4 w-4" />
          Dépublier
        </>
      ) : (
        <>
          <Eye className="h-4 w-4" />
          Publier
        </>
      )}
    </Button>
  )
}
