'use client'

import { useState } from 'react'
import { Package, PackageCheck } from 'lucide-react'
import { collectItem } from '@/app/(player)/play/[sessionId]/actions'

interface Props {
  sessionId: string
  item: string
  collected: boolean
}

export function CollectItemButton({ sessionId, item, collected }: Props) {
  const [loading, setLoading] = useState(false)

  async function handleCollect() {
    if (collected || loading) return
    setLoading(true)
    await collectItem(sessionId, item)
    setLoading(false)
  }

  if (collected) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
        <PackageCheck className="h-4 w-4 shrink-0" />
        <span className="font-medium">{item}</span>
        <span className="ml-auto text-xs text-emerald-500">Ramassé</span>
      </div>
    )
  }

  return (
    <button
      onClick={handleCollect}
      disabled={loading}
      className="flex w-full items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800 transition hover:bg-amber-100 disabled:opacity-60"
    >
      <Package className="h-4 w-4 shrink-0" />
      <span className="font-medium">{item}</span>
      <span className="ml-auto text-xs text-amber-600">
        {loading ? 'Récupération…' : 'Ramasser'}
      </span>
    </button>
  )
}
