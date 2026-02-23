'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen, X, Package, Trash2 } from 'lucide-react'
import { removeItem } from '@/app/(player)/play/[sessionId]/actions'

interface Props {
  items: string[]
  journal: string[]
  sessionId: string
}

export function JournalModal({ items, journal, sessionId }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [removingItem, setRemovingItem] = useState<string | null>(null)
  const total = items.length + journal.length

  async function handleRemove(item: string) {
    if (!confirm(`Supprimer "${item}" de votre inventaire ?`)) return
    setRemovingItem(item)
    await removeItem(sessionId, item)
    setRemovingItem(null)
    router.refresh()
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-800 transition hover:bg-amber-100"
      >
        <BookOpen className="h-4 w-4" />
        Journal
        {total > 0 && (
          <span className="ml-1 rounded-full bg-amber-200 px-1.5 py-0.5 text-xs font-semibold text-amber-800">
            {total}
          </span>
        )}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-amber-600" />
                <h2 className="font-semibold text-gray-900">Journal</h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="divide-y divide-gray-100">
              {/* Inventaire (items ramassés) */}
              <div className="px-5 py-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-700">
                  Inventaire
                </p>
                {items.length === 0 ? (
                  <p className="text-sm italic text-gray-400">Aucun item collecté.</p>
                ) : (
                  <ul className="space-y-2">
                    {items.map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm"
                      >
                        <Package className="h-4 w-4 shrink-0 text-amber-600" />
                        <span className="flex-1 font-medium text-amber-900">{item}</span>
                        <button
                          onClick={() => handleRemove(item)}
                          disabled={removingItem === item}
                          className="rounded p-1 text-amber-400 hover:bg-amber-100 hover:text-red-500 disabled:opacity-40"
                          title="Supprimer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Notes (mots-clés automatiques) */}
              <div className="px-5 py-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Notes
                </p>
                {journal.length === 0 ? (
                  <p className="text-sm italic text-gray-400">Aucune note pour l&apos;instant.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {journal.map((kw) => (
                      <span
                        key={kw}
                        className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
